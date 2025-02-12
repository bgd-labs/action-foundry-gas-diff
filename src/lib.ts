type Snapshot = Record<string, string>;

const numberFormat = new Intl.NumberFormat("en-US");

const formatNumber = (value: string) => {
  return numberFormat.format(Number(value));
};

export function snapshotDiff({
  before,
  after,
}: {
  before: Snapshot;
  after: Snapshot;
}) {
  const removed: Snapshot = {};
  const added: Snapshot = {};
  const changed: Snapshot = {};
  const unchanged: Snapshot = {};

  const beforeKeys = Object.keys(before);
  const afterKeys = Object.keys(after);

  const beforeNotNumbers = beforeKeys.filter((key) =>
    Number.isNaN(Number(before[key])),
  );
  const afterNotNumbers = afterKeys.filter((key) =>
    Number.isNaN(Number(after[key])),
  );

  if (beforeNotNumbers.length > 0) {
    throw new Error(
      `The following keys in before are not numbers: ${beforeNotNumbers.join(", ")}`,
    );
  }

  if (afterNotNumbers.length > 0) {
    throw new Error(
      `The following keys in after are not numbers: ${afterNotNumbers.join(", ")}`,
    );
  }

  for (const _key of beforeKeys) {
    const key = _key;
    const before_value = before[_key];
    const after_value = after[_key];

    if (!after_value) {
      removed[key] = formatNumber(before_value);
    } else if (before_value !== after_value) {
      const diff = Math.abs(Number(before_value) - Number(after_value));
      const diffPercentage = Math.round((diff / Number(before_value)) * 100);
      const diffSym = Number(before_value) < Number(after_value) ? "↑" : "↓";
      const diffSign = Number(before_value) < Number(after_value) ? "+" : "-";
      changed[key] =
        `<sup>${diffSym}${diffPercentage}% (${diffSign}${diff})</sup> ${formatNumber(after_value)}`;
    } else {
      unchanged[key] = formatNumber(before_value);
    }
  }

  for (const _key of afterKeys) {
    const key = _key;
    const before_value = before[_key];
    const after_value = after[_key];

    if (!before_value) {
      added[key] = after_value;
    }
  }

  return {
    removed,
    added,
    changed,
    unchanged,
  };
}

export const formatDiffMd = (
  heading: string,
  input: { path: string; diff: ReturnType<typeof snapshotDiff> }[],
) => {
  const th = "| Path | Value |";
  const hr = "| --- | ---: |";
  const br = "";

  const changedLinesHeader: string[] = [th, hr];
  let changedLines: string[] = [];
  const unchangedLinesHeader: string[] = [
    br,
    "<details><summary>🔕 Unchanged</summary>",
    br,
    th,
    hr,
  ];
  let unchangedLines: string[] = [];

  const formatLine = (key: string, value: string) => `| ${key} | ${value} |`;
  const formatGroup = (values: [string, string][]) => {
    return values.map(([key, value]) => formatLine(`${key}`, `${value}`));
  };

  for (const { path, diff } of input) {
    const changed = diff.changed;
    const added = diff.added;
    const removed = diff.removed;
    const unchanged = diff.unchanged;

    const sumChanged =
      Object.keys(changed).length +
      Object.keys(added).length +
      Object.keys(removed).length;
    if (sumChanged > 0) {
      changedLines.push(formatLine(`**${path}**`, ""));
      changedLines.push(...formatGroup(Object.entries(changed)));
      changedLines.push(...formatGroup(Object.entries(removed).map(([key, value]) => [`~~${key}~~`, `~~${value}~~`])));
      changedLines.push(...formatGroup(Object.entries(added).map(([key, value]) => [`_${key}_`, `_${value}_`])));
    }

    if (Object.keys(unchanged).length > 0) {
      unchangedLines.push(formatLine(`**${path}**`, ""));
      unchangedLines.push(...formatGroup(Object.entries(unchanged)));
    }
  }

  if (changedLines.length > 0) {
    changedLines = [...changedLinesHeader, ...changedLines, "</details>"];
  }
  if (unchangedLines.length > 0) {
    unchangedLines = [...unchangedLinesHeader, ...unchangedLines, "</details>"];
  }

  let lines = changedLines.concat(unchangedLines)
  if (lines.length === 0) {
    lines = ["Seems like you are not measuring gas of any operations yet. 🤔", "Consider adding some [snapshot tests](https://book.getfoundry.sh/forge/gas-section-snapshots?highlight=snapshot#snapshotgas-cheatcodes) to measure regressions & improvements."];
  }

  return [`### ♻️ ${heading}`, ...lines].join("\n");
};
