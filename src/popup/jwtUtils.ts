function base64UrlDecode(input: string): string {
  // Replace URL-safe characters
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");

  // Pad string to valid length
  const padded =
    base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  return atob(padded);
}

export function decodeJwt(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));

  return { header, payload };
}

export function getExpiryStatus(payload: any) {
  if (!payload.exp) return null;

  const now = Math.floor(Date.now() / 1000);
  const diffSeconds = payload.exp - now;

  const absSeconds = Math.abs(diffSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let timeLabel = "";

  if (minutes < 60) {
    timeLabel = `${minutes} min`;
  } else if (hours < 24) {
    timeLabel = `${hours} hr ${remainingMinutes} min`;
  } else {
    timeLabel = `${hours} hr`;
  }

  if (diffSeconds <= 0) {
    return {
      status: "expired",
      timeLabel
    };
  }

  if (diffSeconds <= 300) {
    return {
      status: "expiring-soon",
      timeLabel
    };
  }

  return {
    status: "valid",
    timeLabel
  };
}
