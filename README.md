# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

This project requires a local PostgreSQL database to be running.

### 1. Install and Set Up PostgreSQL

First, you need to have PostgreSQL installed and running on your machine. You can download it from the [official PostgreSQL website](https://www.postgresql.org/download/).

Once installed, you need to create a database and a user for the application. You can do this using `psql` or a graphical tool like pgAdmin.

Example using `psql`:
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create a new user (you will be prompted for a password)
CREATE USER clinic_user WITH ENCRYPTED PASSWORD 'clinic_password';

# Create the database and set the owner
CREATE DATABASE clinic_db OWNER clinic_user;

# Grant all privileges on the database to the new user
GRANT ALL PRIVILEGES ON DATABASE clinic_db TO clinic_user;

# Exit psql
\q
```

### 2. Set Up Environment Variables

Create a new file named `.env` in the root of the project and add your database connection string. This URL is used by the application to connect to the database you just created.

```
POSTGRES_URL="postgresql://clinic_user:clinic_password@localhost:5432/clinic_db"
```
**Important**: Replace the user, password, and database name if you chose different ones.

### 3. Initialize the Database Schema

With your database running and your `.env` file created, you now need to create the tables and seed them with initial data.

The `init.sql` file in the project root contains all the necessary SQL commands. You can execute this file using the `psql` command:

```bash
psql -U clinic_user -d clinic_db -f init.sql
```
You will be prompted for the `clinic_user` password you created earlier. This command will execute the script and set up all the tables (`doctors`, `patients`, `appointments`, etc.).

### 4. Run the Application

Now that your database is set up and running, you can start the Next.js application.

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the result.
