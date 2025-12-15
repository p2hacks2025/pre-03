import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase auth.usersの全ユーザーを削除する
 * profilesテーブルはCASCADE削除される
 */
export const resetAuthUsers = async (
  adminSupabase: SupabaseClient,
): Promise<number> => {
  const { data, error } = await adminSupabase.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }

  let deletedCount = 0;
  for (const user of data.users) {
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
      user.id,
    );

    if (deleteError) {
      console.warn(
        `Failed to delete user ${user.email}: ${deleteError.message}`,
      );
      continue;
    }

    deletedCount++;
  }

  return deletedCount;
};
