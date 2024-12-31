let preSelectText = false;

document.addEventListener("mouseup", (event) => {
  const selectedText = window.getSelection().toString().trim();
  const existingCard = document.getElementById("custom-card");

  if (selectedText && !existingCard) {
    showIcon(selectedText);
  } else {
    removeIcon();
  }

  if (existingCard && existingCard.contains(event.target)) {
    removeIcon();
    event.stopPropagation();
  } else {
    removeCard();
  }
});

document.addEventListener("mousedown", (event) => {
  const existingIcon = document.getElementById("text-select-icon");

  if (existingIcon && !existingIcon.contains(event.target)) {
    removeIcon();
  }
});

function showIcon(selectedText) {
  if (preSelectText !== selectedText) {
    removeIcon();
  }

  preSelectText = selectedText;

  try {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const icon = document.createElement("img");
    icon.src = chrome.runtime.getURL("images/icon-16.png");

    icon.onerror = () => {
      icon.src = chrome.runtime.getURL("images/icon-48.png");
    };

    icon.style.position = "absolute";

    const middleX = rect.left + rect.width / 2;

    // icon.style.left = `${rect.right}px`;
    // icon.style.top = `${rect.bottom + window.scrollY}px`;
    icon.style.left = `${middleX - 50}px`;
    icon.style.top = `${rect.bottom + window.scrollY}px`;

    icon.style.width = "24px";
    icon.style.height = "24px";
    icon.style.cursor = "pointer";
    icon.style.zIndex = "10000";
    icon.id = "text-select-icon";

    document.body.appendChild(icon);

    icon.addEventListener("click", () => {
      removeIcon();
      showCard(selectedText, rect);
    });
  } catch (error) {
    if (error.message.includes("Extension context invalidated")) {
      console.error(
        "Extension context invalidated. Please reload the extension."
      );
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
}

function removeIcon() {
  const existingIcon = document.getElementById("text-select-icon");
  if (existingIcon) {
    existingIcon.remove();
  }
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const copyIcon = document
        .getElementById("icon-copy-convert-text")
        .querySelector("svg");
      const originalIcon = copyIcon.innerHTML;

      // Change icon to check mark
      copyIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
        <path d="M13.485 1.929a.75.75 0 0 1 1.06 1.06l-8 8a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06L6 9.439l7.485-7.51z"/>
      </svg>
    `;

      showToast("Copied to clipboard!");

      // Revert back to original icon after 2 seconds
      setTimeout(() => {
        copyIcon.innerHTML = originalIcon;
      }, 2000);
    })
    .catch((err) => {
      showToast("Could not copy text", true);
      console.error("Could not copy text: ", err);
    });
}

function showCard(text, rect) {
  removeIcon();
  const convertText = convertSelectText(text);
  const isValidURL = isValidURLChecker(convertText);

  const card = document.createElement("div");
  card.id = "custom-card";
  card.style.position = "absolute";
  card.style.left = `${rect.left + rect.width / 2 - 12}px`;
  card.style.top = `${rect.bottom + window.scrollY + 50}px`;
  card.style.transform = "translate(-50%, -50%)";
  card.style.width = "300px";
  card.style.backgroundColor = "#fff";
  card.style.border = "1px solid #ccc";
  card.style.borderRadius = "8px";
  card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  card.style.padding = "16px";
  card.style.zIndex = "10001";
  card.style.fontFamily = "Arial, sans-serif";

  let styleNewTab = "display: none;";

  if (isValidURL) {
    styleNewTab = "display: inline-block;";
  }

  // Card content
  card.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0; font-size: 16px;">
      <span id="icon-open-new-tab" style="cursor: pointer; color: #007bff; margin-right: 8px; ${styleNewTab}" title="Open in new tab">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-window-plus" viewBox="0 0 16 16">
          <path d="M2.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M4 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
          <path d="M0 4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4a.5.5 0 0 1-1 0V7H1v5a1 1 0 0 0 1 1h5.5a.5.5 0 0 1 0 1H2a2 2 0 0 1-2-2zm1 2h13V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1z"/>
          <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1h-1a.5.5 0 0 0 0 1h1v1a.5.5 0 0 0 1 0v-1h1a.5.5 0 0 0 0-1h-1v-1a.5.5 0 0 0-.5-.5"/>
        </svg>
      </span>
      <span id="icon-open-new-tab-incognito" style="cursor: pointer; color:rgb(187, 204, 37); margin-right: 8px; ${styleNewTab}" title="Open in new tab (incognito)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-window-plus" viewBox="0 0 16 16">
          <path d="M2.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M4 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
          <path d="M0 4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4a.5.5 0 0 1-1 0V7H1v5a1 1 0 0 0 1 1h5.5a.5.5 0 0 1 0 1H2a2 2 0 0 1-2-2zm1 2h13V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1z"/>
          <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1h-1a.5.5 0 0 0 0 1h1v1a.5.5 0 0 0 1 0v-1h1a.5.5 0 0 0 0-1h-1v-1a.5.5 0 0 0-.5-.5"/>
        </svg>
      </span>
      <span id="icon-copy-convert-text" style="cursor: pointer; color:rgb(19, 236, 128); margin-right: 8px;" title="Copy text">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
        </svg>
      </span>
    </h3>
    <button id="close-card-btn" style="
      background-color: transparent;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color:rgb(218, 85, 52);
    ">✖</button>
  </div>
  <hr style="margin: 8px 0;">
  <p style="margin: 0; font-size: 14px; overflow-wrap: break-word;word-wrap: break-word;">${convertText}</p>
`;

  // Event remove card
  card.querySelector("#close-card-btn").addEventListener("click", () => {
    removeIcon();
    removeCard();
  });

  // Event copy text
  card
    .querySelector("#icon-copy-convert-text")
    .addEventListener("click", () => {
      copyToClipboard(convertText);
    });

  // Event open in new tab
  card.querySelector("#icon-open-new-tab").addEventListener("click", () => {
    if (isValidURL) {
      window.open(convertText, "_blank");
    } else {
      showToast("Invalid URL", true);
    }
  });

  // Event open in new tab (incognito)
  card
    .querySelector("#icon-open-new-tab-incognito")
    .addEventListener("click", () => {
      if (isValidURL) {
        chrome.runtime.sendMessage({
          action: "openIncognito",
          url: convertText,
        });
      } else {
        showToast("Invalid URL", true);
      }
    });

  document.body.appendChild(card);
}

function removeCard() {
  const existingCard = document.getElementById("custom-card");
  if (existingCard) {
    existingCard.remove();
  }
}

function convertSelectText(input) {
  const convertedText = input.replace(/\s+/g, "");
  return hexToString(convertedText);
}

// Helper function to convert string to hex
function stringToHex(str) {
  return Array.from(str)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}

// Helper function to convert hex to string
function hexToString(hex) {
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    return "Invalid hex input";
  }

  try {
    return hex
      .match(/.{1,2}/g)
      .map((byte) => String.fromCharCode(parseInt(byte, 16)))
      .join("");
  } catch (error) {
    return "Invalid hex input";
  }
}

// Helper function to check if a string is a valid URL
function isValidURLChecker(string) {
  const inputText = string.replace(/\s+/g, "");

  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol (http or https)
      "([\\w-]+\\.)+[\\w-]{2,}" + // domain name
      "(\\/[-\\w@:%_+.~#?&/=]*)*$", // path
    "i" // case-insensitive
  );
  return pattern.test(inputText);
}

function showToast(message, isError = false, duration = 1000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.backgroundColor = isError ? "#e74c3c" : "#2ecc71";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function copyText(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast("Copied to clipboard!", false, 4000);
    })
    .catch((err) => {
      showToast("Failed to copy text", true);
      console.error("Failed to copy text:", err);
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convert-text-to-hex") {
    const text = request.text.replace(/\s+/g, "");
    const result = stringToHex(text);

    copyText(result);
  } else if (request.action === "convert-hex-to-text") {
    const text = request.text.replace(/\s+/g, "");
    const result = hexToString(text);

    copyText(result);
  } else if (request.action === "open-new-tab") {
    const text = request.text.replace(/\s+/g, "");
    const result = hexToString(text);
    const isValidURL = isValidURLChecker(result);

    if (isValidURL) {
      window.open(result, "_blank");
    } else {
      let url = "http://www.google.com/search?q=" + result;
      window.open(url, "_blank");
      // showToast("Invalid URL", true);
    }
  }
});
