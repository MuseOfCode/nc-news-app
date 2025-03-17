const db = require("../db/connection");

exports.fetchArticles = ({
  sort_by = "created_at",
  order = "DESC",
  topic = null,
} = {}) => {
  const validColumns = [
    "created_at",
    "title",
    "author",
    "topic",
    "votes",
    "comment_count",
  ];
  const validOrders = ["ASC", "DESC"];

  if (!validColumns.includes(sort_by) && !validOrders.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid query detected",
    });
  }

  if (!validColumns.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: `Invalid sort_by query parameter: '${sort_by}' is not a valid column.`,
    });
  }

  if (!validOrders.includes(order.toUpperCase())) {
    return Promise.reject({
      status: 400,
      msg: `Invalid order query parameter: Must be 'ASC' or 'DESC'.`,
    });
  }

  let queryStr = `
    SELECT
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
  `;

  let queryParams = [];

  if (topic) {
    queryStr += " WHERE a.topic = $1";
    queryParams.push(topic);
  }

  queryStr += `
    GROUP BY a.article_id, a.title, a.author, a.topic, a.created_at, a.votes, a.article_img_url
    ORDER BY ${sort_by} ${order.toUpperCase()}
  `;

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleById = (article_id) => {
  const queryStr = `
    SELECT
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
    WHERE a.article_id = $1
    GROUP BY a.article_id, a.title, a.author, a.topic, a.created_at, a.votes, a.article_img_url
  `;

  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `Article with ID ${article_id} not found`,
      });
    }
    return rows[0];
  });
};

exports.updateVotesInArticle = (article_id, inc_votes) => {
  const newVote = inc_votes;
  const minVotesAllowed = 0;

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

exports.validateTopic = (topic) => {
  const topicQuery = `SELECT * FROM topics WHERE slug = $1`;
  return db.query(topicQuery, [topic]).then(({ rows }) => {
    if (rows.length === 0) {
      // If no rows are returned, the topic is invalid
      return Promise.reject({
        status: 400,
        msg: "Invalid topic",
      });
    }
  });
};
