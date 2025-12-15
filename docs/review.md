# レビュー基準とその対応について

## はじめに

レビュー方針について記載します。<br />
レビューアはこの基準に従ってレビューを行い、PR作成者は指摘に基づいて修正を行います。

## BADGES

指摘内容や対応方針に応じて、以下のバッジが使用されます

| バッジ | 説明 | 見た目 | 対応方針
|--------|------|--------|----------------|
| must | 必須の修正項目 | ![must-badge](https://img.shields.io/badge/review-must-critical.svg) | 必ず対応してください。 |
| want | 推奨される修正項目 | ![want-badge](https://img.shields.io/badge/review-want-blue) | 可能な限り対応してください。 |
| nits | 軽微な指摘 | ![nits-badge](https://img.shields.io/badge/review-nits-orange.svg) | 必須ではありませんが、対応するとより良くなります。 |
| typo | タイポ・軽微な表現修正 | ![typo-badge](https://img.shields.io/badge/review-typo-orange.svg) | 可能な限り対応してください。 |
| ask | 質問・確認事項 | ![ask-badge](https://img.shields.io/badge/review-ask-yellow.svg) | 必要に応じて回答してください。 |
| imo | 個人的な意見・提案 | ![imo-badge](https://img.shields.io/badge/review-imo-green.svg) | 必須ではありませんが、参考にしてください。 |
| good | 良い点の指摘 | ![good-badge](https://img.shields.io/badge/review-good-success.svg) | 受け取ってください。 |
| memo | メモ・補足情報 | ![memo-badge](https://img.shields.io/badge/review-memo-lightgrey) | 参考情報として受け取ってください。 |

## レビューの優先順位

ハッカソンでは時間が限られるため、以下の優先順位でレビューを行います

1. **最優先**: 動作するか、クラッシュしないか
2. **高**: セキュリティ上の問題（認証漏れ、SQLインジェクション等）
3. **中**: チームメンバーが理解できるコードか
4. **低**: コードスタイル、命名規則

## スコープ外

以下はハッカソン期間中のレビュー対象外とします

- 細かいコードスタイル（Biomeで自動修正されないもの）
- パフォーマンス最適化
- テスト
- 完璧なエラーハンドリング

## マージ基準

- Approved をもらったらマージ可能
