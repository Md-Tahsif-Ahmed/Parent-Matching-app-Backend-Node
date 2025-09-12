import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { z } from "zod";
import { MessageController } from "./message.controller";
import { upload } from "../../middlewares/messageUploads";

const MessageReq = z.object({
  params: z.object({ convId: z.string().min(24) }),
});

const router = express.Router();

// USER / ADMIN / SUPER_ADMIN— তিন রোলই পারবে
router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

// list
router.get("/:convId/messages", validateRequest(MessageReq), MessageController.list);

// send (multipart)
router.post(
  "/:convId/message",
  upload,                      // <-- multipart form-data (files in memory)
  validateRequest(MessageReq),
  MessageController.send
);

// NEW: chat opened ⇒ mark all not-seen as seen
router.post(
  "/:convId/seen",
  validateRequest(MessageReq),
  MessageController.seen
);

export const MessageRoutes = router;
