require("../app");
const { fetchArticleById } = require("../models/articles.model");

exports.getArticleById = (req, res) => {
  const { article_id } = req.params;
  fetchArticleById(article_id).then((article) => {
    console.log(article);
    res.status(200).send({ article });
  });
};
