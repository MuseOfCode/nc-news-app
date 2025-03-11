require("../app");
const { fetchArticles, fetchArticleById } = require("../models/articles.model");

exports.getArticles = (req, res) => {
  fetchArticles().then((articles) => {
    console.log(articles);
    res.status(200).send({ articles });
  });
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
