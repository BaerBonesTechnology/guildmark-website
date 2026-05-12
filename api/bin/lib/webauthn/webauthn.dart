/// WebAuthn / Passkey helpers for DevDash employee 2FA.
///
/// Implements the subset of the WebAuthn Level 2 spec needed for:
///   - ES256 (ECDSA P-256 with SHA-256) credential registration
///   - ES256 assertion verification
///
/// External dependencies used:
///   - package:crypto      (SHA-256 hashing)
///   - package:cryptography (ECDSA P-256 signature verification)
///
/// References:
///   https://www.w3.org/TR/webauthn-2/
///   https://www.iana.org/assignments/cose/cose.xhtml (COSE key parameters)
library;

import 'dart:convert';
import 'dart:typed_data';

import 'package:crypto/crypto.dart' as crypto;
import 'package:cryptography/cryptography.dart' as c;

// ---------------------------------------------------------------------------
// Base64url helpers (WebAuthn always uses unpadded base64url)
// ---------------------------------------------------------------------------

String toBase64Url(List<int> bytes) =>
    base64Url.encode(bytes).replaceAll('=', '');

Uint8List fromBase64Url(String s) {
  final padded = s.padRight(s.length + (4 - s.length % 4) % 4, '=');
  return base64Url.decode(padded);
}

// ---------------------------------------------------------------------------
// Minimal CBOR decoder
//
// Handles the subset used by WebAuthn attestation objects and COSE keys:
//   Major types 0 (uint), 1 (nint), 2 (bstr), 3 (tstr), 4 (array), 5 (map)
//
// Does NOT handle: tags (6), floats (7), indefinite-length items.
// ---------------------------------------------------------------------------

dynamic decodeCbor(Uint8List data) => _CborReader(data).decode();

class _CborReader {
  _CborReader(this._data);
  final Uint8List _data;
  int _pos = 0;

  dynamic decode() {
    final byte = _data[_pos++];
    final major = byte >> 5;
    final info  = byte & 0x1f;

    switch (major) {
      case 0: // unsigned int
        return _readCount(info);

      case 1: // negative int: value = -1 - n
        return -1 - _readCount(info);

      case 2: // byte string
        final len   = _readCount(info);
        final bytes = Uint8List.fromList(_data.sublist(_pos, _pos + len));
        _pos += len;
        return bytes;

      case 3: // text string
        final len   = _readCount(info);
        final bytes = _data.sublist(_pos, _pos + len);
        _pos += len;
        return utf8.decode(bytes);

      case 4: // array
        final len = _readCount(info);
        return List<dynamic>.generate(len, (_) => decode());

      case 5: // map
        final len = _readCount(info);
        final map = <dynamic, dynamic>{};
        for (var i = 0; i < len; i++) {
          final k = decode();
          map[k] = decode();
        }
        return map;

      default:
        throw FormatException('Unsupported CBOR major type $major at pos ${_pos - 1}');
    }
  }

  int _readCount(int info) {
    if (info < 24) return info;
    if (info == 24) return _data[_pos++];
    if (info == 25) {
      final v = (_data[_pos] << 8) | _data[_pos + 1];
      _pos += 2;
      return v;
    }
    if (info == 26) {
      final v = (_data[_pos] << 24) | (_data[_pos + 1] << 16) |
                (_data[_pos + 2] << 8)  |  _data[_pos + 3];
      _pos += 4;
      return v;
    }
    throw FormatException('Unsupported CBOR additional info $info');
  }
}

// ---------------------------------------------------------------------------
// Attestation object parsing
//
// The attestation object sent by the browser during registration is:
//   { fmt: "none"|"packed"|..., attStmt: {}, authData: <bytes> }
//
// We only need authData; the attestation statement is ignored for
// "none" format (which all passkey platforms use by default).
// ---------------------------------------------------------------------------

