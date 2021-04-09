const Driver = require("./driver");
const Page = require("./main");

module.exports = class OIDC extends Page {
  static selectors = {
    mainLoginButton: { css: ".login__button" },
    loginIdOtherAction: { css: ".otheraction" },
    loginIdMainAction: { css: "button" },
    usernameInput: { xpath: "//input" },
    errorSection: { css: ".error-section" },
    apiKeyInput: { css: "input[placeholder='API Key']" },
    baseUriInput: { css: "input[placeholder='Base URI']" },
    appSecretInput: { css: "input[placeholder='App Secret']" },
    configButton: { css: ".configure__button" },
  };

  static actionTypes = {
    REGISTER: "Register",
    LOGIN: "Login",
  };

  static withCromeDriver(baseURL) {
    return new OIDC(Driver.chromeDriver(), baseURL);
  }

  static withEdgeDriver(baseURL) {
    return new OIDC(Driver.edgeDriver(), baseURL);
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

  async configure(apiKey, baseUri, appSecret) {
    await this.findElementAndType(OIDC.selectors.apiKeyInput, apiKey);
    await this.findElementAndType(OIDC.selectors.baseUriInput, baseUri);
    await this.findElementAndType(OIDC.selectors.appSecretInput, appSecret);
    await this.findElementAndClick(OIDC.selectors.configButton);
    await this.driver.sleep(3000);
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
    await this.driver.sleep(2000);
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
    await this.waitForUrl(this.baseURL + "/dashboard");
  }

  async cancelLogin() {
    await this.driver.sleep(1500);
    await this.findElementAndClick(OIDC.selectors.mainLoginButton);
    await this.setUserVerified(false);
    await this.waitForUrl("/loginid/login?challenge");
    await this.setUserVerified(true);
    await this.findElementAndClick(OIDC.selectors.loginIdMainAction);
    await this.waitForUrl(this.baseURL + "/dashboard");
  }
};
