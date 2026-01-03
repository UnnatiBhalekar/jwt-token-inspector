export type SecurityWarning = {
  level: "high" | "medium" | "low";
  message: string;
  code?: "ALG_NONE" | "HS256_CONFUSION";
};

export function getSecurityWarnings(
  header: Record<string, unknown>,
  payload: Record<string, unknown>
): SecurityWarning[] {
  const warnings: SecurityWarning[] = [];

  if (header.alg === "none") {
    warnings.push({
      level: "high",
      code: "ALG_NONE",
      message: "Token uses 'alg: none'. This can bypass signature verification."
    });
  }

  if (header.alg === "HS256") {
    warnings.push({
      level: "medium",
      code: "HS256_CONFUSION",
      message:
        "Token uses HS256. If your backend expects RS256 and does not strictly enforce allowed algorithms, this can enable algorithm confusion attacks."
    });
  }

  // Missing issuer / audience (should apply regardless of exp)
  if (typeof payload.iss !== "string") {
    warnings.push({
      level: "medium",
      message: "Token is missing the 'iss' (issuer) claim."
    });
  }

  if (typeof payload.aud !== "string" && !Array.isArray(payload.aud)) {
    warnings.push({
      level: "medium",
      message: "Token is missing the 'aud' (audience) claim."
    });
  }

  if (Array.isArray(payload.aud) && payload.aud.length > 3) {
    warnings.push({
      level: "low",
      message: "Token has a broad audience (many 'aud' values)."
    });
  }

  // Exp-related warnings
  if (typeof payload.exp !== "number") {
    warnings.push({
      level: "medium",
      message: "Token has no expiration (exp) claim."
    });
    return warnings;
  }

  const now = Math.floor(Date.now() / 1000);
  const lifetime = payload.exp - now;

  if (lifetime > 24 * 60 * 60) {
    warnings.push({
      level: "medium",
      message: "Token is valid for more than 24 hours (long-lived token)."
    });
  }

  if (lifetime > 0 && lifetime <= 5 * 60) {
    warnings.push({
      level: "low",
      message: "Token is expiring very soon."
    });
  }

  return warnings;
}
