import express from "express"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import {registerUser} from "./routes/updaters/register"
import {login} from "./routes/login"
import {createProject} from "./routes/updaters/createProject"
import {checkToken} from "./middlewares/auth"
import {addProjectMember} from "./routes/updaters/addProjectMember"
import {createTask} from "./routes/updaters/createTask"
import {addTaskAssignee} from "./routes/updaters/addTaskAssignee"
import {addStatus} from "./routes/updaters/addStatus"
import {setTaskStatus} from "./routes/updaters/setTaskStatus"
import {getUser} from "./routes/getters/getUser"
import {getProject} from "./routes/getters/getProject"
import {getTask} from "./routes/getters/getTask"
import {getStatus} from "./routes/getters/getStatus"
import {getUserProjects} from "./routes/getters/getUserProjects"
import {getProjectTasks} from "./routes/getters/getProjectTasks"
const port = process.env.PORT ?? 3000

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Task manager sample service",
      version: "0.1.0",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html"
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    servers: [
      {
        url: `http://${process.env.HOST ?? "localhost"}:${port}`
      }
    ]
  },
  apis: ["./src/routes/**/*.ts"]
}

// Extend the Request type to include the user property
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: string
    }
  }
}

// Create Express app
const app = express()
app.use(express.json())

const specs = swaggerJsdoc(options)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

// Add the routes
app.get("/api/users/:id", getUser)
app.get("/api/projects/", checkToken, getUserProjects)
app.get("/api/projects/:id", checkToken, getProject)
app.get("/api/tasks/:id", checkToken, getTask)
app.get("/api/projects/:id/tasks", checkToken, getProjectTasks)
app.get("/api/projects/:id/statuses", getStatus)

app.post("/api/register", registerUser)
app.post("/api/login", login)
app.post("/api/create_project", checkToken, createProject)
app.post("/api/add_project_member", checkToken, addProjectMember)
app.post("/api/create_task", checkToken, createTask)
app.post("/api/add_task_assignee", checkToken, addTaskAssignee)
app.post("/api/add_status", checkToken, addStatus)
app.post("/api/set_task_status", checkToken, setTaskStatus)

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`)
})
