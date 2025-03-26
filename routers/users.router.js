const express = require("express");
const usersRouter = express.Router();
const { getAllUsers } = require("../controllers/users.controller");

usersRouter.get("/", getAllUsers);

module.exports = usersRouter;
