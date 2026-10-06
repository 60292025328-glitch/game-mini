/**
 * AI処理のモック実装
 *
 * 本番環境では以下のように OpenAI API に置き換え可能:
 *
 * import OpenAI from "openai";
 * const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *
 * async function callOpenAI(prompt: string): Promise<string> {
 *   const response = await openai.chat.completions.create({
 *     model: "gpt-4o",
 *     messages: [{ role: "user", content: prompt }],
 *   });
 *   return response.choices[0].message.content ?? "";
 * }
 */

import type { AiOrganizeResult } from "@/types";

// モックの遅延（APIコール感を演出）
const mockDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ランダムにサンプルデータを選ぶユーティリティ
const sample = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * ノート本文からタイトル・要約・タグを自動生成する
 * （本番: OpenAI / Anthropic / Gemini API に置き換える）
 */
export async function organizeNote(content: string): Promise<AiOrganizeResult> {
  await mockDelay(1200 + Math.random() * 800);

  if (!content.trim()) {
    return {
      title: "無題のノート",
      summary: "内容がありません。",
      tags: ["未分類"],
    };
  }

  // ----- モックロジック -----
  // 実際のAPIでは content をプロンプトとして送信する

  const firstLine = content.split("\n")[0].replace(/^#+\s*/, "").trim();
  const title =
    firstLine.length > 0
      ? firstLine.slice(0, 40) + (firstLine.length > 40 ? "…" : "")
      : sample([
          "アイデアメモ",
          "思考の整理",
          "ブレインダンプ",
          "気づきのノート",
          "タスク整理",
        ]);

  const summaries = [
    "複数のアイデアと課題点を整理したメモ。次のアクションが明確化されている。",
    "日常の観察から得たインサイトを記録。後で深掘りする価値がある。",
    "プロジェクトの進捗と懸念点をリストアップ。優先度の再検討が必要。",
    "学習内容の要点をまとめたノート。参考リンクや実践例が含まれる。",
    "ブレインストーミングの結果。有望なアイデアがいくつか含まれている。",
    "会議や対話から得た重要ポイントをキャプチャ。フォローアップが必要。",
  ];

  const tagPool = [
    ["アイデア", "思考", "ブレスト", "創造性"],
    ["タスク", "TODO", "行動計画", "生産性"],
    ["学習", "メモ", "知識", "インサイト"],
    ["プロジェクト", "進捗", "レビュー", "計画"],
    ["日記", "振り返り", "気づき", "成長"],
    ["技術", "開発", "コード", "エンジニアリング"],
    ["読書", "要約", "書評", "推薦"],
    ["アイデア", "戦略", "マーケティング", "ビジネス"],
  ];

  const chosenTagSet = sample(tagPool);
  const tagCount = 3 + Math.floor(Math.random() * 3); // 3〜5個
  const tags = chosenTagSet.slice(0, tagCount);

  return {
    title,
    summary: sample(summaries),
    tags,
  };
}

/**
 * ノートに関するチャット応答を生成する
 * （本番: RAG + OpenAI API に置き換える）
 */
export async function chatWithNote(
  noteContent: string,
  userMessage: string,
  _history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  await mockDelay(800 + Math.random() * 1200);

  const msg = userMessage.toLowerCase();

  // ----- モックロジック：質問の意図に応じた回答 -----

  if (msg.includes("要点") || msg.includes("ポイント") || msg.includes("まとめ")) {
    return `このメモの主な要点は以下の3点です：

1. **核心的なテーマ** — メモ全体を通じて一貫して言及されている中心的な概念や問題があります。
2. **具体的なアクション** — 記述の中にいくつかの実行可能なステップや判断ポイントが含まれています。
3. **未解決の疑問** — まだ結論が出ていない、あるいは追加調査が必要な事柄が残されています。

※ 本番環境では、ノートの実際の内容に基づいて詳細な分析を行います。`;
  }

  if (msg.includes("アクション") || msg.includes("タスク") || msg.includes("todo")) {
    return `このメモから抽出できる**アクションアイテム**：

- [ ] 主要なアイデアについてさらに詳しく調査する
- [ ] 関係者と共有して意見を収集する
- [ ] 優先度を整理して実行計画を立てる
- [ ] 期限を設けて進捗を管理する

上記は内容のパターンから推測した候補です。実際のノートに合わせてご確認ください。`;
  }

  if (msg.includes("要約") || msg.includes("概要") || msg.includes("サマリー")) {
    return `**概要：**

このノートは複数のアイデアや観察事項を記録したものです。主に情報収集・整理フェーズの内容が中心で、具体的な実行計画への移行が次のステップと考えられます。

全体のトーンとして、問題提起と解決策の模索が混在しており、さらに深堀りする価値のある素材が含まれています。`;
  }

  if (msg.includes("質問") || msg.includes("わから") || msg.includes("教えて")) {
    return `ご質問ありがとうございます。このノートの内容に関連して考えられる観点をいくつかご紹介します：

- このアイデアの実現可能性はどのくらいですか？
- 類似した事例や先行研究はありますか？
- このメモを誰かと共有する場合、何を補足すると伝わりやすくなりますか？

具体的な質問があればさらに掘り下げてお答えできます（本番環境では実際のAI応答が返ります）。`;
  }

  if (msg.includes("改善") || msg.includes("リライト") || msg.includes("書き直し")) {
    return `このメモをより良くするための改善提案：

1. **構造化** — 見出しや箇条書きを使って、情報の階層を明確にする
2. **具体化** — 抽象的な表現を具体的な例や数値で補足する
3. **結論の明示** — 各セクションの終わりに結論や次のステップを記載する
4. **関連リンク** — 参考になる資料や関連ノートへのリンクを追加する`;
  }

  // デフォルト応答
  const defaultResponses = [
    `「${userMessage}」についてですが、このノートの文脈から考えると、いくつかの視点から検討できます。\n\nまず内容全体を整理すると、主要なテーマが浮かび上がってきます。それに対してあなたが感じている疑問や課題を、さらに細分化してみると答えが見つかりやすくなるかもしれません。\n\n（本番環境では、実際のノート内容に基づいた具体的な回答が生成されます）`,
    `ご質問の「${userMessage}」に関して、このメモをベースに考えてみます。\n\nノートには複数の関連する要素が含まれており、それらを組み合わせることで新たな洞察が得られそうです。特に核心的なアイデアの部分が出発点になるでしょう。\n\n詳しく知りたい点があれば、具体的に質問してください。`,
  ];

  return sample(defaultResponses);
}
