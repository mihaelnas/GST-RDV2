
# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Running the Local Database

This project is configured to work with a local PostgreSQL database using Docker.

**Prerequisites:**
- Docker must be installed and running on your machine.

**To start the database:**

1. Open a new terminal in your project directory.
2. Run the following command:
   ```bash
   docker-compose up
   ```
3. The first time you run this, it will download the PostgreSQL image and create a local database pre-filled with the necessary tables and some sample data.
4. The database will be running and accessible to your Next.js application. You can now run the app with `npm run dev`.

To stop the database, press `Ctrl + C` in the terminal where `docker-compose` is running.
To remove the database container and its data, run `docker-compose down -v`.

    