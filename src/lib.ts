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
  // report accumulator
  let content = "";
  after.map((item) => {
    const contractBefore = findContract(item.contract, before);
    if (
      options.ignoreUnchanged &&
      contractBefore &&
      JSON.stringify(item) === JSON.stringify(contractBefore)
    )
      return;
    const [path, name] = item.contract.split(":");
    content += `### [${name}](${options.rootUrl}${path})\n\n- gas: ${formatValue(contractBefore?.deployment.gas, item.deployment.gas)}\n-size: ${formatValue(contractBefore?.deployment.size, item.deployment.size)}\n\n`;
    if (
      options.ignoreUnchanged &&
      contractBefore &&
      JSON.stringify(item.functions) ===
        JSON.stringify(contractBefore.functions)
    )
      return;
    else {
      let rows = `| Method | min | mean | median | max | calls |\n| --- | ---: | ---: | ---: | ---: | ---: |\n`;
      Object.entries(item.functions).map(([method, values]) => {
        const before =
          contractBefore && findFunction(method, contractBefore.functions);
        if (
          options.ignoreUnchanged &&
          before &&
          JSON.stringify(before) === JSON.stringify(values)
        )
          return;
        rows += `${method} | ${formatValue(before?.min, values.min)} | ${formatValue(before?.mean, values.mean)} | ${formatValue(before?.median, values.median)} | ${formatValue(before?.max, values.max)} | ${formatValue(before?.calls, values.calls)} |\n`;
      });
      content += rows;
    }
    content += "\n\n";
  });
  return content;
}
