import {Request, Response} from "express"
import db from "../../db"
import isProjectMember from "../../utils/isProjectMember"

/**
 * @openapi
 * /api/add_project_member:
 *   post:
 *     summary: Add a member to a project
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
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
 *         description: Project or user not found
 *       default:
 *         description: Unexpected error
 */
export const addProjectMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const {projectId, userId} = req.body

    if (!projectId || !userId) {
      res.status(400).json({error: "Missing required parameters"})
      return
    }

    // Check if the user performing the request is a project member
    const isCurrentUserMember = await isProjectMember(req.user, projectId)
    if (!isCurrentUserMember) {
      res.status(403).json({error: "Forbidden"})
      return
    }

    // Check if the user being added is not already a project member
    const isUserAlreadyMember = await isProjectMember(userId, projectId)
    if (isUserAlreadyMember) {
      res.status(400).json({error: "User is already a member of the project"})
      return
    }

    // Write the projectMemberAdded event to the project_member_added_events table
    await db("project_member_added_events").insert({
      project_id: projectId,
      user_id: userId
    })

    res.status(201).json({message: "Project member added successfully"})
  } catch (error) {
    console.error("Error adding project member:", error)
    res.status(500).json({error: "Internal Server Error"})
  }
}
