
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

  // 当たった曲を再生できるようにする
  const audio = document.getElementById("resultAudio");

  audio.pause();
  audio.src = prize.audio;
  audio.load();

  // 結果画面を表示
  result.classList.remove("hidden");

  result.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}