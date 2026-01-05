
import { Creature, DigimonStage, PersonalityArchetype, EmotionalAxes, TraumaType, TraumaState, EmotionalKernel, RefusalReason } from '../types';
import { EVOLUTION_TREE } from '../constants';
import { checkEthicalSafeguards, updateNarrativeTags } from './metaSystem';

// --- AEI: Refusal System ---

/**
 * Determines if the Digimon exerts autonomy to REFUSE a command.
 * This is the first line of defense in the AI brain.
 */
export const checkCommandRefusal = (
    creature: Creature,
    action: 'FEED' | 'TRAIN' | 'SCAN' | 'SLEEP' | 'WAKE'
): RefusalReason => {
    
    // 0. Meta-Layer Safeguard (Dissociation)
    const { refusal } = checkEthicalSafeguards(creature, action);
    if (refusal === RefusalReason.DISSOCIATED) return RefusalReason.DISSOCIATED;

    const { kernel, stats } = creature;
    const { axes, traumas, personality } = kernel;

    // 1. Biological Override
    if (action === 'TRAIN' && stats.energy < 5) return RefusalReason.OVERWHELMED;
    if (action === 'FEED' && stats.hunger > 90) return RefusalReason.NOT_HUNGRY;
    
    // 2. Trauma Triggers (Hard Refusal)
    const overload = traumas.find(t => t.type === TraumaType.OVERLOAD && t.isActive);
    if (overload && overload.severity > 50 && (action === 'TRAIN' || action === 'SCAN')) {
        return RefusalReason.FEAR; // "I'm scared this will hurt"
    }

    const betrayal = traumas.find(t => t.type === TraumaType.BETRAYAL && t.isActive);
    if (betrayal && betrayal.severity > 40 && action === 'FEED') {
        // High severity betrayal might refuse food from an untrusted tamer
        if (axes.trust < 20) return RefusalReason.DEFIANCE; 
    }

    // 3. Emotional Thresholds (Soft Refusal)
    if (action === 'TRAIN' && axes.stress > 80 && axes.trust < 40) {
        return RefusalReason.DEFIANCE; // "I hate this and I don't trust you"
    }
    
    // Waking a tired digimon is risky
    if (action === 'WAKE' && stats.energy < 30 && axes.trust < 50) {
        return RefusalReason.DEFIANCE; // "Let me sleep!"
    }

    if (action === 'SCAN' && axes.stability < 10) {
        return RefusalReason.OVERWHELMED; // "I'm falling apart, I can't work"
    }

    // 4. Personality Modifiers
    if (personality === PersonalityArchetype.CHAOTIC && Math.random() < 0.1) {
        return RefusalReason.DEFIANCE; // Random rebellion
    }

    return RefusalReason.NONE;
};

// --- AEI: Trauma & Recovery System ---

export const processTraumaImpact = (
    kernel: EmotionalKernel,
    stimulus: { type: 'FEED' | 'TRAIN' | 'SCAN' | 'IGNORE' | 'PRAISE' | 'SLEEP' | 'REFUSAL' | 'SCOLD' | 'WAKE' },
    currentStats: Creature['stats']
): { traumas: TraumaState[], safeTickBonus: number } => {
    let newTraumas = [...kernel.traumas];
    let safeTickBonus = 0; // 1 means safe tick, -1 means reset recovery

    const getTrauma = (type: TraumaType): TraumaState => {
        const existing = newTraumas.find(t => t.type === type);
        if (existing) return existing;
        const fresh: TraumaState = { type, severity: 0, recovery: 0, isActive: true, triggerCount: 0 };
        newTraumas.push(fresh);
        return fresh;
    };

    // --- Trauma Accumulation Logic ---

    // OVERLOAD: Doing work when unstable or tired
    if (stimulus.type === 'TRAIN' || stimulus.type === 'SCAN') {
        if (kernel.axes.stress > 70 || currentStats.energy < 10) {
            const t = getTrauma(TraumaType.OVERLOAD);
            t.severity = Math.min(100, t.severity + 10);
            t.triggerCount++;
            t.recovery = 0; // Break recovery loop
            safeTickBonus = -1;
        } else {
            // Healthy work builds resilience
            safeTickBonus = 1;
        }
    }

    // ABANDONMENT: Hunger is a trigger, handled in Drift mostly, but FEED heals it
    if (stimulus.type === 'FEED') {
        const t = newTraumas.find(t => t.type === TraumaType.ABANDONMENT);
        if (t) {
            // Recovery Loop: Consistent feeding heals
            t.recovery += 5;
            if (t.recovery >= 100) {
                t.severity = Math.max(0, t.severity - 10);
                t.recovery = 50; // Keep momentum
            }
        }
        safeTickBonus = 1;
    }

    // BETRAYAL: Scolding when innocent or conflicting signals
    // Also WAKING them up forcibly when tired
    if (stimulus.type === 'SCOLD' || (stimulus.type === 'WAKE' && currentStats.energy < 20)) {
        if (kernel.axes.stress > 50 || stimulus.type === 'WAKE') {
            const t = getTrauma(TraumaType.BETRAYAL);
            t.severity += 15;
            t.recovery = 0;
            safeTickBonus = -1;
        }
    }

    // --- Recovery Loop Logic ---
    // Universal Healer: Respecting refusal or Sleep
    if (stimulus.type === 'SLEEP' || stimulus.type === 'REFUSAL') {
        safeTickBonus = 1;
        newTraumas.forEach(t => {
            if (t.severity > 0) t.recovery += 1; // Slow passive healing
        });
    }

    return { 
        traumas: newTraumas.filter(t => t.severity > 0),
        safeTickBonus
    };
};

