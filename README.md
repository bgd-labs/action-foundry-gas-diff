# Github Action: foundry-gas-diff

Foundry gas diff is a Github Action that compares gas usage between two Solidity contracts, assuming snapshots in a directory called `snapshots`.
The action is useful to compare gas usage from pull request to pull request so you can stop gas regressions before they are merged.

In it's current version foundry-gas-diff only performs the diffing, and leaves the reporting to the user.

We might consider changing this in a future version.

## Usage

```yaml
- uses: bgd-labs/action-foundry-gas-diff@main
```
