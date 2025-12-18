import './style.css';
import { GameState } from './gameState.js';
import { UPGRADES } from './constants.js';

// Init Game
const game = new GameState();

// DOM Elements
const ui = {
  healthVal: document.getElementById('health-val'),
  healthBar: document.getElementById('health-bar'),
  energyVal: document.getElementById('energy-val'),
  energyBar: document.getElementById('energy-bar'),
  strengthVal: document.getElementById('strength-val'),
  recoveryVal: document.getElementById('recovery-val'),
  levelVal: document.getElementById('level-val'),
  bossContainer: document.getElementById('boss-container'),
  bossEmoji: document.getElementById('boss-emoji'),
  bossHpBar: document.getElementById('boss-hp-bar'),
  bossHpText: document.getElementById('boss-hp-text'),
  currencyVal: document.getElementById('currency-val'),
  upgradesGrid: document.getElementById('upgrades-grid'),
};

// Render Upgrades
function renderUpgrades() {
  ui.upgradesGrid.innerHTML = '';
  UPGRADES.forEach(upgrade => {
    const btn = document.createElement('button');
    btn.className = 'upgrade-btn';
    btn.id = `btn-${upgrade.id}`;
    
    // Initial cost render
    const cost = game.getUpgradeCost(upgrade.id);
    
    btn.innerHTML = `
      <div class="upgrade-icon">${upgrade.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${upgrade.name}</div>
        <div class="upgrade-cost">💰 ${cost}</div>
        <div style="font-size: 0.7rem; color: #aaa;">${upgrade.description}</div>
      </div>
    `;

    btn.onclick = () => {
      if (game.buyUpgrade(upgrade.id)) {
        createFloatingText(btn, "UPGRADED!", "#7bed9f");
        updateUI(); // Immediate update
        renderUpgrades(); // Re-render to update costs
      } else {
         btn.animate([
           { transform: 'translateX(0)' },
           { transform: 'translateX(-5px)' },
           { transform: 'translateX(5px)' },
           { transform: 'translateX(0)' }
         ], { duration: 200 });
      }
    };
    
    ui.upgradesGrid.appendChild(btn);
  });
}

// Floating Text Logic
function createFloatingText(target, text, color = '#fff') {
  const rect = target.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'damage-number';
  el.textContent = text;
  el.style.color = color;
  
  // Random offset for visual variety
  const randomX = (Math.random() - 0.5) * 40;
  
  el.style.left = `${rect.left + rect.width / 2 + randomX}px`;
  el.style.top = `${rect.top}px`;
  
  document.body.appendChild(el);
  
  // Cleanup
  el.addEventListener('animationend', () => el.remove());
}

// Boss Click Handler
ui.bossEmoji.addEventListener('mousedown', (e) => {
  const result = game.clickBoss();
  
  if (result.damage > 0) {
    createFloatingText(ui.bossEmoji, `-${result.damage}`, '#ff4757');
    ui.bossEmoji.classList.remove('hit');
    void ui.bossEmoji.offsetWidth; // Trigger reflow
    ui.bossEmoji.classList.add('hit');
    
    if (result.killed) {
      ui.bossEmoji.classList.add('dead');
      setTimeout(() => {
        ui.bossEmoji.classList.remove('dead');
        updateUI(); // Refresh emoji for new level
      }, 500);
    }
  } else if (result.reason === 'no_energy') {
    createFloatingText(ui.bossEmoji, "NO ENERGY!", "#eccc68");
  }
});

// Main Loop
let lastTime = 0;
function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Logic Tick
  game.tick(deltaTime);

  // Render Tick
  updateUI();

  requestAnimationFrame(loop);
}

function updateUI() {
  // Stats
  ui.healthVal.textContent = Math.floor(game.player.health);
  ui.healthBar.style.width = `${(game.player.health / game.player.maxHealth) * 100}%`;
  
  ui.energyVal.textContent = Math.floor(game.player.energy);
  ui.energyBar.style.width = `${(game.player.energy / game.player.maxEnergy) * 100}%`;
  
  ui.strengthVal.textContent = game.player.strength;
  ui.recoveryVal.textContent = game.player.recovery;
  ui.currencyVal.textContent = game.player.currency;

  // Boss
  ui.levelVal.textContent = game.boss.level;
  ui.bossEmoji.textContent = game.boss.emoji;
  ui.bossHpText.textContent = game.boss.currentHp;
  ui.bossHpBar.style.width = `${(game.boss.currentHp / game.boss.maxHp) * 100}%`;

  // Upgrades Enable/Disable State
  UPGRADES.forEach(u => {
    const btn = document.getElementById(`btn-${u.id}`);
    if (btn) {
      const cost = game.getUpgradeCost(u.id);
      btn.disabled = game.player.currency < cost;
      // Update cost text dynamically if needed, but we re-render on buy so it's fine
    }
  });
}

// Start
renderUpgrades();
requestAnimationFrame(loop);
