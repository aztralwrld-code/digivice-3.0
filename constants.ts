
import { DigimonStage, EvolutionNode, Creature, PersonalityArchetype, ShopItem, DigimonStaticData } from './types';

export const DIGIMON_DATABASE: Record<string, DigimonStaticData> = {
    'botamon': {
        species: "Slime Digimon",
        attribute: "Free",
        description: "A digital lifeform newly manifested from the Kernel. Its body is composed of unstable data slime. It reacts purely to instinctual stimuli."
    },
    'agumon': {
        species: "Reptile Digimon",
        attribute: "Vaccine",
        description: "A bipedal reptile with hardened claws. Its courage makes it fearless, but its aggression algorithm can be difficult to stabilize."
    },
    'betamon': {
        species: "Amphibian Digimon",
        attribute: "Virus",
        description: "A docile creature that walks on four legs. Its electrical fin warns predators. It prefers calm, low-latency data streams."
    },
    'greymon': {
        species: "Dinosaur Digimon",
        attribute: "Vaccine",
        description: "A giant dinosaur whose cranial skin has hardened into a shell. Its offensive heuristics are incredibly high."
    },
    'darkgreymon': {
        species: "Dinosaur Digimon",
        attribute: "Virus",
        description: "A Greymon whose source code was corrupted by stress and aggression. It fights with savage, uncontrolled power."
    },
    'seadramon': {
        species: "Sea Animal Digimon",
        attribute: "Data",
        description: "It swims through the Net Ocean. Its serpentine body is optimized for constricting enemies."
    },
    'metalgreymon': {
        species: "Cyborg Digimon",
        attribute: "Vaccine",
        description: "Has mechanized more than half of its body. The offensive power of its nuclear reactor is immeasurable."
    }
};

export const INITIAL_CREATURE: Creature = {
  id: 'botamon',
  name: 'Botamon',
  stage: DigimonStage.BABY,
  kernel: {
    personality: PersonalityArchetype.CURIOUS,
    driftRate: 1.0,
    consecutiveSafeTicks: 0,
    isFragmented: false,
    axes: {
        trust: 20,      
        stress: 10,     
        aggression: 5,  
        curiosity: 80,  
        sync: 10,
        stability: 50
    },
    memories: [],
    traumas: []
  },
  meta: {
      metrics: {
          volatilityIndex: 0,
          inputEntropy: 0,
          crueltyScore: 0,
          coherence: 1
      },
      narrative: {
          hasTrustedStrangers: false,
          hasSurvivedBreakdown: false,
          isCodependent: false,
          isLoneWolf: false
      },
      safeguards: {
          dissociationLevel: 0,
          confusionDamping: 0
      }
  },
  stats: {
    hp: 20,
    maxHp: 20,
    energy: 50,
    maxEnergy: 50,
    hunger: 50,
    exp: 0,
    strength: 5,
    defense: 5,
    speed: 5,
    weight: 2,
    age: 0
  },
  condition: {
    isSleeping: false,
    isSick: false,
    mood: 'NEUTRAL',
  },
  history: {
    battlesWon: 0,
    trainingSessions: 0,
    mistakes: 0,
  }
};

export const EVOLUTION_TREE: Record<string, EvolutionNode> = {
  'botamon': {
    id: 'botamon',
    stage: DigimonStage.BABY,
    next: ['agumon', 'betamon']
  },
  'agumon': {
    id: 'agumon',
    stage: DigimonStage.ROOKIE,
    requirements: { 
        minStats: { str: 15 },
        kernelConditions: { minTrust: 30, maxStress: 40 }
    },
    next: ['greymon', 'darkgreymon']
  },
  'betamon': {
    id: 'betamon',
    stage: DigimonStage.ROOKIE,
    requirements: { 
        minStats: { str: 10 },
        kernelConditions: { minTrust: 10 }
    }, 
    next: ['seadramon']
  },
  'greymon': {
    id: 'greymon',
    stage: DigimonStage.CHAMPION,
    requirements: { 
        minStats: { str: 50 },
        kernelConditions: { minTrust: 60, minSync: 40 }
    },
    next: ['metalgreymon']
  },
  'darkgreymon': {
      id: 'darkgreymon',
      stage: DigimonStage.CHAMPION,
      requirements: {
          minStats: { str: 60 },
          kernelConditions: { maxStress: 100, requiresTrauma: true }
      },
      next: []
  },
  'seadramon': {
    id: 'seadramon',
    stage: DigimonStage.CHAMPION,
    requirements: { 
        minStats: { str: 40 },
        kernelConditions: { maxStress: 60 }
    },
    next: []
  },
  'metalgreymon': {
    id: 'metalgreymon',
    stage: DigimonStage.ULTIMATE,
    next: []
  }
};

export const SHOP_ITEMS: ShopItem[] = [
    { id: 'hp_floppy', name: 'HP Floppy', cost: 100, description: "Restores small amount of structural integrity.", effect: "+20 HP", icon: 'FLOPPY', rarity: 'COMMON', category: 'MEDICINE', flavorText: "Standard issue recovery data." },
    { id: 'protein_cube', name: 'Protein Cube', cost: 300, description: "Dense data block. Increases muscle mass.", effect: "+5 STR / +2 Stress", icon: 'CUBE', rarity: 'COMMON', category: 'FOOD', flavorText: "Tastes like raw geometry." },
    { id: 'mood_patch', name: 'Mood Patch v1', cost: 500, description: "Stabilizes emotional kernel algorithms.", effect: "-10 Stress", icon: 'CHIP', rarity: 'RARE', category: 'MEDICINE', flavorText: "Instant zen." },
    { id: 'firewall_shard', name: 'Firewall Shard', cost: 1200, description: "Rare debris. Boosts defense matrix.", effect: "+5 DEF", icon: 'SHIELD', rarity: 'LEGENDARY', category: 'SYMBOL', flavorText: "A fragment of an ancient barrier." }
];

export const TICK_RATE_MS = 3000; 
export const HUNGER_DECAY = 2;
export const ENERGY_DECAY = 1;
export const ENERGY_REGEN_SLEEP = 5;
