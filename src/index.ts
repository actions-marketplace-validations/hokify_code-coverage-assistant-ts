import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { S3Client } from "@aws-sdk/client-s3";
import {
    generateReport,
    setTemporarLvocFilesAsBase,
    uploadTemporaryLvocFiles,
} from "./app.js";

const token = getInput("github-token");
const monorepoBasePath = getInput("monorepo-base-path");
const s3Config = getInput("s3-config");
const base = context.payload.pull_request?.base.ref;

try {
    let s3ConfigParsed:
        | {
              credentials: { accessKeyId: string; secretAccessKey: string };
              Bucket: string;
              region: string;
          }
        | undefined;

    try {
        s3ConfigParsed = s3Config && JSON.parse(s3Config);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log("s3Config", s3Config);
        throw new Error(`failed parsing s3 config json: ${err}`);
    }

    const s3Client = s3ConfigParsed && new S3Client(s3ConfigParsed);

    if (!monorepoBasePath) {
        throw new Error(`No monorepo-base-path specified!`);
    }

    if (context.payload.pull_request?.merged) {
        if (!s3Client || !s3ConfigParsed) {
            throw new Error(`No s3 config specified!`);
        }

        // upload new lcov base files to storage
        const cnt = await setTemporarLvocFilesAsBase(
            s3Client,
            s3ConfigParsed.Bucket,
            context.repo,
            context.payload.pull_request.number,
            monorepoBasePath,
            base,
        );
        // eslint-disable-next-line no-console
        console.info(`updated ${cnt} lcov files as new base`);
    } else {
        // generate diff report
        if (!context.payload.pull_request?.number) {
            throw new Error("no pull request number found in context");
        }

        const client = getOctokit(token);

        const cntReport = await generateReport(
            client,
            s3Client,
            s3ConfigParsed?.Bucket,
            monorepoBasePath,
            context.repo,
            context.payload.pull_request.number,
            base,
        );

        // eslint-disable-next-line no-console
        console.info(`generated report for ${cntReport} lcov files`);

        if (s3Client && s3ConfigParsed) {
            const cntUpload = await uploadTemporaryLvocFiles(
                s3Client,
                s3ConfigParsed.Bucket,
                context.repo,
                context.payload.pull_request.number,
                monorepoBasePath,
                base,
            );

            // eslint-disable-next-line no-console
            console.info(`uploaded ${cntUpload} temporary lcov files`);
        }
    }
} catch (err) {
    console.error(err);
    setFailed(err instanceof Error ? err.message : JSON.stringify(err));
}
