import {Request, Response} from "express"
import db from "../../db"
import isProjectMember from "../../utils/isProjectMember"

/**
 * @openapi
 * /api/set_task_status:
 *   post:
 *     summary: Add a member to a task
 *     tags:
 *       - Task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: string
 *               statusId:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Member added successfully
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Task or user not found
 *       default:
 *         description: Unexpected error
 */
export const setTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const {taskId, statusId} = req.body

    // Validate mandatory fields
    if (!taskId || !statusId) {
      res.status(400).json({error: "Missing required fields"})
      return
    }

    // Check if the user performing the request is a member of the project
    const currentUser = req.user
    const project = await db("task_created_events")
      .where("task_id", taskId)
      .select("project_id")
      .first()

    if (!project) {
      res.status(404).json({error: "Project not found"})
      return
    }

    const isCurrentUserMember = await isProjectMember(currentUser, project.project_id)
    if (!isCurrentUserMember) {
      res.status(403).json({error: "Forbidden"})
      return
    }

    // Write the taskStatusChanged event to the task_status_changed_events table
    await db("task_status_changed_events").insert({
      task_id: taskId,
      status_id: statusId
    })

    res.status(200).json({message: "Task status changed successfully"})
  } catch (error) {
    console.error("Error changing task status:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}
