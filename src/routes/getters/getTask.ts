import {Request, Response} from "express"
import db from "../../db"
import isProjectMember from "../../utils/isProjectMember"

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task details
 *     tags:
 *       - Task
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
 *         description: Task details retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       default:
 *         description: Unexpected error
 */
export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id

    // Retrieve the task details from the database
    const task = await db("task_created_events")
      .leftJoin(
        "task_assignee_added_events",
        "task_created_events.task_id",
        "task_assignee_added_events.task_id"
      )
      .leftJoin(
        db.raw(`(
        SELECT status_id, task_id
        FROM task_status_changed_events
        WHERE id IN (
          SELECT MAX(id)
          FROM task_status_changed_events
          GROUP BY task_id
        )
        ) AS last_status`),
        "last_status.task_id",
        "task_created_events.task_id"
      )
      .leftJoin(
        "task_status_created_events",
        "last_status.status_id",
        "task_status_created_events.status_id"
      )
      .select(
        "task_created_events.task_id",
        "task_created_events.name",
        "task_created_events.description",
        "task_created_events.project_id",
        db.raw("ARRAY_REMOVE(ARRAY_AGG(task_assignee_added_events.user_id), NULL) AS users"),
        db.raw("COALESCE(task_status_created_events.name, 'CREATED') AS status")
      )
      .where("task_created_events.task_id", taskId)
      .groupBy(
        "task_created_events.task_id",
        "task_created_events.name",
        "task_created_events.description",
        "task_created_events.project_id",
        "task_status_created_events.name"
      )
      .first()

    if (!task) {
      res.status(404).json({error: "Task not found"})
      return
    }

    // Check if the user is a project member
    const isUserProjectMember = await isProjectMember(req.user, task.project_id)

    if (!isUserProjectMember) {
      res.status(403).json({error: "Unauthorized access"})
      return
    }

    res.status(200).json(task)
  } catch (error) {
    console.error("Error retrieving task:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}
