const Driver = require("./driver");
const Page = require("./main");

module.exports = class OIDC extends Page {
  static selectors = {
    mainLoginButton: { css: ".login__button" },
    loginIdOtherAction: { css: ".otheraction" },
    loginIdMainAction: { css: "button" },
    usernameInput: { xpath: "//input" },
    errorSection: { css: ".error-section" },
  };

  static actionTypes = {
    REGISTER: "Register",
    LOGIN: "Login",
  };

  static withCromeDriver(baseURL) {
    return new OIDC(Driver.chromeDriver(), baseURL);
  }

  constructor(driver, baseURL) {
    super(driver);
    this.baseURL = baseURL;
  }

  async open() {
    await super.open(this.baseURL);
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
    await this.findElementAndClick(OIDC.selectors.loginIdMainAction);
    await this.waitForUrl(this.baseURL + "/dashboard");
  }

  async login() {
    await this.driver.sleep(1500);
    await this.findElementAndClick(OIDC.selectors.mainLoginButton);
    await this.waitForUrl("/loginid/login?challenge");
    await this.waitForUrl(this.baseURL + "/dashboard");
  }

  async logout() {
    await this.findElementAndClick(OIDC.selectors.mainLoginButton);
    await this.waitForUrl(this.baseURL);
  }

  async cancelRegister(username) {
    await this.findElementAndClick(OIDC.selectors.mainLoginButton);
    await this.makeMainAction(OIDC.actionTypes.REGISTER);
    await this.findElementAndType(OIDC.selectors.usernameInput, username);
    await this.setUserVerified(false);

    const mainAction = this.driver.findElement(
      OIDC.selectors.loginIdMainAction
    );
    await mainAction.click();
    await this.setUserVerified(true);
    await mainAction.click();
  }
};
