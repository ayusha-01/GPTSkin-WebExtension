// Inject CSS once
console.log("CONTENT SCRIPT LOADED");
/*function injectCSS() {
    if (document.getElementById("chatgpt-theme-style")) return;

    const style = document.createElement("style");
    style.id = "chatgpt-theme-style";

    style.innerHTML = `
        
        #main > div,
        #main section {
            background: transparent !important;
        }

        
        #page-header * {
            background: transparent !important;
        }
    `;

    document.head.appendChild(style);
}*/

function injectCSS() {
    if (document.getElementById("chatgpt-theme-style")) return;

    const style = document.createElement("style");
    style.id = "chatgpt-theme-style";

    style.innerHTML = `
        /* Remove chat background layers ONLY */
        #main > div,
        #main section,
        #main [class*="bg-"] {
            background: transparent !important;
        }

        /* Keep input readable */
        textarea, input {
            background: rgba(255,255,255,0.9) !important;
        }
    `;

    document.head.appendChild(style);
}

// Apply theme
/*function applyTheme(theme) {
    let bg = document.getElementById("chatgpt-theme-bg");

    // Create overlay if not exists
    if (!bg) {
        bg = document.createElement("div");
        bg.id = "chatgpt-theme-bg";
        document.body.style.position = "relative";


        Object.assign(bg.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            zIndex: "-9999",
            pointerEvents: "none"
        });

        document.body.appendChild(bg);
    }

    // Apply theme
    if (theme.type === "color") {
        bg.style.background = theme.value;
    }

    if (theme.type === "image") {
        bg.style.backgroundImage = `url(${theme.value})`;
        bg.style.backgroundSize = "cover";
        bg.style.backgroundPosition = "center";
        bg.style.backgroundRepeat = "no-repeat";
    }
}*/

function applyTheme(theme) {
    const header = document.querySelector("#page-header");

    // Reset first
    document.body.style.background = "";
    document.body.style.backgroundImage = "";

    if (theme.type === "color") {
        document.body.style.background = theme.value;

        if (header) {
            header.style.background = theme.value;
        }
    }

    if (theme.type === "image") {
        document.body.style.backgroundImage = `url(${theme.value})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundAttachment = "fixed";
    }
}

// Initialize
function init() {
    injectCSS();

    chrome.storage.local.get("activeTheme", (data) => {
        if (data.activeTheme) {
            applyTheme(data.activeTheme);
        }
    });
}

init();

// Listen for popup messages
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "APPLY_THEME") {
        applyTheme(msg.theme);
    }

    if (msg.type === "RESET_THEME") {
    const header = document.querySelector("#page-header");

    // Reset body (THIS is the important part)
    document.body.style.background = "";
    document.body.style.backgroundImage = "";

    // Reset header
    if (header) {
        header.style.background = "";
    }
}
});

// Handle React re-renders
let timeout;

const observer = new MutationObserver(() => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        init();
    }, 300);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});