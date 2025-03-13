const db = require("../connection");

exports.getArticlesWithoutComments = () => {
  return db
    .query(
      `SELECT a.* 
         FROM articles AS a
         LEFT JOIN comments AS c ON a.article_id = c.article_id 
         WHERE c.article_id IS NULL
         LIMIT 1;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.countUsers = () => {
  return db.query("SELECT COUNT(*) AS total_users FROM users;");
};

exports.deleteAllUsers = () => {
  return db.query("DELETE FROM users");
};
