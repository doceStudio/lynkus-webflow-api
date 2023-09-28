//dsToken : f02309d2133b4905c1b97c6e421455b091f0b417e5bef5d8d587d5ad9b904ecd
//dsCollectionId : 64133c8e5f5f56eb9fef383a
import Webflow from "webflow-api";
import fetch from "node-fetch";
import { CronJob } from "cron";

const token =
  "f02309d2133b4905c1b97c6e421455b091f0b417e5bef5d8d587d5ad9b904ecd";
const currentOffersCollectionId = "64133c8e5f5f56eb9fef383a";

function containsAnyLetter(str) {
  return /[a-zA-Z]/.test(str);
}
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const webflow = new Webflow({ token: token });
const regions = [
  {
    id: "1",
    name: "Auvergne-Rhone-Alpes",
    departements: [
      "01",
      "03",
      "07",
      "15",
      "26",
      "38",
      "42",
      "43",
      "63",
      "69",
      "73",
      "74",
    ],
  },
  {
    id: "2",
    name: "Bourgogne-Franche-Comte",
    departements: ["21", "25", "39", "58", "70", "71", "89", "90"],
  },
  {
    id: "3",
    name: "Bretagne",
    departements: ["22", "29", "35", "56"],
  },
  {
    id: "4",
    name: "Centre-Val de Loire",
    departements: ["18", "28", "36", "37", "41", "45"],
  },
  {
    id: "5",
    name: "Corse",
    departements: ["2A"],
  },
  {
    id: "6",
    name: "Grand Est",
    departements: ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
  },
  {
    id: "7",
    name: "Hauts-de-France",
    departements: ["02", "59", "60", "62", "80"],
  },
  {
    id: "8",
    name: "Ile-de-France",
    departements: ["75", "77", "78", "91", "92", "93", "94", "95"],
  },
  {
    id: "9",
    name: "Normandie",
    departements: ["14", "27", "50", "61", "76"],
  },
  {
    id: "10",
    name: "Nouvelle-Aquitaine",
    departements: [
      "16",
      "17",
      "19",
      "23",
      "24",
      "33",
      "40",
      "47",
      "64",
      "79",
      "86",
      "87",
    ],
  },
  {
    id: "11",
    name: " Occitanie",
    departements: [
      "09",
      "11",
      "12",
      "30",
      "31",
      "32",
      "34",
      "46",
      "48",
      "65",
      "66",
      "81",
      "82",
    ],
  },
  {
    id: "12",
    name: "Pays de la Loire",
    departements: ["44", "49", "53", "72", "85"],
  },
  {
    id: "13",
    name: "Provence-Alpes-Cote d Azur",
    departements: ["04", "05", "06", "13", "83", "84"],
  },
  {
    id: "14",
    name: "Guadeloupe",
    departements: ["971"],
  },
  {
    id: "15",
    name: "Martinique",
    departements: ["972"],
  },
  {
    id: "16",
    name: "Guyane",
    departements: ["973"],
  },
  {
    id: "17",
    name: "Mayotte",
    departements: ["976"],
  },
];
const getJobs = async () => {
  const response = await fetch(
    "https://jobaffinity.fr/feed/x56u1mSPkYBlsZA/json"
  );
  const data = await response.json();
  return data;
};
let ratelimit;
let timeout = 0;

