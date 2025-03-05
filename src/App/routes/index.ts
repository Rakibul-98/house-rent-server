import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { adminRoutes } from '../modules/admin/admin.routes';
import { RequestRoutes } from '../modules/request/request.routes';
import { ListingRoutes } from '../modules/listing/listing.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/listings',
    route: ListingRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/requests',
    route: RequestRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;