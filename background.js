const openMID = "openMID";
const openMIDFromDatabase = "openMIDDatabase";
const openMIDFromServer = "openMIDServer";
const openMIDInBrowser = "openMIDBrowser";

const links = ["link", "header_pane_link"];
const browserUrls = {
  Newsgrouper: "https://newsgrouper.org/<%mid>",
  Google: "https://groups.google.com/search?q=messageid%3A%mid",
  "Howard Knight": "http://al.howardknight.net/?STYPE=msgid&MSGI=<%mid>",
};

messenger.menus.create({
  contexts: links,
  title: "Open Message-ID",
  id: openMID,
  visible: false,
});

messenger.menus.create({
  contexts: links,
  title: "… from Database",
  id: openMIDFromDatabase,
  parentId: openMID,
});

messenger.menus.create({
  contexts: links,
  title: "… from News Server",
  id: openMIDFromServer,
  parentId: openMID,
});

messenger.menus.create({
  contexts: links,
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
    // While message-ids themselves are not URI-encoded and may contain the
    // percentage sign, certain special characters in 'news:' URIs containing
    // a message-id need to be percent-encoded.
    // @see {@link https://datatracker.ietf.org/doc/html/rfc5538#section-4}
    if (/^(s?news|nntp):.*@.*/.test(url)) {
      // Remove the part up to the last slash or colon and return the
      // percent-decoded message-id.
      return decodeURI(url.replace(/(.*(\/|:))(?!.*(\/|:))/, ""));
    }

    // Remove the part up to to the first colon and return the raw message-id.
    return url.replace(/.*?:/, "");
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
    const mid = encodeURI(extractMID(info.linkUrl));
    const messageList = await messenger.messages.query({
      online: true,
      headerMessageId: mid,
    });
    if (!messageList.messages.length) {
      return;
    }
    await messenger.messageDisplay
      .open({ messageId: messageList.messages[0].id })
      .catch((e) => {
        console.warn(e.message);
      });
    return;
  }

  if (info.menuItemId == openMIDInBrowser) {
    const { selectedLookupService } = await messenger.storage.local.get({
      selectedLookupService: "Newsgrouper"
    });
    const mid = encodeURIComponent(extractMID(info.linkUrl));
    browser.windows.openDefaultBrowser(
      browserUrls[selectedLookupService].replace(/%mid/, mid)
    );
    return;
  }
});
