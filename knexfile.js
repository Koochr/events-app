require("ts-node/register")

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST ?? "localhost",
      user: "postgres",
      password: "postgres",
      database: "events_db"
    },
    migrations: {
      directory: "./migrations"
    },
    seeds: {
      directory: "./seeds"
    }
  }
}
