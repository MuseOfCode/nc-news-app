const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, createArticleLookup } = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query("DROP TABLE IF EXISTS comments;")
    .then(() => db.query("DROP TABLE IF EXISTS articles;"))
    .then(() => db.query("DROP TABLE IF EXISTS users;"))
    .then(() => db.query("DROP TABLE IF EXISTS topics;"))
    .then(() => createTopics())
    .then(() => createUsers()) 
    .then(() => createArticles())
    .then(() => createComments())
    .then(() => insertTopics(topicData))
    .then(() => insertUsers(userData))
    .then(() => insertArticles(articleData))
    .then(({ rows }) => {
      const articleLookup = createArticleLookup(rows);
      return insertComments(commentData, articleLookup);
    });
};

module.exports = seed;

function createTopics() {
  const topics = (`
    CREATE TABLE IF NOT EXISTS topics (
      slug VARCHAR(50) PRIMARY KEY,
      description VARCHAR(100) NOT NULL,
      img_url VARCHAR(1000)
    );
  `);
  return db.query(topics)
    .then(() => console.log("Topics table created"))
    .catch((err) => console.error("Error creating topics table:", err));
}

function createUsers() {
  const users = (`
    CREATE TABLE IF NOT EXISTS users (
      username VARCHAR(50) PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      avatar_url VARCHAR(1000)
    );
  `);
  return db.query(users)
    .then(() => console.log("Users table created!"))
    .catch((err) => console.error("Error creating users table:", err));
}

function createArticles() {
  const articles = (`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
      topic VARCHAR(50) REFERENCES topics(slug) ON DELETE CASCADE, 
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      votes INT DEFAULT 0,
      article_img_url VARCHAR(1000)
    );
  `);
  return db.query(articles)
    .then(() => console.log("Articles table created"))
    .catch((err) => console.error("Error creating articles table:", err));
}

function createComments() {
  const comments = (`
    CREATE TABLE IF NOT EXISTS comments (
      comment_id SERIAL PRIMARY KEY,
      article_id INT REFERENCES articles(article_id) ON DELETE CASCADE,
      author VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
      body TEXT NOT NULL,
      votes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  return db.query(comments)
    .then(() => console.log("Comments table created"))
    .catch((err) => console.error("Error creating comments table:", err));
}

function insertTopics(data) {
  const qStr = format(
    `INSERT INTO topics (slug, description, img_url)
    VALUES %L RETURNING *;`,
    data.map(({ slug, description, img_url }) => [slug, description, img_url])
  );
  return db.query(qStr);
}

function insertUsers(data) {
  const qStr = format(
    `INSERT INTO users (username, name, avatar_url)
    VALUES %L RETURNING *;`,
    data.map(({ username, name, avatar_url }) => [username, name, avatar_url])
  );
  return db.query(qStr);
}

function insertArticles(data) {
  // Convert the created_at timestamps to ISO strings.
  const formattedArticles = data.map(convertTimestampToDate);
  const qStr = format(
    `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url)
    VALUES %L RETURNING *;`,
    formattedArticles.map(({ title, topic, author, body, created_at, votes = 0, article_img_url }) => 
      [title, topic, author, body, created_at, votes, article_img_url]
    )
  );
  return db.query(qStr);
}

function insertComments(data, articleLookup) {
  // Map the comment data, converting created_at to an ISO string.
  const formattedComments = data.map(comment => ({
    article_id: articleLookup[comment.article_title],
    body: comment.body,
    votes: comment.votes,
    author: comment.author,
    created_at: new Date(comment.created_at).toISOString()
  }));

  const qStr = format(
    `INSERT INTO comments (article_id, body, votes, author, created_at)
     VALUES %L RETURNING *;`,
    formattedComments.map(({ article_id, body, votes, author, created_at }) => 
      [article_id, body, votes, author, created_at]
    )
  );
  return db.query(qStr);
}
