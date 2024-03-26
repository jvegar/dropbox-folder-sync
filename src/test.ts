import cron from "node-cron";

cron.schedule("*/5 * * * *", () => {
  console.log("Running a task every minute", Date.now());
});
