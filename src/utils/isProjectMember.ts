import db from "../db"
const isProjectMember = async (userId: string, projectId: string): Promise<boolean> => {
  const projectCreatedEvent = await db("project_created_events")
    .where({user_id: userId, project_id: projectId})
    .first()

  if (projectCreatedEvent) {
    return true
  }

  const projectMemberAddedEvent = await db("project_member_added_events")
    .where({user_id: userId, project_id: projectId})
    .first()

  return !!projectMemberAddedEvent
}

export default isProjectMember
