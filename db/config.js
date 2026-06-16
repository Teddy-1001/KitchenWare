import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT,
})
// const pool = new Pool({
//     connectionString: process.env.NEON_URL,
//     ssl: {
//         rejectUnauthorized: false
//     }
// })
export default pool;