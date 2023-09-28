import { MerkleJson } from "merkle-json";
import fetch from "node-fetch";
import Webflow from "webflow-api";
import { CronJob } from "cron";

const MJ = new MerkleJson();
function containsAnyLetter(str) {
  return /[a-zA-Z]/.test(str);
}

// append hashes to jobs queried from the APIs
async function getJobsWithHashes() {
  try {
    const getJobs = async () => {
      const response = await fetch(
        "https://jobaffinity.fr/feed/x56u1mSPkYBlsZA/json"
      );
      const data = await response.json();
      return data;
    };
    const data = await getJobs();
    const jobsWithHashes = [];
    for (let i = 0; i < data.jobs.length; i++) {
      const job = data.jobs[i];
      const jsonData = JSON.stringify(job);
      const hash = MJ.hash(jsonData);
      const jobWithHash = {
        ...job,
        hash: hash,
      };
      jobsWithHashes.push(jobWithHash);
    }
    return jobsWithHashes;
  } catch (error) {
    console.error(error);
  }
}

// Webflow config
const token =
  "b327d00546907ffaf8e5df1dea23e9436be263c2b6d559cc0736d672a04ffa4c";
const currentOffersCollectionId = "63bd330fae1d290673ea34be";
const webflow = new Webflow({ token: token });

// patch item
async function patchItem(params) {
  const url = `https://api.webflow.com/collections/63bd330fae1d290673ea34be/items/${params.itemid}?live=true`;
  const options = {
    method: "PATCH",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization:
        "Bearer b327d00546907ffaf8e5df1dea23e9436be263c2b6d559cc0736d672a04ffa4c",
    },
    body: JSON.stringify({
      fields: {
        slug: params.slug,
        name: params.name,
        _archived: false,
        _draft: false,
        "type-de-contrat-contract-type-abbreviation": params.typeOfContract,
        "date-de-publication": params.publicationDate,
        "code-postal": params.postalCode,
        ville: params.location,
        "apply-link": params.applyLink,
        "job-description": params.jobDesp,
        "company-description": params.employerDescp,
        "profile-description": params.profileDescp,
        "pays-country": params.paysCountry,
        jobid: params.jobId,
        latitude: params.latitude,
        longitude: params.longitude,
        region: params.region ?? "",
        "experience-attribute-0": params.experience ?? "",
        "metier-attribute-1": params.metier ?? "",
        "linkus-interne": params.linkus ?? "",
        jobhash: params.jobhash,
      },
    }),
  };

  const response = await fetch(url, options);
  const res = await response.json();
  return res;
}

// Query jobs from Webflow CMS
const getWebflowJobs = async () => {
  const response = await webflow.items({
    collectionId: currentOffersCollectionId,
  });
  const allJobIds = response;
  return allJobIds;
};

const updateItem = async () => {
  const allWebflowJobs = await getWebflowJobs();
  const data = await getJobsWithHashes();

  let idToSlug = {};
  let idToCid = {};
  allWebflowJobs.map((eachJob) => {
    idToSlug[eachJob.jobid] = eachJob.slug;
    idToCid[eachJob.jobid] = eachJob._id;
  });
  let allWebflowJobHashes = allWebflowJobs
    .map((eachJob) => eachJob.jobhash)
    .filter((item) => item);

  const notMatchingValues = data.reduce((acc, obj) => {
    if (!allWebflowJobHashes.includes(obj.hash)) {
      acc.push(obj);
    }
    return acc;
  }, []);

  console.log(notMatchingValues.length, "JOBS TO BE UPDATED");
  for (const everyJob of notMatchingValues) {
    const params = {};
    params.itemid = idToCid[everyJob.id];
    params.slug = idToSlug[everyJob.id];
    params.name = everyJob.title;
    params.typeOfContract = everyJob.contract_type_abbreviation;
    params.publicationDate = everyJob.last_publication_date;
    params.postalCode = everyJob.zipcode;
    params.location = everyJob.location;
    params.applyLink = everyJob.apply_web_url;
    params.jobDesp = everyJob.position_description;
    params.employerDescp = everyJob.employer_description;
    params.profileDescp = everyJob.profile_description;
    params.paysCountry = everyJob.country;
    params.jobId = everyJob.id.toString();
    params.latitude = everyJob.latitude;
    params.longitude = everyJob.longitude;

    // zipcode to region logic
    if (everyJob.zipcode) {
      if (!containsAnyLetter(everyJob.zipcode)) {
        const jobZipcode = everyJob.zipcode;
        let slicedZipCode = jobZipcode.slice(0, 2);
        if (slicedZipCode === "97") {
          slicedZipCode = jobZipcode.slice(0, 3);
        }
        const matchedRegion = regions.find((region) =>
          region.departements.includes(slicedZipCode)
        );
        params["region"] = matchedRegion.name;
      } else {
        params["region"] = everyJob.zipcode;
      }
    }

    params.jobhash = everyJob.hash;

    if (everyJob.attributes[0]) {
      params.experience = everyJob.attributes[0].value ?? "";
    }
    if (everyJob.attributes[1]) {
      params.metier = everyJob.attributes[1].value ?? "";
    }
    if (everyJob.attributes[2]) {
      params.linkus = everyJob.attributes[2].value ?? "";
    }

    await patchItem(params);
  }
};

updateItem();

const updatecronjob = new CronJob("0 */12 * * *", updateItem);
updatecronjob.start();
