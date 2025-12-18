import { publishDueAiPosts, type WorkerContext } from "@/lib";

export type AiPostPublishJobResult = {
  success: boolean;
  publishedCount: number;
};

export const aiPostPublish = async (
  ctx: WorkerContext,
): Promise<AiPostPublishJobResult> => {
  ctx.logger.info("Starting ai-post-publish job");

  try {
    const publishedIds = await publishDueAiPosts(ctx);
    ctx.logger.info("ai-post-publish job completed", {
      publishedCount: publishedIds.length,
    });
    return { success: true, publishedCount: publishedIds.length };
  } catch (error) {
    ctx.logger.error("ai-post-publish job failed", {}, error as Error);
    return { success: false, publishedCount: 0 };
  }
};
