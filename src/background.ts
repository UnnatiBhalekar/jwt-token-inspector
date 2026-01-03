/// <reference types="chrome" />

let lastJwt: string | null = null;

// Capture Authorization: Bearer <jwt> from outgoing requests
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        const headers = details.requestHeaders ?? [];
        const auth = headers.find(
            (h) => h.name?.toLowerCase() === "authorization"
        );
        const value = auth?.value ?? "";

        if (value.toLowerCase().startsWith("bearer ")) {
            lastJwt = value.slice(7).trim();
        }

        // 🔑 IMPORTANT: explicitly return undefined
        return undefined;
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders", "extraHeaders"]
);

// Respond to popup requests
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "GET_LAST_JWT") {
        sendResponse({ token: lastJwt });
        return; // sync response
    }

    if (msg?.type === "EXPORT_JWT_ANALYSIS") {
        try {
            const json = JSON.stringify(msg.data ?? {}, null, 2);
            const dataUrl =
                "data:application/json;charset=utf-8," + encodeURIComponent(json);

            // downloads permission required
            chrome.downloads.download(
                {
                    url: dataUrl,
                    filename: "jwt-analysis.json",
                    saveAs: true
                },
                () => {
                    sendResponse({ success: true });
                }
            );
            return true; // async response
        } catch (e) {
            sendResponse({ success: false, error: String(e) });
            return;
        }
    }
});
