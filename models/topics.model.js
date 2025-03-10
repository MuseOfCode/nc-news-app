const db = require("../db/connection");

exports.fetchTopics = () => {
  return db
    .query("SELECT t.slug, t.description FROM topics AS t")
    .then(({ rows }) => {
      return rows;
    });
};
