const apiRouter = require("express").Router();

const { getEndpoints } = require("../controllers/api.controller");
const topicsRouter = require("./topics.router");
const articlesRouter = require("./articles.router");
const usersRouter = require("./users.router");
const commentsRouter = require("./comments.router");

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);

apiRouter.get("/", getEndpoints);

apiRouter.get("/", (req, res) => {
  res.status(200).send({
    message: "Welcome to the NC News API. Visit /api for available endpoints.",
  });
});

module.exports = apiRouter;
