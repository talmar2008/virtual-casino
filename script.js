/* Virtual Casino — demo credits only */
(() => {
  const STARTING = 100000;
  const PRESETS = [1000, 5000, 10000, 25000, 100000];
  const KEY = "virtualCasinoData";

  const GAMES = [
    { id: "roulette", name: "Roulette", type: "EUROPEAN", desc: "European wheel with 37 pockets. The ball locks to one number.", action: "PLAY ROULETTE", card: "roulette-card", icon: "◎" },
    { id: "slots", name: "Slots", type: "3 REELS", desc: "Spin three live reels and match symbols.", action: "PLAY SLOTS", card: "slots-card", icon: "▣" },
    { id: "blackjack", name: "Blackjack", type: "CARD GAME", desc: "Play a shuffled 52-card deck against the dealer.", action: "PLAY BLACKJACK", card: "blackjack-card", icon: "♠" },
    { id: "coin", name: "Coin Flip", type: "50 / 50", desc: "You vs the house bot — opposite faces of the same coin.", action: "FLIP COIN", card: "coin-card", icon: "●" },
    { id: "dice", name: "Dice", type: "1–100", desc: "A real six-sided cube tumbles, then a 1–100 result lands.", action: "PLAY DICE", card: "dice-card", icon: "⚄" },
    { id: "mines", name: "Mines", type: "5 × 5", desc: "Pick a difficulty, reveal safe tiles, cash out.", action: "PLAY MINES", card: "mines-card", icon: "✸" },
    { id: "crash", name: "Crash", type: "MULTIPLIER", desc: "Ride the multiplier and cash out before it snaps.", action: "PLAY CRASH", card: "crash-card", icon: "▲" },
    { id: "freecase", name: "Free Case", type: "FREE REWARD", desc: "Open a free virtual case on a short cooldown.", action: "OPEN FREE CASE", card: "free-case-card", icon: "◇" },
    { id: "cases", name: "Case Opening", type: "CASES", desc: "Twenty cases from 100 up to 5,000,000 credits.", action: "OPEN CASES", card: "cases-card", icon: "▣" },
    { id: "casebattle", name: "Case Battle", type: "PLAYER VS BOT", desc: "Open the same cases as the house bot. Higher total takes all.", action: "PLAY CASE BATTLE", card: "case-battle-card", icon: "⚔" },
    { id: "clicker", name: "Clicker", type: "FREE CREDITS", desc: "Click for 1 credit, 100 clicks per minute.", action: "PLAY CLICKER", card: "clicker-card", icon: "✚" },
  ];

  const RED = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const POCKET = 360 / 37;
  const SLOT_SYMS = [
    { id: "seven", label: "7", m: 25, color: "#ffd45a" },
    { id: "diamond", label: "DIA", m: 15, color: "#3ad6e6" },
    { id: "bar", label: "BAR", m: 10, color: "#f5c451" },
    { id: "bell", label: "BEL", m: 8, color: "#f5c451" },
    { id: "cherry", label: "CHR", m: 6, color: "#d32f45" },
    { id: "lemon", label: "LEM", m: 4, color: "#f0d24a" },
  ];
  const CASE_DEFS = [
    ["Bronze Case", "B", 100], ["Copper Case", "C", 250], ["Iron Case", "I", 500],
    ["Silver Case", "S", 1000], ["Gold Case", "G", 2500], ["Platinum Case", "P", 5000],
    ["Emerald Case", "E", 10000], ["Sapphire Case", "Sa", 25000], ["Ruby Case", "R", 50000],
    ["Diamond Case", "D", 100000], ["Obsidian Case", "O", 250000], ["Mythic Case", "M", 500000],
    ["Titan Case", "T", 750000], ["Imperial Case", "Im", 1000000], ["Royal Case", "Ro", 1500000],
    ["Celestial Case", "Ce", 2000000], ["Void Case", "V", 2500000], ["Eternal Case", "Et", 3000000],
    ["Omega Case", "Ω", 4000000], ["Apex Case", "A", 5000000],
  ].map(([name, icon, price]) => ({
    name, icon, price,
    rewards: [
      { name: "Nothing", amount: 0, chance: 18, rarity: "consumer" },
      { name: "Scrap", amount: Math.round(price * 0.2), chance: 22, rarity: "industrial" },
      { name: "Pack", amount: Math.round(price * 0.6), chance: 25, rarity: "milspec" },
      { name: "Full Return", amount: price, chance: 20, rarity: "restricted" },
      { name: "Double", amount: price * 2, chance: 10, rarity: "classified" },
      { name: "Jackpot", amount: price * 5, chance: 5, rarity: "covert" },
    ],
  }));
  const CS2_TILE = 128, CS2_GAP = 8, CS2_STRIDE = 136, CS2_WIN = 42, CS2_LEN = 54;
  function cs2Strip(c, winner) {
    return Array.from({ length: CS2_LEN }, (_, i) => i === CS2_WIN ? winner : c.rewards[rnd(0, c.rewards.length - 1)]);
  }
  function cs2Item(item, won) {
    return `<div class="cs2-item rarity-${item.rarity}${won ? " won" : ""}"><div class="cs2-item-art"></div><div class="cs2-item-meta"><small>${item.name.toUpperCase()}</small><strong>${item.amount ? fmt(item.amount) : "—"}</strong></div></div>`;
  }
  function cs2Ease(t) { return 1 - Math.pow(1 - t, 4.2); }
  let cs2Audio = null;
  function cs2Tick(pitch) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!cs2Audio) cs2Audio = new AC();
    if (cs2Audio.state === "suspended") cs2Audio.resume();
    const t0 = cs2Audio.currentTime;
    const o = cs2Audio.createOscillator();
    const g = cs2Audio.createGain();
    o.type = "square";
    o.frequency.value = 1400 + pitch * 900;
    g.gain.setValueAtTime(0.035, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.045);
    o.connect(g); g.connect(cs2Audio.destination);
    o.start(t0); o.stop(t0 + 0.05);
  }
  function spinCs2(view, track, duration) {
    return new Promise((resolve) => {
      const jitter = (Math.random() - 0.5) * 18;
      const target = CS2_WIN * CS2_STRIDE + CS2_TILE / 2 - view.clientWidth / 2 + jitter;
      track.style.transform = "translate3d(0,0,0)";
      const start = performance.now();
      let last = -1;
      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const x = target * cs2Ease(t);
        track.style.transform = `translate3d(${-x}px,0,0)`;
        const tile = Math.floor((x + view.clientWidth / 2) / CS2_STRIDE);
        if (tile !== last) { last = tile; cs2Tick(1 - t); }
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }
  const MINES_DIFF = [
    { id: "easy", label: "EASY", mines: 3 },
    { id: "normal", label: "NORMAL", mines: 5 },
    { id: "hard", label: "HARD", mines: 8 },
    { id: "expert", label: "EXPERT", mines: 12 },
    { id: "insane", label: "INSANE", mines: 16 },
  ];
  const FACE_ROT = {
    1: "rotateX(0deg) rotateY(0deg)",
    2: "rotateX(0deg) rotateY(-90deg)",
    3: "rotateX(-90deg) rotateY(0deg)",
    4: "rotateX(90deg) rotateY(0deg)",
    5: "rotateX(0deg) rotateY(90deg)",
    6: "rotateX(0deg) rotateY(180deg)",
  };

  const emptyStats = () => ({
    totalGames: 0, wins: 0, losses: 0, totalWagered: 0, totalWon: 0,
    netProfit: 0, biggestWin: 0, biggestLoss: 0,
  });

  let data = load();
  let busy = false;
  let currentGame = null;
  const gameState = {};

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const round2 = (n) => Math.round(n * 100) / 100;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const mod360 = (n) => ((n % 360) + 360) % 360;
  function spinTo(current, targetMod, turns, dir) {
    const cur = mod360(current);
    if (dir === 1) return current + turns * 360 + ((targetMod - cur + 360) % 360);
    return current - turns * 360 - ((cur - targetMod + 360) % 360);
  }

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (raw && typeof raw.balance === "number") {
        return { balance: raw.balance, stats: { ...emptyStats(), ...raw.stats }, history: raw.history || [] };
      }
    } catch {}
    return { balance: STARTING, stats: emptyStats(), history: [] };
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function takeBet(bet) {
    if (!Number.isFinite(bet) || bet < 1 || bet > data.balance) return false;
    data.balance -= bet;
    save();
    paintShell();
    return true;
  }
  function addWin(amount) {
    if (!Number.isFinite(amount) || amount === 0) return;
    data.balance += amount;
    save();
    paintShell();
  }
  function record(game, bet, outcome, profit) {
    const s = data.stats;
    s.totalGames += 1;
    s.totalWagered += bet;
    if (profit > 0) {
      s.wins += 1;
      s.totalWon += profit;
      if (profit > s.biggestWin) s.biggestWin = profit;
    }
    if (profit < 0) {
      s.losses += 1;
      const loss = Math.abs(profit);
      if (loss > s.biggestLoss) s.biggestLoss = loss;
    }
    s.netProfit += profit;
    data.history.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      game, bet, outcome, profit, balance: data.balance,
    });
    data.history = data.history.slice(0, 100);
    save();
    paintShell();
  }

  function setBusy(on) {
    busy = on;
    const btn = $("#closeModal");
    if (!btn) return;
    btn.disabled = on;
    btn.classList.toggle("locked", on);
    btn.setAttribute("aria-label", on ? "Finish the round before closing" : "Close game");
  }

  function parseBet(raw) {
    const n = Math.floor(Number(raw));
    if (!Number.isFinite(n) || n < 1) return "Enter a valid bet.";
    if (n > data.balance) return "Not enough credits.";
    return n;
  }

  function betArea(id = "bet") {
    return `
      <div class="bet-area">
        <label>BET AMOUNT — VIRTUAL CREDITS</label>
        <input class="bet-input" id="${id}" type="number" min="1" value="1000" />
        <div class="quick-bets">
          ${PRESETS.map((v) => `<button type="button" class="quick-bet" data-bet="${v}">${fmt(v)}</button>`).join("")}
        </div>
      </div>`;
  }
  function bindBet(root, inputId = "bet") {
    const input = $(`#${inputId}`, root);
    $$(".quick-bet", root).forEach((b) => {
      b.addEventListener("click", () => {
        input.value = b.dataset.bet;
        $$(".quick-bet", root).forEach((x) => x.classList.toggle("selected", x === b));
      });
    });
    return input;
  }
  function msg(root, text, type) {
    const el = $(".result-message", root) || Object.assign(document.createElement("div"), { className: "result-message" });
    el.className = `result-message ${type === "win" ? "result-win" : type === "loss" ? "result-loss" : type === "push" ? "result-push" : ""}`;
    el.textContent = text || "";
    if (!el.parentNode) $(".rules", root)?.before(el) || root.append(el);
  }

  function paintShell() {
    $("#navBalance").textContent = `${fmt(data.balance)} CREDITS`;
    $("#heroBalance").textContent = `${fmt(data.balance)} CREDITS`;
    $("#statBalance").textContent = fmt(data.balance);
    $("#statGames").textContent = data.stats.totalGames;
    const wr = data.stats.totalGames ? round2((data.stats.wins / data.stats.totalGames) * 100) : 0;
    $("#statWinRate").textContent = `${wr}%`;
    const net = data.stats.netProfit;
    const netEl = $("#statNet");
    netEl.textContent = `${net >= 0 ? "+" : ""}${fmt(net)}`;
    netEl.className = net > 0 ? "recent-win" : net < 0 ? "recent-loss" : "";

    $("#statisticsGrid").innerHTML = [
      ["Games Played", data.stats.totalGames],
      ["Wins", data.stats.wins],
      ["Losses", data.stats.losses],
      ["Win Rate", `${wr}%`],
      ["Total Wagered", fmt(data.stats.totalWagered)],
      ["Total Won", fmt(data.stats.totalWon)],
      ["Net Profit", `${net >= 0 ? "+" : ""}${fmt(net)}`],
      ["Biggest Win", fmt(data.stats.biggestWin)],
      ["Biggest Loss", fmt(data.stats.biggestLoss)],
    ].map(([l, v]) => `<div class="stat-box"><small>${l}</small><strong>${v}</strong></div>`).join("");

    const recent = data.history.slice(0, 5);
    $("#recentResults").innerHTML = recent.length
      ? recent.map((h) => {
          const c = h.profit > 0 ? "recent-win" : h.profit < 0 ? "recent-loss" : "";
          const t = h.profit > 0 ? `+${fmt(h.profit)}` : fmt(h.profit);
          return `<div class="recent-item"><span>${h.game} — ${h.outcome}</span><strong class="${c}">${t} CREDITS</strong></div>`;
        }).join("")
      : `<div class="empty-state">No games played yet.</div>`;

    const body = $("#historyBody");
    body.innerHTML = data.history.map((h) => {
      const c = h.profit > 0 ? "win" : h.profit < 0 ? "loss" : "push";
      const t = h.profit > 0 ? `+${fmt(h.profit)}` : fmt(h.profit);
      return `<tr><td>${h.game}</td><td>${fmt(h.bet)}</td><td>${h.outcome}</td><td class="${c}">${t}</td><td>${fmt(h.balance)}</td></tr>`;
    }).join("");
    $("#historyEmpty").style.display = data.history.length ? "none" : "block";
  }

  function buildGrid() {
    $("#gameGrid").innerHTML = GAMES.map((g) => `
      <article class="game-card ${g.card}">
        <div class="game-icon">${g.icon}</div>
        <span class="game-type">${g.type}</span>
        <h3>${g.name}</h3>
        <p>${g.desc}</p>
        <button type="button" class="game-button" data-open="${g.id}">${g.action}</button>
      </article>`).join("");
  }

  function openGame(id) {
    currentGame = id;
    const modal = $("#modal");
    const content = $("#modalContent");
    content.classList.toggle("wide", id === "casebattle" || id === "cases");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    setBusy(false);
    const ui = OPENERS[id];
    if (ui) ui($("#modalBody"));
  }
  function closeGame() {
    if (busy) return;
    $("#modal").classList.remove("active");
    document.body.style.overflow = "";
    $("#modalBody").innerHTML = "";
    currentGame = null;
  }

  /* ---------- roulette ---------- */
  function colorOf(n) {
    if (n === 0) return "Green";
    return RED.includes(n) ? "Red" : "Black";
  }
  function pocketFill(n, won) {
    if (won) return n === 0 ? "#3dd68c" : RED.includes(n) ? "#ff4d5a" : "#3a3f4c";
    if (n === 0) return "#1a7a46";
    return RED.includes(n) ? "#b11c2c" : "#12141a";
  }
  function polar(deg, r) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: 180 + r * Math.cos(rad), y: 180 + r * Math.sin(rad) };
  }
  function wedge(i) {
    const a = polar(i * POCKET, 168);
    const b = polar((i + 1) * POCKET, 168);
    const c = polar((i + 1) * POCKET, 122);
    const d = polar(i * POCKET, 122);
    return `M ${a.x} ${a.y} A 168 168 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A 122 122 0 0 0 ${d.x} ${d.y} Z`;
  }

  function openRoulette(root) {
    const st = (gameState.roulette ||= { wheel: 0, ball: 0, pick: null, num: null });
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">European Roulette</h2>
        <p class="modal-subtitle">One pocket. One number. The ball never sits the line.</p>
        ${betArea()}
        <div class="eu-wheel-wrap" id="wheelWrap">
          <div class="eu-pointer" aria-hidden><span></span></div>
          <svg viewBox="0 0 360 360" class="eu-wheel" id="wheelSvg"></svg>
          <div class="eu-result-chip tone-idle" id="chip">PLACE YOUR BET</div>
        </div>
        <div class="bet-options">
          ${[["red","RED — 1:1"],["black","BLACK — 1:1"],["odd","ODD — 1:1"],["even","EVEN — 1:1"],["low","1–18 — 1:1"],["high","19–36 — 1:1"],["number","STRAIGHT NUMBER — 35:1"]].map(([id,l]) => `<button type="button" class="bet-option" data-betid="${id}">${l}</button>`).join("")}
        </div>
        <div class="number-select" id="numSelect" style="display:none">
          ${Array.from({ length: 37 }, (_, n) => `<button type="button" class="number-button" data-n="${n}">${n}</button>`).join("")}
        </div>
        <div class="result-message"></div>
        <button type="button" class="action-button" id="spinBtn">SPIN</button>
        <div class="rules">The wheel and ball share one landing angle. After the spin the ivory ball is locked inside the winning pocket — it cannot rest on two numbers.</div>
      </div>`;
    const input = bindBet(root);
    drawWheel(null, false);
    $$(".bet-option", root).forEach((b) => b.addEventListener("click", () => {
      st.pick = b.dataset.betid;
      $$(".bet-option", root).forEach((x) => x.classList.toggle("selected", x === b));
      $("#numSelect", root).style.display = st.pick === "number" ? "grid" : "none";
    }));
    $$(".number-button", root).forEach((b) => b.addEventListener("click", () => {
      st.num = Number(b.dataset.n);
      $$(".number-button", root).forEach((x) => {
        x.classList.toggle("selected", x === b);
        x.classList.remove("landed");
      });
    }));
    $("#spinBtn", root).addEventListener("click", () => {
      if (busy) return;
      const parsed = parseBet(input.value);
      if (typeof parsed === "string") return msg(root, parsed, "loss");
      if (!st.pick) return msg(root, "Select a roulette bet.", "loss");
      if (st.pick === "number" && st.num == null) return msg(root, "Select a number.", "loss");
      if (!takeBet(parsed)) return msg(root, "Not enough credits.", "loss");

      const landed = rnd(0, 36);
      const idx = WHEEL.indexOf(landed);
      const center = (idx + 0.5) * POCKET;
      st.wheel = spinTo(st.wheel, mod360(360 - center), 6, 1);
      st.ball = spinTo(st.ball, 0, 9, -1);
      setBusy(true);
      msg(root, "", "");
      $("#spinBtn", root).disabled = true;
      $("#spinBtn", root).textContent = "BALL IN PLAY";
      $("#chip", root).textContent = "ONE POCKET…";
      $("#wheelWrap", root).classList.add("live");
      highlight(null);
      const center = $("#wheelCenter", root);
      if (center) center.textContent = "…";
      const rotor = root.querySelector(".eu-rotor");
      const flight = root.querySelector(".eu-ball-flight");
      const ease = "cubic-bezier(0.15, 0.78, 0.12, 1)";
      const trans = `transform 4600ms ${ease}`;
      if (rotor) {
        rotor.style.transition = trans;
        rotor.style.transform = `rotate(${st.wheel}deg)`;
      }
      if (flight) {
        flight.style.transition = trans;
        flight.style.transform = `rotate(${st.ball}deg)`;
      }
      setTimeout(() => {
        highlight(landed);
        $("#wheelWrap", root).classList.remove("live");
        const col = colorOf(landed);
        $("#chip", root).className = `eu-result-chip tone-${col.toLowerCase()}`;
        $("#chip", root).textContent = `${landed}  ·  ${col.toUpperCase()}`;
        $$(".number-button", root).forEach((x) => {
          x.classList.toggle("landed", Number(x.dataset.n) === landed);
          if (Number(x.dataset.n) === landed) x.classList.remove("selected");
        });
        let won = false;
        if (st.pick === "red") won = RED.includes(landed);
        if (st.pick === "black") won = landed !== 0 && !RED.includes(landed);
        if (st.pick === "odd") won = landed !== 0 && landed % 2 === 1;
        if (st.pick === "even") won = landed !== 0 && landed % 2 === 0;
        if (st.pick === "low") won = landed >= 1 && landed <= 18;
        if (st.pick === "high") won = landed >= 19 && landed <= 36;
        if (st.pick === "number") won = landed === st.num;
        const outcome = `${landed} — ${col}`;
        if (won) {
          const payout = st.pick === "number" ? parsed * 36 : parsed * 2;
          addWin(payout);
          record("Roulette", parsed, outcome, payout - parsed);
          msg(root, `YOU WON +${fmt(payout - parsed)} CREDITS`, "win");
        } else {
          record("Roulette", parsed, outcome, -parsed);
          msg(root, `YOU LOST -${fmt(parsed)} CREDITS`, "loss");
        }
        $("#spinBtn", root).disabled = false;
        $("#spinBtn", root).textContent = "SPIN";
        setBusy(false);
      }, 4600);
    });

    function highlight(result) {
      $$("[data-pocket]", root).forEach((g) => {
        const n = Number(g.dataset.pocket);
        const won = n === result;
        const path = g.querySelector("path");
        const text = g.querySelector("text");
        path.setAttribute("fill", pocketFill(n, won));
        path.setAttribute("stroke", won ? "#f5c451" : "#0b0d12");
        path.setAttribute("stroke-width", won ? "2.2" : "0.7");
        text.setAttribute("fill", won ? "#fff6d2" : "#f4f5f7");
        text.setAttribute("font-size", won ? "11" : "9");
      });
      const center = $("#wheelCenter", root);
      if (center) center.textContent = result == null ? "EURO" : result;
    }

    function drawWheel(result, spinning) {
      const stR = gameState.roulette;
      const landedIdx = result == null ? -1 : WHEEL.indexOf(result);
      const parked = !spinning && landedIdx >= 0;
      const home = parked ? polar((landedIdx + 0.5) * POCKET, 155) : null;
      const pockets = WHEEL.map((n, i) => {
        const mid = (i + 0.5) * POCKET;
        const lab = polar(mid, 145);
        const won = n === result;
        return `<g data-pocket="${n}">
          <path d="${wedge(i)}" fill="${pocketFill(n, won)}" stroke="${won ? "#f5c451" : "#0b0d12"}" stroke-width="${won ? 2.2 : 0.7}"/>
          <text x="${lab.x}" y="${lab.y}" text-anchor="middle" dominant-baseline="middle" fill="${won ? "#fff6d2" : "#f4f5f7"}" font-size="${won ? 11 : 9}" font-weight="800" transform="rotate(${mid}, ${lab.x}, ${lab.y})">${n}</text>
        </g>`;
      }).join("");
      const frets = WHEEL.map((_, i) => {
        const a = polar(i * POCKET, 168);
        const b = polar(i * POCKET, 122);
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#e6c56a" stroke-width="1.15" opacity="0.85"/>`;
      }).join("");
      const rivets = Array.from({ length: 12 }, (_, i) => {
        const p = polar(i * 30, 176);
        return `<circle cx="${p.x}" cy="${p.y}" r="3.2" fill="#5c4308" stroke="#f3d37a" stroke-width="0.6"/>`;
      }).join("");
      const ease = "cubic-bezier(0.15, 0.78, 0.12, 1)";
      const t = spinning ? `transition: transform 4600ms ${ease};` : "transition: none;";
      $("#wheelSvg").innerHTML = `
        <defs>
          <radialGradient id="rimGold" cx="50%" cy="35%" r="70%"><stop offset="0%" stop-color="#f8e19a"/><stop offset="45%" stop-color="#d4a017"/><stop offset="100%" stop-color="#7a5608"/></radialGradient>
          <radialGradient id="felt" cx="50%" cy="40%" r="70%"><stop offset="0%" stop-color="#1b6b42"/><stop offset="100%" stop-color="#0b2e1c"/></radialGradient>
          <radialGradient id="ivory" cx="32%" cy="28%" r="70%"><stop offset="0%" stop-color="#fff"/><stop offset="55%" stop-color="#e8e4d8"/><stop offset="100%" stop-color="#9a9484"/></radialGradient>
          <filter id="pocketGlow"><feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#f5c451" flood-opacity="0.9"/></filter>
        </defs>
        <circle cx="180" cy="180" r="178" fill="url(#rimGold)"/>
        ${rivets}
        <circle cx="180" cy="180" r="171" fill="#1a140c"/>
        <g class="eu-rotor" style="transform: rotate(${stR.wheel}deg); transform-origin: 180px 180px; ${t}">
          ${pockets}${frets}
          <circle cx="180" cy="180" r="120" fill="#0d1118"/>
          <circle cx="180" cy="180" r="108" fill="url(#felt)"/>
          <circle cx="180" cy="180" r="86" fill="#12161e" stroke="#c99525" stroke-width="3"/>
          <circle cx="180" cy="180" r="18" fill="url(#rimGold)"/>
          <circle cx="180" cy="180" r="8" fill="#2a2112"/>
          <text id="wheelCenter" x="180" y="224" text-anchor="middle" fill="#f5c451" font-size="13" font-weight="800">${result == null ? (spinning ? "…" : "EURO") : result}</text>
          ${parked ? `<g><circle cx="${home.x}" cy="${home.y}" r="8.2" fill="url(#ivory)"/><circle cx="${home.x - 2}" cy="${home.y - 2.4}" r="2.2" fill="#fff" opacity="0.85"/></g>` : ""}
        </g>
        ${parked ? "" : `<g class="eu-ball-flight" style="transform: rotate(${stR.ball}deg); transform-origin: 180px 180px; ${t}">
          <circle class="eu-ball" cx="180" cy="25" r="8.2" fill="url(#ivory)"/>
          <circle cx="178" cy="22.6" r="2.2" fill="#fff" opacity="0.85"/>
        </g>`}`;
    }
  }

  /* ---------- slots ---------- */
  function slotIcon(s) {
    if (s.id === "seven") return `<svg viewBox="0 0 80 80" class="slot-icon"><rect x="8" y="10" width="64" height="60" rx="10" fill="#7a1020"/><text x="40" y="58" text-anchor="middle" font-size="48" font-weight="800" fill="#ffd45a" font-family="Cinzel, serif">7</text></svg>`;
    if (s.id === "diamond") return `<svg viewBox="0 0 80 80" class="slot-icon"><polygon points="40,8 72,32 40,72 8,32" fill="#3ad6e6"/><polygon points="40,8 72,32 40,28 8,32" fill="#9af4ff"/></svg>`;
    if (s.id === "bar") return `<svg viewBox="0 0 80 80" class="slot-icon"><rect x="10" y="28" width="60" height="26" rx="4" fill="#f5c451"/><text x="40" y="48" text-anchor="middle" font-size="16" font-weight="800" fill="#1a1408">BAR</text></svg>`;
    if (s.id === "bell") return `<svg viewBox="0 0 80 80" class="slot-icon"><path d="M40 12c-12 0-20 10-20 24v16h40V36c0-14-8-24-20-24z" fill="#f5c451"/><rect x="22" y="50" width="36" height="8" rx="4" fill="#e0a83a"/><circle cx="40" cy="64" r="5" fill="#ffd875"/></svg>`;
    if (s.id === "cherry") return `<svg viewBox="0 0 80 80" class="slot-icon"><path d="M40 18c8 10 16 12 22 12" stroke="#3d7a32" stroke-width="4" fill="none"/><circle cx="28" cy="52" r="14" fill="#d32f45"/><circle cx="52" cy="56" r="13" fill="#b71c32"/></svg>`;
    return `<svg viewBox="0 0 80 80" class="slot-icon"><ellipse cx="40" cy="44" rx="22" ry="18" fill="#f0d24a"/><ellipse cx="40" cy="38" rx="16" ry="10" fill="#ffe98a"/><path d="M40 18c6 8 10 12 14 14" stroke="#6a9a32" stroke-width="4" fill="none"/></svg>`;
  }
  function openSlots(root) {
    const strip = Array.from({ length: 6 }, () => SLOT_SYMS).flat();
    const CELL = 110;
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">Virtual Slots</h2>
        <p class="modal-subtitle">Three independent reels • live strip spin</p>
        ${betArea()}
        <div class="slot-machine real" id="slotMachine">
          <div class="slot-payline"></div>
          ${[0,1,2].map((i) => `<div class="slot-window"><div class="slot-strip" id="strip${i}">${strip.map((s) => `<div class="slot-cell">${slotIcon(s)}<span>${s.label}</span></div>`).join("")}</div></div>`).join("")}
        </div>
        <div class="slot-landed" id="slotLanded"><span>7</span><span>BAR</span><span>CHR</span></div>
        <div class="payout-table"><h4>Payout Table</h4>
          ${SLOT_SYMS.map((s) => `<div class="payout-row"><span>${s.label} ${s.label} ${s.label}</span><strong>${s.m}×</strong></div>`).join("")}
          <div class="payout-row"><span>Two matching symbols</span><strong>1.5×</strong></div>
        </div>
        <div class="result-message"></div>
        <button type="button" class="action-button" id="spinBtn">SPIN</button>
        <div class="rules">Three of a kind pays the symbol multiplier. Two matching symbols pay 1.5×.</div>
      </div>`;
    const input = bindBet(root);
    $("#spinBtn", root).addEventListener("click", () => {
      if (busy) return;
      const parsed = parseBet(input.value);
      if (typeof parsed === "string") return msg(root, parsed, "loss");
      if (!takeBet(parsed)) return msg(root, "Not enough credits.", "loss");
      setBusy(true);
      msg(root, "", "");
      $("#spinBtn", root).disabled = true;
      $("#slotMachine", root).classList.add("live");
      const result = [0, 1, 2].map(() => SLOT_SYMS[rnd(0, SLOT_SYMS.length - 1)]);
      [0, 1, 2].forEach((i) => {
        const el = $(`#strip${i}`, root);
        el.classList.add("is-spinning");
        el.style.transform = "";
        el.style.animationDelay = `${i * 120}ms`;
      });
      setTimeout(() => {
        result.forEach((s, i) => {
          const idx = SLOT_SYMS.findIndex((x) => x.id === s.id);
          const el = $(`#strip${i}`, root);
          el.classList.remove("is-spinning");
          el.style.transform = `translateY(${-((3 * SLOT_SYMS.length + idx) * CELL)}px)`;
        });
        $("#slotLanded", root).innerHTML = result.map((s) => `<span>${s.label}</span>`).join("");
        let multi = 0;
        if (result[0].id === result[1].id && result[1].id === result[2].id) multi = result[0].m;
        else if (new Set(result.map((s) => s.id)).size < 3) multi = 1.5;
        const outcome = result.map((s) => s.label).join(" ");
        if (multi > 0) {
          const payout = parsed * multi;
          addWin(payout);
          record("Slots", parsed, outcome, payout - parsed);
          msg(root, `YOU WON +${fmt(payout - parsed)} CREDITS`, "win");
        } else {
          record("Slots", parsed, outcome, -parsed);
          msg(root, `YOU LOST -${fmt(parsed)} CREDITS`, "loss");
        }
        $("#spinBtn", root).disabled = false;
        $("#slotMachine", root).classList.remove("live");
        setBusy(false);
      }, 2400);
    });
  }

  /* ---------- blackjack ---------- */
  const SUITS = ["♠", "♥", "♦", "♣"];
  const VALS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  function deck() {
    const d = [];
    for (const s of SUITS) for (const v of VALS) d.push({ s, v });
    for (let i = d.length - 1; i > 0; i--) {
      const j = rnd(0, i);
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }
  function cVal(c) {
    if (c.v === "A") return 11;
    if ("KQJ".includes(c.v)) return 10;
    return Number(c.v);
  }
  function handVal(h) {
    let t = 0, a = 0;
    for (const c of h) { t += cVal(c); if (c.v === "A") a += 1; }
    while (t > 21 && a) { t -= 10; a -= 1; }
    return t;
  }
  function cardEl(c, back) {
    const red = c.s === "♥" || c.s === "♦" ? " card-red" : "";
    return `<div class="playing-card deal${red}${back ? " back" : ""}">${back ? "" : `${c.v}${c.s}`}</div>`;
  }
  function openBlackjack(root) {
    const st = { d: [], p: [], h: [], stake: 0, live: false };
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">Blackjack</h2>
        <p class="modal-subtitle">Dealer hits soft 17- and stands on 17+</p>
        ${betArea()}
        <div class="cards-area">
          <div class="card-zone"><h4>DEALER</h4><div class="cards" id="dealerCards"></div><div id="dealerVal"></div></div>
          <div class="card-zone"><h4>YOU</h4><div class="cards" id="playerCards"></div><div id="playerVal"></div></div>
        </div>
        <div class="blackjack-actions">
          <button type="button" class="action-button" id="dealBtn">DEAL</button>
          <button type="button" class="secondary-button" id="hitBtn" disabled>HIT</button>
          <button type="button" class="secondary-button" id="standBtn" disabled>STAND</button>
        </div>
        <div class="result-message"></div>
        <div class="rules">Blackjack pays 3:2. Dealer peeks the hole card after you stand. Cards are dealt one at a time.</div>
      </div>`;
    const input = bindBet(root);
    const paint = (hide) => {
      $("#dealerCards", root).innerHTML = st.h.map((c, i) => cardEl(c, hide && i === 1)).join("");
      $("#playerCards", root).innerHTML = st.p.map((c) => cardEl(c, false)).join("");
      $("#playerVal", root).textContent = st.p.length ? handVal(st.p) : "";
      $("#dealerVal", root).textContent = st.h.length ? (hide ? cVal(st.h[0]) : handVal(st.h)) : "";
    };
    async function settle(hide = false) {
      const pv = handVal(st.p), dv = handVal(st.h);
      let profit = -st.stake, text, type;
      if (pv > 21) { text = `BUST — LOST -${fmt(st.stake)}`; type = "loss"; }
      else if (dv > 21 || pv > dv) {
        const bj = st.p.length === 2 && pv === 21;
        const pay = bj ? Math.floor(st.stake * 2.5) : st.stake * 2;
        addWin(pay); profit = pay - st.stake; text = `YOU WIN +${fmt(profit)}`; type = "win";
      } else if (pv === dv) {
        addWin(st.stake); profit = 0; text = "PUSH"; type = "push";
      } else { text = `DEALER WINS — LOST -${fmt(st.stake)}`; type = "loss"; }
      record("Blackjack", st.stake, `You ${pv} vs dealer ${dv}`, profit);
      msg(root, text, type);
      st.live = false;
      setBusy(false);
      $("#dealBtn", root).disabled = false;
      $("#hitBtn", root).disabled = true;
      $("#standBtn", root).disabled = true;
      paint(false);
    }
    $("#dealBtn", root).addEventListener("click", async () => {
      if (busy) return;
      const parsed = parseBet(input.value);
      if (typeof parsed === "string") return msg(root, parsed, "loss");
      if (!takeBet(parsed)) return msg(root, "Not enough credits.", "loss");
      st.d = deck(); st.p = []; st.h = []; st.stake = parsed; st.live = true;
      setBusy(true); msg(root, "", "");
      $("#dealBtn", root).disabled = true;
      for (const who of ["p", "h", "p", "h"]) {
        st[who].push(st.d.pop());
        paint(true);
        await sleep(280);
      }
      if (handVal(st.p) === 21 || handVal(st.h) === 21) return settle(false);
      $("#hitBtn", root).disabled = false;
      $("#standBtn", root).disabled = false;
    });
    $("#hitBtn", root).addEventListener("click", async () => {
      if (!st.live) return;
      st.p.push(st.d.pop());
      paint(true);
      if (handVal(st.p) >= 21) {
        $("#hitBtn", root).disabled = true;
        $("#standBtn", root).disabled = true;
        await sleep(250);
        settle(false);
      }
    });
    $("#standBtn", root).addEventListener("click", async () => {
      if (!st.live) return;
      $("#hitBtn", root).disabled = true;
      $("#standBtn", root).disabled = true;
      paint(false);
      await sleep(280);
      while (handVal(st.h) < 17) {
        st.h.push(st.d.pop());
        paint(false);
        await sleep(320);
      }
      settle(false);
    });
  }

  /* ---------- coin ---------- */
  function openCoin(root) {
    let choice = null;
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">Coin Flip</h2>
        <p class="modal-subtitle">You vs the house bot — opposite sides of the same coin</p>
        ${betArea()}
        <div class="battle-players coin-sides">
          <div class="battle-player player" id="youSide"><div class="battle-player-name">YOU</div><div class="battle-score" id="youPick">PICK A SIDE</div></div>
          <div class="battle-vs">VS</div>
          <div class="battle-player bot" id="botSide"><div class="battle-player-name">HOUSE BOT</div><div class="battle-score" id="botPick">—</div></div>
        </div>
        <div class="coin-stage"><div class="coin-3d" id="coin"><div class="coin-face heads">H</div><div class="coin-face tails">T</div></div></div>
        <div class="choice-buttons">
          <button type="button" class="choice-button" data-side="Heads">YOU: HEADS</button>
          <button type="button" class="choice-button" data-side="Tails">YOU: TAILS</button>
        </div>
        <div class="result-message"></div>
        <button type="button" class="action-button" id="flipBtn">FLIP</button>
        <div class="rules">You take one face, the bot takes the other. A winning call returns 2× the stake.</div>
      </div>`;
    const input = bindBet(root);
    $$(".choice-button", root).forEach((b) => b.addEventListener("click", () => {
      choice = b.dataset.side;
      $$(".choice-button", root).forEach((x) => x.classList.toggle("selected", x === b));
      $("#youPick", root).textContent = choice;
      $("#botPick", root).textContent = choice === "Heads" ? "Tails" : "Heads";
    }));
    $("#flipBtn", root).addEventListener("click", () => {
      if (busy) return;
      const parsed = parseBet(input.value);
      if (typeof parsed === "string") return msg(root, parsed, "loss");
      if (!choice) return msg(root, "Choose your side.", "loss");
      if (!takeBet(parsed)) return msg(root, "Not enough credits.", "loss");
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      const bot = choice === "Heads" ? "Tails" : "Heads";
      const coin = $("#coin", root);
      setBusy(true);
      coin.classList.remove("show-tails");
      coin.classList.add("flipping");
      if (result === "Tails") coin.classList.add("show-tails");
      $("#flipBtn", root).disabled = true;
      setTimeout(() => {
        coin.classList.remove("flipping");
        coin.classList.toggle("show-tails", result === "Tails");
        const youP = $("#youSide", root);
        const botP = $("#botSide", root);
        youP.classList.remove("winner", "loser");
        botP.classList.remove("winner", "loser");
        if (result === choice) {
          addWin(parsed * 2);
          record("Coin Flip", parsed, `You ${choice} beat bot ${bot} — ${result}`, parsed);
          msg(root, `YOU WIN +${fmt(parsed)} CREDITS`, "win");
          youP.classList.add("winner"); botP.classList.add("loser");
        } else {
          record("Coin Flip", parsed, `Bot ${bot} beat you ${choice} — ${result}`, -parsed);
          msg(root, `BOT WINS — YOU LOST -${fmt(parsed)} CREDITS`, "loss");
          botP.classList.add("winner"); youP.classList.add("loser");
        }
        $("#flipBtn", root).disabled = false;
        setBusy(false);
      }, 1400);
    });
  }

  /* ---------- dice ---------- */
  function pips(n) {
    const map = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
    const on = new Set(map[n]);
    return `<div class="pip-face">${Array.from({ length: 9 }, (_, i) => `<span class="pip${on.has(i + 1) ? " on" : ""}"></span>`).join("")}</div>`;
  }
  function openDice(root) {
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">Dice</h2>
        <p class="modal-subtitle">3D die roll • random integer from 1 to 100</p>
        ${betArea()}
        <div class="dice-controls">
          <select class="bet-input" id="dir"><option value="over">OVER</option><option value="under">UNDER</option></select>
          <input class="bet-input" id="target" type="number" min="2" max="99" value="50" />
        </div>
        <div class="dice-info" id="diceInfo"></div>
        <div class="dice-stage">
          <div class="cube-scene"><div class="cube" id="cube">${[1,2,3,4,5,6].map((n) => `<div class="cube-face face-${n}">${pips(n)}</div>`).join("")}</div></div>
          <div class="dice-result" id="diceNum">?</div>
        </div>
        <div class="result-message"></div>
        <button type="button" class="action-button" id="rollBtn">ROLL</button>
        <div class="rules">The cube tumbles while a number from 1 to 100 is generated. Payout is the inverse of the win probability.</div>
      </div>`;
    const input = bindBet(root);
    const info = () => {
      const t = Math.min(99, Math.max(2, Number($("#target", root).value) || 50));
      const dir = $("#dir", root).value;
      const wins = dir === "over" ? 100 - t : t - 1;
      const p = wins / 100;
      $("#diceInfo", root).textContent = `Estimated chance: ${round2(p * 100)}% • Fair payout: approximately ${p > 0 ? round2(1 / p) : 0}×`;
      return { t, dir, p };
    };
    info();
    $("#target", root).addEventListener("input", info);
    $("#dir", root).addEventListener("change", info);
    $("#rollBtn", root).addEventListener("click", () => {
      if (busy) return;
      const { t, dir, p } = info();
      const parsed = parseBet(input.value);
      if (typeof parsed === "string") return msg(root, parsed, "loss");
      if (p <= 0) return msg(root, "Impossible roll.", "loss");
      if (!takeBet(parsed)) return msg(root, "Not enough credits.", "loss");
      const roll = rnd(1, 100);
      const face = ((roll - 1) % 6) + 1;
      setBusy(true);
      const cube = $("#cube", root);
      cube.classList.add("tumbling");
      $$(".cube-face", root).forEach((f) => f.classList.remove("lit"));
      $("#diceNum", root).textContent = "…";
      $("#rollBtn", root).disabled = true;
      setTimeout(() => {
        cube.classList.remove("tumbling");
        cube.style.transform = FACE_ROT[face];
        $(`.face-${face}`, root).classList.add("lit");
        $("#diceNum", root).textContent = roll;
        const won = dir === "over" ? roll > t : roll < t;
        const multi = 1 / p;
        if (won) {
          const payout = Math.floor(parsed * multi);
          addWin(payout);
          record("Dice", parsed, `${dir.toUpperCase()} ${t} → ${roll}`, payout - parsed);
          msg(root, `YOU WON +${fmt(payout - parsed)} CREDITS`, "win");
        } else {
          record("Dice", parsed, `${dir.toUpperCase()} ${t} → ${roll}`, -parsed);
          msg(root, `YOU LOST -${fmt(parsed)} CREDITS`, "loss");
        }
        $("#rollBtn", root).disabled = false;
        setBusy(false);
      }, 1100);
    });
  }

  /* ---------- mines ---------- */
  function mineMulti(safe, mines) {
    if (!safe) return 1;
    let m = 1;
    for (let i = 0; i < safe; i++) m *= (25 - i) / (25 - mines - i);
    return m;
  }
  function openMines(root) {
    const st = { diff: MINES_DIFF[1], mines: [], revealed: [], stake: 0, live: false, blown: false };
    const paint = () => {
      const tiles = Array.from({ length: 25 }, (_, i) => {
        const isMine = st.blown && st.mines.includes(i);
        const isSafe = st.revealed.includes(i);
        return `<button type="button" class="mine-tile${isMine ? " mine" : ""}${isSafe ? " safe" : ""}" data-i="${i}" ${!st.live || isSafe ? "disabled" : ""}>${isMine ? "✸" : isSafe ? "◆" : ""}</button>`;
      }).join("");
      $("#minesGrid", root).innerHTML = tiles;
      const multi = mineMulti(st.revealed.length, st.diff.mines);
      $("#minesInfo", root).innerHTML = `
        <div><span>MINES</span><strong>${st.diff.mines}</strong></div>
        <div><span>SAFE</span><strong>${st.revealed.length}</strong></div>
        <div><span>MULTIPLIER</span><strong>${round2(multi)}×</strong></div>
        <div><span>PAYOUT</span><strong>${fmt(Math.floor(st.stake * multi))}</strong></div>`;
      $$(".mine-tile", root).forEach((b) => b.addEventListener("click", () => reveal(Number(b.dataset.i))));
    };
    function cashout(safe) {
      if (!st.live) return;
      const amount = Math.floor(st.stake * mineMulti(safe, st.diff.mines));
      addWin(amount);
      record("Mines", st.stake, `${safe} safe • ${st.diff.mines} mines — cash out`, amount - st.stake);
      msg(root, `CASHED OUT +${fmt(amount - st.stake)} CREDITS`, "win");
      st.live = false; st.blown = true; setBusy(false);
      $("#startBtn", root).disabled = false;
      $("#cashBtn", root).disabled = true;
      paint();
    }
    function reveal(i) {
      if (!st.live || st.revealed.includes(i)) return;
      if (st.mines.includes(i)) {
        st.blown = true; st.live = false; setBusy(false);
        record("Mines", st.stake, `${st.diff.label} mine hit`, -st.stake);
        msg(root, `MINE HIT — YOU LOST -${fmt(st.stake)} CREDITS`, "loss");
        $("#startBtn", root).disabled = false;
        $("#cashBtn", root).disabled = true;
        paint();
        return;
      }
      st.revealed.push(i);
      if (st.revealed.length === 25 - st.diff.mines) cashout(st.revealed.length);
      else paint();
    }
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">Mines</h2>
        <p class="modal-subtitle">5×5 grid • choose how many mines hide in the board</p>
        ${betArea()}
        <div class="battle-rounds">${MINES_DIFF.map((d) => `<button type="button" class="battle-round${d.id === "normal" ? " selected" : ""}" data-d="${d.id}">${d.label} · ${d.mines}</button>`).join("")}</div>
        <div class="mines-info" id="minesInfo"></div>
        <div class="mines-grid" id="minesGrid"></div>
        <div class="crash-actions">
          <button type="button" class="action-button" id="startBtn">START ROUND</button>
          <button type="button" class="secondary-button" id="cashBtn" disabled>CASH OUT</button>
        </div>
        <div class="result-message"></div>
        <div class="rules">Positions are rolled at the start of the round. Cash out any time — or hit a mine and lose the stake.</div>
      </div>`;
    const input = bindBet(root);
    paint();
    $$(".battle-round", root).forEach((b) => b.addEventListener("click", () => {
      if (st.live) return;
      st.diff = MINES_DIFF.find((d) => d.id === b.dataset.d);
      $$(".battle-round", root).forEach((x) => x.classList.toggle("selected", x === b));
      paint();
    }));
    $("#startBtn", root).addEventListener("click", () => {
      if (st.live) return;
      const parsed = parseBet(input.value);
      if (typeof parsed === "string") return msg(root, parsed, "loss");
      if (!takeBet(parsed)) return msg(root, "Not enough credits.", "loss");
      const mines = [];
      while (mines.length < st.diff.mines) {
        const p = rnd(0, 24);
        if (!mines.includes(p)) mines.push(p);
      }
      st.mines = mines; st.revealed = []; st.stake = parsed; st.live = true; st.blown = false;
      setBusy(true); msg(root, "", "");
      $("#startBtn", root).disabled = true;
      $("#cashBtn", root).disabled = false;
      paint();
    });
    $("#cashBtn", root).addEventListener("click", () => cashout(st.revealed.length));
  }

  /* ---------- crash ---------- */
  function openCrash(root) {
    let live = false, crashAt = 0, multi = 1, stake = 0, raf = 0, last = 0;
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">Crash</h2>
        <p class="modal-subtitle">Cash out before the predetermined crash point</p>
        ${betArea()}
        <div class="crash-display">
          <div class="crash-multiplier" id="cm">1.00×</div>
          <div class="crash-status" id="cs">READY</div>
        </div>
        <div class="crash-actions">
          <button type="button" class="action-button" id="startBtn">START</button>
          <button type="button" class="secondary-button" id="cashBtn" disabled>CASH OUT</button>
        </div>
        <div class="result-message"></div>
        <div class="rules">The crash point is rolled before the climb. The graph rises at 0.28× per second.</div>
      </div>`;
    const input = bindBet(root);
    const cm = $("#cm", root), cs = $("#cs", root);
    function tick(ts) {
      if (!live) return;
      if (!last) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      multi = round2(multi + 0.28 * dt);
      cm.textContent = `${multi.toFixed(2)}×`;
      if (multi >= crashAt) {
        live = false; setBusy(false);
        cm.classList.add("crashed");
        cs.textContent = `CRASHED @ ${crashAt.toFixed(2)}×`;
        record("Crash", stake, `crashed ${crashAt.toFixed(2)}×`, -stake);
        msg(root, `CRASHED — YOU LOST -${fmt(stake)} CREDITS`, "loss");
        $("#startBtn", root).disabled = false;
        $("#cashBtn", root).disabled = true;
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    $("#startBtn", root).addEventListener("click", () => {
      if (live) return;
      const parsed = parseBet(input.value);
      if (typeof parsed === "string") return msg(root, parsed, "loss");
      if (!takeBet(parsed)) return msg(root, "Not enough credits.", "loss");
      stake = parsed;
      crashAt = round2(1.01 + Math.pow(Math.random(), 2) * 7.99);
      multi = 1; live = true; last = 0;
      setBusy(true); msg(root, "", "");
      cm.classList.remove("crashed");
      cm.textContent = "1.00×";
      cs.textContent = "IN FLIGHT";
      $("#startBtn", root).disabled = true;
      $("#cashBtn", root).disabled = false;
      raf = requestAnimationFrame(tick);
    });
    $("#cashBtn", root).addEventListener("click", () => {
      if (!live) return;
      live = false; cancelAnimationFrame(raf); setBusy(false);
      const payout = Math.floor(stake * multi);
      addWin(payout);
      record("Crash", stake, `cashed ${multi.toFixed(2)}× / crash ${crashAt.toFixed(2)}×`, payout - stake);
      msg(root, `CASHED OUT +${fmt(payout - stake)} CREDITS`, "win");
      cs.textContent = `CASHED @ ${multi.toFixed(2)}×`;
      $("#startBtn", root).disabled = false;
      $("#cashBtn", root).disabled = true;
    });
  }

  /* ---------- cases ---------- */
  function rollCase(c) {
    const roll = Math.random() * 100;
    let cur = 0;
    for (const r of c.rewards) { cur += r.chance; if (roll < cur) return r; }
    return c.rewards.at(-1);
  }
  function openCases(root) {
    let sel = 0, opening = false;
    const paint = () => {
      const c = CASE_DEFS[sel];
      $("#caseGrid", root).innerHTML = CASE_DEFS.map((item, i) => `
        <button type="button" class="case-card${i === sel ? " selected" : ""}" data-i="${i}">
          <div class="case-icon">${item.icon}</div>
          <h3>${item.name}</h3>
          <div class="case-price">${fmt(item.price)} CREDITS</div>
        </button>`).join("");
      $("#caseRewards", root).innerHTML = c.rewards.map((r) => `<div class="case-reward-row"><span class="cs2-chip rarity-${r.rarity}">${r.name} · ${r.chance}%</span><strong>${fmt(r.amount)}</strong></div>`).join("");
      const filler = Array.from({ length: 20 }, (_, i) => c.rewards[i % c.rewards.length]);
      $("#cTrack", root).innerHTML = filler.map((it) => cs2Item(it, false)).join("");
      $("#caseLane", root).textContent = c.name.toUpperCase();
      $$(".case-card", root).forEach((b) => b.addEventListener("click", () => { if (opening) return; sel = Number(b.dataset.i); paint(); }));
    };
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">Case Opening</h2>
        <p class="modal-subtitle">20 unique cases • CS2-style item reel</p>
        <div class="cs2-stage">
          <div class="cs2-lane team-ct">
            <div class="cs2-lane-head"><span id="caseLane">CASE</span></div>
            <div class="cs2-window" id="cView"><div class="cs2-marker" aria-hidden><i></i></div><div class="cs2-fade cs2-fade-left"></div><div class="cs2-fade cs2-fade-right"></div><div class="cs2-track" id="cTrack"></div></div>
          </div>
        </div>
        <div class="case-grid" id="caseGrid"></div>
        <div class="case-rewards" id="caseRewards"></div>
        <div class="case-result" id="caseResult">Pick a case</div>
        <div class="result-message"></div>
        <button type="button" class="action-button" id="openBtn">OPEN CASE</button>
        <div class="rules">The reward is rolled before the animation. Jackpots pay 5× the case price.</div>
      </div>`;
    paint();
    $("#openBtn", root).addEventListener("click", async () => {
      if (opening) return;
      const c = CASE_DEFS[sel];
      if (c.price > data.balance) return msg(root, "Not enough credits.", "loss");
      if (!takeBet(c.price)) return msg(root, "Not enough credits.", "loss");
      const reward = rollCase(c);
      opening = true; setBusy(true); msg(root, "", "");
      $("#openBtn", root).disabled = true;
      $("#caseResult", root).textContent = "UNBOXING…";
      const strip = cs2Strip(c, reward);
      $("#cTrack", root).innerHTML = strip.map((it) => cs2Item(it, false)).join("");
      await spinCs2($("#cView", root), $("#cTrack", root), 5200);
      const items = $$(".cs2-item", $("#cTrack", root));
      if (items[CS2_WIN]) items[CS2_WIN].classList.add("won");
      addWin(reward.amount);
      const profit = reward.amount - c.price;
      record("Cases", c.price, `${c.name} → ${reward.name}`, profit);
      $("#caseResult", root).className = `case-result ${profit > 0 ? "win" : profit < 0 ? "loss" : "push"}`;
      $("#caseResult", root).textContent = `${reward.name} · ${fmt(reward.amount)}`;
      msg(root, profit >= 0 ? `+${fmt(profit)} CREDITS` : `${fmt(profit)} CREDITS`, profit > 0 ? "win" : "loss");
      $("#openBtn", root).disabled = false;
      opening = false; setBusy(false);
    });
  }

  /* ---------- case battle ---------- */
  function openBattle(root) {
    let sel = 4, rounds = 3;
    root.innerHTML = `
      <div class="game-ui case-battle-ui cs2-battle">
        <div class="battle-header"><h2 class="modal-title">Case Battle</h2><p class="modal-subtitle">Winner takes every opened credit</p></div>
        <div class="battle-players">
          <div class="battle-player player" id="pBox"><div class="battle-player-icon">♠</div><div class="battle-player-name">YOU</div><div class="battle-score" id="pScore">0</div></div>
          <div class="battle-vs">VS</div>
          <div class="battle-player bot" id="bBox"><div class="battle-player-icon">◆</div><div class="battle-player-name">HOUSE BOT</div><div class="battle-score" id="bScore">0</div></div>
        </div>
        <div class="battle-case-grid" id="bcases"></div>
        <div class="battle-rounds">${[1,2,3,4,5].map((n) => `<button type="button" class="battle-round${n === 3 ? " selected" : ""}" data-r="${n}">${n} ROUND${n > 1 ? "S" : ""}</button>`).join("")}</div>
        <p class="modal-subtitle" id="potLine"></p>
        <div class="cs2-stage">
          <div class="cs2-lane team-ct">
            <div class="cs2-lane-head"><span>YOU</span></div>
            <div class="cs2-window" id="pView"><div class="cs2-marker" aria-hidden><i></i></div><div class="cs2-fade cs2-fade-left"></div><div class="cs2-fade cs2-fade-right"></div><div class="cs2-track" id="pTrack"></div></div>
          </div>
          <div class="cs2-lane team-t">
            <div class="cs2-lane-head"><span>HOUSE BOT</span></div>
            <div class="cs2-window" id="bView"><div class="cs2-marker" aria-hidden><i></i></div><div class="cs2-fade cs2-fade-left"></div><div class="cs2-fade cs2-fade-right"></div><div class="cs2-track" id="bTrack"></div></div>
          </div>
          <div class="cs2-landed-row" id="landedRow"></div>
        </div>
        <div class="battle-result" id="bresult"></div>
        <div class="result-message"></div>
        <button type="button" class="action-button" id="fightBtn">START BATTLE</button>
        <div class="battle-history" id="bh"></div>
        <div class="rules">Both sides open the same case each round. The higher total wins the combined unboxed credits.</div>
      </div>`;
    const paintCases = () => {
      $("#bcases", root).innerHTML = CASE_DEFS.map((c, i) => `
        <button type="button" class="battle-case${i === sel ? " selected" : ""}" data-i="${i}">
          <div class="battle-case-icon">${c.icon}</div>
          <div class="battle-case-name">${c.name}</div>
          <div class="battle-case-price">${fmt(c.price)} / round</div>
        </button>`).join("");
      $$(".battle-case", root).forEach((b) => b.addEventListener("click", () => {
        if (busy) return;
        sel = Number(b.dataset.i);
        paintCases();
        idleFill();
        pot();
      }));
      pot();
    };
    const pot = () => {
      const c = CASE_DEFS[sel];
      $("#potLine", root).textContent = `${rounds} × ${c.name} · ${fmt(c.price * rounds)} credits to enter`;
    };
    paintCases();
    const idleFill = () => {
      const c = CASE_DEFS[sel];
      const filler = Array.from({ length: 20 }, (_, i) => c.rewards[i % c.rewards.length]);
      $("#pTrack", root).innerHTML = filler.map((it) => cs2Item(it, false)).join("");
      $("#bTrack", root).innerHTML = filler.map((it) => cs2Item(it, false)).join("");
    };
    idleFill();
    $$(".battle-round", root).forEach((b) => b.addEventListener("click", () => {
      if (busy) return;
      rounds = Number(b.dataset.r);
      $$(".battle-round", root).forEach((x) => x.classList.toggle("selected", x === b));
      pot();
    }));
    $("#fightBtn", root).addEventListener("click", async () => {
      if (busy) return;
      const c = CASE_DEFS[sel];
      const cost = c.price * rounds;
      if (cost > data.balance) return msg(root, "Not enough credits.", "loss");
      if (!takeBet(cost)) return msg(root, "Not enough credits.", "loss");
      setBusy(true); msg(root, "", "");
      $("#fightBtn", root).disabled = true;
      $("#pBox", root).classList.remove("winner", "loser");
      $("#bBox", root).classList.remove("winner", "loser");
      let pTot = 0, bTot = 0;
      const hist = [];
      for (let r = 1; r <= rounds; r++) {
        const pR = rollCase(c), bR = rollCase(c);
        const pStrip = cs2Strip(c, pR);
        const bStrip = cs2Strip(c, bR);
        $("#pTrack", root).innerHTML = pStrip.map((it) => cs2Item(it, false)).join("");
        $("#bTrack", root).innerHTML = bStrip.map((it) => cs2Item(it, false)).join("");
        $("#pTrack", root).style.transform = "translate3d(0,0,0)";
        $("#bTrack", root).style.transform = "translate3d(0,0,0)";
        $("#landedRow", root).innerHTML = "";
        await Promise.all([
          spinCs2($("#pView", root), $("#pTrack", root), 5000),
          spinCs2($("#bView", root), $("#bTrack", root), 5400),
        ]);
        const pItems = $$(".cs2-item", $("#pTrack", root));
        const bItems = $$(".cs2-item", $("#bTrack", root));
        if (pItems[CS2_WIN]) pItems[CS2_WIN].classList.add("won");
        if (bItems[CS2_WIN]) bItems[CS2_WIN].classList.add("won");
        pTot += pR.amount; bTot += bR.amount;
        $("#pScore", root).textContent = fmt(pTot);
        $("#bScore", root).textContent = fmt(bTot);
        $("#landedRow", root).innerHTML =
          `<span class="cs2-chip rarity-${pR.rarity}">You · ${pR.name} · ${fmt(pR.amount)}</span>` +
          `<span class="cs2-chip rarity-${bR.rarity}">Bot · ${bR.name} · ${fmt(bR.amount)}</span>`;
        hist.push({ round: r, p: pR.amount, b: bR.amount });
        $("#bh", root).innerHTML = hist.map((h) => `<div class="battle-history-row"><span>R${h.round}</span><span>You ${fmt(h.p)}</span><span>Bot ${fmt(h.b)}</span></div>`).join("");
        await sleep(800);
      }
      const potAmt = pTot + bTot;
      let verdict, profit;
      if (pTot > bTot) {
        addWin(potAmt); profit = potAmt - cost; verdict = "win";
        msg(root, `YOU WIN THE POT +${fmt(profit)} CREDITS`, "win");
      } else if (pTot < bTot) {
        profit = -cost; verdict = "loss";
        msg(root, `BOT TAKES THE POT — LOST -${fmt(cost)} CREDITS`, "loss");
      } else {
        addWin(cost); profit = 0; verdict = "draw";
        msg(root, "DRAW — STAKE RETURNED", "push");
      }
      record("Case Battle", cost, `${c.name} ×${rounds}  ${fmt(pTot)} vs ${fmt(bTot)}`, profit);
      $("#bresult", root).className = `battle-result ${verdict}`;
      $("#bresult", root).textContent = verdict === "win" ? "YOU WIN" : verdict === "loss" ? "BOT WINS" : "DRAW";
      $("#pBox", root).classList.add(verdict === "win" ? "winner" : verdict === "loss" ? "loser" : "");
      $("#bBox", root).classList.add(verdict === "loss" ? "winner" : verdict === "win" ? "loser" : "");
      $("#fightBtn", root).disabled = false;
      setBusy(false);
    });
  }

  /* ---------- free case / clicker ---------- */
  function openFree(root) {
    const FREE = [
      { label: "Dust", amount: 5, chance: 40 },
      { label: "Coins", amount: 25, chance: 35 },
      { label: "Stack", amount: 75, chance: 18 },
      { label: "Chest", amount: 250, chance: 7 },
    ];
    const cdKey = "vcFreeCaseAt";
    const remaining = () => Math.max(0, Number(localStorage.getItem(cdKey) || 0) - Date.now());
    const paint = () => {
      const left = remaining();
      $("#freeBtn", root).disabled = left > 0;
      $("#freeBtn", root).textContent = left > 0 ? "ON COOLDOWN" : "OPEN FREE CASE";
      $("#cooldown", root).textContent = left > 0 ? `Available in ${Math.ceil(left / 1000)}s` : "Ready now";
    };
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">Free Case</h2>
        <p class="modal-subtitle">A small free virtual credit reward</p>
        <div class="free-case-box">
          <div class="free-case-icon">◇</div>
          <p class="modal-subtitle">Opens instantly. 45 second cooldown.</p>
          <button type="button" class="action-button" id="freeBtn">OPEN FREE CASE</button>
          <div class="cooldown" id="cooldown"></div>
        </div>
        <div class="case-rewards">${FREE.map((r) => `<div class="case-reward-row"><span>${r.label} · ${r.chance}%</span><strong>${fmt(r.amount)}</strong></div>`).join("")}</div>
        <div class="result-message"></div>
        <div class="rules">No wager. One open every 45 seconds.</div>
      </div>`;
    paint();
    const t = setInterval(paint, 500);
    $("#freeBtn", root).addEventListener("click", () => {
      if (remaining() > 0) return;
      const roll = Math.random() * 100;
      let cur = 0, reward = FREE.at(-1);
      for (const r of FREE) { cur += r.chance; if (roll < cur) { reward = r; break; } }
      addWin(reward.amount);
      record("Free Case", 0, reward.label, reward.amount);
      msg(root, `+${fmt(reward.amount)} CREDITS — ${reward.label}`, "win");
      localStorage.setItem(cdKey, String(Date.now() + 45000));
      paint();
    });
    root.addEventListener("remove", () => clearInterval(t));
  }
  function openClicker(root) {
    const win = 60000, cap = 100;
    let stamps = [];
    root.innerHTML = `
      <div class="game-ui">
        <h2 class="modal-title">Credit Clicker</h2>
        <p class="modal-subtitle">Earn a tiny amount of free virtual credits</p>
        <div class="clicker-score"><small>BALANCE</small><strong id="cBal">${fmt(data.balance)}</strong></div>
        <button type="button" class="clicker-button" id="cBtn">CLICK +1</button>
        <div class="clicker-limit" id="cLim"></div>
        <div class="rules">1 credit per click. 100 clicks per rolling 60-second window.</div>
      </div>`;
    const left = () => {
      const now = Date.now();
      stamps = stamps.filter((t) => now - t < win);
      return cap - stamps.length;
    };
    const paint = () => {
      $("#cBal", root).textContent = fmt(data.balance);
      $("#cLim", root).textContent = `${left()} free clicks remaining in this window`;
    };
    paint();
    $("#cBtn", root).addEventListener("click", () => {
      if (left() <= 0) return;
      stamps.push(Date.now());
      addWin(1);
      paint();
    });
  }

  const OPENERS = {
    roulette: openRoulette, slots: openSlots, blackjack: openBlackjack, coin: openCoin,
    dice: openDice, mines: openMines, crash: openCrash, cases: openCases,
    casebattle: openBattle, freecase: openFree, clicker: openClicker,
  };

  function init() {
    buildGrid();
    paintShell();
    document.addEventListener("click", (e) => {
      const open = e.target.closest("[data-open]");
      if (open) openGame(open.dataset.open);
    });
    $("#closeModal").addEventListener("click", closeGame);
    $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeGame(); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeGame(); });
    $("#resetDemo").addEventListener("click", () => {
      if (!confirm("Reset the entire demo session?\n\nThis will restore 100,000 CREDITS and clear statistics and history.")) return;
      data = { balance: STARTING, stats: emptyStats(), history: [] };
      save(); paintShell(); closeGame();
    });
    $("#clearHistory").addEventListener("click", () => {
      if (!data.history.length) return;
      if (!confirm("Clear all visible game history?")) return;
      data.history = []; save(); paintShell();
    });
  }
  init();
})();
