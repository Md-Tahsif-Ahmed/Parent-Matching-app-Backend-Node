import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ConversationController } from "./conversation.controller";

const router = express.Router();
router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get("/list", ConversationController.myList);
router.get("/recent", ConversationController.recent);
router.patch("/:id/archive", ConversationController.archive);

export const ConversationRoutes = router;
