import { config } from 'dotenv';
config();
export default {
  PORT: Number(process.env.PORT),
  DB_URL: String(process.env.DB_URL),
};
