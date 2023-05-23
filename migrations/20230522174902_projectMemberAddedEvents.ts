import {Knex} from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("project_member_added_events", table => {
    table.increments("id").primary()
    table.uuid("project_id").notNullable()
    table.uuid("user_id").notNullable()
    table.timestamp("created_at").defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("project_member_added_events")
}
