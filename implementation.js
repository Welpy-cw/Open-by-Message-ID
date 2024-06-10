var { ExtensionCommon } = ChromeUtils.import(
  "resource://gre/modules/ExtensionCommon.jsm"
);

var { MailUtils } = ChromeUtils.import("resource:///modules/MailUtils.jsm");

var mailUtilsWrapper = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      mailUtilsWrapper: {
        handleNewsUri(newsUri) {
          MailUtils.handleNewsUri(
            newsUri,
            Services.wm.getMostRecentWindow("mail:3pane")
          );
        },
      },
    };
  }
};
