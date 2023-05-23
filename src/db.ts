import knex, {Knex} from "knex"

const db: Knex = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST ?? "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "events_db"
  }
})

export default db
