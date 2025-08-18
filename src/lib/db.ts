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
    // We exit here because there is no way to connect without the URL.
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

pool.on('connect', () => {
    console.log('A client has connected to the PostgreSQL database.');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export default pool;
