import 'dotenv/config';


export const PORT = process.env.PORT || 3000;
export const CUSTOM_HEADER_KEY = process.env.CUSTOM_HEADER_KEY || 'my-custom-header';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';