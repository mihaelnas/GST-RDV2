/**
 * @fileOverview Database connection setup.
 * This file configures and exports the PostgreSQL connection pool.
 */
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { Pool } = pg;

let pool: pg.Pool;

if (!process.env.POSTGRES_URL) {
    console.error("*****************************************************************");
    console.error("**********           CONFIGURATION ERROR:         **********");
    console.error("********** POSTGRES_URL is not defined in .env file. **********");
    console.error("********** The application will run, but all DB    **********");
    console.error("********** queries will fail until it is configured. **********");
    console.error("*****************************************************************");
    // Create a mock pool that will throw an error on any query
    pool = {
        query: () => Promise.reject(new Error("Database connection is not configured. Please set POSTGRES_URL in the .env file.")),
        connect: () => Promise.reject(new Error("Database connection is not configured. Please set POSTGRES_URL in the .env file.")),
        on: () => {}, // Mock 'on' method to do nothing
    } as any;
} else {
    pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });

    // This is the definitive fix for character encoding issues.
    // It ensures that every new client connection from the pool will use UTF8.
    pool.on('connect', (client) => {
        client.query('SET client_encoding TO \'UTF8\'')
            .catch(err => console.error('Error setting client encoding', err));
    });

    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
}

export default pool;