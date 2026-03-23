function sendTheme(theme) {
    chrome.storage.local.set({ activeTheme: theme });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.id) return;

        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "APPLY_THEME", theme: theme },
            () => {
                if (chrome.runtime.lastError) {
                    console.log("Content script not ready yet");
                }
            }
        );
    });
}

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {

    // Color picker → instant apply
    document.getElementById("colorPicker").addEventListener("input", (e) => {
        sendTheme({
            type: "color",
            value: e.target.value
        });
    });

    // Image upload → instant apply
    document.getElementById("imageUpload").addEventListener("change", (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function () {
            sendTheme({
                type: "image",
                value: reader.result
            });
        };

        reader.readAsDataURL(file);
    });

    // Preset colors
    document.querySelectorAll("#presetColors button").forEach(btn => {
        btn.addEventListener("click", () => {
            sendTheme({
                type: "color",
                value: btn.dataset.color
            });
        });
    });

    // Save theme
    document.getElementById("saveTheme").addEventListener("click", () => {
        const nameInput = document.getElementById("themeName");
        const name = nameInput.value || "Untitled";

        chrome.storage.local.get(["themes", "activeTheme"], (data) => {
            if (!data.activeTheme) return;

            const themes = data.themes || [];

            themes.push({
                name: name,
                ...data.activeTheme
            });

            chrome.storage.local.set({ themes: themes }, () => {
                loadCollection();
                nameInput.value = "";
            });
        });
    });

    // Reset theme
    document.getElementById("resetTheme").addEventListener("click", () => {
        chrome.storage.local.remove("activeTheme");

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "RESET_THEME"
            });
        });
    });

    loadCollection();
});

// Load saved themes
function loadCollection() {
    chrome.storage.local.get("themes", (data) => {
        const container = document.getElementById("collection");
        container.innerHTML = "";

        (data.themes || []).forEach((theme, index) => {
            const wrapper = document.createElement("div");

            const btn = document.createElement("button");
            btn.innerText = theme.name;
            btn.onclick = () => sendTheme(theme);

            const del = document.createElement("span");
            del.innerText = " ❌";
            del.style.cursor = "pointer";

            del.onclick = () => {
                chrome.storage.local.get("themes", (data) => {
                    const updated = (data.themes || []).filter((_, i) => i !== index);
                    chrome.storage.local.set({ themes: updated }, loadCollection);
                });
            };

            wrapper.appendChild(btn);
            wrapper.appendChild(del);

            container.appendChild(wrapper);
        });
    });
}