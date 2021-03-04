require("chromedriver");
const webdriver = require("selenium-webdriver");
const { Command } = require("selenium-webdriver/lib/Command");

module.exports = class Driver {
  static chromeDriver() {
    const driver = new webdriver.Builder().forBrowser("chrome").build();
    return driver;
  }

  static async withAuthenticator(driver) {
    const sessionId = (await driver.getSession()).id_;

    driver
      .getExecutor()
      .defineCommand(
        "AddVirtualAuthenticator",
        "POST",
        `/session/${sessionId}/webauthn/authenticator`
      );

    const addVirtualAuthCommand = new Command("AddVirtualAuthenticator");
    addVirtualAuthCommand.setParameter("protocol", "ctap2");
    addVirtualAuthCommand.setParameter("transport", "internal");
    addVirtualAuthCommand.setParameter("hasResidentKey", true);
    addVirtualAuthCommand.setParameter("isUserConsenting", true);
    addVirtualAuthCommand.setParameter("isUserVerified", true);
    addVirtualAuthCommand.setParameter("hasUserVerification", true);
    await driver.getExecutor().execute(addVirtualAuthCommand);

    return driver;
  }
};
