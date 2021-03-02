module.exports = class Page {
  constructor(driver) {
    this.driver = driver;
  }

  async open(url) {
    await this.driver.get(url);
  }

  async close() {
    await this.driver.close();
  }

  async getUrl() {
    return await this.driver.getCurrentUrl();
  }

  async findElementAndGetText(selector) {
    return await this.driver.findElement(selector).then((elm) => elm.getText());
  }

  async findElementAndClick(selector) {
    await this.driver.findElement(selector).then((elm) => elm.click());
  }

  async findElementAndType(selector, text) {
    await this.driver.findElement(selector).then((elm) => elm.sendKeys(text));
  }
};
