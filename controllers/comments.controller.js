const { fetchArticleById } = require("../models/articles.model");
const {
  fetchCommentsByArticleId,
  insertComment,
  removeCommentById,
  checkCommentExists,
  updateVotesInComment,
} = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then(() => {
      return fetchCommentsByArticleId(article_id);
    })
    .then((comments) => {
      res.status(200).send({ comments: comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  insertComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment: comment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  checkCommentExists(comment_id)
    .then(() => removeCommentById(comment_id))
    .then(() => res.status(204).send())
    .catch(next);
};

exports.updateCommentVotes = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  if (inc_votes === null) {
    return next({
      status: 400,
      message: "Bad request: Invalid Input.",
    });
  }

  updateVotesInComment(comment_id, inc_votes)
    .then((comment) => {
      res.status(200).send({ comment: comment });
    })
    .catch(next);
};
