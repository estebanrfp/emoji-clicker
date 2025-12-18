import { GAME_CONFIG, BOSS_EMOJIS, UPGRADES } from './constants.js';

export class GameState {
  constructor() {
    this.player = { ...GAME_CONFIG.INITIAL_PLAYER_STATS };
    this.level = 1;
    this.boss = this.createBoss(1);
    this.lastTick = Date.now();
    this.load();
  }

  createBoss(level) {
    const baseHp = GAME_CONFIG.BOSS_BASE_HP;
    const multiplier = Math.pow(GAME_CONFIG.BOSS_HP_MULTIPLIER, level - 1);
    const maxHp = Math.floor(baseHp * multiplier);
    
    return {
      level: level,
      maxHp: maxHp,
      currentHp: maxHp,
      emoji: BOSS_EMOJIS[level - 1] || '❓'
    };
  }

  clickBoss() {
    if (this.player.health <= 0) return { damage: 0, reason: 'dead' };
    if (this.player.energy < GAME_CONFIG.ENERGY_COST_PER_CLICK) return { damage: 0, reason: 'no_energy' };

    // Deduct energy
    this.player.energy -= GAME_CONFIG.ENERGY_COST_PER_CLICK;

    // Deal damage
    const damage = this.player.strength;
    this.boss.currentHp -= damage;

    // Gain Currency (1:1 damage ratio for simplicity, or define logic)
    this.player.currency += damage;

    if (this.boss.currentHp <= 0) {
      this.handleBossDeath();
      return { damage, killed: true };
    }

    this.save();
    return { damage, killed: false };
  }

  handleBossDeath() {
    // Level up
    if (this.level < GAME_CONFIG.MAX_LEVEL) {
      this.level++;
      this.boss = this.createBoss(this.level);
    } else {
      // Victory state or Endless mode?
      // Reset to level 1 but harder? Or just stay at 10?
      // For now, loop max level with higher HP scaling
      this.boss = this.createBoss(this.level);
      this.boss.maxHp *= 2; // Endless diff scaling
      this.boss.currentHp = this.boss.maxHp;
    }
  }

  buyUpgrade(upgradeId) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    // Calculate dynamic cost based on number of purchases? 
    // For simplicity, we can store purchase counts in player stats or just increase generic stats
    // Let's implement simple scaling: cost = base * (multiplier ^ purchases)
    // We need to track purchases.
    
    // Quick fix: Add 'upgrades' object to player if missing
    if (!this.player.upgrades) this.player.upgrades = {};
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
    if (!this.player.upgrades) this.player.upgrades = {};
    const currentCount = this.player.upgrades[upgradeId] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentCount));
  }

  tick(deltaTimeMs) {
    // Regenerate Energy
    const energyGain = this.player.recovery * (deltaTimeMs / 1000);
    this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + energyGain);

    // Save occasionally? optimize later.
  }

  save() {
    const data = {
      player: this.player,
      level: this.level
      // Don't save boss state to prevent cheat/bugs easily, just spawn fresh boss of that level
    };
    localStorage.setItem('emojiClickerSave', JSON.stringify(data));
  }

  load() {
    const saved = localStorage.getItem('emojiClickerSave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Merge with defaults to prevent crash on new fields
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
