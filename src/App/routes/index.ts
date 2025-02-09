import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { ProductRoutes } from '../modules/product/product.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { adminRoutes } from '../modules/admin/admin.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;