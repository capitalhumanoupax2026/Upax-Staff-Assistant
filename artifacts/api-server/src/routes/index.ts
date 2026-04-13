import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import chatRouter from "./chat.js";
import sheetsRouter from "./sheets.js";
import mediaRouter from "./media.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(chatRouter);
router.use(sheetsRouter);
router.use(mediaRouter);
router.use(adminRouter);

export default router;
