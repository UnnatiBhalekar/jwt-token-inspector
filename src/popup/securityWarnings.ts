export type SecurityWarning = {
    level: "high" | "medium" | "low";
    message: string;
};

export function getSecurityWarnings(
    header: Record<string, unknown>,
    payload: Record<string, unknown>
): SecurityWarning[] {
    const warnings: SecurityWarning[] = [];

    // 1. alg: none
    if (header.alg === "none") {
        warnings.push({
            level: "high",
            message: "Token uses 'alg: none'. This can bypass signature verification.",
        });
    }

    // RS256 ↔ HS256 confusion risk
    if (header.alg === "HS256") {
        warnings.push({
            level: "medium",
            message:
                "Token uses HS256. If your backend expects RS256 and does not strictly enforce allowed algorithms, this may allow algorithm confusion attacks.",
        });
    }

    // 2. Missing exp
    if (typeof payload.exp !== "number") {
        warnings.push({
            level: "medium",
            message: "Token has no expiration (exp) claim.",
        });
    } else {
        const now = Math.floor(Date.now() / 1000);
        const lifetime = payload.exp - now;

        // 3. Long-lived token (> 24h)
        if (lifetime > 24 * 60 * 60) {
            warnings.push({
                level: "medium",
                message: "Token is valid for more than 24 hours.",
            });
        }

        // 4. Expiring soon
        if (lifetime > 0 && lifetime <= 5 * 60) {
            warnings.push({
                level: "low",
                message: "Token is expiring very soon.",
            });
        }

        // Missing issuer
        if (typeof payload.iss !== "string") {
            warnings.push({
                level: "medium",
                message:
                    "Token is missing the 'iss' (issuer) claim. This makes it harder to verify the token’s origin.",
            });
        }

        // Missing audience
        if (
            typeof payload.aud !== "string" &&
            !Array.isArray(payload.aud)
        ) {
            warnings.push({
                level: "medium",
                message:
                    "Token is missing the 'aud' (audience) claim. This token may be accepted by unintended services.",
            });
        }

        // Overly broad audience
        if (Array.isArray(payload.aud) && payload.aud.length > 3) {
            warnings.push({
                level: "low",
                message:
                    "Token has a broad audience (multiple 'aud' values). This increases the risk of token reuse across services.",
            });
        }
    }

    return warnings;
}
