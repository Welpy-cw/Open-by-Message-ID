const openMID = "openMID";
const openMIDFromDatabase = "openMIDDatabase";
const openMIDFromServer = "openMIDServer";
const openMIDInBrowser = "openMIDBrowser";

const browserUrls = {
  Google: "https://groups.google.com/search?q=messageid%3A%mid",
  "Howard Knight": "http://al.howardknight.net/?STYPE=msgid&MSGI=<%mid>",
};

messenger.menus.create({
  contexts: ["link"],
  title: "Open Message-ID",
  id: openMID,
  visible: false,
});

messenger.menus.create({
  contexts: ["link"],
  title: "… from Database",
  id: openMIDFromDatabase,
  parentId: openMID,
});

messenger.menus.create({
  contexts: ["link"],
  title: "… from News Server",
  id: openMIDFromServer,
  parentId: openMID,
});

messenger.menus.create({
  contexts: ["link"],
  title: "… in Browser",
  id: openMIDInBrowser,
  parentId: openMID,
});

messenger.menus.onShown.addListener((info, tab) => {
  if (!info.linkUrl) {
    return;
  }

  const isVisible = /^(mid|mailto|s?news|nntp):.*@.*/.test(info.linkUrl);
  messenger.menus.update(openMID, {
    visible: isVisible,
  });
  messenger.menus.refresh();
});

messenger.menus.onClicked.addListener(async (info, tab) => {
  const extractMID = (url) => {
    return decodeURI(url.replace(/(.*(\/|:))(?!.*(\/|:))/, ""));
  };

  const extractServer = (url) => {
    const found = url.match(/^.*:\/\/(.*)\//);
    return found?.length > 1 ? decodeURI(found[1]) : "";
  };

  if (info.menuItemId == openMIDFromDatabase) {
    const mid = extractMID(info.linkUrl);
    const displayedMessage = await messenger.messageDisplay.getDisplayedMessage(
      await messenger.tabs.getCurrent()
    );
    const messageList = await messenger.messages.query({
      accountId: displayedMessage.folder.accountId,
      headerMessageId: mid,
    });
    await messenger.messageDisplay
      .open(
        messageList.messages.length
          ? { messageId: messageList.messages[0].id }
          : { headerMessageId: mid }
      )
      .catch((e) => {
        console.warn(e.message);
      });
    return;
  }

  if (info.menuItemId == openMIDFromServer) {
    messenger.mailUtilsWrapper.handleNewsUri(
      `news://${extractServer(info.linkUrl)}/${extractMID(info.linkUrl)}`
    );
    return;
  }

  if (info.menuItemId == openMIDInBrowser) {
    const { selectedLookupService } = await messenger.storage.local.get({
      selectedLookupService: "Google",
    });
    const mid = encodeURIComponent(extractMID(info.linkUrl));
    browser.windows.openDefaultBrowser(
      browserUrls[selectedLookupService].replace(/%mid/, mid)
    );
    return;
  }
});
