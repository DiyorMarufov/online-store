import { config } from 'dotenv';
config();
export default {
  PORT: Number(process.env.PORT),
  DB_URL: String(process.env.DB_URL),
  ACCESS_TOKEN_KEY: String(process.env.ACCESS_TOKEN_KEY),
  ACCESS_TOKEN_TIME: String(process.env.ACCESS_TOKEN_TIME),
  REFRESH_TOKEN_KEY: String(process.env.REFRESH_TOKEN_KEY),
  REFRESH_TOKEN_TIME: String(process.env.REFRESH_TOKEN_TIME),
  SUPERADMIN_FULL_NAME: String(process.env.SUPERADMIN_FULL_NAME),
  SUPERADMIN_PHONE_NUMBER: String(process.env.SUPERADMIN_PHONE_NUMBER),
  SUPERADMIN_PASSWORD: String(process.env.SUPERADMIN_PASSWORD),
};
