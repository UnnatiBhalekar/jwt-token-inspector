/// <reference types="chrome" />

import { useMemo, useState } from "react";
import { decodeJwt, getExpiryStatus, normalizeToken } from "./jwtUtils";
import { getSecurityWarnings, SecurityWarning } from "./securityWarnings";
import { CLAIM_EXPLANATIONS } from "./claimInfo";
import { WARNING_EXPLANATIONS } from "./warningInfo";
import "./Popup.css";

/* ---------------- Types ---------------- */

type ExpiryInfo = {
    status: "expired" | "expiring-soon" | "valid";
    timeLabel: string;
};

/* ---------------- Sample Tokens ---------------- */

const SAMPLE_TOKENS = {
    valid:
        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlzcyI6ImF1dGgtc2VydmljZSIsImlhdCI6MTY5MDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.signature",
    expired:
        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlzcyI6ImF1dGgtc2VydmljZSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.signature"
};

/* ---------------- UI Helpers ---------------- */

function CopyIconButton({
    onClick,
    title
}: {
    onClick: () => void;
    title: string;
}) {
    return (
        <button className="icon-btn" onClick={onClick} title={title} type="button">
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

/* ---------------- Main Component ---------------- */

export default function Popup() {
    const [token, setToken] = useState("");
    const [header, setHeader] = useState<Record<string, unknown> | null>(null);
    const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
    const [warnings, setWarnings] = useState<SecurityWarning[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expiryInfo, setExpiryInfo] = useState<ExpiryInfo | null>(null);

    /* ---------------- Helpers ---------------- */

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    function formatUnixTime(ts: number): string {
        return new Date(ts * 1000).toLocaleString();
    }

    /* ---------------- Decode ---------------- */

    function handleDecode() {
        try {
            setError(null);

            const cleaned = normalizeToken(token);
            const decoded = decodeJwt(cleaned);

            setHeader(decoded.header);
            setPayload(decoded.payload);
            setExpiryInfo(getExpiryStatus(decoded.payload));
            setWarnings(getSecurityWarnings(decoded.header, decoded.payload));
        } catch {
            setHeader(null);
            setPayload(null);
            setWarnings([]);
            setExpiryInfo(null);
            setError("Invalid JWT. Please check the token format.");
        }
    }

    /* ---------------- Export ---------------- */

    function handleExport() {
        if (!header || !payload) return;

        const data = {
            token: normalizeToken(token),
            header,
            payload,
            expiry: expiryInfo,
            warnings
        };

        chrome.runtime.sendMessage({ type: "EXPORT_JWT_ANALYSIS", data }, (res) => {
            if (!res?.success) {
                setError("Export failed. Check extension permissions.");
            }
        });
    }

    /* ---------------- Payload with Human Dates ---------------- */

    const displayPayload = useMemo(() => {
        if (!payload) return null;

        return Object.fromEntries(
            Object.entries(payload).map(([key, value]) => {
                if (
                    (key === "exp" || key === "iat" || key === "nbf") &&
                    typeof value === "number"
                ) {
                    return [
                        key,
                        `${value} (${formatUnixTime(value)})`
                    ];
                }
                return [key, value];
            })
        );
    }, [payload]);

    /* ---------------- Claim Explanations ---------------- */

    const explainedClaims = useMemo(() => {
        if (!payload) return [];
        return Object.keys(payload)
            .filter((k) => Boolean(CLAIM_EXPLANATIONS[k]))
            .map((k) => ({ key: k, desc: CLAIM_EXPLANATIONS[k] }));
    }, [payload]);

    /* ---------------- Render ---------------- */

    return (
        <div className="popup-container">
            <h1>JWT Inspector</h1>

            {/* Disclaimer */}
            <div className="disclaimer">
                ⚠️ This tool <strong>does not verify JWT signatures</strong>. It only
                decodes the header and payload for inspection.
            </div>

            {/* Sample Tokens */}
            <div className="sample-buttons">
                <button type="button" onClick={() => setToken(SAMPLE_TOKENS.valid)}>
                    Load Valid Token
                </button>
                <button type="button" onClick={() => setToken(SAMPLE_TOKENS.expired)}>
                    Load Expired Token
                </button>
            </div>

            <textarea
                placeholder="Paste JWT or Bearer token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
            />

            <button onClick={handleDecode} type="button">
                Decode
            </button>

            {header && payload && (
                <button onClick={handleExport} type="button" style={{ marginTop: 8 }}>
                    Export JSON
                </button>
            )}

            {error && <p className="error">{error}</p>}

            {/* Header */}
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

            {/* Payload */}
            {displayPayload && (
                <>
                    <div className="section-header">
                        <h2>Payload</h2>
                        <CopyIconButton
                            title="Copy payload"
                            onClick={() =>
                                copyToClipboard(JSON.stringify(displayPayload, null, 2))
                            }
                        />
                    </div>
                    <pre>{JSON.stringify(displayPayload, null, 2)}</pre>
                </>
            )}

            {/* Claim Explanations */}
            {explainedClaims.length > 0 && (
                <>
                    <h3>Claim Explanations</h3>
                    <ul className="claims">
                        {explainedClaims.map((c) => (
                            <li key={c.key} className="claim-item">
                                <strong className="claim-key">{c.key}</strong>
                                <div className="claim-desc">{c.desc}</div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
                <>
                    <h2>Security Warnings</h2>
                    <ul className="warnings">
                        {warnings.map((w, i) => (
                            <li key={i} className={`warning ${w.level}`}>
                                <div className="warning-row">
                                    <span>{w.message}</span>

                                    {w.code && (
                                        <span className="why-wrapper">
                                            <button className="why-btn">Why?</button>
                                            <span className="why-tooltip">
                                                {WARNING_EXPLANATIONS[w.code]}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* Expiry */}
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
