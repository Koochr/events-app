import {Request, Response} from "express"
import db from "../../db"

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: Get all projects of the current user
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *       '401':
 *         description: Unauthorized
 *       default:
 *         description: Unexpected error
 */
export const getUserProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    // Retrieve the project details from the database
    const projects = await db("project_created_events")
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
          "ARRAY_REMOVE(ARRAY_AGG(DISTINCT project_member_added_events.user_id) || ARRAY_AGG(DISTINCT project_created_events.user_id), NULL) AS users"
        ),
        db.raw("ARRAY_REMOVE(ARRAY_AGG(DISTINCT task_created_events.task_id), NULL) AS tasks")
      )
      .where("project_created_events.user_id", req.user)
      .groupBy(
        "project_created_events.project_id",
        "project_created_events.name",
        "project_created_events.description"
      )

    res.status(200).json(projects)
  } catch (error) {
    console.error("Error retrieving project:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}
