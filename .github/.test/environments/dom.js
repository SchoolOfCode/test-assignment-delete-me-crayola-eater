import JsDomEnvironment from "jest-environment-jsdom";

export default class CustomTestEnvironment extends JsDomEnvironment {
  async setup() {
    await super.setup();
    // See: https://stackoverflow.com/a/57713960
    this.global.TextEncoder ??= TextEncoder;
    this.global.TextDecoder ??= TextDecoder;
  }
}
