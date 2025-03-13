const { fetchAllUsers } = require("../models/users.model");

exports.getAllUsers = (req, res) => {
  fetchAllUsers().then((users) => {
    res.status(200).send({ users: users });
  });
};