/// Parses the CBOR-encoded attestation object and returns the raw authData bytes.
Uint8List parseAttestationObject(Uint8List attObj) {
  final map = decodeCbor(attObj) as Map<dynamic, dynamic>;
  final authData = map['authData'];
  if (authData == null) {
    throw FormatException('attestationObject missing authData');
  }
  return authData as Uint8List;
}

// ---------------------------------------------------------------------------
// AuthData parsing
//
// Binary layout (per WebAuthn spec §6.1):
//   [0-31]  rpIdHash        – SHA-256 of the RP ID
//   [32]    flags           – bitmask (UP=0x01, UV=0x04, AT=0x40, ED=0x80)
//   [33-36] signCount       – big-endian uint32
//   If AT flag set (attestedCredentialData):
//     [37-52]   aaguid              – 16 bytes
//     [53-54]   credentialIdLength  – big-endian uint16
//     [55 …]    credentialId        – N bytes
//     [55+N …]  credentialPublicKey – CBOR-encoded COSE key
// ---------------------------------------------------------------------------

class ParsedCredential {
  ParsedCredential({
    required this.credentialId,
    required this.publicKeyX,
    required this.publicKeyY,
    required this.signCount,
    required this.aaguid,
  });

  final Uint8List credentialId;
  final Uint8List publicKeyX;  // 32 bytes, P-256 x coordinate
  final Uint8List publicKeyY;  // 32 bytes, P-256 y coordinate
  final int       signCount;
  final String    aaguid;      // hex string
}

ParsedCredential parseAuthData(Uint8List authData) {
  if (authData.length < 37) {
    throw FormatException('authData too short: ${authData.length}');
  }

  final flags     = authData[32];
  final signCount = (authData[33] << 24) | (authData[34] << 16) |
                    (authData[35] << 8)  |  authData[36];

  final hasAttestedCredData = (flags & 0x40) != 0;
  if (!hasAttestedCredData) {
    throw FormatException('authData has no attestedCredentialData (AT flag not set)');
  }

  // aaguid: bytes 37–52
  final aaguidBytes = authData.sublist(37, 53);
  final aaguid = aaguidBytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();

  // credentialIdLength: bytes 53–54 (big-endian uint16)
  final credIdLen = (authData[53] << 8) | authData[54];

  // credentialId: bytes 55 … 55+credIdLen
  final credentialId = authData.sublist(55, 55 + credIdLen);

  // credentialPublicKey: remaining bytes (CBOR COSE key)
  final coseBytes    = authData.sublist(55 + credIdLen);
  final coseKey      = decodeCbor(coseBytes) as Map<dynamic, dynamic>;

  // COSE key parameters for EC2 / ES256:
  //   1: kty  = 2 (EC2)
  //   3: alg  = -7 (ES256)
  //  -1: crv  = 1 (P-256)
  //  -2: x    = <32 bytes>
  //  -3: y    = <32 bytes>
  final kty = coseKey[1] as int?;
  final alg = coseKey[3] as int?;
  if (kty != 2)  throw FormatException('Unsupported COSE kty: $kty (expected 2 = EC2)');
  if (alg != -7) throw FormatException('Unsupported COSE alg: $alg (expected -7 = ES256)');

  final x = coseKey[-2] as Uint8List;
  final y = coseKey[-3] as Uint8List;

  return ParsedCredential(
    credentialId: credentialId,
    publicKeyX:   _pad32(x),
    publicKeyY:   _pad32(y),
    signCount:    signCount,
    aaguid:       aaguid,
  );
}

/// Trims leading 0x00 bytes (DER sign padding) then pads back to exactly 32 bytes.
Uint8List _pad32(Uint8List bytes) {
  var start = 0;
  while (start < bytes.length - 1 && bytes[start] == 0x00) {
    start++;
  }
  final trimmed = bytes.sublist(start);
  if (trimmed.length == 32) return trimmed;
  final out = Uint8List(32);
  out.setRange(32 - trimmed.length, 32, trimmed);
  return out;
}

