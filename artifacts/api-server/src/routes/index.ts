import { Router, type IRouter } from "express";
import healthRouter from "./health";
import replyRouter from "./reply";

const router: IRouter = Router();

router.use(healthRouter);
router.use(replyRouter);

export default router;
