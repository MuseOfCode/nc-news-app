require("../app");

exports.handleServerErrors = (err, req, res, next) => {
  console.error(err);

  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
};
