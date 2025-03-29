const express = require("express");
const app = express();
const apiRouter = require("./routers/api.router");

app.use(express.json());

app.use("/api", apiRouter);

app.all("/*", (req, res, next) => {
  console.log(res.body);
  res.status(404).send({ msg: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    console.log(err);
    return res.status(400).send({ msg: "Bad request: Invalid Input." });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  console.log(err);
  res.status(status).send({ msg: message });
});

module.exports = app;
