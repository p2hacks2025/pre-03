import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePopup } from "@/contexts/popup-context";
import { createAuthenticatedClient } from "@/lib/api";
import { logger } from "@/lib/logger";
import { popupStorage } from "../lib/popup-storage";
import type { DailyUpdateResponse, PopupConfig } from "../types";

/**
 * 日付更新 API を呼び出す
 */
const fetchDailyUpdate = async (
  accessToken: string,
): Promise<DailyUpdateResponse> => {
  const client = createAuthenticatedClient(accessToken);
  const res = await client.reflection["date-update"].$get();

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
};

/**
 * ステータスに応じたポップアップのタイトルを返す
 */
const getPopupTitle = (type: "daily" | "weekly"): string => {
  return type === "weekly" ? "週間サマリー" : "今日の振り返り";
};

/**
 * ステータスに応じたポップアップのメッセージを返す
 */
const getPopupMessage = (type: "daily" | "weekly"): string => {
  return type === "weekly"
    ? "先週の日記がまとまり、新世界が完成しました。1週間でどんな出来事があったか振り返ってみましょう。"
    : "昨日の日記によって、あなたの世界が成長しました。今日も起こったことを記録してみましょう。";
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
      title: getPopupTitle("weekly"),
      message: getPopupMessage("weekly"),
      imageUrl: response.weekly.imageUrl,
      closeButtonLabel: "確認しました",
    });
  }

  if (response.daily) {
    items.push({
      id: `daily-${response.date}`,
      title: getPopupTitle("daily"),
      message: getPopupMessage("daily"),
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
  const { accessToken, isAuthenticated } = useAuth();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    logger.debug("useDailyPopup effect", {
      isLoaded,
      isAuthenticated,
      hasAccessToken: !!accessToken,
      hasChecked: hasCheckedRef.current,
    });

    if (!isLoaded || !isAuthenticated || !accessToken || hasCheckedRef.current)
      return;
    hasCheckedRef.current = true;

    const checkAndShowPopup = async () => {
      try {
        const lastLaunchDate = await popupStorage.getLastLaunchDate();
        const response = await fetchDailyUpdate(accessToken);

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
        logger.debug("Popup items to enqueue", {
          count: popupItems.length,
          ids: popupItems.map((i) => i.id),
        });

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
  }, [enqueue, isLoaded, isAuthenticated, accessToken]);
};
