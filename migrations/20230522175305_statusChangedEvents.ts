import {Knex} from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("task_status_changed_events", table => {
    table.increments("id").primary()
    table.uuid("task_id").notNullable()
    table.uuid("status_id").notNullable()
    table.timestamp("created_at").defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("task_status_changed_events")
}
