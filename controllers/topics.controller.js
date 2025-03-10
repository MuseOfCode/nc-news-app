require("../app");
const { fetchTopics } = require("../models/topics.model");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      if (!topics.length) {
        return Promise.reject({
          status: 404,
          msg: "Endpoint Not Found",
        });
      }
      res.status(200).send({ topics: topics });
    })
    .catch((err) => {
      next(err);
    });
};
