const textareaEl = document.getElementById("inputText");
const convertedTextSpanEl = document.getElementById("convertedTextSpan");
const groupBtnActionEl = document.getElementById("groupBtnAction");
const openInNewTabEl = document.getElementById("openInNewTab");
const inputTextEl = document.getElementById("inputText");
const titleEl = document.getElementById("titleText");
const toggleConvertEl = document.getElementById("toggleConvert");

function hexToText(hex) {
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

function showToast(message, isError = false, duration = 1000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.backgroundColor = isError ? "#e74c3c" : "#2ecc71";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function toggleConvert(isUserClicked = false) {
  if (titleEl.textContent === "Hex to Text Converter") {
    titleEl.textContent = "Text to Hex Converter";
    inputTextEl.placeholder = "Enter text to convert to hex...";
    inputTextEl.value = "";
    convertedTextSpanEl.textContent = "Converted hex will appear here...";
  } else {
    titleEl.textContent = "Hex to Text Converter";
    inputTextEl.placeholder = "Enter hex to convert to text...";
    inputTextEl.value = "";
    convertedTextSpanEl.textContent = "Converted text will appear here...";
  }

  groupBtnActionEl.style.display = "none";
  openInNewTabEl.style.display = "none";

  if (isUserClicked) {
    chrome.storage.local.set({ mode: titleEl.textContent });
    chrome.storage.local.remove(["inputText", "lastConvertedText"]);

    // Add fade-out effect
    toggleConvertEl.style.transition = "opacity 2s";
    toggleConvertEl.style.opacity = "0";

    // Disable the button
    toggleConvertEl.disabled = true;

    // Re-enable the button and remove fade-out effect after 1 seconds
    setTimeout(() => {
      toggleConvertEl.style.opacity = "1";
      toggleConvertEl.disabled = false;
    }, 500);
  }
}

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(
    ["inputText", "lastConvertedText", "mode"],
    (result) => {
      if (result.mode) {
        titleEl.textContent = result.mode;

        if (result.mode === "Hex to Text Converter") {
          titleEl.textContent = "Hex to Text Converter";
          groupBtnActionEl.style.display = result?.inputText ? "block" : "none";
          inputTextEl.value = result?.inputText || "";
          convertedTextSpanEl.textContent =
            result?.lastConvertedText || "Converted text will appear here...";
        } else {
          titleEl.textContent = "Text to Hex Converter";
          groupBtnActionEl.style.display = result?.inputText ? "block" : "none";
          inputTextEl.value = result?.inputText || "";
          convertedTextSpanEl.textContent =
            result?.lastConvertedText || "Converted hex will appear here...";
          openInNewTabEl.style.display = "none";
        }
      }
    }
  );
});

document.getElementById("hexDecode").addEventListener("click", () => {
  const inputText = inputTextEl.value;

  if (!inputText) {
    return;
  }

  if (titleEl.textContent === "Hex to Text Converter") {
    const convertedText = hexToText(inputText.replace(/\s+/g, ""));

    convertedTextSpanEl.textContent = convertedText;

    if (convertedText != "Invalid hex input") {
      groupBtnActionEl.style.display = "block";
      openInNewTabEl.style.display = "inline-block";
      convertedTextSpanEl.style.color = "black";

      chrome.storage.local.set({ inputText, lastConvertedText: convertedText });
    } else {
      convertedTextSpanEl.style.color = "#e74c3c";
      groupBtnActionEl.style.display = "none";
    }
  } else {
    const convertedText = inputText
      .split("")
      .map((char) => char.charCodeAt(0).toString(16))
      .join("");
    convertedTextSpanEl.textContent = convertedText;
    groupBtnActionEl.style.display = "block";
    convertedTextSpanEl.style.color = "black";
    openInNewTabEl.style.display = "none";

    chrome.storage.local.set({ inputText, lastConvertedText: convertedText });
  }
});

document.getElementById("copyToClipboard").addEventListener("click", () => {
  const convertedText = convertedTextSpanEl.textContent;

  navigator.clipboard
    .writeText(convertedText)
    .then(() => {
      showToast("Copied to clipboard!");
    })
    .catch((err) => {
      showToast("Failed to copy text", true);
      console.error("Failed to copy text:", err);
    });
});

document.getElementById("openInNewTab").addEventListener("click", () => {
  const convertedText = convertedTextSpanEl.textContent;

  if (isValidURL(convertedText)) {
    window.open(convertedText, "_blank");
  } else {
    showToast("Invalid URL", true);
  }
});

document.getElementById("clearIcon").addEventListener("click", () => {
  textareaEl.value = "";
  convertedTextSpanEl.style.color = "black";
  convertedTextSpanEl.textContent = "Converted text will appear here...";
  groupBtnActionEl.style.display = "none";
});

document.getElementById("toggleConvert").addEventListener("click", () => {
  toggleConvert(true);
});
