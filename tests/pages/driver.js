require("chromedriver");
const webdriver = require("selenium-webdriver");
const { Command } = require("selenium-webdriver/lib/Command");

module.exports = class Driver {
  static commands = {
    ADDVIRTUALAUTHENTICATOR: "AddVirtualAuthenticator",
    SETUSERVERIFIED: "SetUserVerified",
  };

  static chromeDriver() {
    const driver = new webdriver.Builder().forBrowser("chrome").build();
    return driver;
  }

  static withAuthenticator(driver) {
    const executor = driver.getExecutor();

    executor.defineCommand(
      Driver.commands.ADDVIRTUALAUTHENTICATOR,
      "POST",
      "/session/:sessionId/webauthn/authenticator"
    );
    executor.defineCommand(
      Driver.commands.SETUSERVERIFIED,
      "POST",
      "/session/:sessionId/webauthn/authenticator/:authenticatorId/uv"
    );
  }

  static async addVirtualAuthenticator(driver) {
    const sessionId = (await driver.getSession()).id_;

    const addVirtualAuthCommand = new Command(
      Driver.commands.ADDVIRTUALAUTHENTICATOR
    );
    addVirtualAuthCommand.setParameter("sessionId", sessionId);
    addVirtualAuthCommand.setParameter("protocol", "ctap2");
    addVirtualAuthCommand.setParameter("transport", "internal");
    addVirtualAuthCommand.setParameter("hasResidentKey", true);
    addVirtualAuthCommand.setParameter("isUserConsenting", true);
    addVirtualAuthCommand.setParameter("isUserVerified", true);
    addVirtualAuthCommand.setParameter("hasUserVerification", true);
    const authenticatorId = await driver
      .getExecutor()
      .execute(addVirtualAuthCommand);

    return { driver, authenticatorId };
  }

  static async setUserVerified(driver, authenticatorId, isUserVerified) {
    const sessionId = (await driver.getSession()).id_;

    const setUserVerified = new Command(Driver.commands.SETUSERVERIFIED);
    setUserVerified.setParameters({
      sessionId,
      authenticatorId,
      isUserVerified,
    });

    await driver.getExecutor().execute(setUserVerified);
  }
};
