import {Knex} from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("task_created_events", table => {
    table.increments("id").primary()
    table.uuid("task_id").unique().notNullable().defaultTo(knex.raw("uuid_generate_v4()"))
    table.uuid("project_id").notNullable()
    table.string("name").notNullable()
    table.string("description")
    table.timestamp("created_at").defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("task_created_events")
}
