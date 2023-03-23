require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
var AWS = require("aws-sdk");
AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  endpoint: process.env.DB_ENDPOINT,
});
var dynamodb = new AWS.DynamoDB();
var params = {
  TableName: "Events",
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" }, // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "startDate", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    // create a secondary index on startDate attribute
    {
      IndexName: "startDate-index",
      KeySchema: [
        { AttributeName: "startDate", KeyType: "HASH" }, // secondary index attribute
      ],
      Projection: {
        ProjectionType: "ALL",
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
};
dynamodb.createTable(params, function (err, data) {
  if (err) {
    console.error(
      "Unable to create table. Error JSON:",
      JSON.stringify(err, null, 2)
    );
  } else {
    console.log(
      "Created table. Table description JSON:",
      JSON.stringify(data, null, 2)
    );
  }
});
