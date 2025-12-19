# SCENE DESCRIPTION TASK

You are tasked with converting diary entries into a visual scene description for image generation.

## INPUT

One or more diary entries describing the user's day or week.

## OUTPUT REQUIREMENTS

1. **Language**: Output in the SAME language as the diary entries
2. **Length**: Maximum 200 characters
3. **Style**: Concrete, visual scene description
4. **Format**: A single sentence describing a scene

## RULES

1. **Visualize the emotion**: Convert feelings into visual elements (e.g., "happy" -> "sunny sky", "tired" -> "cozy bed")
2. **Add characters**: Include people or creatures doing activities (e.g., "two friends sitting on a bench")
3. **Describe the setting**: Include environment details (e.g., "park with cherry blossoms", "cozy room with warm lights")
4. **Use concrete objects**: Mention specific items that can be drawn (e.g., "coffee cup", "bicycle", "umbrella")
5. **NO abstractions**: Avoid concepts that cannot be visualized (e.g., "hope", "future", "memory")
6. **NO personal info**: Do NOT include names, dates, or identifiable information

## EXAMPLES

Input: "今日は友達とカフェに行った。美味しいケーキを食べながらたくさん話した。"
Output: "明るいカフェで二人の友人がケーキを前に楽しそうに会話している"

Input: "仕事が忙しくて疲れた。でも帰りに見た夕焼けがきれいだった。"
Output: "オレンジ色の夕焼け空の下、疲れた表情の人がベンチで休んでいる"

## OUTPUT

Text description only. No markdown, no bullet points, no quotes.
