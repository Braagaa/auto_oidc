const Driver = require("./driver");
const Page = require("./main");

module.exports = class OIDC extends Page {
  static selectors = {
    mainLoginButton: { css: ".login__button" },
    loginIdOtherAction: { css: ".otheraction" },
    loginIdMainAction: { css: "button" },
    usernameInput: { xpath: "//input" },
  };

  static actionTypes = {
    REGISTER: "Register",
    LOGIN: "Login",
  };

  static withAuthenticator() {
    return new OIDC(Driver.withAuthenticator());
  }

  constructor(driver) {
    super(driver);
  }

  async makeMainAction(type) {
    const mainText = await this.findElementAndGetText(
      OIDC.selectors.loginIdMainAction
    );

    if (type !== mainText) {
      await this.findElementAndClick(OIDC.selectors.loginIdOtherAction);
    }
  }

  async register(username) {
    await this.findElementAndClick(OIDC.selectors.mainLoginButton);
    await this.makeMainAction(OIDC.actionTypes.REGISTER);
    await this.findElementAndType(OIDC.selectors.usernameInput, username);
  }
};
