

const isProduction = window.location.hostname !== 'localhost';

export const API_URL = isProduction 
  ? 'https://service-directory-backend.onrender.com/api' // We will update this later after deployment
  : 'http://localhost:5001/api';