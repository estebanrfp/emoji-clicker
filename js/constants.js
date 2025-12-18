const GAME_CONFIG = {
  INITIAL_PLAYER_STATS: {
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    strength: 10,
    recovery: 1,
    currency: 0,
  },
  ENERGY_COST_PER_CLICK: 5,
  BOSS_BASE_HP: 100,
  BOSS_HP_MULTIPLIER: 1.5,
  MAX_LEVEL: 10,
};

const BOSS_EMOJIS = ["👾", "💀", "👹", "🤡", "👽", "👻", "🤖", "🐲", "🧛", "🧟"];

const UPGRADES = [
  {
    id: 'strength',
    name: 'Strength',
    icon: '💪',
    baseCost: 50,
    costMultiplier: 1.5,
    effect: (player) => { player.strength += 5; },
    description: "+5 Damage/Click"
  },
  {
    id: 'recovery',
    name: 'Recovery',
    icon: '🔄',
    baseCost: 100,
    costMultiplier: 1.6,
    effect: (player) => { player.recovery += 1; },
    description: "+1 Energy/Sec"
  },
  {
    id: 'maxHealth',
    name: 'Max Health',
    icon: '❤️',
    baseCost: 150,
    costMultiplier: 1.4,
    effect: (player) => { 
      player.maxHealth += 20; 
      player.health += 20;
    },
    description: "+20 Max HP"
  },
  {
    id: 'maxEnergy',
    name: 'Max Energy',
    icon: '⚡',
    baseCost: 120,
    costMultiplier: 1.4,
    effect: (player) => { 
      player.maxEnergy += 20; 
      player.energy += 20;
    },
    description: "+20 Max Energy"
  }
];
