const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
var AWS = require("aws-sdk");
var fs = require("fs");
AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  endpoint: process.env.DB_ENDPOINT,
});
var docClient = new AWS.DynamoDB.DocumentClient();
console.log("Importing Events into DynamoDB. Please wait.");
var events = JSON.parse(fs.readFileSync("eventData.json", "utf8"));
events.forEach(function (event) {
  var params = {
    TableName: "Events",
    Item: {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      place: event.place,
      picture: event.picture,
    },
  };
  docClient.put(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to add Event",
        event.title,
        ". Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("PutItem succeeded:", event.title);
    }
  });
});
