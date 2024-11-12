import { readFileSync, existsSync } from "fs";
import { getInput, setOutput } from "@actions/core";
import { context } from "@actions/github";
import { getHtmlGasReport } from "./lib";

const root = getInput("ROOT_REPORT_PATH");
const current = getInput("REPORT_PATH");

const rootExists = root && existsSync(root);
const currentExists = current && existsSync(current);

if (!currentExists) throw new Error("gas report not found");

const rootContent = rootExists ? JSON.parse(readFileSync(root, "utf8")) : [];
const currentContent = JSON.parse(readFileSync(current, "utf8"));

const table = getHtmlGasReport(rootContent, currentContent, {
  rootUrl: `${context.payload.repository?.html_url}/blob/${context.sha}/`,
  ignoreUnchanged: getInput("ignoreUnchanged") === "true",
});

setOutput("gas-report", table);
