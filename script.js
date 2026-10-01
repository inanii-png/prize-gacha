
"use strict";

// ========================================
// PRIZE GACHA!!
// ゲーム風ガチャ演出・ジャケット画像・履歴保存対応
// ========================================


// ========================================
// 景品データ
// ========================================

const prizes = [
  {
    rank: "S",
    name: "君と羊と青 いなちゃんTRIBUTE",
    emoji: "🎸",
    chance: 10,
    audio: "music/song1.mp3",
    image: "images/song1.jpg",
    description: "特別な一曲！ Sランクをゲット！"
  },
  {
    rank: "A",
    name: "まらしま！",
    emoji: "🎹",
    chance: 30,
    audio: "music/song2.mp3",
    image: "images/song2.jpg",
    description: "おめでとう！ Aランクをゲット！"
  },
  {
    rank: "B",
    name: "原初刻メズ、スネタレウス",
    emoji: "🎧",
    chance: 60,
    audio: "music/song3.mp3",
    image: "images/song3.jpg",
    description: "新しい一曲を楽しもう！"
  }
];


// ========================================
// HTML要素の取得
// ========================================

const drawButton = document.getElementById("drawButton");
const capsule = document.getElementById("capsule");
const resultSection = document.getElementById("result");

const resultRarity = document.getElementById("resultRarity");
const resultEmoji = document.getElementById("resultEmoji");
const resultName = document.getElementById("resultName");
const resultDescription = document.getElementById("resultDescription");
const resultAudio = document.getElementById("resultAudio");

const resultPopup = resultSection
  ? resultSection.querySelector(".result-popup")
  : null;

const resultCover = document.getElementById("resultCover");

const closeResultButton = document.getElementById("closeResult");
const closeResultBottomButton = document.getElementById("closeResultBottom");

const resultOverlay = resultSection
  ? resultSection.querySelector(".result-overlay")
  : null;

const prizeGrid = document.getElementById("prizeGrid");
const prizeCount = document.getElementById("prizeCount");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");


// ========================================
// 設定
// ========================================

// 抽選結果を発表するまでの時間
const DRAW_ANIMATION_TIME = 1600;

// 演出用クラスをリセットするまでの時間
const EFFECT_RESET_TIME = 3000;

// 履歴の最大保存件数
const MAX_HISTORY = 10;

// ブラウザに履歴を保存するためのキー
const STORAGE_KEY = "prizeGachaHistory";


// ========================================
// 状態管理
// ========================================

let isDrawing = false;
let history = loadHistory();

let effectResetTimer = null;


// ========================================
// 履歴をブラウザから読み込む
// ========================================

function loadHistory() {
  try {
    const savedHistory = localStorage.getItem(STORAGE_KEY);

    if (!savedHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(savedHistory);

    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    return parsedHistory
      .filter((entry) => {
        return (
          entry &&
          typeof entry.name === "string" &&
          typeof entry.rank === "string" &&
          typeof entry.image === "string" &&
          typeof entry.time === "string"
        );
      })
      .slice(0, MAX_HISTORY);

  } catch (error) {
    console.warn("履歴を読み込めませんでした。", error);
    return [];
  }
}


// ========================================
// 履歴をブラウザに保存する
// ========================================

function saveHistory() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history)
    );
  } catch (error) {
    console.warn("履歴を保存できませんでした。", error);
  }
}


// ========================================
// 相対パスをURLに変換
// ========================================

function getAssetURL(path) {
  return new URL(path, document.baseURI).href;
}


// ========================================
// 景品を確率に応じて抽選
// ========================================

function drawPrize() {
  const random = Math.random() * 100;
  let total = 0;

  for (const prize of prizes) {
    total += prize.chance;

    if (random < total) {
      return prize;
    }
  }

  // 確率の合計が100未満の場合の保険
  return prizes[prizes.length - 1];
}


// ========================================
// 結果画面の演出クラスをリセット
// ========================================

function resetResultEffects() {
  if (!resultSection) {
    return;
  }

  resultSection.classList.remove(
    "card-burst",
    "screen-flash",
    "rank-S",
    "rank-A",
    "rank-B"
  );

  if (effectResetTimer !== null) {
    clearTimeout(effectResetTimer);
    effectResetTimer = null;
  }
}


// ========================================
// ガチャ結果の表示
// ========================================

