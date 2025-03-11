const db = require("../db/connection");

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      // if(comments.length === 0 && )
      console.log("What is sent back:", rows);
      return rows;
    });
};
//   return db.query(
//     `SELECT c.comment_id, c.votes, c.created_at, c.author, c.body, c.article_id FROM comments AS c JOIN article a ON a.article WHERE c.article_id = ${article_id}`, [article_id]
//   );
