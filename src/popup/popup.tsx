import { useState } from "react";
import { decodeJwt } from "./jwtUtils";
import "./Popup.css";

export default function Popup() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState<object | null>(null);
  const [payload, setPayload] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleDecode() {
    try {
      setError(null);
      const decoded = decodeJwt(token.trim());
      setHeader(decoded.header);
      setPayload(decoded.payload);
    } catch (err) {
      setHeader(null);
      setPayload(null);
      setError("Invalid JWT. Please check the token format.");
    }
  }

  return (
    <div className="popup-container">
      <h1>JWT Inspector</h1>

      <textarea
        placeholder="Paste JWT here"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />

      <button onClick={handleDecode}>Decode</button>

      {error && <p className="error">{error}</p>}

      {header && (
        <>
          <h2>Header</h2>
          <pre>{JSON.stringify(header, null, 2)}</pre>
        </>
      )}

      {payload && (
        <>
          <h2>Payload</h2>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </>
      )}
    </div>
  );
}