function showResult(prize) {
  if (!resultSection) {
    return;
  }

  // --------------------------------------
  // 結果テキストの設定
  // --------------------------------------

  if (resultRarity) {
    resultRarity.textContent = `${prize.rank} RANK`;
    resultRarity.className = `rarity rank-${prize.rank}`;
  }

  if (resultEmoji) {
    resultEmoji.textContent = prize.emoji;
  }

  if (resultName) {
    resultName.textContent = prize.name;
  }

  if (resultDescription) {
    resultDescription.textContent = prize.description;
  }


  // --------------------------------------
  // ジャケット画像の設定
  // --------------------------------------

  const coverURL = getAssetURL(prize.image);

  if (resultCover) {
    resultCover.src = coverURL;
    resultCover.alt = `${prize.name} のジャケット`;
    resultCover.classList.remove("cover-error");
  }

  // 背景画像用のCSS変数も設定しておく。
  // 現在のキラキラ背景では使用しないが、
  // 今後の演出追加にも対応できる。
  if (resultPopup) {
    resultPopup.style.setProperty(
      "--popup-cover",
      `url("${coverURL}")`
    );
  }


  // --------------------------------------
  // 音源の切り替え
  // --------------------------------------

  if (resultAudio) {
    resultAudio.pause();
    resultAudio.removeAttribute("src");
    resultAudio.load();

    resultAudio.src = getAssetURL(prize.audio);
    resultAudio.load();
  }


  // --------------------------------------
  // 結果画面を表示
  // --------------------------------------

  resetResultEffects();

  resultSection.classList.remove("hidden");
  resultSection.setAttribute("aria-hidden", "false");

  // ランク別の演出を設定
  resultSection.classList.add(`rank-${prize.rank}`);

  // アニメーションを再スタートさせる
  void resultSection.offsetWidth;

  resultSection.classList.add(
    "card-burst",
    "screen-flash"
  );

  // アニメーション用クラスだけを後から削除する。
  // rank-S / rank-A / rank-B は残して、
  // ランク別の枠や背景を表示し続ける。
  effectResetTimer = setTimeout(() => {
    resultSection.classList.remove(
      "card-burst",
      "screen-flash"
    );

    effectResetTimer = null;
  }, EFFECT_RESET_TIME);


  // --------------------------------------
  // 獲得履歴に追加
  // --------------------------------------

  const now = new Date();

  const historyEntry = {
    name: prize.name,
    rank: prize.rank,
    emoji: prize.emoji,
    image: prize.image,
    time: now.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    date: now.toLocaleDateString("ja-JP")
  };

  history.unshift(historyEntry);

  // 履歴は最大10件
  history = history.slice(0, MAX_HISTORY);

  saveHistory();
  renderHistory();
}


// ========================================
// ガチャを回す
// ========================================

function playGacha() {
  if (isDrawing) {
    return;
  }

  if (!drawButton || !resultSection) {
    console.error("ガチャに必要なHTML要素が見つかりません。");
    return;
  }

  isDrawing = true;
  drawButton.disabled = true;

  // ボタンの表示を抽選中に変更
  const originalButtonText = drawButton.textContent;
  drawButton.textContent = "抽選中...";

  // 前回の音声を停止
  if (resultAudio) {
    resultAudio.pause();
  }

  // 前回の結果画面を閉じる
  resultSection.classList.add("hidden");
  resultSection.setAttribute("aria-hidden", "true");

  resetResultEffects();


  // --------------------------------------
  // カプセルを揺らす
  // --------------------------------------

  if (capsule) {
    capsule.classList.remove("spinning", "shaking");

    // アニメーションを再スタート
    void capsule.offsetWidth;

    capsule.classList.add("spinning", "shaking");
  }


  // --------------------------------------
  // 抽選結果を決定
  // --------------------------------------

  const prize = drawPrize();


  // --------------------------------------
  // 少し待ってから結果を発表
  // --------------------------------------

  setTimeout(() => {
    if (capsule) {
      capsule.classList.remove("spinning", "shaking");
    }

    showResult(prize);

    isDrawing = false;
    drawButton.disabled = false;
    drawButton.textContent = originalButtonText;

  }, DRAW_ANIMATION_TIME);
}


// ========================================
// 景品一覧の表示
// ========================================

