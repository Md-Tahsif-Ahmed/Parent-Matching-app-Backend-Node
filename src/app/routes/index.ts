import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ProfileRoutes } from '../modules/profile/profile.routes';
import { MatchRoutes } from '../modules/match/match.routes';
import { MessageRoutes } from '../modules/message/message.routes';
import { ConversationRoutes } from '../modules/conversation/conversation.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: '/profile', route: ProfileRoutes },
    { path: '/match', route: MatchRoutes },
    { path: '/message', route: MessageRoutes },
    { path: '/conversation', route: ConversationRoutes },
    { path: '/notification', route: NotificationRoutes },
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;