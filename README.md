# NC News Seeding

# Setting Up Environment Variables

.env.* files are ignored by Git meaning anyone who clones this project won’t have access to the required environment variables. Please follow these steps to set up your environment variables:

# Step 1: Create the .env Files

Two .env files need to be created in the root of the project:

.env.development (this is for the development database)

.env.test (this is for the test database)


# Step 2: Add the Required Variables

Each .env file should contain the following environment variable:


The name of the development database in .env.development: 

PGDATABASE=nc_news


The name of your test database in .env.test: 

PGDATABASE=nc_news_test


# Step 3: Verify Your Setup

To confirm that your environment variables are set up as they should be, please run in your terminal:

npm run test-seed

If the connection is successful, you should see logs confirming connection to the correct database.


