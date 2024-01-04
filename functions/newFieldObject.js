const Tools = require("../utils/tools");
const slugify = require("slugify");

// const FIELD_NAMES = {
//   name: "name",
//   slug: "slug",
//   typeOfContractAbbreviation: "type-de-contrat-contract-type-abbreviation",
//   lastpublicationDate: "date-de-publication",
//   applyLink: "apply-link",
//   jobDescP: "job-description",
//   profileDescP: "profile-description",
//   employerDescP: "company-description",
//   country: "pays-country",
//   town: "ville",
//   jobId: "jobid",
//   latitude: "latitude",
//   longitude: "longitude",
//   zipCode: "code-postal",
//   region: "region",
//   experience: "experience-attribute-0",
//   metier: "metier-attribute-1",
//   interne: "linkus-interne",
//   jobHash: "jobhash",
// };


const FIELD_NAMES = {
  name: "name",
  slug: "slug",
  typeOfContractAbbreviation: "contract-type-abbreviation",
  lastpublicationDate: "last-publication-date-2",
  applyLink: "apply-web-url",
  jobDescP: "position-description-2",
  profileDescP: "profile-description-2",
  employerDescP: "company-description-2",
  country: "country",
  town: "town",
  jobId: "jobid",
  latitude: "latitude",
  longitude: "longitude",
  zipCode: "zipcode",
  region: "region",
  experience: "experience",
  metier: "metier",
  interne: "interne",
  jobHash: "jobhash",
};

const newFieldObject = (job, method) => {
  const randomString = Tools.generateString(5);
  const fields = {};
  let slug;

  if (method.toUpperCase() === "ADD") {
    slug = slugify(`${job.title}-${job.id.toString()}${randomString}`, {
      lower: true,
      strict: true,
    });
  } else {
    slug = job.slug;
  }
  fields[FIELD_NAMES.name] = job.title;
  fields[FIELD_NAMES.slug] = slug;
  // console.log(fields.slug);
  fields[FIELD_NAMES.typeOfContractAbbreviation] =
    job.contract_type_abbreviation;
  fields[FIELD_NAMES.lastpublicationDate] = job.last_publication_date;
  fields[FIELD_NAMES.applyLink] = job.apply_web_url;
  fields[FIELD_NAMES.jobDescP] = job.position_description;
  fields[FIELD_NAMES.profileDescP] = job.profile_description;
  fields[FIELD_NAMES.employerDescP] = job.employer_description;
  fields[FIELD_NAMES.country] = job.country;
  fields[FIELD_NAMES.town] = job.town;
  fields[FIELD_NAMES.jobId] = job.id.toString();
  fields[FIELD_NAMES.latitude] = job.latitude;
  fields[FIELD_NAMES.zipCode] = job.zipcode;
  if (job.hash) fields[FIELD_NAMES.jobHash] = job.hash;
  job.zipcode && !Tools.containsAnyLetter(job.zipcode)
    ? (fields["region"] = Tools.getRegion(job.zipcode))
    : (fields["region"] = job.zipcode);

  if (job.attributes) {
    if (job.attributes[0]) {
      fields[FIELD_NAMES.experience] = job.attributes[0].value;
    }
    if (job.attributes[1]) {
      fields[FIELD_NAMES.metier] = job.attributes[1].value;
    }
    if (job.attributes[2]) {
      fields[FIELD_NAMES.interne] = job.attributes[2].value;
    }
  }
  fields["_archived"] = false;
  fields["_draft"] = false;
  return fields;
};

module.exports = newFieldObject;
