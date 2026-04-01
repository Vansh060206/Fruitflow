const https = require('https');

const OGD_API_KEY = "579b464db66ec23bdd0000014ccd3270d1e745e967d5cdfe0e1d2ac2";
const OGD_RESOURCE_ID = "3595b119-94d0-4351-93e1-456cb0ee08c4"; // New potential resource ID
const fruit = "Mango";

const ogdUrl = `https://api.data.gov.in/resource/${OGD_RESOURCE_ID}?api-key=${OGD_API_KEY}&format=json&filters[commodity]=${fruit}&limit=5`;

console.log("Testing API with URL:", ogdUrl);

https.get(ogdUrl, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("API Response Status:", json.status);
      console.log("Total Records:", json.total);
      if (json.records && json.records.length > 0) {
        console.log("First Record:", JSON.stringify(json.records[0], null, 2));
      } else {
        console.log("No records found in response.");
        console.log("Full JSON Sample:", data.substring(0, 500));
      }
    } catch (e) {
      console.error("JSON Parse Error:", e);
      console.log("Raw Response:", data);
    }
  });
}).on('error', (err) => {
  console.error("Fetch Error:", err);
});