function renderPrizes() {
  if (!prizeGrid) {
    return;
  }

  prizeGrid.innerHTML = "";

  if (prizeCount) {
    prizeCount.textContent = `全${prizes.length}種類`;
  }

  prizes.forEach((prize) => {
    // --------------------------------------
    // カード本体
    // --------------------------------------

    const card = document.createElement("div");
    card.className = `prize-card rank-${prize.rank}`;


    // --------------------------------------
    // ジャケット画像
    // --------------------------------------

    const cover = document.createElement("img");

    cover.className = "prize-cover";
    cover.src = getAssetURL(prize.image);
    cover.alt = `${prize.name} のジャケット`;
    cover.loading = "lazy";

    cover.addEventListener("error", () => {
      cover.alt = "ジャケット画像を読み込めませんでした";
      cover.classList.add("cover-error");

      console.error(
        "ジャケット画像を読み込めませんでした:",
        prize.image
      );
    });


    // --------------------------------------
    // ランク表示
    // --------------------------------------

    const rankLabel = document.createElement("p");

    rankLabel.className = `rarity rank-${prize.rank}`;
    rankLabel.textContent = `${prize.rank} RANK`;


    // --------------------------------------
    // 絵文字
    // --------------------------------------

    const emoji = document.createElement("div");

    emoji.className = "prize-emoji";
    emoji.textContent = prize.emoji;
    emoji.setAttribute("aria-hidden", "true");


    // --------------------------------------
    // 楽曲名
    // --------------------------------------

    const name = document.createElement("h3");

    name.textContent = prize.name;


    // --------------------------------------
    // 説明文
    // --------------------------------------

    const description = document.createElement("p");

    description.className = "prize-description";
    description.textContent = prize.description;


    // --------------------------------------
    // 当選確率
    // --------------------------------------

    const probability = document.createElement("p");

    probability.className = "prize-probability";
    probability.textContent = `当選確率 ${prize.chance}%`;


    // --------------------------------------
    // カードに追加
    // --------------------------------------

    card.appendChild(cover);
    card.appendChild(rankLabel);
    card.appendChild(emoji);
    card.appendChild(name);
    card.appendChild(description);
    card.appendChild(probability);

    prizeGrid.appendChild(card);
  });
}


// ========================================
// 獲得履歴の表示
// ========================================

function renderHistory() {
  if (!historyList) {
    return;
  }

  historyList.innerHTML = "";

  // 履歴が空の場合
  if (history.length === 0) {
    const item = document.createElement("li");

    item.textContent = "まだ楽曲を引いていません。";
    historyList.appendChild(item);

    return;
  }


  // --------------------------------------
  // 履歴を1件ずつ表示
  // --------------------------------------

  history.forEach((entry) => {
    const item = document.createElement("li");

    item.className = "history-item";


    // ジャケット画像
    const cover = document.createElement("img");

    cover.className = "history-cover";
    cover.src = getAssetURL(entry.image);
    cover.alt = "";
    cover.loading = "lazy";

    cover.addEventListener("error", () => {
      cover.style.visibility = "hidden";
    });


    // 履歴テキスト
    const text = document.createElement("span");

    text.className = "history-text";

    const dateText = entry.date
      ? `${entry.date} `
      : "";

    text.textContent =
      `${dateText}${entry.time}　` +
      `${entry.emoji || ""} ` +
      `${entry.rank} RANK：${entry.name}`;


    // 履歴に追加
    item.appendChild(cover);
    item.appendChild(text);

    historyList.appendChild(item);
  });
}


// ========================================
// 結果ポップアップを閉じる
// ========================================

function closeResult() {
  if (!resultSection) {
    return;
  }

  // 再生中の曲を停止
  if (resultAudio) {
    resultAudio.pause();
  }

  // ポップアップを非表示
  resultSection.classList.add("hidden");
  resultSection.setAttribute("aria-hidden", "true");

  // 演出クラスをリセット
  resetResultEffects();
}


// ========================================
// 履歴をリセット
// ========================================

function clearHistory() {
  history = [];

  saveHistory();
  renderHistory();
}


// ========================================
// 画像の読み込みエラー
// ========================================

if (resultCover) {
  resultCover.addEventListener("error", () => {
    resultCover.classList.add("cover-error");

    console.error(
      "結果画面のジャケット画像を読み込めませんでした。",
      resultCover.src
    );
  });

  resultCover.addEventListener("load", () => {
    resultCover.classList.remove("cover-error");
  });
}


// ========================================
// 音声読み込みエラー
// ========================================

if (resultAudio) {
  resultAudio.addEventListener("error", () => {
    if (!resultAudio.src) {
      return;
    }

    console.error(
      "音源を読み込めませんでした。",
      resultAudio.src
    );
  });
}


// ========================================
// ボタンのイベント設定
// ========================================

// ガチャボタン
if (drawButton) {
  drawButton.addEventListener("click", playGacha);
}


// 右上の「×」ボタン
if (closeResultButton) {
  closeResultButton.addEventListener("click", closeResult);
}


// ポップアップ下部の閉じるボタン
if (closeResultBottomButton) {
  closeResultBottomButton.addEventListener("click", closeResult);
}


// ポップアップの暗い背景をクリックして閉じる
if (resultOverlay) {
  resultOverlay.addEventListener("click", closeResult);
}


// 履歴のリセット
if (clearHistoryButton) {
  clearHistoryButton.addEventListener("click", clearHistory);
}


// ========================================
// キーボード操作
// Escapeキーで結果画面を閉じる
// ========================================

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (
      resultSection &&
      !resultSection.classList.contains("hidden")
    ) {
      closeResult();
    }
  }
});


// ========================================
// 初期表示
// ========================================

renderPrizes();
renderHistory();