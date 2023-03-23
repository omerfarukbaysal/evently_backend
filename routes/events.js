var express = require("express");
var router = express.Router();
const eventController = require("../controllers/eventController");

/* GET events listing. */
router.get("/", eventController.getEvents);

/* POST event. */
router.post("/", eventController.createEvent);

/* GET single event. */
router.get("/:id", eventController.getSingleEvent);

module.exports = router;
