const fetch = require('node-fetch');

const OGD_API_KEY = "579b464db66ec23bdd0000014ccd3270d1e745e967d5cdfe0e1d2ac2";
const OGD_RESOURCE_ID = "9ef2713d-cc3d-4c37-97ef-abcd3868353e";
const fruit = "Mango";

const ogdUrl = `https://api.data.gov.in/resource/${OGD_RESOURCE_ID}?api-key=${OGD_API_KEY}&format=json&filters[commodity]=${fruit}&limit=5`;

console.log("Testing API with URL:", ogdUrl);

fetch(ogdUrl)
    .then(res => res.json())
    .then(json => {
        console.log("API Response Status:", json.status);
        console.log("Total Records:", json.total);
        if (json.records) {
            console.log("First Record:", JSON.stringify(json.records[0], null, 2));
        } else {
            console.log("No records found in response.");
            console.log("Full JSON:", JSON.stringify(json, null, 2));
        }
    })
    .catch(err => console.error("Fetch Error:", err));
