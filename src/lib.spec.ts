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
          "test_bigger": "<sup>↑41% (+322)</sup> 1,111",
          "test_smaller": "<sup>↓17% (-135)</sup> 654",
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
      | test_bigger | <sup>↑41% (+322)</sup> 1,111 |
      | test_smaller | <sup>↓17% (-135)</sup> 654 |
      | test_removed | 123 |
      | test_added | 789 |
      | **path_b** |  |
      | test_bigger | <sup>↑41% (+322)</sup> 1,111 |
      | test_smaller | <sup>↓17% (-135)</sup> 654 |
      | test_removed | 123 |
      | test_added | 789 |

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
});
