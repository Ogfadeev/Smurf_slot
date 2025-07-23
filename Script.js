// Звуки (используем встроенные мелодии для demo)
const sounds = {
  spin: new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'),
  win: new Audio('https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg'),
  bonus: new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg'),
  button: new Audio('https://actions.google.com/sounds/v1/buttons/button_press.wav')
};
function playSound(name){
  if(sounds[name]){
    sounds[name].currentTime = 0;
    sounds[name].play();
  }
}

// Уникальные синие создания — SVG символы
const symbols = [
  { name: 'Существо 1', svg: `
    <svg width="100" height="100" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Существо 1" role="img">
      <circle cx="32" cy="32" r="30" fill="#004080"/>
      <ellipse cx="32" cy="42" rx="15" ry="10" fill="#66aaff"/>
      <circle cx="24" cy="26" r="8" fill="#0080ff"/>
      <circle cx="40" cy="26" r="8" fill="#0080ff"/>
      <circle cx="23" cy="26" r="3" fill="#fff"/>
      <circle cx="39" cy="26" r="3" fill="#fff"/>
      <path d="M20 50 Q32 60 44 50" stroke="#003366" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    multiplier: 5
  },
  { name: 'Существо 2', svg: `
    <svg width="100" height="100" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Существо 2" role="img">
      <circle cx="32" cy="32" r="30" fill="#002244"/>
      <ellipse cx="32" cy="40" rx="18" ry="12" fill="#5599ff"/>
      <ellipse cx="22" cy="25" rx="10" ry="7" fill="#0077ff"/>
      <ellipse cx="42" cy="25" rx="10" ry="7" fill="#0077ff"/>
      <circle cx="21" cy="25" r="3" fill="#d0e6ff"/>
      <circle cx="43" cy="25" r="3" fill="#d0e6ff"/>
      <path d="M20 52 Q32 58 44 52" stroke="#001122" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`,
    multiplier: 7
  },
  { name: 'Существо 3', svg: `
    <svg width="100" height="100" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Существо 3" role="img">
      <circle cx="32" cy="32" r="30" fill="#003366"/>
      <ellipse cx="32" cy="38" rx="17" ry="11" fill="#5a9fff"/>
      <circle cx="23" cy="27" r="9" fill="#0073e6"/>
      <circle cx="41" cy="27" r="9" fill="#0073e6"/>
      <circle cx="22" cy="27" r="3" fill="#cce6ff"/>
      <circle cx="40" cy="27" r="3" fill="#cce6ff"/>
      <path d="M20 49 Q32 59 44 49" stroke="#002244" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    multiplier: 10
  },
  { name: 'Бонус', svg: `
    <svg width="100" height="100" viewBox="0 0 64 64" aria-label="Бонус" role="img" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#ffcc00"/>
      <path d="M32 12 L37 27 L53 27 L40 36 L45 52 L32 42 L19 52 L24 36 L11 27 L27 27 Z" fill="#ff9900" />
    </svg>`,
    multiplier: 0
  }
];

const reels = [
  document.getElementById('reel1'),
  document.getElementById('reel2'),
  document.getElementById('reel3')
];

const balanceElem = document.getElementById('balance');
const betSelect = document.getElementById('bet-select');
const spinBtn = document.getElementById('spin-btn');
const messageElem = document.getElementById('message');

let balance = 1000;
let bet = parseInt(betSelect.value);
let freeSpins = 0;
let spinning = false;

function updateUI() {
  balanceElem.textContent = `Баланс: ${balance} монет`;
  messageElem.textContent = freeSpins > 0 ? `Фриспины: ${freeSpins}` : '';
  betSelect.disabled = spinning;
  spinBtn.disabled = spinning || (balance < bet && freeSpins === 0);
}

betSelect.addEventListener('change', () => {
  bet = parseInt(betSelect.value);
  updateUI();
  playSound('button');
});

function getRandomSymbolIndex() {
  return Math.floor(Math.random() * symbols.length);
}

function spinReels() {
  if (spinning) return;
  if (balance < bet && freeSpins === 0) {
    messageElem.textContent = 'Недостаточно средств для ставки.';
    return;
  }
  spinning = true;
  playSound('button');
  messageElem.textContent = '';
  if (freeSpins === 0) {
    balance -= bet;
  } else {
    freeSpins--;
  }
  updateUI();

  let finalIndices = [];
  for (let i = 0; i < 3; i++) {
    finalIndices.push(getRandomSymbolIndex());
  }

  // Анимация вращения с замедлением
  const spinDurations = [2200, 3000, 3700];
  reels.forEach((reel, i) => {
    reel.innerHTML = ''; // очистка
    let startTime = null;

    function animateSpin(timestamp) {
      if (!startTime) startTime = timestamp;
      let elapsed = timestamp - startTime;
      let speed = Math.max(20 - (elapsed / spinDurations[i]) * 18, 2);
      let index = Math.floor(elapsed / speed) % symbols.length;
      reel.innerHTML = symbols[index].svg;
      if (elapsed < spinDurations[i]) {
        requestAnimationFrame(animateSpin);
      } else {
        reel.innerHTML = symbols[finalIndices[i]].svg;
        if (i === reels.length - 1) {
          setTimeout(() => finishSpin(finalIndices), 400);
        }
      }
    }
    requestAnimationFrame(animateSpin);
  });
}

function finishSpin(indices) {
  const names = indices.map(i => symbols[i].name);
  const isBonus = names.filter(n => n === 'Бонус').length === 3;

  if (isBonus) {
    freeSpins += 15;
    messageElem.textContent = '🎉 Бонус! 15 фриспинов активированы! 🎉';
    playSound('bonus');
    startConfetti();
  } else if (names.every(n => n === names[0])) {
    let winAmount = bet * symbols[indices[0]].multiplier;
    balance += winAmount;
    messageElem.textContent = `🎊 Вы выиграли ${winAmount} монет! 🎊`;
    playSound('win');
    highlightWin();
    startConfetti();
  } else {
    messageElem.textContent = freeSpins > 0 ? `Фриспины: ${freeSpins}` : 'Попробуйте снова!';
  }
  updateUI();
  spinning = false;
}

function highlightWin() {
  reels.forEach(r => r.classList.add('highlight'));
  setTimeout(() => reels.forEach(r => r.classList.remove('highlight')), 2000);
}

// Конфетти на canvas
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];
const confettiCount = 150;

function initConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiPieces = [];
  for (let i = 0; i < confettiCount; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach(p => {
    ctx.beginPath();
    ctx.lineWidth = p.r / 2;
    ctx.strokeStyle = p.color;
    ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
    ctx.stroke();
  });
  updateConfetti();
}

function updateConfetti() {
  confettiPieces.forEach(p => {
    p.tiltAngle += p.tiltAngleIncrement;
    p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
    p.x += Math.sin(p.d);
    p.tilt = Math.sin(p.tiltAngle) * 15;

    if (p.y > confettiCanvas.height) {
      p.x = Math.random() * confettiCanvas.width;
      p.y = -20;
      p.tilt = Math.random() * 10 - 10;
    }
  });
}

let confettiActive = false;
function startConfetti() {
  if (confettiActive) return;
  confettiActive = true;
  initConfetti();
  function run() {
    if (!confettiActive) {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      return;
    }
    drawConfetti();
    requestAnimationFrame(run);
  }
  run();
  setTimeout(() => { confettiActive = false; }, 4000);
}

spinBtn.addEventListener('click', spinReels);

window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

updateUI();