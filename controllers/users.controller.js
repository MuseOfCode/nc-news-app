const { fetchAllUsers, fetchUserByUsername } = require("../models/users.model");

exports.getAllUsers = (req, res) => {
  fetchAllUsers().then((users) => {
    res.status(200).send({ users: users });
  });
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  fetchUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user: user });
    })
    .catch(next);
};
