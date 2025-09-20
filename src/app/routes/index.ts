import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ProfileRoutes } from '../modules/profile/profile.routes';
import { MatchRoutes } from '../modules/match/match.routes';
import { MessageRoutes } from '../modules/message/message.routes';
import { ConversationRoutes } from '../modules/conversation/conversation.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { AdminRoutes } from '../modules/admin/admin.route';
import { FeedRoutes } from '../modules/feed/feed.routes';
import { BlockRoutes } from '../modules/block/block.routes';
import { JourneyRoutes } from '../modules/journey/journey.route';
import { TherapyRoutes } from '../modules/therapy/therapy.routes';
import { DiagnosisRoutes } from '../modules/diagonosis/diagonosis.routes';
const router = express.Router();

const apiRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/user", route: UserRoutes },
  { path: "/admin", route: AdminRoutes },
  { path: "/profile", route: ProfileRoutes },
  { path: "/match", route: MatchRoutes },
  { path: "/message", route: MessageRoutes },
  { path: "/conversation", route: ConversationRoutes },
  { path: "/notification", route: NotificationRoutes },
  { path: "/feed", route: FeedRoutes },
  { path: "/block", route: BlockRoutes },  
  { path: "/journey", route: JourneyRoutes },
  { path: "/therapy", route: TherapyRoutes },
  { path: "/diagnosis", route: DiagnosisRoutes }, 
];


apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;