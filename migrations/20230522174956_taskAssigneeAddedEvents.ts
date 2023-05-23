import {Knex} from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("task_assignee_added_events", table => {
    table.increments("id").primary()
    table.uuid("task_id").notNullable()
    table.uuid("user_id").notNullable()
    table.timestamp("created_at").defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("task_assignee_added_events")
}
