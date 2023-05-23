import {Request, Response} from "express"
import db from "../../db"
import isProjectMember from "../../utils/isProjectMember"

/**
 * @openapi
 * /api/add_task_assignee:
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
 *               userId:
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
export const addTaskAssignee = async (req: Request, res: Response): Promise<void> => {
  try {
    const {taskId, userId} = req.body

    if (!taskId || !userId) {
      res.status(400).json({error: "Missing required fields"})
      return
    }

    const task = await db("task_created_events")
      .where({task_id: taskId})
      .select("task_id", "project_id")
      .first()
    if (!task) {
      res.status(404).json({error: "Task not found"})
      return
    }

    // Check if the user performing the request is a member of the project
    const currentUser = req.user
    const isCurrentUserMember = await isProjectMember(currentUser, task.project_id)
    if (!isCurrentUserMember) {
      res.status(403).json({error: "Forbidden"})
      return
    }

    // Check if the user being added is a member of the project
    const isUserMember = await isProjectMember(userId, task.project_id)
    if (!isUserMember) {
      res.status(400).json({error: "User is not a member of the project"})
      return
    }

    // Check if the user being added is not already a member of the task
    const taskAssigneeAddedEvent = await db("task_assignee_added_events")
      .where({task_id: taskId, user_id: userId})
      .first()
    if (taskAssigneeAddedEvent) {
      res.status(400).json({error: "User is already a member of the task"})
      return
    }

    // Write the taskMemberAdded event to the task_member_added_events table
    await db("task_assignee_added_events").insert({
      task_id: taskId,
      user_id: userId
    })

    res.status(201).json({message: "Task assignee added successfully"})
  } catch (error) {
    console.error("Error adding user to the task:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}