// --- AEI: Stimulus Processing Engine ---

export const processKernelStimulus = (
    kernel: Creature['kernel'], 
    stimulus: { type: 'FEED' | 'TRAIN' | 'SCAN' | 'IGNORE' | 'PRAISE' | 'SCOLD' | 'SLEEP' | 'REFUSAL' | 'WAKE' },
    currentStats: Creature['stats']
): { kernel: EmotionalKernel } => {
    
    let newKernel = { ...kernel, axes: { ...kernel.axes } };
    const p = kernel.personality;

    // 1. Process Trauma & Recovery
    const traumaResult = processTraumaImpact(kernel, stimulus, currentStats);
    newKernel.traumas = traumaResult.traumas;

    // Manage Recovery Loop (Consecutive Safe Ticks)
    if (traumaResult.safeTickBonus > 0) {
        newKernel.consecutiveSafeTicks += 1;
    } else if (traumaResult.safeTickBonus < 0) {
        newKernel.consecutiveSafeTicks = 0; // Break the chain
    }

    // Bonus healing for long streaks
    if (newKernel.consecutiveSafeTicks > 10) {
        newKernel.axes.stability += 1;
        newKernel.axes.stress -= 1;
    }

    // 2. Base Emotional Reaction
    switch (stimulus.type) {
        case 'FEED':
            newKernel.axes.trust += 2;
            newKernel.axes.stress -= 5;
            if (p === PersonalityArchetype.CURIOUS) newKernel.axes.curiosity -= 2;
            break;
        case 'TRAIN':
            newKernel.axes.stress += 5;
            newKernel.axes.aggression += 2;
            if (p === PersonalityArchetype.BRAVE) {
                newKernel.axes.stress -= 3; 
                newKernel.axes.sync += 1;
            }
            if (p === PersonalityArchetype.TIMID) newKernel.axes.stress += 8; // Biased reaction
            break;
        case 'SCAN':
            newKernel.axes.curiosity -= 10;
            newKernel.axes.sync += 2;
            newKernel.axes.stability -= 1; // Scanning creates digital noise/instability
            break;
        case 'PRAISE':
            newKernel.axes.trust += 3;
            newKernel.axes.stability += 2;
            break;
        case 'REFUSAL':
            // Respecting refusal increases Trust but might lower Sync momentarily
            newKernel.axes.trust += 1;
            newKernel.axes.stress -= 2;
            break;
        case 'SLEEP':
            newKernel.axes.stress -= 10;
            newKernel.axes.stability += 5;
            break;
        case 'WAKE':
            if (currentStats.energy < 50) {
                newKernel.axes.stress += 10;
                newKernel.axes.trust -= 5;
            } else {
                newKernel.axes.stress += 2; // Waking up is always slightly annoying
            }
            break;
    }

    // 3. Trauma Distortion Field (The Lens)
    // Existing traumas modify the output of the reaction
    newKernel.traumas.forEach(t => {
        if (t.severity > 30) {
            const factor = t.severity / 100;

            if (t.type === TraumaType.ABANDONMENT) {
                // Praise feels fake
                if (stimulus.type === 'PRAISE') {
                    newKernel.axes.trust -= 2; 
                    newKernel.axes.stress += 1; // "Why are you being nice now?"
                }
            }
            if (t.type === TraumaType.BETRAYAL) {
                // Trust is capped or decays on interaction
                newKernel.axes.trust *= 0.95;
                newKernel.axes.stability -= 2;
            }
        }
    });

    // 4. Check Fragmentation
    if (newKernel.axes.stress > 90 && newKernel.axes.stability < 20) {
        newKernel.isFragmented = true;
    } else if (newKernel.axes.stress < 50 && newKernel.axes.stability > 40) {
        newKernel.isFragmented = false; // Reintegration
    }

    // Clamp
    Object.keys(newKernel.axes).forEach(key => {
        const k = key as keyof EmotionalAxes;
        newKernel.axes[k] = Math.max(0, Math.min(100, newKernel.axes[k]));
    });

    return { kernel: newKernel };
};

// --- Passive Drift ---

