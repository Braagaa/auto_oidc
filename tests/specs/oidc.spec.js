require("dotenv").config();
const { expect } = require("chai");
const randomstring = require("randomstring");
const OIDC = require("../pages/oidc");
const Integrations = require("../../scripts/integrations");

//put this in .env file
const dashboardUsername = process.env.DASHBOARD_USERNAME;
const password = process.env.DASHBOARD_PASSWORD;
const env = process.env.DASHBOARD_ENVIRONMENT;
const testURL = process.env.TEST_URL;
const username = randomstring.generate(7);
const username1 = randomstring.generate(7);
const integration = new Integrations(dashboardUsername, password, env);
let oidc = OIDC.withCromeDriver(testURL);

describe("To Dashboard", () => {
  it("Should go to OIDC dashboard when clicking on login", async () => {
    await integration.tryLogin();
    const { client_id, client_secret, uri } = await integration.createOIDC(
      randomstring.generate(7),
      testURL + "/callback"
    );

    await oidc.open();
    await oidc.configure(client_id, uri, client_secret);
    await oidc.findElementAndClick(OIDC.selectors.mainLoginButton);
    expect(await oidc.getUrl()).to.include("/loginid/login?challenge");
  });
  after(async () => {
    await oidc.close();
  });
});

describe("Dashboard Validations", () => {
  before(async () => {
    oidc = OIDC.withCromeDriver(testURL);
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
    oidc = OIDC.withCromeDriver(testURL);
    await oidc.addVirtualAuthenticator();
    await oidc.open();
  });

  it("Should successfully register on LoginID dashboard", async () => {
    await oidc.register(username);
    expect(await oidc.getUrl()).to.eq(testURL + "/dashboard");
  });

  it("Should logout successfully", async () => {
    await oidc.logout();
    expect(await oidc.getUrl()).to.eq(testURL + "/");
  });
});

describe("Login", () => {
  it("Should successfully login on LoginID dashboard", async () => {
    await oidc.login();
    expect(await oidc.getUrl()).to.eq(testURL + "/dashboard");
  });

  it("Should logout successfully", async () => {
    await oidc.logout();
    expect(await oidc.getUrl()).to.eq(testURL + "/");
  });

  after(async () => {
    await oidc.close();
  });
});

describe("Cancelled Register", () => {
  before(async () => {
    oidc = OIDC.withCromeDriver(testURL);
    await oidc.addVirtualAuthenticator();
    await oidc.open();
  });

  it("Should register after retying cancelled prompt", async () => {
    await oidc.cancelRegister(username1);
    expect(await oidc.getUrl()).to.eq(testURL + "/dashboard");
  });

  after(async () => {
    await oidc.logout();
  });
});

describe("Cancelled Login", () => {
  it("Should login after retying cancelled prompt", async () => {
    await oidc.cancelLogin();
    expect(await oidc.getUrl()).to.eq(testURL + "/dashboard");
  });
});

after(async () => {
  await oidc.close();
});
