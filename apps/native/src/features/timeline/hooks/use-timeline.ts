export interface TimelineItem {
  id: string;
  username: string;
  content: string;
  timeAgo: string;
  avatarUri?: string;
}

const SAMPLE_TIMELINE_DATA: TimelineItem[] = [
  {
    id: "1",
    username: "poyopoyo",
    content:
      "poyo~~~~~~~~~~~~~~~~~~~~いろはにほへとチリぬるをあああああああああああああああああああ",
    timeAgo: "経過時間",
  },
  {
    id: "2",
    username: "tanaka_taro",
    content: "今日はとても良い天気ですね。散歩に行ってきました。",
    timeAgo: "5分前",
  },
  {
    id: "3",
    username: "yamada_hanako",
    content:
      "新しいカフェに行ってきました！コーヒーがとても美味しかったです。また行きたいと思います。",
    timeAgo: "1時間前",
  },
  {
    id: "4",
    username: "sato_ichiro",
    content: "プロジェクトが無事に完了しました。チームのみんなに感謝です。",
    timeAgo: "3時間前",
  },
  {
    id: "5",
    username: "sato_ichiro",
    content: "プロジェクトが無事に完了しました。チームのみんなに感謝です。",
    timeAgo: "3時間前",
  },
  {
    id: "6",
    username: "sato_ichiro",
    content: "プロジェクトが無事に完了しました。チームのみんなに感謝です。",
    timeAgo: "3時間前",
  },
  {
    id: "7",
    username: "sato_ichiro",
    content: "プロジェクトが無事に完了しました。チームのみんなに感謝です。",
    timeAgo: "3時間前",
  },
];

/**
 * タイムラインデータを取得するカスタムフック
 *
 * 現在はサンプルデータを返しますが、将来的にAPIからデータを取得する際は
 * このフック内の実装を変更するだけで対応できます。
 *
 * @example
 * ```tsx
 * const { timelineData } = useTimeline();
 *
 * return (
 *   <View>
 *     {timelineData.map((item) => (
 *       <TimelineCard key={item.id} {...item} />
 *     ))}
 *   </View>
 * );
 * ```
 *
 * @returns タイムラインデータの配列
 *
 * @todo API統合時は以下のように実装を変更
 * ```tsx
 * const { data, isLoading, error } = useQuery({
 *   queryKey: ["timeline"],
 *   queryFn: () => client.timeline.$get(),
 * });
 * ```
 */
export const useTimeline = () => {
  // TODO: API統合時はここでAPIを呼び出す
  // 例: const { data, isLoading, error } = useQuery(...)

  return {
    timelineData: SAMPLE_TIMELINE_DATA,
    // TODO: API統合時は以下も追加
    // isLoading: false,
    // error: null,
  };
};
