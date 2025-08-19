
# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To run your full development environment, you will need two separate terminals.

**Terminal 1: Start the Database**
1. Run `docker-compose up`.
2. This command starts the local PostgreSQL database service. Leave this terminal running.

**Terminal 2: Start the Application**
1. Run `npm run dev`.
2. This command starts the Next.js application.
3. Open [http://localhost:9002](http://localhost:9002) in your browser to see the result.

Your app in Terminal 2 will now be able to connect to the database running in Terminal 1.

## About the Local Database

This project is configured to work with a local PostgreSQL database using Docker, which is managed by the `docker-compose.yml` file.

**Prerequisites:**
- Docker must be installed and running on your machine.

The first time you run `docker-compose up`, Docker will download the PostgreSQL image and create a local database pre-filled with the necessary tables and some sample data from the `init.sql` file.

To stop the database, press `Ctrl + C` in the terminal where `docker-compose` is running.
To remove the database container and all its data, run `docker-compose down -v`.
