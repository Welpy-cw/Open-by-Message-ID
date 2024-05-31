var { ExtensionCommon } = ChromeUtils.import(
  "resource://gre/modules/ExtensionCommon.jsm"
);

var { MailUtils } = ChromeUtils.import("resource:///modules/MailUtils.jsm");

var mailUtilsWrapper = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      mailUtilsWrapper: {
        openMessageForMessageId(messageID, tab) {
          const nativeTab = context.extension.tabManager.get(tab.id).nativeTab;
          const browser = nativeTab.chromeBrowser ?? tab.messageBrowser;
          const startServer = browser?.contentWindow.gFolder?.server;
          MailUtils.openMessageForMessageId(messageID, startServer);
        },
        handleNewsUri(newsUri) {
          MailUtils.handleNewsUri(
            newsUri,
            Services.wm.getMostRecentWindow("mail:3pane")
          );
        },
        openBrowserWithMessageId(messageID) {
          MailUtils.openBrowserWithMessageId(messageID);
        },
      },
    };
  }
};
