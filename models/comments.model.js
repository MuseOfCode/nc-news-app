const db = require("../db/connection");
const { fetchArticleById } = require("./articles.model");

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertComment = (article_id, username, body) => {
  if (!body || !body.trim()) {
    return Promise.reject({
      status: 400,
      msg: "Comment body cannot be empty.",
    });
  }
  return fetchArticleById(article_id)
    .then(() => {
      return db
        .query("SELECT username FROM users WHERE username = $1;", [username])
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "User not found" });
          } else {
            return db.query(
              `INSERT INTO comments (article_id, author, body)
               VALUES ($1, $2, $3) RETURNING *;`,
              [Number(article_id), username, body]
            );
          }
        })
        .then(({ rows }) => {
          return rows[0];
        });
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};