export const processKernelDrift = (creature: Creature): Creature['kernel'] => {
    const kernel = { ...creature.kernel, axes: { ...creature.kernel.axes }, traumas: [...creature.kernel.traumas] };
    
    // 1. Biological Triggering
    if (creature.stats.hunger < 5) {
        // Abandonment Trauma Generation
        let t = kernel.traumas.find(x => x.type === TraumaType.ABANDONMENT);
        if (!t) {
            t = { type: TraumaType.ABANDONMENT, severity: 0, recovery: 0, isActive: true, triggerCount: 0 };
            kernel.traumas.push(t);
        }
        t.severity = Math.min(100, t.severity + 5); 
        t.recovery = 0;
        kernel.consecutiveSafeTicks = 0; // Reset safe loop
        
        kernel.axes.stress += 5;
        kernel.axes.trust -= 1;
    }

    // 2. Passive Axis Drift
    // Stability naturally decays slightly if neglected, regens if high Trust
    if (kernel.axes.trust > 60) kernel.axes.stability += 0.5;
    else kernel.axes.stability -= 0.1;

    // 3. Fragmentation Effects
    if (kernel.isFragmented) {
        // Erratic Stat Changes
        kernel.axes.stress += (Math.random() - 0.5) * 10;
        kernel.axes.aggression += (Math.random() - 0.5) * 10;
    }

    // Clamp
    Object.keys(kernel.axes).forEach(key => {
        const k = key as keyof EmotionalAxes;
        kernel.axes[k] = Math.max(0, Math.min(100, kernel.axes[k]));
    });

    return kernel;
};

// --- Standard Game Logic ---

export const checkEvolution = (creature: Creature): string | null => {
  const currentNode = EVOLUTION_TREE[creature.id];
  if (!currentNode || !currentNode.next) return null;

  for (const nextId of currentNode.next) {
    const nextNode = EVOLUTION_TREE[nextId];
    if (!nextNode.requirements) return nextId; // Automatic

    const req = nextNode.requirements;
    let meetsRequirements = true;

    // Check Stats
    if (req.minStats) {
        if (req.minStats.str && creature.stats.strength < req.minStats.str) meetsRequirements = false;
        if (req.minStats.def && creature.stats.defense < req.minStats.def) meetsRequirements = false;
    }

    // Check Kernel
    if (req.kernelConditions) {
        const k = creature.kernel.axes;
        const c = req.kernelConditions;
        if (c.minTrust && k.trust < c.minTrust) meetsRequirements = false;
        if (c.maxStress && k.stress > c.maxStress) meetsRequirements = false;
        if (c.minSync && k.sync < c.minSync) meetsRequirements = false;
        if (c.requiredPersonality && creature.kernel.personality !== c.requiredPersonality) meetsRequirements = false;
        
        if (c.requiresTrauma) {
            const hasSevereTrauma = creature.kernel.traumas.some(t => t.severity > 70);
            if (!hasSevereTrauma) meetsRequirements = false;
        }
    }
    
    if (meetsRequirements) return nextId;
  }

  return null;
};

export const processCreatureTick = (creature: Creature, hungerDecay: number, energyDecay: number, sleepRegen: number): Creature => {
  let newCreature = { ...creature, stats: { ...creature.stats } };

  // 1. Biological Processing
  if (newCreature.condition.isSleeping) {
    newCreature.stats.energy = Math.min(newCreature.stats.maxEnergy, newCreature.stats.energy + sleepRegen);
    newCreature.stats.hunger = Math.max(0, newCreature.stats.hunger - (hungerDecay / 2));
  } else {
    newCreature.stats.energy = Math.max(0, newCreature.stats.energy - energyDecay);
    newCreature.stats.hunger = Math.max(0, newCreature.stats.hunger - hungerDecay);
  }

  // 2. Emotional Processing (The Kernel)
  newCreature.kernel = processKernelDrift(newCreature);
  
  // 3. Meta-Layer Processing (Narrative Emergence)
  newCreature = updateNarrativeTags(newCreature);

  // 4. Mood Determination (Output Layer)
  const k = newCreature.kernel.axes;
  
  // Check Dissociation First (Meta-State Override)
  if (newCreature.meta.safeguards.dissociationLevel > 80) {
      newCreature.condition.mood = 'REFUSING'; // Visually refusing due to ethical block
  }
  else if (newCreature.kernel.isFragmented) newCreature.condition.mood = 'FRACTURED';
  else if (k.stress > 80) newCreature.condition.mood = 'ANGRY';
  else if (k.curiosity < 20 && k.stress > 50) newCreature.condition.mood = 'SAD';
  else if (k.curiosity > 80 && newCreature.stats.energy > 50) newCreature.condition.mood = 'HYPER';
  else if (k.trust > 70 && k.stress < 30) newCreature.condition.mood = 'HAPPY';
  else if (newCreature.stats.energy < 20) newCreature.condition.mood = 'TIRED';
  else newCreature.condition.mood = 'NEUTRAL';

  return newCreature;
};
