import { type JobName, jobs } from "@/jobs";
import { getContext } from "@/lib";

const main = async () => {
  const [, , command, jobName] = process.argv;

  if (command !== "run" || !jobName) {
    console.log("Usage: pnpm worker job <job-name>");
    console.log("Available jobs:", Object.keys(jobs).join(", "));
    process.exit(1);
  }

  if (!(jobName in jobs)) {
    console.error(`Unknown job: ${jobName}`);
    console.log("Available jobs:", Object.keys(jobs).join(", "));
    process.exit(1);
  }

  const ctx = getContext();
  ctx.logger.info(`Running job: ${jobName}`);

  try {
    const result = await jobs[jobName as JobName](ctx);
    ctx.logger.info("Job completed", { result });
    process.exit(0);
  } catch (error) {
    ctx.logger.error("Job failed", {}, error as Error);
    process.exit(1);
  }
};

void main();
