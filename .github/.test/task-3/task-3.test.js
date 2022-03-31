import { JSDOM } from "jsdom";
import path from "path";
import { it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import "@testing-library/jest-dom";
import * as catApi from "./cat-api.js";

/** @jest-environment ./environments/dom.js */

/** @type {JSDOM["window"]} */
let window;

/** @type {JSDOM["window"]["document"]} */
let document;

const filePath = path.resolve("..", "..", "task-3", "index.html");

const json = jest.fn(async () => catApi.primaryResponse);
const fetch = jest.fn(async () => {
  return {
    ok: true,
    status: 200,
    json,
  };
});

// Currently using beforeEach (instead of beforeAll), which is maybe wasteful (since the setup takes ~400ms).
// But the benefit is that the tests should be isolated (with a fresh context) and not related/dependent on each other.
// Currently, this test file takes ~7 seconds on an old-ish machine.
// Could maybe switch to beforeAll, which should make the tests complete faster, but will need to rewrite some of the tests
// in a way that makes them order sensitive and rely on effects from previous tests (which I wanted to avoid).
beforeEach(async () => {
  const jsdom = await JSDOM.fromFile(filePath, {
    contentType: "text/html",
    runScripts: "dangerously",
    resources: "usable",
    beforeParse(window) {
      window.fetch = fetch;
      jest.spyOn(window.document, "querySelector");
    },
  });

  window = jsdom.window;
  document = window.document;

  await new Promise((resolve) => {
    document.addEventListener("load", resolve, { once: true });
  });
});

afterEach(() => {
  json.mockClear();
  fetch.mockClear();
});

it("should contain a button", () => {
  const button = document.querySelector("button");
  expect(button).toBeInTheDocument();
});

it("should contain an image", () => {
  const image = document.querySelector("img");
  expect(image).toBeInTheDocument();
});

it("should call fetch with correct url", async () => {
  expect(fetch).toHaveBeenCalledWith(
    "https://api.thecatapi.com/v1/images/search"
  );
});

it("should set image source based on data fetched from API", async () => {
  const img = document.querySelector("img");
  const button = document.querySelector("button");

  const { url } = catApi.secondaryResponse[0];
  json.mockResolvedValueOnce(catApi.secondaryResponse);

  expect(img.src).not.toBe(url);
  // Can probably use user event here instead.
  button.click();

  await new Promise((resolve) => setImmediate(resolve));

  expect(img.src).toBe(url);
});
