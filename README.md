# 🔐 JWT Inspector & Token Debugger

A lightweight, security-first Chrome extension for **locally inspecting JSON Web Tokens (JWTs)**.  
Designed for developers to quickly decode tokens, understand claims, spot common security issues, and export analysis — all without sending data anywhere.

---

## ✨ Features

- 🔍 **Decode JWT header & payload**
- ⏱ **Expiry analysis**
  - Valid / expiring soon / expired
  - Human-readable timestamps for `exp`, `iat`, `nbf`
- 🚨 **Security warnings**
  - `alg: none` detection
  - HS256 algorithm-confusion warning
- 🧠 **Claim explanations**
  - Plain-English explanations for standard JWT claims
- 📤 **Export analysis as JSON**
- 🧪 **One-click sample tokens**
  - Load valid / expired tokens instantly
- ⚠️ **Clear security disclaimer**
  - No misleading “verification” claims

---

## ❗ Important Security Disclaimer

> **This tool does NOT verify JWT signatures.**  
> It only Base64-decodes the header and payload for inspection.
>
> A decoded token does **not** mean the token is valid or trustworthy.  
> Always rely on your backend for proper signature verification.

This disclaimer is intentionally prominent to prevent misuse.

---

## 🧩 How It Works

1. Paste a JWT (or use a sample token)
2. The extension decodes:
   - Header
   - Payload
3. It analyzes:
   - Expiration time
   - Common misconfigurations
4. Results are shown **locally**
5. You can export the analysis as a JSON file

No data ever leaves your browser.

---

## 🔐 Privacy & Permissions

- ✅ **No data collection**
- ✅ **No network requests**
- ✅ **No tracking**
- ✅ **Runs entirely locally**

### Permissions used

| Permission | Why |
|-----------|-----|
| `downloads` | To export decoded analysis as a JSON file |

No other permissions are requested.

---

## 🛠 Tech Stack

- **React + TypeScript**
- **Vite**
- **Chrome Extensions (Manifest V3)**

---

## 🚀 Installation (Local / Development)

```bash
git clone https://github.com/<your-username>/jwt-inspector
cd jwt-inspector
npm install
npm run build
