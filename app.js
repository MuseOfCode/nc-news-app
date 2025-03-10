const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

module.exports = app;
