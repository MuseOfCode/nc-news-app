const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/api.controller");

app.get("/api", getEndpoints);

module.exports = app;
