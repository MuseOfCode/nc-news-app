const { fetchArticleById } = require("../models/articles.model");
const { fetchCommentsByArticleId } = require("../models/comments.model");

require("../app");

exports.getCommentsByArticleId = (req, res, next) => {
  console.log(req.params);
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then(() => {
      return fetchCommentsByArticleId(article_id);
    })
    .then((comments) => {
      // if (comments) console.log(comments);
      res.status(200).send({ comments: comments });
    })
    .catch(next);
};
