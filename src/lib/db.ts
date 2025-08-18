/**
 * @fileOverview Database connection setup.
 * This file configures and exports the PostgreSQL connection pool.
 */
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { Pool } = pg;

if (!process.env.POSTGRES_URL) {
    console.error("*****************************************************************");
    console.error("**********           FATAL ERROR:          **********");
    console.error("********** POSTGRES_URL is not defined in .env file. **********");
    console.error("********** Please create a .env file and add it.     **********");
    console.error("*****************************************************************");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Test the connection on startup and provide a helpful error message.
(async () => {
    let client;
    try {
        client = await pool.connect();
        console.log('PostgreSQL connected successfully.');
        client.release();
    } catch (err: any) {
        if (client) {
            client.release();
        }
        console.error("*****************************************************************");
        console.error("**********      DATABASE CONNECTION FAILED       **********");
        console.error("*****************************************************************");
        console.error("Could not connect to the PostgreSQL database.");
        console.error("Please ensure that:");
        console.error("1. Your PostgreSQL server is running.");
        console.error(`2. The connection URL in your .env file is correct: ${process.env.POSTGRES_URL}`);
        console.error(`Error details: ${err.message}`);
        console.error("*****************************************************************");
        // We exit because the app is not functional without a database.
        process.exit(1);
    }
})();


export default pool;
