import { useState } from "react";
import { decodeJwt, getExpiryStatus, normalizeToken } from "./jwtUtils";
import "./Popup.css";

export default function Popup() {
    const [token, setToken] = useState("");
    const [header, setHeader] = useState<object | null>(null);
    const [payload, setPayload] = useState<object | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expiryInfo, setExpiryInfo] = useState<any>(null);


    function handleDecode() {
        try {
            setError(null);
            
            const cleanedToken = normalizeToken(token);
            const decoded = decodeJwt(cleanedToken);

            setHeader(decoded.header);
            setPayload(decoded.payload);
            setExpiryInfo(getExpiryStatus(decoded.payload));
        } catch {
            setHeader(null);
            setPayload(null);
            setExpiryInfo(null);
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
            {expiryInfo && (
                <div className={`expiry ${expiryInfo.status}`}>
                    {expiryInfo.status === "expired" && "❌ Token expired"}
                    {expiryInfo.status === "expiring-soon" && "⚠️ Token expiring soon"}
                    {expiryInfo.status === "valid" && "✅ Token is valid"}

                    <div className="expiry-time">
                        {expiryInfo.status === "expired"
                            ? `Expired ${expiryInfo.timeLabel} ago`
                            : `Expires in ${expiryInfo.timeLabel}`}
                    </div>
                </div>
            )}

        </div>
    );
}
