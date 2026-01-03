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
