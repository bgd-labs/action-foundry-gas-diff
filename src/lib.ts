type FunctionSnapshot = {
  calls: number;
  min: number;
  mean: number;
  median: number;
  max: number;
};

type GasSnapshot = {
  contract: string;
  deployment: { gas: number; size: number };
  functions: Record<string, FunctionSnapshot>;
}[];

type Options = {
  rootUrl?: string;
  ignoreUnchanged?: boolean;
};

const UP = `↑`;
const DOWN = `↓`;

function findContract(
  contract: string,
  snapshot: {
    contract: string;
    deployment: { gas: number; size: number };
    functions: Record<
      string,
      { calls: number; min: number; mean: number; median: number; max: number }
    >;
  }[],
) {
  return snapshot.find((item) => item.contract === contract);
}

function findFunction(
  fn: string,
  snapshot: Record<
    string,
    { calls: number; min: number; mean: number; median: number; max: number }
  >,
) {
  return snapshot[fn];
}

function formatValue(before: number | undefined, after: number) {
  if (!before || after === before) return after;
  const diff = ((after - before) / Math.abs(before)) * 100;
  return `<sup title="${before}">${diff > 0 ? UP : DOWN}${new Intl.NumberFormat(
    "en-US",
    {
      maximumSignificantDigits: 2,
    },
  ).format(diff)}%</sup>${after}`;
}

export function getHtmlGasReport(
  before: GasSnapshot,
  after: GasSnapshot,
  options: Options = {},
) {
  let content = "";
  after.map((item) => {
    const contract = findContract(item.contract, before);
    const [path, name] = item.contract.split(":");
    content += `### [${name}](${options.rootUrl}${path}) [gas: ${formatValue(contract?.deployment.gas, item.deployment.gas)}, size: ${formatValue(contract?.deployment.size, item.deployment.size)}]\n\n`;
    let rows = `| Method | min | mean | median | max | calls |\n| --- | ---: | ---: | ---: | ---: | ---: |\n`;
    Object.entries(item.functions).map(([method, values]) => {
      const before = contract && findFunction(method, contract.functions);
      rows += `${method} | ${formatValue(before?.min, values.min)} | ${formatValue(before?.mean, values.mean)} | ${formatValue(before?.median, values.median)} | ${formatValue(before?.max, values.max)} | ${formatValue(before?.calls, values.calls)} |\n`;
    });
    content += rows;
    content += "\n\n";
  });
  return content;
}
