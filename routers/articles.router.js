const express = require("express");
const articlesRouter = express.Router();
const {
  getArticles,
  getArticleById,
  updateArticleVotes,
} = require("../controllers/articles.controller");

const {
  getCommentsByArticleId,
  postComment,
} = require("../controllers/comments.controller");

// Routes for articles
articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.patch("/:article_id", updateArticleVotes);

// Routes for comments on a specific article
articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postComment);

module.exports = articlesRouter;
