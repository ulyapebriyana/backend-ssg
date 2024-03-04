import express from "express"
import user from "./controllers/user-controller.js"

const router = express.Router()

router.post("/api/auth/register", user.register)
router.post("/api/auth/login", user.login)

export default router