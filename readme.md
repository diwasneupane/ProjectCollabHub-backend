# Setting Up the Database and Seeding Data

To set up the database and seed initial data, follow these steps:

1. **Configure MongoDB URI:**

   - Open your environment file (`.env`) and paste your MongoDB connection URI.
     ```
     MONGODB_URI=<your_mongodb_uri>
     ```
     Example URI format: `MONGODB_URI=mongodb+srv://username:password@cluster0.9ah6mbk.mongodb.net`
     (Make sure to remove the trailing slash from the URI)

2. **Run Database Seeding:**
   - Execute the following command in your terminal:
     ```
     npm run seed
     ```
     This command will populate the database with initial data, including an admin login. You can find the admin login credentials in the `src/db/seeders.js` file.

# Usage Instructions

Once the database is seeded, you can proceed with the following steps:

1. **Admin Login:**

   - Log in as an admin using the provided credentials.

2. **Registration:**

   - After logging in as an admin, register students and instructors as necessary.

3. **Utilize Application Functionalities:**
   - Perform any other required tasks using the provided functionalities of your application.
