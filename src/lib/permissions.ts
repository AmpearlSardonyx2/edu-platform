import { Role } from "@prisma/client";

// Every capability in the platform, named explicitly.
// Add new ones here as features grow — never scatter role checks
// as raw string comparisons around the codebase.
export const PERMISSIONS = {
  VIEW_LESSON: [Role.LEARNER, Role.STUDENT, Role.INSTRUCTOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN],
  SUBMIT_QUIZ: [Role.LEARNER, Role.STUDENT, Role.INSTRUCTOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN],

  CREATE_CONTENT: [Role.INSTRUCTOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN],
  EDIT_CONTENT: [Role.INSTRUCTOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN],

  MANAGE_COLLEGE_USERS: [Role.COLLEGE_ADMIN, Role.SUPER_ADMIN],
  MANAGE_COLLEGES: [Role.SUPER_ADMIN],
  MANAGE_ALL_USERS: [Role.SUPER_ADMIN],
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export function hasPermission(role: Role | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

/** Throws-friendly helper for use inside API routes/server actions */
export function assertPermission(role: Role | undefined, permission: PermissionKey) {
  if (!hasPermission(role, permission)) {
    throw new Error(`FORBIDDEN: missing permission ${permission}`);
  }
}
