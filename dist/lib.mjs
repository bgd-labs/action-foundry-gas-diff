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
    const contractBefore = findContract(item.contract, before);
    if (options.ignoreUnchanged && contractBefore && JSON.stringify(item) === JSON.stringify(contractBefore))
      return;
    const [path, name] = item.contract.split(":");
    content += `### [${name}](${options.rootUrl}${path})

`;
    content += `- size: ${formatValue(contractBefore?.deployment.size, item.deployment.size)} / 49152

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
export {
  getHtmlGasReport
};
