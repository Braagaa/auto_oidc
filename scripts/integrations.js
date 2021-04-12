const nodeFetch = require("node-fetch");
const fetchCookie = require("fetch-cookie");

const fetch = fetchCookie(nodeFetch);

module.exports = class Integraions {
  constructor(username, password, baseURL) {
    this.username = username;
    this.password = password;
    this.baseURL = baseURL;
    this.clientId = "c84df67b-4b0f-4ae4-8e5c-ba266906ad69.loginid.io";
    this.userCookie = "";
    this.userId = "";
    this.csrfToken = "";
    this.orgId = "";
  }

  async _request(url, body = {}, headers = {}, method = "POST") {
    return await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  }

  async _getJSON(res) {
    const data = await res.json();
    if (!res.ok) {
      throw data;
    }
    return data;
  }

  authHeaders() {
    return { Cookie: this.userCookie, "x-csrf-token": this.csrfToken };
  }

  async register() {
    console.log(`Trying to register ${this.username}...`);
    const resInit = await this._request(
      `${this.baseURL}/api/dashboard/native/register/init`,
      { clientId: this.clientId, udata: this.username }
    );

    const initData = await resInit.json();

    if (!resInit.ok) return initData;

    const resRegister = await this._request(
      `${this.baseURL}/api/dashboard/native/register/complete`,
      {
        strategy: "password",
        payload: {
          password: this.password,
          password_confirmation: this.password,
        },
        client_id: this.clientId,
        username: this.username,
      },
      { Origin: this.baseURL }
    );
    this.userCookie = resRegister.headers.get("set-cookie");

    const data = await this._getJSON(resRegister);
    this.userId = data.user.id;

    return data;
  }

  async login() {
    console.log(`Trying to login ${this.username}...`);
    const res = await this._request(
      `${this.baseURL}/api/dashboard/native/authenticate/complete`,
      {
        strategy: "password",
        payload: { password: this.password },
        client_id: this.clientId,
        username: this.username,
      }
    );
    const data = await this._getJSON(res);
    this.userCookie = res.headers.get("set-cookie");
    this.userId = data.user.id;
  }

  async getCsrfToken() {
    const res = await fetch(`${this.baseURL}/api/dashboard/is-logged-in`, {
      headers: { Cookie: this.userCookie },
    });
    if (!res.ok) await this._getJSON(res);
    this.csrfToken = res.headers.get("x-csrf-token");
  }

  async setWorkspace() {
    const res = await fetch(
      `${this.baseURL}/api/dashboard/admins/${this.userId}/organizations`,
      { headers: this.authHeaders() }
    );
    const [data] = await this._getJSON(res);
    this.orgId = data.organization.id;
  }

  async signLicense() {
    const res = await this._request(
      `${this.baseURL}/api/dashboard/licenses/developer/organizations/${this.orgId}`,
      { claSigned: true },
      this.authHeaders(),
      "PUT"
    );
    await this._getJSON(res);
  }

  async tryLogin() {
    const result = await this.register();
    if (result.code === "username_taken") {
      console.log(`Registering failed trying to login ${this.username}`);
      await this.login();
    }
    console.log("Obtaining CSRF token");
    await this.getCsrfToken();
    console.log("Setting workspace");
    await this.setWorkspace();
  }

  async createOIDC(name, callbackUri) {
    console.log("Signing license");
    await this.signLicense();
    console.log(`Creating integration: ${name}`);
    const res = await this._request(
      `${this.baseURL}/api/dashboard/clients/organizations/${this.orgId}/integrations/oidc`,
      {
        name,
        scope: "",
        redirect_uris: [callbackUri],
        overload_endpoints: false,
      },
      { ...this.authHeaders(), origin: this.baseURL }
    );
    const { client_id, client_secret } = await this._getJSON(res);
    const uri = `https://oauth2.${this.baseURL.replace(
      /(https:\/\/)|(http:\/\/)/,
      ""
    )}`;
    return { client_id, client_secret, uri };
  }
};
