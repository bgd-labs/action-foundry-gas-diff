"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib.ts
var lib_exports = {};
__export(lib_exports, {
  getHtmlGasReport: () => getHtmlGasReport
});
module.exports = __toCommonJS(lib_exports);
var UP = `\u2191`;
var DOWN = `\u2193`;
function findContract(contract, snapshot) {
  return snapshot.find((item) => item.contract === contract);
}
function findFunction(fn, snapshot) {
  return snapshot[fn];
}
function formatValue(before, after) {
  if (!before || after === before) return after;
  const diff = (after - before) / Math.abs(before) * 100;
  return `<sup title="${before}">${diff > 0 ? UP : DOWN}${new Intl.NumberFormat(
    "en-US",
    {
      maximumSignificantDigits: 2
    }
  ).format(diff)}%</sup>${after}`;
}
function getHtmlGasReport(before, after, options = {}) {
  let content = "";
  after.map((item) => {
    const contractBefore = findContract(item.contract, before);
    if (options.ignoreUnchanged && contractBefore && JSON.stringify(item) === JSON.stringify(contractBefore))
      return;
    const [path, name] = item.contract.split(":");
    content += `### [${name}](${options.rootUrl}${path})

- gas: ${formatValue(contractBefore?.deployment.gas, item.deployment.gas)}
-size: ${formatValue(contractBefore?.deployment.size, item.deployment.size)}

`;
    if (options.ignoreUnchanged && contractBefore && JSON.stringify(item.functions) === JSON.stringify(contractBefore.functions))
      return;
    else {
      let rows = `| Method | min | mean | median | max | calls |
| --- | ---: | ---: | ---: | ---: | ---: |
`;
      Object.entries(item.functions).map(([method, values]) => {
        const before2 = contractBefore && findFunction(method, contractBefore.functions);
        if (options.ignoreUnchanged && before2 && JSON.stringify(before2) === JSON.stringify(values))
          return;
        rows += `${method} | ${formatValue(before2?.min, values.min)} | ${formatValue(before2?.mean, values.mean)} | ${formatValue(before2?.median, values.median)} | ${formatValue(before2?.max, values.max)} | ${formatValue(before2?.calls, values.calls)} |
`;
      });
      content += rows;
    }
    content += "\n\n";
  });
  return content;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getHtmlGasReport
});
