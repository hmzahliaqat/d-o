import type { User } from '@prisma/client';
import { Role } from '@prisma/client';

export const isSuperAdmin = (user: Pick<User, 'roles'>) => user.roles.includes(Role.SUPER_ADMIN);
