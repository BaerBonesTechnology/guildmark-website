/// Cryptographic utilities shared across the API.
library;

import 'dart:convert';

/// Compares two strings in constant time to prevent timing-based side-channel
/// attacks. Returns true only if both strings are identical.
///
/// Unlike [==], this function always iterates over the full length of the
/// longer string, so the execution time does not leak information about how
/// many leading characters are correct.
bool constantTimeEquals(String a, String b) {
  return constantTimeBytesEqual(utf8.encode(a), utf8.encode(b));
}

/// Compares two byte lists in constant time. Both lists must be the same
/// length for a meaningful comparison — differing lengths return false
/// immediately, which leaks length but not content.
bool constantTimeBytesEqual(List<int> a, List<int> b) {
  if (a.length != b.length) return false;
  var result = 0;
  for (var i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result == 0;
}
