const Webflow = require("webflow-api");
const { MerkleJson } = require("merkle-json");
const fetchApi = require("./fetchApi");
require("dotenv").config();
const {
  SITE_ID,
  COLLECTION_ID,
  TOKEN,
  JOB_AFFINITY_ENDPOINT,
  WEBFLOW_ENDPOINT,
} = process.env;

const MJ = new MerkleJson();
const wfApi = new Webflow({
  token: TOKEN,
  version: "1.0.0",
  headers: {
    "User-Agent": "Lynkus-App",
  },
});

const webflowUrl = `${WEBFLOW_ENDPOINT}/${COLLECTION_ID}/items?access_token=${TOKEN}`;

const getJobAffintyJobs = async () => {
  try {
    const response = await fetchApi(JOB_AFFINITY_ENDPOINT);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.jobs;
  } catch (error) {
    console.log("There was an error fetching the job Affinity list :", error);
    return null;
  }
};

const getCollectionItems = async () => {
  const itemsPerPage = 100;
  let offset = 0;
  let moreItemsAvailable = true;
  let items = [];
  try {
    while (moreItemsAvailable) {
      const currentItems = await wfApi.items({
        collectionId: COLLECTION_ID,
        itemsPerPage,
        offset,
      });
      items = [...items, ...currentItems];
      offset += itemsPerPage;
      moreItemsAvailable = currentItems.length === itemsPerPage;
    }
    return items;
  } catch (err) {
    console.log("response not ok : ", err);
    console.log(err.cause);
    return null;
  }
};

const getItem = async (itemId) => {
  const response = await wfApi.item({
    collectionId: COLLECTION_ID,
    itemId: itemId,
  });
  return response;
};

const addItem = async (fields) => {
  const response = await wfApi.createItem({
    collectionId: COLLECTION_ID,
    fields: fields,
  });
  return response;
};

const deleteJobList = async (jobList) => {
  const body = JSON.stringify({ itemIds: jobList });
  const options = {
    method: "DELETE",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: body,
  };
  const response = await fetch(webflowUrl, options);
  return response;
};

const publishItemsList = async (list) => {
  const response = await wfApi.publishItems({
    collectionId: COLLECTION_ID,
    itemIds: list,
    live: true,
  });
  return response;
};

// patch item
const patchItem = async (fields, webflowItemId) => {
  const url = `https://api.webflow.com/collections/${COLLECTION_ID}/items/${webflowItemId}?live=true&access_token=${TOKEN}`;
  const options = {
    method: "PATCH",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fields,
    }),
  };
  try {
    const response = await fetch(url, options);
    const res = await response.json();
    return res;
  } catch (err) {
    return err;
  }
};

module.exports = {
  getItem,
  getJobAffintyJobs,
  getCollectionItems,
  publishItemsList,
  addItem,
  patchItem,
  deleteJobList,
};
