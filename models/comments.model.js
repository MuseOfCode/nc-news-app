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
  return fetchArticleById(article_id).then(() => {
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
  });
};

exports.checkCommentExists = (comment_id) => {
  return db
    .query("SELECT * FROM comments WHERE comment_id = $1;", [comment_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

exports.removeCommentById = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

exports.updateVotesInComment = (comment_id, inc_votes) => {
  const newVote = inc_votes;
  const minVotesAllowed = 0;

  return db
    .query("SELECT * FROM comments WHERE comment_id = $1", [comment_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment not found.",
        });
      }

      const currentVotes = rows[0].votes;
      const updatedVotes = currentVotes + newVote;

      if (updatedVotes < minVotesAllowed) {
        return Promise.reject({
          status: 400,
          msg: "Votes cannot go below 0",
        });
      }

      return db
        .query(
          "UPDATE comments SET votes = $1 WHERE comment_id = $2 RETURNING *;",
          [updatedVotes, comment_id]
        )
        .then(({ rows }) => rows[0]);
    });
};
