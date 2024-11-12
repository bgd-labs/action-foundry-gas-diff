import { expect, it, describe } from "vitest";
import { getHtmlGasReport } from "./lib";
import gas from "../mocks/gas.json";
import gasRoot from "../mocks/gas.backup.json";

describe("lib", () => {
  it("should generate a well formatted report with empty root", () => {
    expect(
      getHtmlGasReport([], gas as any, {
        rootUrl: "https://github.com/",
      }),
    ).toMatchSnapshot();
  });
  it("should generate a well formatted report with existing root", () => {
    expect(
      getHtmlGasReport(gasRoot as any, gas as any, {
        rootUrl: "https://github.com/",
      }),
    ).toMatchSnapshot();
  });
  it("should generate a well formatted report with existing root & skip unchanged", () => {
    expect(
      getHtmlGasReport(gasRoot as any, gas as any, {
        rootUrl: "https://github.com/",
        ignoreUnchanged: true,
      }),
    ).toMatchSnapshot();
  });
});
