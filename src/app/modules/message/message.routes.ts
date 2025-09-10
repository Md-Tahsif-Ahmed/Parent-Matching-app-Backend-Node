// import express from "express";
// import auth from "../../middlewares/auth";
// import { USER_ROLES } from "../../../enums/user";
// import validateRequest from "../../middlewares/validateRequest";
// import { z } from "zod";
// import { MessageController } from "./message.controller";

// const Param = z.object({ convId: z.string().min(10) });

// const router = express.Router();
// router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

// router.get(
//   "/:convId/messages",
//   validateRequest({ params: Param } as any),
//   MessageController.list
// );
// router.post(
//   "/:convId/message",
//   validateRequest({ params: Param } as any),
//   MessageController.send
// );

 

import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { z } from "zod";
import { MessageController } from "./message.controller";


const MessageReq = z.object({
  params: z.object({ convId: z.string().min(24) })
});

 const router = express.Router();
 router.use(auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));


router.get("/:convId/messages", validateRequest(MessageReq), MessageController.list);
router.post("/:convId/message",  validateRequest(MessageReq), MessageController.send);

export const MessageRoutes = router;


