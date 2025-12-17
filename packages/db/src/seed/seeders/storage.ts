import type { SeedContext, Seeder } from "./index";

// ============================================================
// 型定義
// ============================================================

interface StorageBucket {
  id: string;
  public: boolean;
  allowedMimeTypes: string[];
  fileSizeLimit: number;
}

// ============================================================
// バケット定義
// ============================================================

const STORAGE_BUCKETS: StorageBucket[] = [
  {
    id: "avatars",
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  {
    id: "images",
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  },
];

// ============================================================
// Seeder
// ============================================================

export const storageSeeder: Seeder = {
  name: "storage",

  async seed(ctx) {
    console.log("  [storage] Setting up storage buckets...");

    for (const bucket of STORAGE_BUCKETS) {
      await createOrUpdateBucket(ctx, bucket);
    }
  },

  async reset(ctx) {
    console.log("  [storage] Resetting storage buckets...");

    for (const bucket of STORAGE_BUCKETS) {
      await resetBucketFiles(ctx, bucket.id);
    }
  },
};

// ============================================================
// バケット操作
// ============================================================

/**
 * バケットを作成、または既存なら設定を更新
 */
async function createOrUpdateBucket(
  ctx: SeedContext,
  bucket: StorageBucket,
): Promise<void> {
  const { error } = await ctx.adminSupabase.storage.createBucket(bucket.id, {
    public: bucket.public,
    allowedMimeTypes: bucket.allowedMimeTypes,
    fileSizeLimit: bucket.fileSizeLimit,
  });

  if (error) {
    if (error.message.includes("already exists")) {
      // 既存バケットの設定を更新
      const { error: updateError } =
        await ctx.adminSupabase.storage.updateBucket(bucket.id, {
          public: bucket.public,
          allowedMimeTypes: bucket.allowedMimeTypes,
          fileSizeLimit: bucket.fileSizeLimit,
        });

      if (updateError) {
        throw updateError;
      }
      console.log(`  [storage] Updated bucket "${bucket.id}"`);
    } else {
      throw error;
    }
  } else {
    console.log(`  [storage] Created bucket "${bucket.id}"`);
  }
}

/**
 * バケット内のファイルを削除（リセット用）
 */
async function resetBucketFiles(
  ctx: SeedContext,
  bucketId: string,
): Promise<void> {
  const { data: files, error } = await ctx.adminSupabase.storage
    .from(bucketId)
    .list("", { limit: 1000 });

  if (error) {
    if (error.message.includes("not found")) {
      console.log(`  [storage] Bucket "${bucketId}" not found, skipping reset`);
      return;
    }
    throw error;
  }

  if (files && files.length > 0) {
    const filePaths = files.map((f: { name: string }) => f.name);
    await ctx.adminSupabase.storage.from(bucketId).remove(filePaths);
    console.log(
      `  [storage] Removed ${filePaths.length} files from "${bucketId}"`,
    );
  } else {
    console.log(`  [storage] No files to remove from "${bucketId}"`);
  }
}
