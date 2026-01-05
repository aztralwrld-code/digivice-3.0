// Fix: Removed non-existent and unused import 'HiddenMetrics'
import { Creature, MetaState, RefusalReason, TraumaType } from "../types";

// --- CONFIGURATION (DESIGNER TUNING) ---
const CONFIG = {
    CRUELTY_DECAY: 0.05,       // Cruelty score drops over time
    CRUELTY_TRIGGER: 0.1,      // How much cruelty adds per bad interaction
    DISSOCIATION_THRESHOLD: 0.8, // If cruelty > 0.8, safeguard activates
    CONFUSION_WINDOW: 5,       // Inputs to track for entropy
    ENTROPY_THRESHOLD: 0.9     // If inputs are too random, player is confused
};

/**
 * THE OBSERVER ENGINE
 * Analyzes player behavior patterns to detect abuse, confusion, or mastery.
 * Does NOT affect game state directly, but tunes the "MetaState".
 */
export const analyzePlayerPatterns = (
    creature: Creature,
    recentInputs: string[] // List of last N action types
): MetaState => {
    let meta = { ...creature.meta };

    // 1. Calculate Input Entropy (Detect Confusion)
    // If a player is spamming random buttons, they don't understand the UI.
    const uniqueInputs = new Set(recentInputs).size;
    const entropy = recentInputs.length > 0 ? uniqueInputs / recentInputs.length : 0;
    
    meta.metrics.inputEntropy = entropy;

    // Heuristic: If entropy is high AND trust is low, enable "Confusion Damping"
    // This might visually simplify the signal noise to help the player learn.
    if (entropy > CONFIG.ENTROPY_THRESHOLD && creature.kernel.axes.trust < 30) {
        meta.safeguards.confusionDamping = Math.min(100, meta.safeguards.confusionDamping + 5);
    } else {
        meta.safeguards.confusionDamping = Math.max(0, meta.safeguards.confusionDamping - 1);
    }

    // 2. Calculate Volatility (Mood Swing Speed)
    // Difference between current Stability and previous Stability (simplified)
    const volatility = (100 - creature.kernel.axes.stability) / 100;
    meta.metrics.volatilityIndex = volatility;

    return meta;
};

/**
 * ETHICAL SAFEGUARD: THE DAMPENER
 * Prevents "Trauma Farming" or optimal cruelty strategies.
 * If a player is abusive, the Digimon "Dissociates" (Goes numb).
 * This makes the game boring (mechanically suboptimal) rather than rewarding the cruelty with reaction.
 */
export const checkEthicalSafeguards = (
    creature: Creature,
    actionType: string
): { meta: MetaState, refusal: RefusalReason } => {
    let meta = { ...creature.meta };
    let refusal = RefusalReason.NONE;

    // 1. Detect Cruelty
    // Example: Scolding a crying Digimon, or Waking a tired one repeatedly
    let isCruel = false;
    
    if (actionType === 'SCOLD' && creature.condition.mood === 'SAD') isCruel = true;
    if (actionType === 'TRAIN' && creature.stats.energy < 5) isCruel = true;
    if (actionType === 'WAKE' && creature.stats.energy < 20) isCruel = true;

    if (isCruel) {
        meta.metrics.crueltyScore = Math.min(1, meta.metrics.crueltyScore + CONFIG.CRUELTY_TRIGGER);
    } else {
        // Decay cruelty score if being nice
        meta.metrics.crueltyScore = Math.max(0, meta.metrics.crueltyScore - CONFIG.CRUELTY_DECAY);
    }

    // 2. Trigger Dissociation
    if (meta.metrics.crueltyScore > CONFIG.DISSOCIATION_THRESHOLD) {
        meta.safeguards.dissociationLevel = 100;
        refusal = RefusalReason.DISSOCIATED;
        // Effect: Digimon becomes unresponsive. No animations. No stats change. 
        // The game effectively "pauses" emotional simulation until the player stops.
    } else {
        meta.safeguards.dissociationLevel = Math.max(0, meta.safeguards.dissociationLevel - 5);
    }

    return { meta, refusal };
};

/**
 * NARRATIVE EMERGENCE
 * Grants hidden tags based on long-term behavioral patterns.
 */
export const updateNarrativeTags = (creature: Creature): Creature => {
    const k = creature.kernel;
    const m = creature.meta;

    // Tag: SURVIVED_BREAKDOWN
    // If the Digimon hit max stress/fragmentation but recovered stability > 80
    if (k.memories.some(mem => mem.type === 'TRAUMA') && k.axes.stability > 80) {
        m.narrative.hasSurvivedBreakdown = true;
        // Effect: Future stress gain is reduced by 20% (Resilience)
    }

    // Tag: TRUSTED_STRANGERS (Multiplayer Heuristic)
    // If Sync is high despite low Stability (taking a leap of faith)
    if (k.axes.sync > 80 && k.axes.stability < 40) {
        m.narrative.hasTrustedStrangers = true;
    }

    return { ...creature, meta: m };
};

/**
 * RESONANCE FIELD (MULTIPLAYER SIMULATION)
 * Calculates how a remote Digimon's signal affects this one.
 */
export const calculateResonance = (
    localCreature: Creature,
    remoteSignal: { stress: number, trust: number }
): { stressMod: number, syncMod: number } => {
    
    // 1. The Chorus Effect
    // High Stress + High Stress = Amplified Anxiety (Feedback Loop)
    let stressMod = 0;
    if (localCreature.kernel.axes.stress > 60 && remoteSignal.stress > 60) {
        stressMod = 0.5; // Feedback loop
    }
    
    // 2. The Anchor Effect
    // Low Stress (Remote) soothes High Stress (Local)
    if (localCreature.kernel.axes.stress > 60 && remoteSignal.stress < 20) {
        stressMod = -0.5; // Calming presence
    }

    // 3. Dissonance
    // High Trust (Local) vs Low Trust (Remote) creates confusion
    let syncMod = 0;
    if (Math.abs(localCreature.kernel.axes.trust - remoteSignal.trust) > 50) {
        syncMod = -1; // Interference
    } else {
        syncMod = 1; // Resonance
    }

    return { stressMod, syncMod };
};
