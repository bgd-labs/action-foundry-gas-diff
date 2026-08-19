import { expect, it, describe } from "vitest";
import { formatDiffMd, snapshotDiff } from "./lib";

const before = {
  "test_removed": "123",
  "test_unchanged": "456",
  "test_noise": "100000",
  "test_bigger": "789",
  "test_smaller": "789",
}

const after = {
  "test_unchanged": "456",
  "test_bigger": "1111",
  "test_smaller": "654",
  "test_added": "789",
  "test_noise": "100200",
}

describe("lib", () => {
  it("should throw when not passed numbers in before", () => {
    expect(() => snapshotDiff({
      before: {
        "test": "abc",
      },
      after: {
        "test": "123",
      },
    })).toThrowErrorMatchingInlineSnapshot(`[Error: The following keys in before are not numbers: test]`);
  })

  it("should throw when not passed numbers in after", () => {
    expect(() => snapshotDiff({
      before: {
        "test": "123",
      },
      after: {
        "test": "abc",
      },
    })).toThrowErrorMatchingInlineSnapshot(`[Error: The following keys in after are not numbers: test]`);
  })

  it("should detect differences between two different snapshots", () => {


    expect(
      snapshotDiff({
        before,
        after
      }),
    ).toMatchInlineSnapshot(`
      {
        "added": {
          "test_added": "789",
        },
        "changed": {
          "test_bigger": "<sup>↑40.8% (+322)</sup> 1,111",
          "test_smaller": "<sup>↓17.1% (-135)</sup> 654",
        },
        "removed": {
          "test_removed": "123",
        },
        "unchanged": {
          "test_noise": "<sup>↑0.2% (+200)</sup> 100,200",
          "test_unchanged": "456",
        },
      }
    `);
  });

  it("nicely formats the diff as markdown", () => {
    const diffA = snapshotDiff({
      before,
      after
    })

    const diffB = snapshotDiff({
      before,
      after
    })

    const result = formatDiffMd("Abcdef", [{ path: "path_a", diff: diffA }, { path: "path_b", diff: diffB }])
    console.log(result)
    expect(result).toMatchInlineSnapshot(`
      "### ♻️ Abcdef
      | Path | Value |
      | --- | ---: |
      | **path_a** |  |
      | test_bigger | <sup>↑40.8% (+322)</sup> 1,111 |
      | test_smaller | <sup>↓17.1% (-135)</sup> 654 |
      | ~~test_removed~~ | ~~123~~ |
      | _test_added_ | _789_ |
      | **path_b** |  |
      | test_bigger | <sup>↑40.8% (+322)</sup> 1,111 |
      | test_smaller | <sup>↓17.1% (-135)</sup> 654 |
      | ~~test_removed~~ | ~~123~~ |
      | _test_added_ | _789_ |
      </details>

      <details><summary>🔕 Unchanged</summary>

      | Path | Value |
      | --- | ---: |
      | **path_a** |  |
      | test_unchanged | 456 |
      | test_noise | <sup>↑0.2% (+200)</sup> 100,200 |
      | **path_b** |  |
      | test_unchanged | 456 |
      | test_noise | <sup>↑0.2% (+200)</sup> 100,200 |
      </details>"
    `)
  })

  it("strips surrounding whitespace of keys", () => {
    const diff = snapshotDiff({
      before: {
        "test_removed   ": "98074",
        "  test_unchanged ": "456",
        "test_changed  ": "789",
      },
      after: {
        "  test_unchanged ": "456",
        "test_changed  ": "654",
        "test_added   ": "145788",
      },
    })

    const result = formatDiffMd("Abcdef", [{ path: "path_a", diff }])
    expect(result).toMatchInlineSnapshot(`
      "### ♻️ Abcdef
      | Path | Value |
      | --- | ---: |
      | **path_a** |  |
      | test_changed | <sup>↓17.1% (-135)</sup> 654 |
      | ~~test_removed~~ | ~~98,074~~ |
      | _test_added_ | _145788_ |
      </details>

      <details><summary>🔕 Unchanged</summary>

      | Path | Value |
      | --- | ---: |
      | **path_a** |  |
      | test_unchanged | 456 |
      </details>"
    `)
  })

  it("reports sub 0.5% changes as unchanged, but keeps the diff visible", () => {
    const diff = snapshotDiff({
      before: {
        "test_below_threshold": "100000",
        "test_at_threshold": "100000",
      },
      after: {
        // 0.499% -> noise
        "test_below_threshold": "100499",
        // 0.5% -> reported
        "test_at_threshold": "100500",
      },
    })

    expect(diff).toMatchInlineSnapshot(`
      {
        "added": {},
        "changed": {
          "test_at_threshold": "<sup>↑0.5% (+500)</sup> 100,500",
        },
        "removed": {},
        "unchanged": {
          "test_below_threshold": "<sup>↑0.4% (+499)</sup> 100,499",
        },
      }
    `)
  })
});
