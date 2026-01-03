import { useState } from "react";
import { decodeJwt, getExpiryStatus, normalizeToken } from "./jwtUtils";
import { CLAIM_EXPLANATIONS } from "./claimInfo";
import "./Popup.css";

type ExpiryInfo = {
    status: "expired" | "expiring-soon" | "valid";
    timeLabel: string;
};

export default function Popup() {
    const [token, setToken] = useState("");
    const [header, setHeader] = useState<Record<string, unknown> | null>(null);
    const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expiryInfo, setExpiryInfo] = useState<ExpiryInfo | null>(null);

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

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    function CopyIconButton({
        onClick,
        title,
    }: {
        onClick: () => void;
        title: string;
    }) {
        return (
            <button className="icon-btn" onClick={onClick} title={title}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            </button>
        );
    }

    return (
        <div className="popup-container">
            <h1>JWT Inspector</h1>

            <textarea
                placeholder="Paste JWT or Bearer token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
            />

            <button onClick={handleDecode}>Decode</button>

            {error && <p className="error">{error}</p>}

            {header && (
                <>
                    <div className="section-header">
                        <h2>Header</h2>
                        <CopyIconButton
                            title="Copy header"
                            onClick={() =>
                                copyToClipboard(JSON.stringify(header, null, 2))
                            }
                        />
                    </div>
                    <pre>{JSON.stringify(header, null, 2)}</pre>
                </>
            )}

            {payload && (
                <>
                    <div className="section-header">
                        <h2>Payload</h2>
                        <CopyIconButton
                            title="Copy payload"
                            onClick={() =>
                                copyToClipboard(JSON.stringify(payload, null, 2))
                            }
                        />
                    </div>

                    <pre>{JSON.stringify(payload, null, 2)}</pre>

                    <h3>Claim Explanations</h3>
                    <ul className="claims">
                        {Object.keys(payload as Record<string, unknown>).map((key) =>
                            CLAIM_EXPLANATIONS[key] ? (
                                <li key={key} className="claim-item">
                                    <div className="claim-header">
                                        <strong className="claim-key">{key}</strong>

                                        <button
                                            className="icon-btn"
                                            title={`Copy ${key}`}
                                            onClick={() => copyToClipboard(String(payload[key]))}
                                        >
                                            {/* SVG icon */}
                                        </button>
                                    </div>

                                    <div className="claim-desc">
                                        {CLAIM_EXPLANATIONS[key]}
                                    </div>
                                </li>
                            ) : null
                        )}
                    </ul>
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
