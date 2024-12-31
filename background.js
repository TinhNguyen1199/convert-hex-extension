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
    id: "convert-text-to-hex",
    title: "Convert đoạn text sang mã hex và copy",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-new-tab") {
    chrome.tabs.sendMessage(tab.id, {
      action: "open-new-tab",
      text: info.selectionText,
    });
  } else if (info.menuItemId === "convert-text-to-hex") {
    chrome.tabs.sendMessage(tab.id, {
      action: "convert-text-to-hex",
      text: info.selectionText,
    });
  } else if (info.menuItemId === "convert-hex-to-text") {
    chrome.tabs.sendMessage(tab.id, {
      action: "convert-hex-to-text",
      text: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openIncognito") {
    chrome.windows.create(
      {
        url: message.url,
        incognito: true,
      },
      (window) => {
        console.log("Incognito window opened:", window);
      }
    );
  }
});
