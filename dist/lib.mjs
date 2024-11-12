// src/lib.ts
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
    const contract = findContract(item.contract, before);
    const [path, name] = item.contract.split(":");
    content += `### [${name}](${options.rootUrl}${path}) [gas: ${formatValue(contract?.deployment.gas, item.deployment.gas)}, size: ${formatValue(contract?.deployment.size, item.deployment.size)}]

`;
    let rows = `| Method | min | mean | median | max | calls |
| --- | ---: | ---: | ---: | ---: | ---: |
`;
    Object.entries(item.functions).map(([method, values]) => {
      const before2 = contract && findFunction(method, contract.functions);
      rows += `${method} | ${formatValue(before2?.min, values.min)} | ${formatValue(before2?.mean, values.mean)} | ${formatValue(before2?.median, values.median)} | ${formatValue(before2?.max, values.max)} | ${formatValue(before2?.calls, values.calls)} |
`;
    });
    content += rows;
    content += "\n\n";
  });
  return content;
}
export {
  getHtmlGasReport
};
