import { useEffect, useRef } from "react";
import { usePopup } from "@/contexts/popup-context";
import { logger } from "@/lib/logger";
import { MOCK_DAILY_UPDATE_RESPONSE } from "../lib/mock-data";
import { popupStorage } from "../lib/popup-storage";
import type { DailyUpdateResponse } from "../types";

/**
 * 日本時間（JST）の今日の日付を YYYY-MM-DD 形式で取得
 */
const getJSTDateString = (): string => {
  const now = new Date();
  // UTC + 9時間 = JST
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstDate = new Date(now.getTime() + jstOffset);
  return jstDate.toISOString().split("T")[0];
};

/**
 * 日付更新 API を呼び出す（現在はモックデータを返す）
 */
const fetchDailyUpdate = async (): Promise<DailyUpdateResponse> => {
  // TODO: 実際の API 実装時に置き換え
  // const res = await client.daily.$get();
  // return res.json();
  return MOCK_DAILY_UPDATE_RESPONSE;
};

/**
 * useDailyPopup
 * 毎日 JST 0:00 以降の初回起動時に日付更新をチェックし、
 * 更新があればポップアップを表示する
 */
export const useDailyPopup = () => {
  const { enqueue } = usePopup();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // 重複実行防止
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkAndShowPopup = async () => {
      try {
        // TODO: テスト完了後に削除 - 毎回ポップアップを表示するためのリセット
        await popupStorage.clearLastLaunchDate();

        const todayJST = getJSTDateString();
        const lastLaunchDate = await popupStorage.getLastLaunchDate();

        logger.debug("Daily popup check", {
          todayJST,
          lastLaunchDate,
        });

        // 既に今日起動済みの場合はスキップ
        if (lastLaunchDate === todayJST) {
          logger.debug("Already launched today, skipping popup check");
          return;
        }

        // 今日の日付を記録
        await popupStorage.setLastLaunchDate(todayJST);

        // 日付更新情報を取得
        const response = await fetchDailyUpdate();

        logger.info("Daily update response", {
          date: response.date,
          status: response.status,
          hasDaily: !!response.daily,
          hasWeekly: !!response.weekly,
        });

        // ウィークリー更新があれば先に追加（優先度高）
        if (response.weekly) {
          enqueue({
            id: `weekly-${response.date}`,
            title: response.weekly.title,
            message: response.weekly.message,
            imageUrl: response.weekly.imageUrl,
            closeButtonLabel: "確認しました",
          });
        }

        // デイリー更新があれば追加
        if (response.daily) {
          enqueue({
            id: `daily-${response.date}`,
            title: response.daily.title,
            message: response.daily.message,
            imageUrl: response.daily.imageUrl,
            closeButtonLabel: "閉じる",
          });
        }
      } catch (error) {
        logger.error(
          "Failed to check daily update",
          {},
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    };

    checkAndShowPopup();
  }, [enqueue]);
};
