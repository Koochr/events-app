import {Request, Response} from "express"
import db from "../../db"
import isProjectMember from "../../utils/isProjectMember"

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get project details
 *     tags:
 *       - Project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Project details retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       default:
 *         description: Unexpected error
 */
export const getProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id

    const isCurrentUserMember = await isProjectMember(req.user, projectId)
    if (!isCurrentUserMember) {
      res.status(403).json({error: "Forbidden"})
      return
    }

    // Retrieve the project details from the database
    const project = await db("project_created_events")
      .leftJoin(
        "project_member_added_events",
        "project_created_events.project_id",
        "project_member_added_events.project_id"
      )
      .leftJoin(
        "task_created_events",
        "project_created_events.project_id",
        "task_created_events.project_id"
      )
      .select(
        "project_created_events.project_id",
        "project_created_events.name",
        "project_created_events.description",
        db.raw(
          "ARRAY_REMOVE(ARRAY_AGG(project_member_added_events.user_id) || ARRAY_AGG(project_created_events.user_id), NULL) AS users"
        ),
        db.raw("ARRAY_REMOVE(ARRAY_AGG(task_created_events.task_id), NULL) AS tasks")
      )
      .where("project_created_events.project_id", projectId)
      .groupBy(
        "project_created_events.project_id",
        "project_created_events.name",
        "project_created_events.description"
      )
      .first()

    if (!project) {
      res.status(404).json({error: "Project not found"})
      return
    }

    res.status(200).json(project)
  } catch (error) {
    console.error("Error retrieving project:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}
