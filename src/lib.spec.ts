import { expect, it, describe } from "vitest";
import { formatDiffMd, snapshotDiff } from "./lib";

const before = {
  "test_removed": "123",
  "test_unchanged": "456",
  "test_bigger": "789",
  "test_smaller": "789",
}

const after = {
  "test_unchanged": "456",
  "test_bigger": "1111",
  "test_smaller": "654",
  "test_added": "789",
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
      | **path_b** |  |
      | test_unchanged | 456 |
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

  it("reports sub 0.1% changes as unchanged", () => {
    const diff = snapshotDiff({
      before: {
        "test_below_threshold": "100000",
        "test_at_threshold": "100000",
      },
      after: {
        // 0.099% -> noise
        "test_below_threshold": "100099",
        // 0.1% -> reported
        "test_at_threshold": "100100",
      },
    })

    expect(diff).toMatchInlineSnapshot(`
      {
        "added": {},
        "changed": {
          "test_at_threshold": "<sup>↑0.1% (+100)</sup> 100,100",
        },
        "removed": {},
        "unchanged": {
          "test_below_threshold": "100,099",
        },
      }
    `)
  })
});
