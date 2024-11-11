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
export {
  getHtmlGasReport
};
