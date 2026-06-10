import { db } from "@/db";
import { userTable } from "@/db/schema/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";

const fetchUser = (clerkId: string) => {
  return unstable_cache(
    async () => {
      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.clerkId, clerkId))
        .limit(1);
      return user || null;
    },
    [`user-${clerkId}`],
    {
      revalidate: 60 * 60,
    },
  )();
};

export const getAuthenticatedUser = cache(async (clerkId: string) => {
  return fetchUser(clerkId);
}); 