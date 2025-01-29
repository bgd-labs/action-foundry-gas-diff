import { readFile } from "node:fs/promises";
import { debug, getInput, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { create as createGlob } from "@actions/glob";
import { formatDiffMd, snapshotDiff } from "./lib";
import path from "node:path";

const heading = getInput("heading");
const octokit = getOctokit(getInput("token"));

const getBaseFile = async (path: string) => {
  const { data } = await octokit.rest.repos.getContent({
    repo: context.repo.repo,
    owner: context.repo.owner,
    path,
    ref: context.payload.pull_request?.base.ref,
  }).catch(e => {
    return e.response as {
      status: number
      data: {
        message: string;
        status: number;
      };
    };
  })
  debug(`Base file ${path}: ${JSON.stringify(data)}`);

  if (!data || !("content" in data)) {
    return {};
  }

  return JSON.parse(atob(data.content));
};


const run = async () => {
  debug("Starting run");
  if (!("pull_request" in context.payload)) {
    throw new Error("This action can only be run on pull_request events");
  }
  const results: Parameters<typeof formatDiffMd>[1] = [];
  const globber = await createGlob(getInput("files"));
  const files = await globber.glob();
  debug(`Files to compare: ${files.join(", ")}`);

  for (const filePath of files) {
    const relativePath = path.relative(process.cwd(), filePath);
    debug(`Comparing ${relativePath}`);
    const before = await getBaseFile(relativePath);
    const after = JSON.parse(await readFile(filePath, "utf8"));
    const diff = snapshotDiff({
      before,
      after,
    });
    results.push({
      path: relativePath,
      diff,
    });
  }

  debug(`Results: ${JSON.stringify(results)}`);
  const report = formatDiffMd(heading, results);
  debug(`Report: ${report}`);

  setOutput("report", report);
}

run()