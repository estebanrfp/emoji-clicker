class GameState {
  constructor() {
    this.player = { ...GAME_CONFIG.INITIAL_PLAYER_STATS };
    this.level = 1;
    this.boss = this.createBoss(1);
    this.load();
  }

  createBoss(level) {
    const baseHp = GAME_CONFIG.BOSS_BASE_HP;
    const multiplier = Math.pow(GAME_CONFIG.BOSS_HP_MULTIPLIER, level - 1);
    const maxHp = Math.floor(baseHp * multiplier);
    
    return {
      level,
      maxHp,
      currentHp: maxHp,
      emoji: BOSS_EMOJIS[level - 1] || '❓'
    };
  }

  clickBoss() {
    if (this.player.health <= 0) return { damage: 0, reason: 'dead' };
    if (this.player.energy < GAME_CONFIG.ENERGY_COST_PER_CLICK) return { damage: 0, reason: 'no_energy' };

    this.player.energy -= GAME_CONFIG.ENERGY_COST_PER_CLICK;
    const damage = this.player.strength;
    this.boss.currentHp -= damage;
    this.player.currency += damage;

    if (this.boss.currentHp <= 0) {
      this.handleBossDeath();
      return { damage, killed: true };
    }

    this.save();
    return { damage, killed: false };
  }

  handleBossDeath() {
    if (this.level < GAME_CONFIG.MAX_LEVEL) {
      this.level++;
      this.boss = this.createBoss(this.level);
    } else {
      this.boss = this.createBoss(this.level);
      this.boss.maxHp *= 2;
      this.boss.currentHp = this.boss.maxHp;
    }
  }

  buyUpgrade(upgradeId) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    this.player.upgrades ??= {};
    const currentCount = this.player.upgrades[upgradeId] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentCount));

    if (this.player.currency >= cost) {
      this.player.currency -= cost;
      upgrade.effect(this.player);
      this.player.upgrades[upgradeId] = currentCount + 1;
      this.save();
      return true;
    }
    return false;
  }

  getUpgradeCost(upgradeId) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    this.player.upgrades ??= {};
    const currentCount = this.player.upgrades[upgradeId] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentCount));
  }

  tick(deltaTimeMs) {
    const energyGain = this.player.recovery * (deltaTimeMs / 1000);
    this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + energyGain);
  }

  save() {
    const data = { player: this.player, level: this.level };
    localStorage.setItem('emojiClickerSave', JSON.stringify(data));
  }

  load() {
    const saved = localStorage.getItem('emojiClickerSave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.player = { ...this.player, ...data.player };
        this.level = data.level || 1;
        this.boss = this.createBoss(this.level);
      } catch (e) {
        console.error("Save load failed", e);
      }
    }
  }

  reset() {
    this.player = { ...GAME_CONFIG.INITIAL_PLAYER_STATS };
    this.level = 1;
    this.boss = this.createBoss(1);
    this.save();
  }
}
