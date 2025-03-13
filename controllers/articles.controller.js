require("../app");
const {
  fetchArticles,
  fetchArticleById,
  updateVotesInArticle,
} = require("../models/articles.model");

exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.updateArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  fetchArticleById(article_id)
    .then(() => {
      return updateVotesInArticle(article_id, inc_votes);
    })
    .then((article) => {
      console.log(article);
      res.status(200).send({ article: article });
    })
    .catch(next);
};
