// For a real application, use environment variables for these settings.
// For this college project, we are hardcoding them for simplicity.
module.exports = {
  HOST: process.env.DATABASE_HOST || "localhost",
  USER: process.env.DATABASE_USER || "root",
  PASSWORD: process.env.DATABASE_PASSWORD || "",
  DB: process.env.DATABASE_NAME || "service_booking"
};
