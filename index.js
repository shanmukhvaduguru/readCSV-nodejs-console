const fs = require("fs");
const Papa = require("papaparse");
const axios = require("axios");
var arguments = process.argv ;
  

const csvFilePath = `CSV/data${arguments[2]}.csv`;

const qaEnv = {
  url: "https://qa-webportal-admin.yankeekicks.com/api/consignment/consignee-update-retail-price",
  token:
    "Bearer eyJraWQiOiIxMTBlYzA1MC1lMTIwLTRkYjgtYTdkZC05MDUxZGVhNmFjYzciLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ5a19hZG1pbkB5YW5rZWVraWNrcy5jb20iLCJyb2xlIjpbIllLX0FkbWluIl0sInVzZXJfaWQiOjE2NywibmFtZSI6IllLIEFkbWluIiwibG9jYXRpb24iOnsiWUtfQWRtaW4iOlsiRGF2aWUgV2FyZWhvdXNlICM4IiwiNjY0MTc3MjE0ODMiLCJNaWFtaSBCZWFjaCBTdG9yZSIsIjY2NDUzMzQwMjk5Il19LCJleHAiOjE2OTAxNDM3MjQsImlhdCI6MTY5MDEwNzcyNH0.TNtlh8IHNZ6NotVgb6bh5-kvEMjG8Lz7Xt1CgX3Oq02E0cnUhKexYJ3bMeQgJMPyjkW_Z6Cca4O7mFqgw0-_Yw",
};
const prodEnv = {
  url: `https://api.yankeekicks.com/v1/consignee/update/selling-price`,
  token:
    "Bearer eyJraWQiOiIxMTBlYzA1MC1lMTIwLTRkYjgtYTdkZC05MDUxZGVhNmFjYzciLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ5a19hZG1pbkB5YW5rZWVraWNrcy5jb20iLCJyb2xlIjpbIllLX0FkbWluIl0sInVzZXJfaWQiOjMzLCJuYW1lIjoiWUsgQWRtaW4iLCJsb2NhdGlvbiI6eyJZS19BZG1pbiI6WyJNaWFtaSBCZWFjaCBTdG9yZSIsIjY0MDYzNzk5NDkzIiwiRGF2aWUgV2FyZWhvdXNlICM4IiwiNjc2NTAzMjI2MjkiXX0sImV4cCI6MTY5MDE0OTEzMywiaWF0IjoxNjkwMTEzMTMzfQ.iLEkKwuNaJzi6lGoDF0r-RaqipW8f2-Z203kOpRu3YSx3BV5EUFUt9l0hxQcDWPslCiXQp_3QajsW4E2cCymRA",
};

const readCSV = async (filePath) => {
  const csvFile = fs.readFileSync(filePath);
  const csvData = csvFile.toString();
  return new Promise((resolve) => {
    Papa.parse(csvData, {
      header: true,
      complete: (results) => {
        console.log("Complete", results.data.length, "records.");
        resolve(results.data);
      },
    });
  });
};

const readData = async (env) => {
  console.log("reading file contents of ....       ",csvFilePath);
  let parsedData = await readCSV(csvFilePath);
  //console.log("reasData",parsedData);
  const fields = ["ID", "Title", "Description"];
  let i = 0;

  const errorData = [];
  while (i < parsedData?.length) {
    const data = {
      createdBy: parsedData[i]?.userId,
      id: parsedData[i]?.consignmentlineitemId_D,
      retailPrice: parsedData[i]?.retailPrice,
      cost: parsedData[i]?.cost,
      updatedBy: parsedData[i]?.userId,
      userId: parsedData[i]?.userId,
    };

    try {
      console.log("=========>             ", i, "               <==========");

     const res = await axios({
        method: "post",
        url: env.url,
        data: data,
        headers: {
          Authorization: env.token,
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      //await axios.post(env.url, data, { Authorization: env.token });
      /* 
      .then(function (response) {      
        console.log({...data,response:response?.data});
      })
      .catch(function (error) {
        errorData.push({...data,error:error})
        console.log(error);
      }); */
      console.log({ ...data, response: res?.data });
    } catch (err) {
      errorData.push({ ...data, error: err });
      console.log("catch error", err);
    }
    i++;
  }
  console.log("error items", errorData);
};

readData(prodEnv);
