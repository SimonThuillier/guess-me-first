import 'dotenv/config';

export const HOSTNAME = process.env.HOSTNAME || 'localhost';
export const PORT = process.env.PORT || 3000;
export const CUSTOM_HEADER_KEY = process.env.CUSTOM_HEADER_KEY || 'my-custom-header';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
export const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001';