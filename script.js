
"use strict";

// ========================================
// 景品データ
// ========================================

const prizes = [
  {
    rank: "S",
    name: "君と羊と青 いなちゃんTRIBUTE",
    emoji: "🎸",
    description: "レアな一曲！ぜひ聴いてみて！",
    probability: 10,
    audio: "music/song1.mp3"
  },
  {
    rank: "A",
    name: "まらしま！",
    emoji: "🎹",
    description: "あなたに届く特別な一曲！",
    probability: 30,
    audio: "music/song2.mp3"
  },
  {
    rank: "B",
    name: "原初刻メズ、スネタレウス",
    emoji: "🎧",
    description: "新しい音楽との出会い！",
    probability: 60,
    audio: "music/song3.mp3"
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
const closeResultButton = document.getElementById("closeResult");
const prizeGrid = document.getElementById("prizeGrid");
const prizeCount = document.getElementById("prizeCount");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

// 抽選中かどうか
let isDrawing = false;

// 獲得履歴
let history = [];

// ========================================
// 景品を確率に応じて抽選
// ========================================

function drawPrize() {
  const random = Math.random() * 100;
  let total = 0;

  for (const prize of prizes) {
    total += prize.probability;

    if (random < total) {
      return prize;
    }
  }

  // 確率の合計が100未満の場合の保険
  return prizes[prizes.length - 1];
}

// ========================================
// ガチャ結果の表示
// ========================================

function showResult(prize) {
  resultRarity.textContent = `${prize.rank} RANK`;
  resultRarity.className = `rarity rank-${prize.rank}`;

  resultEmoji.textContent = prize.emoji;
  resultName.textContent = prize.name;
  resultDescription.textContent = prize.description;

  // 前の曲を停止して、当たった曲を設定
  resultAudio.pause();
  resultAudio.removeAttribute("src");
  resultAudio.load();

  resultAudio.src = prize.audio;
  resultAudio.load();

  // 結果画面を表示
  resultSection.classList.remove("hidden");

  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  // 履歴に追加
  history.unshift({
    name: prize.name,
    rank: prize.rank,
    emoji: prize.emoji,
    time: new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  // 最大10件まで表示
  history = history.slice(0, 10);
  renderHistory();
}

// ========================================
// ガチャを回す
// ========================================

function playGacha() {
  if (isDrawing) return;

  isDrawing = true;
  drawButton.disabled = true;

  // 前回の音声を停止
  resultAudio.pause();

  // 前回の結果を閉じる
  resultSection.classList.add("hidden");

  // カプセルのアニメーション
  if (capsule) {
    capsule.classList.remove("spinning");

    // アニメーションを再スタート
    void capsule.offsetWidth;
    capsule.classList.add("spinning");
  }

  // 少し待ってから抽選結果を表示
  setTimeout(() => {
    const prize = drawPrize();

    if (capsule) {
      capsule.classList.remove("spinning");
    }

    showResult(prize);

    isDrawing = false;
    drawButton.disabled = false;
  }, 1000);
}

// ========================================
// 景品一覧の表示
// ========================================

function renderPrizes() {
  prizeGrid.innerHTML = "";

  prizeCount.textContent = `全${prizes.length}種類`;

  prizes.forEach((prize) => {
    const card = document.createElement("div");
    card.className = `prize-card rank-${prize.rank}`;

    const rankLabel = document.createElement("p");
    rankLabel.className = `rarity rank-${prize.rank}`;
    rankLabel.textContent = `${prize.rank} RANK`;

    const emoji = document.createElement("div");
    emoji.className = "prize-emoji";
    emoji.textContent = prize.emoji;

    const name = document.createElement("h3");
    name.textContent = prize.name;

    const description = document.createElement("p");
    description.className = "prize-description";
    description.textContent = prize.description;

    const probability = document.createElement("p");
    probability.className = "prize-probability";
    probability.textContent = `当選確率 ${prize.probability}%`;

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
  historyList.innerHTML = "";

  if (history.length === 0) {
    const item = document.createElement("li");
    item.textContent = "まだ楽曲を引いていません。";
    historyList.appendChild(item);
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement("li");

    item.textContent =
      `${entry.time}　${entry.emoji} ${entry.rank} RANK：${entry.name}`;

    historyList.appendChild(item);
  });
}

// ========================================
// 結果画面を閉じる
// ========================================

function closeResult() {
  resultAudio.pause();
  resultSection.classList.add("hidden");
}

// ========================================
// 履歴をリセット
// ========================================

function clearHistory() {
  history = [];
  renderHistory();
}

// ========================================
// 音声読み込みエラーの確認
// ========================================

resultAudio.addEventListener("error", () => {
  if (!resultAudio.src) return;

  console.error(
    "音源を読み込めませんでした。",
    resultAudio.src
  );
});

// ========================================
// ボタンのイベント設定
// ========================================

drawButton.addEventListener("click", playGacha);

closeResultButton.addEventListener("click", closeResult);

clearHistoryButton.addEventListener("click", clearHistory);

// ========================================
// 初期表示
// ========================================

renderPrizes();
renderHistory();