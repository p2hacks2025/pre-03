import type { WorkerContext } from "../context";

export const uploadGeneratedImage = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
  imageBuffer: Buffer,
): Promise<string> => {
  const weekStr = weekStartDate.toISOString().split("T")[0];
  const timestamp = Date.now();
  const path = `weekly-worlds/${userProfileId}/${weekStr}/world_${timestamp}.png`;

  const { error } = await ctx.supabase.storage
    .from("images")
    .upload(path, imageBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload generated image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = ctx.supabase.storage.from("images").getPublicUrl(path);

  return publicUrl;
};
