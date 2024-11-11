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
function getHtmlGasReport(before, after) {
  let table = `<table>`;
  after.map((item) => {
    const contract = findContract(item.contract, before);
    const ctr = `<strong title="${item.contract}">${item.contract.match(/:(.*)$/)?.[1]}</strong>`;
    let row = `
      <tr>
        <th colspan="4">Contract</th>
        <th>gas</th>
        <th>size</th>
      </tr>
      <tr>
        <td colspan="4">${ctr}</td>
        <td>${formatValue(contract?.deployment.gas, item.deployment.gas)}</td>
        <td>${formatValue(contract?.deployment.size, item.deployment.size)}</td>
      </tr>
      <tr>
        <th>Method</th>
        <th>min</th>
        <th>mean</th>
        <th>median</th>
        <th>max</th>
        <th>calls</th>
      </tr>`;
    Object.entries(item.functions).map(([method, values]) => {
      const before2 = contract && findFunction(method, contract.functions);
      row += `
      <tr>
        <td>${method}</td>
        <td>${formatValue(before2?.min, values.min)}</td>
        <td>${formatValue(before2?.mean, values.mean)}</td>
        <td>${formatValue(before2?.median, values.median)}</td>
        <td>${formatValue(before2?.max, values.max)}</td>
        <td>${formatValue(before2?.calls, values.calls)}</td>
      </tr>`;
    });
    table += row;
  });
  table += `</table>`;
  return table;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getHtmlGasReport
});
