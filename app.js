const Api = require("./utils/apiFunctions");
const newFieldObject = require("./functions/newFieldObject");
const Tools = require("./utils/tools");
const Cron = require("node-cron");
const tp = require("timers/promises");

const functions = require("./functions/functions");

const maxRequest = 60;
let requestsLeft = maxRequest;
const getAllJobs = async () => {
  try {
    const [webflowJobs, jobAffintyJobs] = await Promise.all([
      Api.getCollectionItems(),
      Api.getJobAffintyJobs(),
    ]);

    requestsLeft--;
    return [webflowJobs, jobAffintyJobs];
  } catch (err) {
    console.log(`${Tools.displayTimeStamp()}error retrieving the data`);
    return;
  }
};
const updateJobList = async () => {
  const [webflowJobs, jobAffintyJobs] = await getAllJobs(); // Get the jobs

  //Check data content
  if (!webflowJobs || !jobAffintyJobs) {
    console.log(
      `${Tools.displayTimeStamp()}error retrieving the data from external job lists. check the error logs`
    );
    return;
  }
  const unpublishedItems = webflowJobs.filter((job) => {
    return job["published-on"] === null;
  });
  const unpublishedItemsCid = unpublishedItems.map((item) => item._id); // Get the jobs cid
  const webflowJobsId = webflowJobs.map((item) => item.jobid); // Get the jobs id
  const jobAffinityJobsWithHashes = Tools.addJobHashFields(jobAffintyJobs);

  const [...newJobsId] = await functions.addJobs(jobAffintyJobs, webflowJobs);

  const wfUnpublishedJobs = [...newJobsId, ...unpublishedItemsCid];
  //PUBLISH UNPUBLISHED ITEMS
  if (wfUnpublishedJobs.length > 0) {
    try {
      await Api.publishItemsList(wfUnpublishedJobs); // Publish the new jobs
      console.log(
        `${Tools.displayTimeStamp()}${newJobsId.length} new job(s) published !`
      );
      console.log(
        `${Tools.displayTimeStamp()}${
          unpublishedItemsCid.length
        } old unpublished job(s) published !`
      );
    } catch (err) {
      console.log(`${Tools.displayTimeStamp()}${err}`);
      console.log(`${Tools.displayTimeStamp()}error while publishing the jobs`);
    }
  } else {
    console.log(`${Tools.displayTimeStamp()}No job were published.`);
  }
  
  //UPDATE JOBS
  if (webflowJobs.length > 1) {
    const left = await functions.updateJobs(
      jobAffinityJobsWithHashes,
      webflowJobs,
      requestsLeft,
      maxRequest
      );
      requestsLeft = left;
    } else {
      console.log(`${Tools.displayTimeStamp()}No jobs to update`);
    }
    //DELETE JOBS
    await functions.deleteJobs(webflowJobs, jobAffintyJobs);
};

const runJob = async () => {
  console.log(`-------------------------------------------------------`);
  console.log(
    `${Tools.displayTimeStamp()}Script to update jobs on website running.`
  );
  requestsLeft = maxRequest;
  await updateJobList();
  console.log(`${Tools.displayTimeStamp()}Script finished running!`);
  console.log(`-------------------------------------------------------`);
};

Cron.schedule(" */5 * * * *", runJob); //Every two min
runJob();
//Cron.schedule(" 59 * * * *", runJob); // Every hour
