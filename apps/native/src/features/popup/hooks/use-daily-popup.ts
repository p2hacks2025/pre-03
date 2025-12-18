import { useEffect, useRef } from "react";
import { usePopup } from "@/contexts/popup-context";
import { logger } from "@/lib/logger";
import { MOCK_DAILY_UPDATE_RESPONSE } from "../lib/mock-data";
import { popupStorage } from "../lib/popup-storage";
import type { DailyUpdateResponse, PopupConfig } from "../types";

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
 * API レスポンスからポップアップアイテムのリストを生成
 * ウィークリーが先、デイリーが後（優先度順）
 */
const createPopupItemsFromResponse = (
  response: DailyUpdateResponse,
): PopupConfig[] => {
  const items: PopupConfig[] = [];

  if (response.weekly) {
    items.push({
      id: `weekly-${response.date}`,
      title: response.weekly.title,
      message: response.weekly.message,
      imageUrl: response.weekly.imageUrl,
      closeButtonLabel: "確認しました",
    });
  }

  if (response.daily) {
    items.push({
      id: `daily-${response.date}`,
      title: response.daily.title,
      message: response.daily.message,
      imageUrl: response.daily.imageUrl,
      closeButtonLabel: "閉じる",
    });
  }

  return items;
};

/**
 * useDailyPopup
 * 毎日 JST 0:00 以降の初回起動時に日付更新をチェックし、
 * 更新があればポップアップを表示する
 */
export const useDailyPopup = () => {
  const { enqueue, isLoaded } = usePopup();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkAndShowPopup = async () => {
      try {
        const lastLaunchDate = await popupStorage.getLastLaunchDate();
        const response = await fetchDailyUpdate();

        logger.debug("Daily popup check", {
          responseDate: response.date,
          lastLaunchDate,
        });

        if (lastLaunchDate === response.date) {
          logger.debug("Already checked this date, skipping popup");
          return;
        }

        await popupStorage.setLastLaunchDate(response.date);

        logger.info("Daily update response", {
          date: response.date,
          status: response.status,
          hasDaily: !!response.daily,
          hasWeekly: !!response.weekly,
        });

        const popupItems = createPopupItemsFromResponse(response);
        for (const item of popupItems) {
          enqueue(item);
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
  }, [enqueue, isLoaded]);
};
