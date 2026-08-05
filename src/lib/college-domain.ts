import { prisma } from "./prisma";
import { Role } from "@prisma/client";

/**
 * Given an email like "priya@vjti.ac.in", extract the domain
 * and check if it matches a partner College in the DB.
 *
 * If it matches -> user gets role STUDENT and collegeId set.
 * If not        -> user gets role LEARNER (regular public user).
 *
 * This is the single place that decides "is this a college student email".
 * Onboarding a new college later = just inserting one row in `College`,
 * not touching any auth code.
 */
export async function resolveCollegeForEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase().trim();

  if (!domain) {
    return { role: Role.LEARNER as Role, collegeId: null as string | null };
  }

  const college = await prisma.college.findUnique({ where: { domain } });

  if (college && college.isVerified) {
    return { role: Role.STUDENT as Role, collegeId: college.id };
  }

  return { role: Role.LEARNER as Role, collegeId: null as string | null };
}
