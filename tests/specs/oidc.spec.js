const { expect } = require("chai");
const randomstring = require("randomstring");
const OIDC = require("../pages/oidc");

let oidc = OIDC.withAuthenticator();
const username = randomstring.generate(7);
//put this in .env file
const URL = "https://oidcc.herokuapp.com";

describe("To Dashboard", () => {
  it("Should go to OIDC dashboard when clicking on login", async () => {
    await oidc.open(URL);
    await oidc.findElementAndClick(OIDC.selectors.mainLoginButton);
    expect(await oidc.getUrl()).to.include("/oidc/loginid/");
  });
  after(async () => {
    await oidc.close();
  });
});

/*
describe("Dashboard Validations", () => {
	it("Should not register a username with less than 2 ")
  after(async () => {
    //await oidc.close();
  });
});
*/

describe("Register", () => {
  before(async () => {
    oidc = OIDC.withAuthenticator();
    oidc.open(URL);
  });

  it("Should successfully register on LoginID dashboard", async () => {
    await oidc.register(username);
  });
});
