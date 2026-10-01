
const prizes = [
  {
    rank: "S",
    name: "プレミアム賞",
    emoji: "🎮",
    description: "特別なプレミアム景品！",
    probability: 1
  },
  {
    rank: "A",
    name: "豪華グッズ賞",
    emoji: "🎧",
    description: "うれしい豪華グッズ！",
    probability: 9
  },
  {
    rank: "B",
    name: "人気アイテム賞",
    emoji: "⌚",
    description: "毎日使える人気アイテム！",
    probability: 20
  },
  {
    rank: "C",
    name: "雑貨賞",
    emoji: "🎒",
    description: "ちょっとうれしい雑貨！",
    probability: 30
  },
  {
    rank: "D",
    name: "参加賞",
    emoji: "🎁",
    description: "気軽に楽しめる参加賞！",
    probability: 40
  }
];

const drawButton = document.getElementById("drawButton");
const capsule = document.getElementById("capsule");
const result = document.getElementById("result");
const prizeGrid = document.getElementById("prizeGrid");
const historyList = document.getElementById("historyList");

let history = [];

try {
  const saved = JSON.parse(
    localStorage.getItem("gachaHistory") || "[]"
  );
  if (Array.isArray(saved)) {
    history = saved.filter(item =>
      item &&
      typeof item.name === "string" &&
      typeof item.rank === "string"
    ).slice(0, 10);
  }
} catch {
  history = [];
}

// 景品一覧を表示
function renderPrizes() {
  prizeGrid.innerHTML = "";

  prizes.forEach(prize => {
    const card = document.createElement("div");
    card.className = "prize-card";

    const rank = document.createElement("div");
    rank.className = `prize-rank rank-${prize.rank}`;
    rank.textContent = `${prize.rank} RANK`;

    const emoji = document.createElement("div");
    emoji.className = "prize-emoji";
    emoji.textContent = prize.emoji;

    const name = document.createElement("div");
    name.className = "prize-name";
    name.textContent = prize.name;

    const probability = document.createElement("div");
    probability.className = "probability";
    probability.textContent = `当選確率 ${prize.probability}%`;

    card.append(rank, emoji, name, probability);
    prizeGrid.appendChild(card);
  });
}

// 確率に応じて景品を抽選
function drawPrize() {
  const total = prizes.reduce(
    (sum, prize) => sum + prize.probability, 0
  );

  let random = Math.random() * total;

  for (const prize of prizes) {
    random -= prize.probability;
    if (random < 0) return prize;
  }

  return prizes[prizes.length - 1];
}

// 結果表示
function showResult(prize) {
  document.getElementById("resultRarity").textContent =
    `${prize.rank} RANK`;

  document.getElementById("resultRarity").className =
    `rarity rank-${prize.rank}`;

  document.getElementById("resultEmoji").textContent =
    prize.emoji;

  document.getElementById("resultName").textContent =
    prize.name;

  document.getElementById("resultDescription").textContent =
    prize.description;

  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "center" });
}

// 履歴を保存して表示
function renderHistory() {
  historyList.replaceChildren();

  if (history.length === 0) {
    const li = document.createElement("li");
    li.textContent = "まだ景品を引いていません。";
    historyList.appendChild(li);
    return;
  }

  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.emoji} ${item.rank}賞：${item.name}`;
    historyList.appendChild(li);
  });
}

// ガチャを回す
drawButton.addEventListener("click", () => {
  if (drawButton.disabled) return;

  drawButton.disabled = true;
  result.classList.add("hidden");
  capsule.classList.add("spinning");

  const prize = drawPrize();

  setTimeout(() => {
    capsule.classList.remove("spinning");
    capsule.style.background =
      prize.rank === "S" ? "#ffd477" :
      prize.rank === "A" ? "#ff8ecb" :
      prize.rank === "B" ? "#a98bff" :
      prize.rank === "C" ? "#7dcaff" : "#c0c0d4";

    history.unshift({
      rank: prize.rank,
      name: prize.name,
      emoji: prize.emoji
    });

    history = history.slice(0, 10);

    try {
      localStorage.setItem(
        "gachaHistory",
        JSON.stringify(history)
      );
    } catch {
      // 保存できなくてもガチャ自体は動作する
    }

    renderHistory();
    showResult(prize);
    drawButton.disabled = false;
  }, 1600);
});

// 結果を閉じる
document.getElementById("closeResult").addEventListener("click", () => {
  result.classList.add("hidden");
});

// 履歴リセット
document.getElementById("clearHistory").addEventListener("click", () => {
  history = [];

  try {
    localStorage.removeItem("gachaHistory");
  } catch {
    // 保存領域にアクセスできない場合も画面は更新
  }

  renderHistory();
});

renderPrizes();
renderHistory();