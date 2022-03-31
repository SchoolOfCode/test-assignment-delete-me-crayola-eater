import { JSDOM } from "jsdom";
import path from "path";
import { it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import "@testing-library/jest-dom";

/** @jest-environment ./environments/dom.js */

/** @type {JSDOM["window"]} */
let window;

/** @type {JSDOM["window"]["document"]} */
let document;

/** @type {HTMLParagraphElement} */
let p;

const filePath = path.resolve("..", "..", "task-2", "index.html");

// Currently using beforeEach (instead of beforeAll), which is maybe wasteful (since the setup takes ~400ms).
// But the benefit is that the tests should be isolated (with a fresh context) and not related/dependent on each other.
// Currently, this test file takes ~7 seconds on an old-ish machine.
// Could maybe switch to beforeAll, which should make the tests complete faster, but will need to rewrite some of the tests
// in a way that makes them order sensitive and rely on effects from previous tests (which I wanted to avoid).
beforeEach(async () => {
  jest.useFakeTimers();

  const jsdom = await JSDOM.fromFile(filePath, {
    contentType: "text/html",
    runScripts: "dangerously",
    resources: "usable",
    beforeParse(window) {
      // TODO: might be a cleaner way (than to mutate objects we don't own).
      // The reason for overwriting window's properties is to use
      // jest's fake timers (instead of having to wait for real time to elapse).
      // Supposedly, jest.useFakeTimers() is meant to cover jsdom timers,
      // but couldn't get it all to work. Seems easier to keep testEnvironment=node and
      // import/set up JSDOM in the test.
      window.setTimeout = global.setTimeout;
      window.setInterval = global.setInterval;
      window.clearInterval = global.clearInterval;
      window.clearTimeout = global.clearTimeout;
      jest.spyOn(window, "setInterval");
      jest.spyOn(window, "clearInterval");
      jest.spyOn(window.document, "querySelector");
    },
  });

  window = jsdom.window;
  document = window.document;

  await new Promise((resolve) => {
    document.addEventListener("load", resolve, { once: true });
  });

  p = document.querySelector("p");
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

it("should call setInterval", () => {
  expect(window.setInterval).toHaveBeenCalled();
});

it("should pass a function and 1000 as arguments to setInterval", () => {
  const expectedArguments = [expect.any(Function), 1_000];
  expect(window.setInterval).toHaveBeenCalledWith(...expectedArguments);
});

it.concurrent.each(Array.from({ length: 13 }, (_, i) => [`${i}`, i]))(
  "should display %d in paragraph element after %d second(s)",
  (expected, seconds) => {
    jest.advanceTimersByTime(seconds * 1_000);
    expect(p).toHaveTextContent(expected);
  }
);

it("should call clearInterval", () => {
  jest.advanceTimersByTime(13_000);
  expect(window.clearInterval).toHaveBeenCalled();
});

it("should call clearInterval with the value returned from setInterval", () => {
  const intervalId = window.setInterval.mock.results?.[0].value;
  jest.advanceTimersByTime(13_000);
  expect(window.clearInterval).toHaveBeenCalledWith(intervalId);
});

it("should still display 12 in paragraph element after an hour", () => {
  jest.advanceTimersByTime(3_600_000);
  expect(p).toHaveTextContent("12");
});