// ADD ITEM FUNCTION
const addItem = async (job) => {
  const randomString = generateString(3);
  const fields = {};

  fields.name = job.title;

  fields.slug = `${job.id.toString()}${randomString}`;

  fields["contract_type_abbreviation"] = job.contract_type_abbreviation;

  fields["last_publication_date"] = job.last_publication_date;

  fields.zipcode = job.zipcode;

  fields["location"] = job.location;

  fields["apply_web_url"] = job.apply_web_url;

  fields["position_description"] = job.position_description;

  fields["employer_description"] = job.employer_description;

  fields["profile_description"] = job.profile_description;

  fields["country"] = job.country;
  fields["jobid"] = job.id.toString();

  fields.latitude = job.latitude;

  fields.longitude = job.longitude;
  // zipcode to region logic
  if (job.zipcode) {
    if (!containsAnyLetter(job.zipcode)) {
      const jobZipcode = job.zipcode;
      let slicedZipCode = jobZipcode.slice(0, 2);
      if (slicedZipCode === "97") {
        slicedZipCode = jobZipcode.slice(0, 3);
      }
      const matchedRegion = regions.find((region) =>
        region.departements.includes(slicedZipCode)
      );
      fields["zipcode"] = matchedRegion.name;
    } else {
      fields["zipcode"] = job.zipcode;
    }
  }

  if (job.attributes[0]) {
    fields["attribute-0"] = job.attributes[0].value;
  }
  if (job.attributes[1]) {
    fields["attribute-1"] = job.attributes[1].value;
  }
  if (job.attributes[2]) {
    fields["interne"] = job.attributes[2].value;
  }
  fields["_archived"] = false;
  fields["_draft"] = false;
  console.log(`fields : ${fields}`);

  // add item on webflow
  const response = await webflow.createItem(
    {
      collectionId: currentOffersCollectionId,
      fields: fields,
    },
    { live: "true" }
  );
  return response;
};
const getOneItem = async () => {
  const response = await webflow.item({
    collectionId: currentOffersCollectionId,
    itemId: "6316df1c196af5f2ad0469ca",
  });
  console.log(response);
};
const getAllCurrentJobs = async () => {
  const response = await webflow.items({
    collectionId: currentOffersCollectionId,
  });
  const allJobIds = response.items;
  return allJobIds;
};
// logic for fetching all items with offset
const url = `https://api.webflow.com/collections/${currentOffersCollectionId}/items`;
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    authorization: `Bearer ${token}`,
  },
};
const itemsPerPage = 100;
let items = [];

async function fetchItems(offset) {
  const res = await fetch(
    `${url}?limit=${itemsPerPage}&offset=${offset}`,
    options
  );
  const json = await res.json();
  return json.items;
}

async function fetchAllItems() {
  let offset = 0;
  let moreItemsAvailable = true;

  while (moreItemsAvailable) {
    const currentItems = await fetchItems(offset);
    items = [...items, ...currentItems];
    offset += itemsPerPage;
    moreItemsAvailable = currentItems.length === itemsPerPage;
  }

  return items;
}
const removeJobsFromWebflow = async (itemIds) => {
  for (const itemId of itemIds) {
    const response = await webflow.removeItem({
      collectionId: currentOffersCollectionId,
      itemId,
    });
    console.log(response);
  }
};
const runJob = async () => {
  // get the jobs
  const [data, allJobsOnWebflow] = await Promise.all([
    getJobs(),
    fetchAllItems(),
  ]);
  const allJobIdsOnWebflow = allJobsOnWebflow.map((item) => item.jobid);
  console.log(`${allJobIdsOnWebflow}...`);
  // filter the jobs
  const filteredJobs = data.jobs.filter((eachJob) => {
    return !allJobIdsOnWebflow.includes(eachJob.id.toString());
  });
  // find the jobs that are removed and remove from Webflow
  const jobIdsFromData = data.jobs.map((eachJob) => eachJob.id.toString());
  const removedJobsIds = allJobIdsOnWebflow.filter(
    (jobId) => !jobIdsFromData.includes(jobId)
  );
  const removeJobs = allJobsOnWebflow.filter((eachJobOnWebflow) =>
    removedJobsIds.includes(eachJobOnWebflow.jobid)
  );
  console.log(removeJobs, "jobs to be removed");
  const removeJobsCids = removeJobs.map((removeJob) => removeJob["_id"]);
  console.log(removeJobsCids, "cid of jobs to be removed");
  const removeJobPromises = removeJobsCids.map(async (itemId) => {
    const response = await webflow.removeItem({
      collectionId: currentOffersCollectionId,
      itemId,
    });
  });
  Promise.all(removeJobPromises);

  // add the filtered jobs
  for (const job of filteredJobs) {
    const finalJobData = await addItem(job);

    if (finalJobData["_meta"]["rateLimit"].remaining < 2) {
      setTimeout(() => {
        console.log("timeout!");
      }, 60000);
    }
  }

  console.log("job ran! at", new Date().toLocaleString());
  console.log(data.jobs.length, "total jobs quered");
  console.log(filteredJobs.length, "final filtered jobs added");
};

await runJob();

const job = new CronJob("0 */60 * * * *", runJob);
job.start();
