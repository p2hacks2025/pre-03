"use client";

type TabType = "diary" | "timeline";

interface DetailTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * 日記/住人の様子タブ切り替えコンポーネント
 * タブ下線のスライドアニメーション付き
 */
export const DetailTabs = ({ activeTab, onTabChange }: DetailTabsProps) => {
  return (
    <div className="relative">
      {/* タブボタン */}
      <div className="flex">
        <button
          type="button"
          className="flex-1 border-white border-b-2 py-3 text-center"
          onClick={() => onTabChange("diary")}
        >
          <span
            className={`font-bold text-xl transition-colors ${
              activeTab === "diary" ? "text-[#DF6800]" : "text-white"
            }`}
          >
            日記
          </span>
        </button>
        <button
          type="button"
          className="flex-1 border-white border-b-2 py-3 text-center"
          onClick={() => onTabChange("timeline")}
        >
          <span
            className={`font-bold text-xl transition-colors ${
              activeTab === "timeline" ? "text-[#DF6800]" : "text-white"
            }`}
          >
            住人の様子
          </span>
        </button>
      </div>

      {/* アニメーションする下線 */}
      <div
        className="absolute bottom-0 h-0.5 w-1/2 bg-[#DF6800] transition-transform duration-200"
        style={{
          transform: `translateX(${activeTab === "diary" ? "0%" : "100%"})`,
        }}
      />
    </div>
  );
};

export type { TabType };
