import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Marks a resolver method as restricted to the given Role names
 *  ('admin' | 'curator' | 'contributor') — enforced by RolesGuard. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
