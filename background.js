chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-new-tab",
    title: "Giải mã và mở trang mới hoặc tìm kiếm trên Google",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "convert-hex-to-text",
    title: "Convert mã hex sang text và copy",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "convert-to-hex",
    title: "Convert đoạn text sang mã hex và copy",
    contexts: ["selection"],
  });
});

function stringToHex(str) {
  try {
    return Array.from(str)
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    console.error("Không thể convert mã hex:", error);
    return "Invalid text input";
  }
}

function hexToString(hex) {
  try {
    return hex
      .match(/.{1,2}/g)
      .map((byte) => String.fromCharCode(parseInt(byte, 16)))
      .join("");
  } catch (error) {
    console.error("Không thể convert mã hex:", error);
    return "Invalid hex input";
  }
}

function showToast(message, isError = false, duration = 1000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.backgroundColor = isError ? "#e74c3c" : "#2ecc71";
  toast.style.color = "#fff";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "5px";
  toast.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
  toast.style.zIndex = "10000";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

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

function copyToClipboard(tab, text) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (text) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast("Copied to clipboard!");
        })
        .catch((err) => {
          showToast("Could not copy text", true);
          console.error("Could not copy text: ", err);
        });
    },
    args: [text],
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-new-tab") {
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: (selectionText) => {
          alert("selectionText", selectionText);
        },
        args: [info.selectionText],
      })
      .then(() => console.log("injected a function"));
  } else if (info.menuItemId === "convert-to-hex") {
    const text = info.selectionText || "";
    const hex = stringToHex(text);

    copyToClipboard(tab, hex);

    chrome.tabs.sendMessage(tab.id, { action: "copyHex", hex });
  } else if (info.menuItemId === "convert-hex-to-text") {
    const hex = info.selectionText || "";
    const text = hexToString(hex);

    copyToClipboard(tab, text);

    chrome.tabs.sendMessage(tab.id, { action: "copyText", text });
  }

  if (info.menuItemId === "alertMenuItem") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => showToast("Hello from context menu!"),
    });
  }
});
