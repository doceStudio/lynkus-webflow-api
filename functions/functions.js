const tp = require("timers/promises");
const Tools = require("../utils/tools");
const newFieldObject = require("./newFieldObject");
const Api = require("../utils/apiFunctions");

const addJobs = async (jobAffintyJobs, webflowJobs) => {
  const jobAffinityJobsWithHashes = Tools.addJobHashFields(jobAffintyJobs);
  const webflowJobsId = webflowJobs.map((item) => item.jobid); // Get the jobs id
  const filteredJobs = jobAffinityJobsWithHashes.filter((eachJob) => {
    return !webflowJobsId.includes(eachJob.id.toString()); // Filter the new jobs on jobAffinity
  });
  let newJobsId = [];
  if (filteredJobs.length > 0) {
    console.log(
      `${Tools.displayTimeStamp()}${filteredJobs.length} jobs to be added.`
    );
    for (const newJob of filteredJobs) {
      const jobToAdd = newFieldObject(newJob, "ADD");
      const newItem = await Api.addItem(jobToAdd); // Add the new jobs on webflow
      await Tools.rateLimitStatus(newItem);
      const newItemId = newItem._id.toString();
      newJobsId.push(newItemId);
      console.log(
        `${Tools.displayTimeStamp()}${newJob.title} | id : ${
          newJob.id
        } added to CMS.`
      );
    }
  } else {
    console.log(`${Tools.displayTimeStamp()}No job to add.`);
  }
  return newJobsId;
};

const deleteJobs = async (webflowJobs, jobAffintyJobs) => {
  // Find the removed jobs on JobAffinity
  const jobIdsFromJobAffinty = jobAffintyJobs.map(
    (eachJob) => eachJob.id.toString() // Get the jobs ids from jobAffinity
  );
  const webflowJobsId = webflowJobs.map((item) => item.jobid); // Get the jobs id

  const removedJobsIds = webflowJobsId.filter(
    (jobId) => !jobIdsFromJobAffinty.includes(jobId) //Get the webflow jobsid to remove
  );
  const jobsTorRemove = webflowJobs.filter(
    (eachJobOnWebflow) =>
      removedJobsIds.includes(eachJobOnWebflow.jobid.toString()) // Get the Webflow jobs to remove from their ids
  );

  if (jobsTorRemove.length > 0) {
    console.log(
      `${Tools.displayTimeStamp()}${jobsTorRemove.length} jobs to remove.`
    );
    const jobsCidsTorRemove = jobsTorRemove.map(
      (removeJob) => removeJob["_id"] // Get the Webflow jobs Cids
    );
    // Delete jobs from Webflow
    await Api.deleteJobList(jobsCidsTorRemove);
    jobsTorRemove.forEach((job) => {
      console.log(
        `${Tools.displayTimeStamp()}${job.name} | id : ${
          job.jobid
        } removed for website.`
      );
    });
  } else {
    console.log(`${Tools.displayTimeStamp()}No job to remove.`);
  }
};

const updateJobs = async (
  jobAffintyJobs,
  webflowJobs,
  requestsLeft,
  maxRequest
) => {
  const jobAffinityJobsWithHashes = Tools.addJobHashFields(jobAffintyJobs);
  let idToSlug = {};
  let idToCid = {};
  webflowJobs.map((eachJob) => {
    idToSlug[eachJob.jobid] = eachJob.slug;
    idToCid[eachJob.jobid] = eachJob._id;
  });

  const allWebflowJobHashes = webflowJobs
    .map((eachJob) => eachJob.jobhash)
    .filter((item) => item);
  const obsoleteJobs = jobAffinityJobsWithHashes.reduce((acc, obj) => {
    if (!allWebflowJobHashes.includes(obj.hash)) {
      acc.push(obj);
    }
    return acc;
  }, []);
  console.log(
    `${Tools.displayTimeStamp()}Number of jobs to be updated : ${
      obsoleteJobs.length
    }.`
  );
  for (const jobToUpdate of obsoleteJobs) {
    requestsLeft = Tools.handlingRateLimit(requestsLeft, maxRequest);
    const newUpdatedFields = newFieldObject(jobToUpdate, "UPDATE");
    const webflowItemId = idToCid[jobToUpdate.id];
    newUpdatedFields.slug = idToSlug[jobToUpdate.id];
    try {
      const patchedJob = await Api.patchItem(newUpdatedFields, webflowItemId);
      requestsLeft--;
      console.log(
        `${Tools.displayTimeStamp()}job updated : ${patchedJob.name}.`
      );
    } catch (err) {
      console.log(`${Tools.displayTimeStamp()}${err}.`);
      return;
    }
  }
};

module.exports = { deleteJobs, addJobs, updateJobs };
