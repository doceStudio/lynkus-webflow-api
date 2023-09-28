const tp = require("timers/promises");

const { MerkleJson } = require("merkle-json");
const MJ = new MerkleJson();

const addJobHashFields = (jobList) => {
  const data = jobList;
  const jobsWithHashes = [];
  for (let i = 0; i < data.length; i++) {
    const job = data[i];
    const jsonData = JSON.stringify(job);
    const hash = MJ.hash(jsonData);
    const jobWithHash = {
      ...job,
      hash: hash,
    };
    jobsWithHashes.push(jobWithHash);
  }

  return jobsWithHashes;
};

const containsAnyLetter = (str) => {
  return /[a-zA-Z]/.test(str);
};

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

const getRegion = (zipcode) => {
  let slicedZipCode = zipcode.slice(0, 2);
  if (slicedZipCode === "97") {
    slicedZipCode = jobZipcode.slice(0, 3);
  }
  const matchedRegion = regions.find((region) =>
    region.departements.includes(slicedZipCode)
  );
  return matchedRegion.name;
};

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateString = (length) => {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const handlingRateLimit = async (requestsLeft, maxRequest) => {
  if (requestsLeft === 0) {
    console.log("waiting for rate limit");
    await tp.setTimeout(61000, () => {
      console.log("Time limit done! Let's proceed");
    });
    requestsLeft = maxRequest;
  }
  return requestsLeft;
};

const rateLimitStatus = async (response) => {
  if (response["_meta"]["rateLimit"].remaining < 8) {
    await tp.setTimeout(61000, () => {
      console.log("Time limit done! Let's proceed");
    });
  }
};

const displayTimeStamp = () => {
  const timeStamp = new Date().toLocaleString();
  return `${timeStamp} | `;
};

module.exports = {
  getRegion,
  addJobHashFields,
  containsAnyLetter,
  generateString,
  handlingRateLimit,
  rateLimitStatus,
  displayTimeStamp,
};
