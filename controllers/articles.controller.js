require("../app");
const {
  fetchArticles,
  fetchArticleById,
  updateVotesInArticle,
  validateTopic,
} = require("../models/articles.model");

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;

  if (topic) {
    validateTopic(topic)
      .then(() => {
        return fetchArticles({ sort_by, order, topic });
      })
      .then((articles) => {
        res.status(200).send({ articles: articles });
      })
      .catch(next);
  } else {
    fetchArticles({ sort_by, order })
      .then((articles) => {
        res.status(200).send({ articles: articles });
      })
      .catch(next);
  }
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
      res.status(200).send({ article: article });
    })
    .catch(next);
};