// ---------------------------------------------------------------------------
// DER → IEEE P1363 signature conversion
//
// WebAuthn assertions carry DER-encoded ECDSA signatures:
//   0x30 [seqLen] 0x02 [rLen] [r…] 0x02 [sLen] [s…]
//
// The cryptography package expects raw P1363 format: r || s (64 bytes for P-256).
// ---------------------------------------------------------------------------

Uint8List derToP1363(Uint8List der) {
  if (der[0] != 0x30) throw FormatException('Not a DER SEQUENCE (got ${der[0]})');
  var i = 2; // skip 0x30 and length byte
  if (der[i] != 0x02) throw FormatException('Expected INTEGER tag (got ${der[i]})');
  i++;
  final rLen = der[i++];
  final r = der.sublist(i, i + rLen);
  i += rLen;
  if (der[i] != 0x02) throw FormatException('Expected INTEGER tag for s (got ${der[i]})');
  i++;
  final sLen = der[i++];
  final s = der.sublist(i, i + sLen);

  return Uint8List.fromList([..._pad32(r), ..._pad32(s)]);
}

// ---------------------------------------------------------------------------
// ECDSA-P256-SHA256 signature verification
//
// Verifies a WebAuthn authentication assertion.
//
// The signed content (per spec) is:
//   sigBase = authenticatorData || SHA-256(clientDataJSON)
//
// The cryptography package's Ecdsa.p256(Sha256()) hashes sigBase internally,
// so we pass the raw sigBase bytes (not pre-hashed).
// ---------------------------------------------------------------------------

Future<bool> verifyAssertion({
  required Uint8List authenticatorData,
  required Uint8List clientDataJson,
  required Uint8List derSignature,
  required Uint8List publicKeyX,
  required Uint8List publicKeyY,
}) async {
  // Build sigBase: authData || SHA-256(clientDataJSON)
  final clientDataHash = Uint8List.fromList(
    crypto.sha256.convert(clientDataJson).bytes,
  );
  final sigBase = Uint8List.fromList([...authenticatorData, ...clientDataHash]);

  // Convert DER signature to P1363 (r || s)
  final p1363 = derToP1363(derSignature);

  // Reconstruct the EC public key
  final publicKey = c.EcPublicKey(
    x: publicKeyX,
    y: publicKeyY,
    type: c.KeyPairType.p256,
  );

  final algorithm = c.Ecdsa.p256(c.Sha256());
  final signature = c.Signature(p1363, publicKey: publicKey);

  try {
    return await algorithm.verify(sigBase, signature: signature);
  } catch (_) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// clientDataJSON verification helpers
// ---------------------------------------------------------------------------

/// Verifies that the clientDataJSON returned by the browser matches the
/// challenge we issued and the expected type / origin.
///
/// Returns the parsed JSON map on success, throws [FormatException] on mismatch.
Map<String, dynamic> verifyClientData({
  required Uint8List clientDataJson,
  required String    expectedChallenge,    // base64url
  required String    expectedType,         // 'webauthn.create' or 'webauthn.get'
  required String    expectedOrigin,
}) {
  final Map<String, dynamic> data;
  try {
    data = jsonDecode(utf8.decode(clientDataJson)) as Map<String, dynamic>;
  } catch (e) {
    throw FormatException('clientDataJSON is not valid UTF-8 JSON: $e');
  }

  final type      = data['type']      as String?;
  final challenge = data['challenge'] as String?;
  final origin    = data['origin']    as String?;

  if (type != expectedType) {
    throw FormatException('clientData type mismatch: got $type, want $expectedType');
  }

  // Challenges may differ in padding; normalise before comparing.
  final normalise = (String? s) =>
      s?.replaceAll('=', '') ?? '';

  if (normalise(challenge) != normalise(expectedChallenge)) {
    throw FormatException('clientData challenge mismatch');
  }

  if (origin != expectedOrigin) {
    throw FormatException('clientData origin mismatch: got $origin, want $expectedOrigin');
  }

  return data;
}
