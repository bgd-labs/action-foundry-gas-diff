# Github Action: foundry-gas-diff

Foundry gas diff is a Github Action that compares gas usage between two Solidity contracts.
The action is useful to compare gas usage from pull request to pullrequest so you can stop gas regressions before they are merged.

In it's current version foundry-gas-diff only performs the diffing, and leaves the reporting to the user.
We might consider changing this in a future version.

## Usage

```yaml
- uses: bgd-labs/action-foundry-gas-diff@main
  with:
    # The path to the first contract to compare
    ROOT_REPORT_PATH: 'path/to/gas/on/main'
    # The path to the second contract to compare
    REPORT_PATH: 'path/to/gas'
```
