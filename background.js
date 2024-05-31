const openMID = "openMID";
const openMIDFromDatabase = "openMIDDatabase";
const openMIDFromServer = "openMIDServer";
const openMIDInBrowser = "openMIDBrowser";

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
  title: "… from Server",
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

messenger.menus.onClicked.addListener((info, tab) => {
  const extractMID = (url) => {
    return decodeURI(url.replace(/(.*(\/|:))(?!.*(\/|:))/, ""))
  }

  const extractServer = (url) => {
    const found = url.match(/^.*:\/\/(.*)\//);
    return found?.length > 1 ? decodeURI(found[1]) : "";
  }


  if (info.menuItemId == openMIDFromDatabase) {
    messenger.mailUtilsWrapper.openMessageForMessageId(extractMID(info.linkUrl), tab);
    return;
  }

  if (info.menuItemId == openMIDFromServer) {
    messenger.mailUtilsWrapper.handleNewsUri(`news://${extractServer(info.linkUrl)}/${extractMID(info.linkUrl)}`);
    return;
  }

  if (info.menuItemId == openMIDInBrowser) {
    messenger.mailUtilsWrapper.openBrowserWithMessageId(extractMID(info.linkUrl));
    return;
  }
});
