function base64UrlDecode(input: string): string {
    // Replace URL-safe characters
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");

    // Pad string to valid length
    const padded =
        base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    return atob(padded);
}

export function normalizeToken(input: string): string {
    return input
        .trim()
        .replace(/^Bearer\s+/i, "")   // remove "Bearer "
        .replace(/\s+/g, "");         // remove newlines/spaces
}

export function decodeJwt(token: string): {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
} {
    const parts = token.split(".");
    if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
    }

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    return { header, payload };
}

type ExpiryStatus = "expired" | "expiring-soon" | "valid";

export function getExpiryStatus(
  payload: Record<string, unknown>
): { status: ExpiryStatus; timeLabel: string } | null {
  if (!payload.exp || typeof payload.exp !== "number") {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const diffSeconds = payload.exp - now;

  if (diffSeconds <= 0) {
    return {
      status: "expired",
      timeLabel: formatTime(Math.abs(diffSeconds)),
    };
  }

  if (diffSeconds <= 5 * 60) {
    return {
      status: "expiring-soon",
      timeLabel: formatTime(diffSeconds),
    };
  }

  return {
    status: "valid",
    timeLabel: formatTime(diffSeconds),
  };
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
