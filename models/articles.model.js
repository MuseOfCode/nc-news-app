const db = require("../db/connection");

exports.fetchArticles = ({ sort_by = "created_at", order = "DESC" } = {}) => {
  const validSortColumns = ["created_at", "title", "author", "votes"];
  const validOrders = ["ASC", "DESC"];

  return db
    .query(
      `SELECT
        a.article_id,
        a.title,
        a.author,
        a.topic,
        a.created_at,
        a.votes,
        a.article_img_url,
        COUNT(c.comment_id)::INT AS comment_count
      FROM articles AS a
      LEFT JOIN comments c
        ON a.article_id = c.article_id
      GROUP BY a.article_id
      ORDER BY ${sort_by} ${order}`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.updateVotesInArticle = (article_id, inc_votes) => {
  const newVote = inc_votes;
  const maxVotesAllowed = 100;
  const minVotesAllowed = 0;

  if (newVote === undefined) {
    return Promise.reject({
      status: 400,
      msg: "inc_votes is required",
    });
  }

  if (newVote === null || isNaN(newVote)) {
    return Promise.reject({
      status: 400,
      msg: "inc_votes must be a number",
    });
  }

  if (Math.abs(newVote) > maxVotesAllowed) {
    return Promise.reject({
      status: 400,
      msg: `inc_votes exceeds the maximum allowed value of ${maxVotesAllowed}`,
    });
  }

  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
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
          "UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *;",
          [updatedVotes, article_id]
        )
        .then(({ rows }) => {
          return rows;
        });
    });
};
