require("dotenv").config();
const { expect } = require("chai");
const randomstring = require("randomstring");
const OIDC = require("../pages/oidc");

//put this in .env file
const URL = process.env.TEST_URL;
const username = randomstring.generate(7);
let oidc = OIDC.withCromeDriver(URL);

describe("To Dashboard", () => {
  it("Should go to OIDC dashboard when clicking on login", async () => {
    await oidc.open();
    await oidc.findElementAndClick(OIDC.selectors.mainLoginButton);
    expect(await oidc.getUrl()).to.include("/loginid/login?challenge");
  });
  after(async () => {
    await oidc.close();
  });
});

describe("Dashboard Validations", () => {
  before(async () => {
    oidc = OIDC.withCromeDriver(URL);
    await oidc.addVirtualAuthenticator();
    await oidc.open();
  });

  it("Should not register a user with empty name", async () => {
    await oidc.findElementAndClick(OIDC.selectors.mainLoginButton);
    await oidc.makeMainAction(OIDC.actionTypes.REGISTER);
    await oidc.findElementAndClick(OIDC.selectors.loginIdMainAction);
    const errorText = await oidc.findElementAndGetText(
      OIDC.selectors.errorSection
    );
    expect(errorText).to.eq("Min. 2 characters required");
  });

  it("Should not login a user with an empty name", async () => {
    await oidc.makeMainAction(OIDC.actionTypes.LOGIN);
    await oidc.findElementAndClick(OIDC.selectors.loginIdMainAction);
    const errorText = await oidc.findElementAndGetText(
      OIDC.selectors.errorSection
    );
    expect(errorText).to.eq("Min. 2 characters required");
  });

  it("Should not login a user with 1 character long", async () => {
    await oidc.findElementAndType(OIDC.selectors.usernameInput, "z");
    await oidc.findElementAndClick(OIDC.selectors.loginIdMainAction);
    const errorText = await oidc.findElementAndGetText(
      OIDC.selectors.errorSection
    );
    expect(errorText).to.eq("Min. 2 characters required");
  });

  it("Should not register a user with 1 character long", async () => {
    await oidc.makeMainAction(OIDC.actionTypes.REGISTER);
    await oidc.findElementAndClick(OIDC.selectors.loginIdMainAction);
    const errorText = await oidc.findElementAndGetText(
      OIDC.selectors.errorSection
    );
    expect(errorText).to.eq("Min. 2 characters required");
  });

  after(async () => {
    await oidc.close();
  });
});

describe("Register", () => {
  before(async () => {
    oidc = OIDC.withCromeDriver(URL);
    await oidc.addVirtualAuthenticator();
    await oidc.open();
  });

  it("Should successfully register on LoginID dashboard", async () => {
    await oidc.register(username);
    expect(await oidc.getUrl()).to.eq(URL + "/dashboard");
  });

  it("Should logout successfully", async () => {
    await oidc.logout();
    expect(await oidc.getUrl()).to.eq(URL + "/");
  });
});

describe("Login", () => {
  it("Should successfully login on LoginID dashboard", async () => {
    await oidc.login();
    expect(await oidc.getUrl()).to.eq(URL + "/dashboard");
  });

  it("Should logout successfully", async () => {
    await oidc.logout();
    expect(await oidc.getUrl()).to.eq(URL + "/");
  });
});

after(async () => {
  await oidc.close();
});
