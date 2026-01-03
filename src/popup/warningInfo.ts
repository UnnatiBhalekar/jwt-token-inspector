export const WARNING_EXPLANATIONS: Record<string, string> = {
  ALG_NONE:
    "The 'alg: none' algorithm disables cryptographic signature verification. " +
    "If a backend accepts this token, attackers can forge arbitrary JWTs. " +
    "This is a critical vulnerability and should never be allowed.",

  HS256_CONFUSION:
    "HS256 uses a shared secret. If a backend expects RS256 but does not strictly " +
    "enforce allowed algorithms, an attacker may sign a token using HS256 with the " +
    "public key as the secret. This is known as an algorithm confusion attack."
};
