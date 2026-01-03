export const CLAIM_EXPLANATIONS: Record<string, string> = {
  exp: "Expiration time (Unix timestamp). Token is invalid after this time.",
  iss: "Issuer. Identifies who issued the token.",
  aud: "Audience. Identifies the intended recipient(s).",
  sub: "Subject. Identifies the principal (user/service).",
  iat: "Issued at. Time when the token was issued.",
  nbf: "Not before. Token must not be accepted before this time.",
  jti: "JWT ID. Unique identifier for this token."
};
