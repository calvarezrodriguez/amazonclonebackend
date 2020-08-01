module.exports = {
  database: process.env.MONGODB_KEY,
  port: process.env.MONGODB_PORT || 3030,
  secret: process.env.SECRET_MONGO,
};
