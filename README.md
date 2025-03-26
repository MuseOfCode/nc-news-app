# NC News API

## Hosted Version

You can access the hosted version of this API here: https://nc-news-ysld.onrender.com/api

This link will also direct you to a full list of available endpoints and how to use them.

---

## Project Overview

NC News is a RESTful API that serves news-related data, including articles, topics, users and comments. Users can interact with the API by retrieving articles, posting and deleting comments and voting on articles. This project is built using **Node.js, Express and PostgreSQL**.

---

## Getting started:

To get started with this project locally, please follow the instructions below.

### 1. Clone the Repository

```sh[
git clone https://github.com/MuseOfCode/nc-news-app.git
cd nc-news
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

The project requires two `.env` files to be created in the root directory:

#### `.env.development` (For Development Database)
```sh
PGDATABASE=nc_news
```

#### `.env.test` (For Test Database)
```sh
PGDATABASE=nc_news_test
```

**Please note:** `.env` files are ignored by Git meaning that they must be created manually.

### 4. Set Up and Seed the Local Database

Ensure you have **PostgreSQL installed and running**. Then, run the following commands to create and seed your databases:

```sh
npm run setup-dbs   # This creates the databases
npm run seed-dev    # This seeds the development database
```

### 5. Run Tests

To verify everything is set up correctly, run the test suite:

```sh
npm run test
```

### 6. Start the Server Locally

To start the server locally, run:

```sh
npm start
```

The server should now be running on: [http://localhost:9090](http://localhost:9090).

---

## Production Environment Setup

For production deployment, a `.env.production` file is needed with the following format:

```sh
DATABASE_URL=your-production-database-url
```

After setting up the production database, seed it using:

```sh
npm run seed-prod
```

---

## Minimum Requirements

- **Node.js:** v16+
- **PostgreSQL:** v12+

---


