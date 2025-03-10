const db = require("../db/connection");

exports.fetchTopics = () => {
  return db
    .query("SELECT t.slug, t.description FROM topics AS t")
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "No topics found",
        });
      }
      return rows;
    });
};
