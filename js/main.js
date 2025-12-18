const game = new GameState();

const ui = {
  healthVal: document.getElementById('health-val'),
  healthBar: document.getElementById('health-bar'),
  energyVal: document.getElementById('energy-val'),
  energyBar: document.getElementById('energy-bar'),
  strengthVal: document.getElementById('strength-val'),
  recoveryVal: document.getElementById('recovery-val'),
  levelVal: document.getElementById('level-val'),
  bossEmoji: document.getElementById('boss-emoji'),
  bossHpBar: document.getElementById('boss-hp-bar'),
  bossHpText: document.getElementById('boss-hp-text'),
  currencyVal: document.getElementById('currency-val'),
  upgradesGrid: document.getElementById('upgrades-grid'),
};

const renderUpgrades = () => {
  ui.upgradesGrid.innerHTML = '';
  UPGRADES.forEach(upgrade => {
    const btn = document.createElement('button');
    btn.className = 'upgrade-btn';
    btn.id = `btn-${upgrade.id}`;
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
        updateUI();
        renderUpgrades();
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
};

const createFloatingText = (target, text, color = '#fff') => {
  const rect = target.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'damage-number';
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 40}px`;
  el.style.top = `${rect.top}px`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
};

ui.bossEmoji.addEventListener('mousedown', () => {
  const result = game.clickBoss();
  
  if (result.damage > 0) {
    createFloatingText(ui.bossEmoji, `-${result.damage}`, '#ff4757');
    ui.bossEmoji.classList.remove('hit');
    void ui.bossEmoji.offsetWidth;
    ui.bossEmoji.classList.add('hit');
    
    if (result.killed) {
      ui.bossEmoji.classList.add('dead');
      setTimeout(() => {
        ui.bossEmoji.classList.remove('dead');
        updateUI();
      }, 500);
    }
  } else if (result.reason === 'no_energy') {
    createFloatingText(ui.bossEmoji, "NO ENERGY!", "#eccc68");
  }
});

let lastTime = 0;
const loop = (timestamp) => {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  game.tick(deltaTime);
  updateUI();
  requestAnimationFrame(loop);
};

const updateUI = () => {
  ui.healthVal.textContent = Math.floor(game.player.health);
  ui.healthBar.style.width = `${(game.player.health / game.player.maxHealth) * 100}%`;
  
  ui.energyVal.textContent = Math.floor(game.player.energy);
  ui.energyBar.style.width = `${(game.player.energy / game.player.maxEnergy) * 100}%`;
  
  ui.strengthVal.textContent = game.player.strength;
  ui.recoveryVal.textContent = game.player.recovery;
  ui.currencyVal.textContent = game.player.currency;

  ui.levelVal.textContent = game.boss.level;
  ui.bossEmoji.textContent = game.boss.emoji;
  ui.bossHpText.textContent = game.boss.currentHp;
  ui.bossHpBar.style.width = `${(game.boss.currentHp / game.boss.maxHp) * 100}%`;

  UPGRADES.forEach(u => {
    const btn = document.getElementById(`btn-${u.id}`);
    if (btn) btn.disabled = game.player.currency < game.getUpgradeCost(u.id);
  });
};

renderUpgrades();
requestAnimationFrame(loop);
