import { Router } from "express";
import { healthRouter } from "./health";
import { authRouter } from "./auth";
import { subredditsRouter } from "./subreddits";
import { postsRouter } from "./posts";
import { commentsRouter } from "./comments";

export const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(subredditsRouter);
router.use(postsRouter);
router.use(commentsRouter);

