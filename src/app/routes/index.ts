import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ProfileRoutes } from '../modules/profile/profile.routes';
const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: '/profile', route: ProfileRoutes }
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;