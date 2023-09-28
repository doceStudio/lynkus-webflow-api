require("dotenv").config();
const {
  SITE_ID,
  COLLECTION_ID,
  TOKEN,
  JOB_AFFINITY_ENDPOINT,
  WEBFLOW_ENDPOINT,
} = process.env;
const webflowUrl = `${WEBFLOW_ENDPOINT}/${COLLECTION_ID}/items?access_token=${TOKEN}`;
const Webflow = require("webflow-api");
const api = new Webflow({
  token: TOKEN,
  version: "1.0.0",
  headers: {
    "User-Agent": "Lynkus-App",
  },
});

const fetchCollection = async () => {
  api
    .collection({ collectionId: COLLECTION_ID })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      console.log("--------------+++------------------------");
      console.log(err.code);
      console.log("--------------------++++------------------");
      return;
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
};



const updateItem = async (itemId, fields) => {
  const response = await api.updateItem({
    collectionId: COLLECTION_ID,
    itemId: itemId,
    fields: fields,
  });
};


const addItem = async (fields) => {
  const response = await api.createItem(
    {
      collectionId: COLLECTION_ID,
      fields: fields,
    },
  );
  return response;
};



module.exports = {
  patchItem,
  getCollectionItems,
  fetchCollection,
  addItem,
  publishItemsList,
  updateItem,
  deleteJobList,
};
