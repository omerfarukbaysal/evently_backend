var AWS = require("aws-sdk");
var crypto = require("crypto");
const { getYesterday, getNextDay, isISODate } = require("../utils/dateUtils");
var docClient = new AWS.DynamoDB.DocumentClient();

function getEvents(req, res) {
  var params = {
    TableName: "Events",
    IndexName: "startDate-index",
  };
  // If there is a 'highlighted' key in query params, we will filter events with start date today
  if (req.query.highlighted) {
    let yesterday = getYesterday().toISOString();
    let morrow = getNextDay().toISOString();
    params = {
      ...params,
      ...{
        FilterExpression: "startDate BETWEEN :date1 and :date2", // "contains (place, :place)",
        ExpressionAttributeValues: {
          ":date1": yesterday,
          ":date2": morrow,
        },
      },
    };
  }
  docClient.scan(params, onScan);
  function onScan(err, data) {
    if (err) {
      res.status(500).send({
        message: "Server Error",
      });
    } else {
      const { Items } = data;
      res.send(Items);
    }
  }
}

function createEvent(req, res) {
  const { title, description, startDate, place, picture } = req.body;
  var errors = {};
  const requiredFields = [
    "title",
    "description",
    "startDate",
    "place",
    "picture",
  ];

  // Validate all required fields before committing
  requiredFields.map((field) => {
    if (!req.body[field]) {
      if (errors[field])
        errors[field] = [...errors[field], "This field is required."];
      else errors[field] = ["This field is required."];
    }
  });

  // if the 'startDate' field is sent, check that it is in the correct format
  if (startDate) {
    if (!isISODate(startDate)) {
      if (errors["startDate"])
        errors["startDate"] = [
          ...errors["startDate"],
          "Date must be a valid ISO 8601 date (YYYY-MM-DDThh:mm:ssTZD) string.",
        ];
      else
        errors["startDate"] = [
          "Date must be a valid ISO 8601 date (YYYY-MM-DDThh:mm:ssTZD) string.",
        ];
    }
  }
  // if there are no errors
  if (Object.keys(errors).length === 0) {
    const id = crypto.randomUUID(); // Generate random ID
    var params = {
      TableName: "Events",
      Item: {
        id: id,
        title: title,
        description: description,
        startDate: startDate,
        place: place,
        picture: picture,
      },
    };
    docClient.put(params, function (err, data) {
      if (err) {
        res.status(500).send({
          message: "Server Error",
        });
      } else {
        res.status(201).send(params.Item);
      }
    });
  } else {
    // otherwise return errors in response
    res.status(400).send(errors);
  }
}

//
function getSingleEvent(req, res) {
  var id = req.params.id;
  var params = {
    TableName: "Events",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id,
    },
  };
  docClient.query(params, function (err, data) {
    if (err) {
      res.status(500).send({
        message: "Server Error",
      });
    } else {
      const { Items } = data;
      // if there is no match
      if (Items.length < 1) {
        // return 404
        res.status(404).send({
          message: "Not Found.",
        });
      } else {
        res.send(Items[0]);
      }
    }
  });
}

module.exports = { getEvents, createEvent, getSingleEvent };
