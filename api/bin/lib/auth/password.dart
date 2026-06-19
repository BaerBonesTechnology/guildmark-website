import 'package:bcrypt/bcrypt.dart';

const _bcryptCost = 12;

String hashPassword(String plaintext) {
  return BCrypt.hashpw(plaintext, BCrypt.gensalt(logRounds: _bcryptCost));
}

bool verifyPassword(String plaintext, String hash) {
  try {
    return BCrypt.checkpw(plaintext, hash);
  } catch (_) {
    // Malformed hash — treat as failure.
    return false;
  }
}
