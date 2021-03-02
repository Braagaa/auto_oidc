require("chromedriver");
const webdriver = require("selenium-webdriver");
const { Command } = require("selenium-webdriver/lib/Command");

module.exports = class Driver {
  static withAuthenticator() {
    const driver = new webdriver.Builder().forBrowser("chrome").build();
    const session = driver.getSession();

    console.log(session);

    driver
      .getExecutor()
      .defineCommand(
        "AddVirtualAuthenticator",
        "POST",
        "/session/:sessionId/webauthn/authenticator"
      );

    const addVirtualAuthCommand = new Command("AddVirtualAuthenticator");
    addVirtualAuthCommand.setParameters({
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      isUserVerified: true,
      hasUserVerification: true,
      isUserConsenting: true,
    });

    driver.getExecutor().execute(addVirtualAuthCommand);

    return driver;
  }
};
