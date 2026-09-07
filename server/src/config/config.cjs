/**
 * config/config.cjs — Sequelize CLI configuration
 *
 * The CLI (unlike your app) can't use the ESM `sequelize` instance in db.js
 * directly — it needs its own CommonJS config file with connection details
 * per environment. This is the ONLY place DATABASE_URL is read a second time,
 * purely for migration tooling.
 */
require("dotenv/config");

const common = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
};

module.exports = {
  development: common,
  test: common,
  production: common,
};