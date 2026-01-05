
export enum ScreenMode {
  // SYSTEM STATES
  TITLE = 'TITLE',
  OFF = 'OFF',
  BOOT = 'BOOT',
  LOGIN = 'LOGIN',

  // HUB STATES
  HOME = 'HOME',
  MENU = 'MENU', 
  
  // APPS
  STATUS = 'STATUS',
  TRAIN = 'TRAIN',
  EVOLVE = 'EVOLVE',
  INVENTORY = 'INVENTORY',
  SHOP = 'SHOP',
  DIGIDEX = 'DIGIDEX',
  SLEEP = 'SLEEP',
  SETTINGS = 'SETTINGS',
  DESIGN_GUIDE = 'DESIGN_GUIDE' // Interactive Visual Style Guide
}

export enum BootPhase {
  OFF = 0,
  HARDWARE_CHECK = 1,
  KERNEL_LOAD = 2,
  BIOMETRIC_HANDSHAKE = 3,
  SYSTEM_READY = 4
}

export enum EvolutionPhase {
    IDLE = 0,
    SIGNAL_DETECTED = 1,
    SYNCING = 2,
    DATA_REWRITE = 3,
    COMPLETE = 4
}

export enum InputButton {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  MENU = 'MENU',
  STATS = 'STATS',
  L1 = 'L1',
  R1 = 'R1'
}

export enum PersonalityArchetype {
  BRAVE = 'BRAVE',
  TIMID = 'TIMID',
  STOIC = 'STOIC',
  CURIOUS = 'CURIOUS',
  CHAOTIC = 'CHAOTIC'
}

export enum TraumaType {
  ABANDONMENT = 'ABANDONMENT',
  OVERLOAD = 'OVERLOAD',
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  BETRAYAL = 'BETRAYAL'
}

export enum RefusalReason {
  NONE = 'NONE',
  FEAR = 'FEAR',
  DEFIANCE = 'DEFIANCE',
  APATHY = 'APATHY',
  OVERWHELMED = 'OVERWHELMED',
  DISSOCIATED = 'DISSOCIATED',
  DISGUST = 'DISGUST',
  NOT_HUNGRY = 'NOT_HUNGRY'
}

export interface TraumaState {
  type: TraumaType;
  severity: number;
  recovery: number;
  isActive: boolean;
  triggerCount: number;
}

export interface EmotionalAxes {
  trust: number;
  stress: number;
  aggression: number;
  curiosity: number;
  sync: number;
  stability: number;
}

export interface MemoryTrace {
  id: string;
  timestamp: number;
  type: 'TRAUMA' | 'TRIUMPH' | 'BONDING' | 'NEGLECT' | 'CONFLICT' | 'DREAM';
  intensity: number;
  tags: string[];
  description: string;
  resolved: boolean;
}

export interface EmotionalKernel {
  personality: PersonalityArchetype;
  axes: EmotionalAxes;
  memories: MemoryTrace[];
  traumas: TraumaState[]; 
  driftRate: number; 
  consecutiveSafeTicks: number;
  isFragmented: boolean;
}

export interface MetaState {
    metrics: {
        volatilityIndex: number;
        inputEntropy: number;
        crueltyScore: number;
        coherence: number;
    };
    narrative: {
        hasTrustedStrangers: boolean;
        hasSurvivedBreakdown: boolean;
        isCodependent: boolean;
        isLoneWolf: boolean;
    };
    safeguards: {
        dissociationLevel: number;
        confusionDamping: number;
    }
}

export interface Creature {
  id: string;
  name: string;
  stage: DigimonStage;
  kernel: EmotionalKernel;
  meta: MetaState;
  stats: {
    hp: number;
    maxHp: number;
    energy: number;
    maxEnergy: number;
    hunger: number;
    exp: number;
    strength: number;
    defense: number;
    speed: number; 
    weight: number; 
    age: number;    
  };
  condition: {
    isSleeping: boolean;
    isSick: boolean;
    mood: 'HAPPY' | 'NEUTRAL' | 'SAD' | 'ANGRY' | 'TIRED' | 'HYPER' | 'FRACTURED' | 'REFUSING'; 
  };
  history: {
    battlesWon: number;
    trainingSessions: number;
    mistakes: number;
  };
}

export interface UIState {
  modal: 'NONE' | 'SHOP_CONFIRM' | 'ITEM_DETAILS';
  modalData: any;
  interactionMode: 'NONE' | 'DRAGGING' | 'TRAINING_SYNC' | 'SLEEP_TOGGLE';
  dragItem: ShopItem | null;
  dragPosition: { x: number; y: number } | null;
  feedback: {
      type: 'HEART' | 'ANGER' | 'REFUSAL' | 'EAT' | 'SLEEP' | 'WAKE';
      timestamp: number;
  } | null;
}

export interface GameState {
  isOn: boolean;
  bootPhase: BootPhase;
  currentScreen: ScreenMode;
  creature: Creature;
  notifications: string[];
  lastTick: number;
  menuSelection: number;
  scanProgress: number;
  lastRefusal: {
    reason: RefusalReason;
    timestamp: number;
  } | null;
  uiState: UIState;
  
  evolution: {
      phase: EvolutionPhase;
      progress: number;
      targetId: string | null;
  };
}

export interface EvolutionNode {
  id: string;
  stage: DigimonStage;
  requirements?: {
    minLevel?: number;
    minStats?: { str?: number; def?: number };
    kernelConditions?: {
        minTrust?: number;
        maxStress?: number; 
        minSync?: number;
        requiredPersonality?: PersonalityArchetype;
        requiresTrauma?: boolean; 
    };
  };
  next?: string[];
}

export interface ShopItem {
    id: string;
    name: string;
    cost: number;
    description: string;
    effect: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
    category: 'FOOD' | 'MEDICINE' | 'TOY' | 'SYMBOL';
    flavorText: string;
}

export interface DigimonStaticData {
    description: string;
    species: string;
    attribute: 'Vaccine' | 'Data' | 'Virus' | 'Free';
    unlocked?: boolean;
}

export enum DigimonStage {
  EGG = 'EGG',
  BABY = 'BABY',
  ROOKIE = 'ROOKIE',
  CHAMPION = 'CHAMPION',
  ULTIMATE = 'ULTIMATE'
}
