import * as dotenv from 'dotenv';

dotenv.config();

export const appConstants = {
  SERVER_PORT: parseInt(process.env.SERVER_PORT),

  DB_DATABASE_NAME: process.env.DB_DATABASE_NAME,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT),
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,

  HASHING_SALT_ROUNDS: parseInt(process.env.HASHING_SALT_ROUNDS),
  HASHING_SALT: process.env.HASHING_SALT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
  DB_LOGGING: process.env.DB_LOGGING,

  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: parseInt(process.env.MAIL_PORT),
  MAIL_USERNAME: process.env.MAIL_USERNAME,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,

  BASE_URL_STATIC_FILES: process.env.BASE_URL_STATIC_FILES,
  COMPLEMENTS_PATH: process.env.COMPLEMENTS_PATH,
  COMPLEMENTS_PATH_TIRE_CHARACTERISTICS: process.env.COMPLEMENTS_PATH_TIRE_CHARACTERISTICS,
  SALES_MENU_PATH: process.env.SALES_MENU_PATH,
  SERVICES_PATH: process.env.SERVICES_PATH,
  TTL_CACHE: parseInt(process.env.TTL_CACHE),
  MAX_CACHE: parseInt(process.env.MAX_CACHE),

  DB_EQUIFAX_HOST: process.env.DB_EQUIFAX_HOST,
  DB_EQUIFAX_PORT: parseInt(process.env.DB_EQUIFAX_PORT),
  DB_EQUIFAX_USERNAME: process.env.DB_EQUIFAX_USERNAME,
  DB_EQUIFAX_PASSWORD: process.env.DB_EQUIFAX_PASSWORD,
  DB_EQUIFAX_DATABASE: process.env.DB_EQUIFAX_DATABASE,
  MODE_APP: process.env.MODE_APP,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: parseInt(process.env.REDIS_PORT),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  BASE_URL_FILES_STORAGE: process.env.BASE_URL_FILES_STORAGE,
  STATIC_URL_PATH: process.env.STATIC_URL_PATH,
};
