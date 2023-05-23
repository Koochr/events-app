import {Knex} from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("project_created_events", table => {
    table.increments("id").primary()
    table.uuid("project_id").unique().notNullable().defaultTo(knex.raw("uuid_generate_v4()"))
    table.uuid("user_id").notNullable()
    table.string("name").notNullable()
    table.string("description")
    table.timestamp("created_at").defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("project_created_events")
}
