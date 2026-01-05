import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScreenMode, InputButton, GameState, BootPhase, Creature, EvolutionPhase } from './types';
import { INITIAL_CREATURE, TICK_RATE_MS, HUNGER_DECAY, ENERGY_DECAY, ENERGY_REGEN_SLEEP, EVOLUTION_TREE, SHOP_ITEMS } from './constants';
import { processCreatureTick, checkEvolution, processKernelStimulus } from './services/gameLogic';
import { Digivice } from './components/Digivice';
import { WorldViewport } from './components/WorldViewport';

function App() {
  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>({
    isOn: true,
    bootPhase: BootPhase.HARDWARE_CHECK,
    currentScreen: ScreenMode.BOOT,
    creature: INITIAL_CREATURE,
    notifications: [],
    lastTick: Date.now(),
    menuSelection: 0,
    scanProgress: 0,
    lastRefusal: null,
    uiState: { 
        modal: 'NONE', 
        modalData: null,
        interactionMode: 'NONE',
        dragItem: null,
        dragPosition: null,
        feedback: null
    },
    evolution: {
        phase: EvolutionPhase.IDLE,
        progress: 0,
        targetId: null
    }
  });

  // --- Gesture State ---
  const touchStartRef = useRef<{x: number, y: number, time: number} | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressActiveRef = useRef(false);

  // --- STAGED BOOT SEQUENCE CONTROLLER ---
  useEffect(() => {
    if (gameState.currentScreen === ScreenMode.BOOT) {
        
        // 1. HARDWARE CHECK (Auto - 3s duration)
        if (gameState.bootPhase === BootPhase.HARDWARE_CHECK) {
            const t = setTimeout(() => {
                setGameState(p => ({ ...p, bootPhase: BootPhase.KERNEL_LOAD, scanProgress: 0 }));
            }, 3500);
            return () => clearTimeout(t);
        }

        // 2. KERNEL LOAD (Progress driven)
        if (gameState.bootPhase === BootPhase.KERNEL_LOAD) {
            const interval = setInterval(() => {
                setGameState(prev => {
                    const nextProgress = prev.scanProgress + 1.5; // Load speed
                    if (nextProgress >= 100) {
                        return { ...prev, scanProgress: 100, bootPhase: BootPhase.BIOMETRIC_HANDSHAKE };
                    }
                    return { ...prev, scanProgress: nextProgress };
                });
            }, 30);
            return () => clearInterval(interval);
        }

        // 3. BIOMETRIC HANDSHAKE (Interactive - Waits for Touch)
        // Handled in handleTouchStart

        // 4. SYSTEM READY (Auto transition to Login)
        if (gameState.bootPhase === BootPhase.SYSTEM_READY) {
            const t = setTimeout(() => {
                setGameState(p => ({ ...p, currentScreen: ScreenMode.LOGIN }));
            }, 2500);
            return () => clearTimeout(t);
        }
    }
  }, [gameState.currentScreen, gameState.bootPhase]);

  // --- Game Loop ---
  useEffect(() => {
    if (!gameState.isOn) return;
    const interval = setInterval(() => {
      setGameState((prev: GameState) => {
        if (prev.currentScreen === ScreenMode.BOOT || prev.currentScreen === ScreenMode.LOGIN || prev.currentScreen === ScreenMode.TITLE) return prev;
        if (prev.uiState.modal !== 'NONE') return prev;

        // Evolution Sync Logic
        if (prev.evolution.phase === EvolutionPhase.SYNCING) return prev; 
        if (prev.evolution.phase === EvolutionPhase.DATA_REWRITE) return prev;

        let nextCreature = processCreatureTick(prev.creature, HUNGER_DECAY, ENERGY_DECAY, ENERGY_REGEN_SLEEP);
        let nextEvo = { ...prev.evolution };

        if (nextEvo.phase === EvolutionPhase.IDLE) {
            const targetId = checkEvolution(nextCreature);
            if (targetId) {
                nextEvo.phase = EvolutionPhase.SIGNAL_DETECTED;
                nextEvo.targetId = targetId;
            }
        }

        return { ...prev, creature: nextCreature, evolution: nextEvo, lastTick: Date.now() };
      });
    }, TICK_RATE_MS);
    return () => clearInterval(interval);
  }, [gameState.isOn]);

  // --- High Freq Loop (Evolution Sync) ---
  useEffect(() => {
      if (!gameState.isOn) return;
      const fastInterval = setInterval(() => {
          setGameState(prev => {
              if (prev.evolution.phase === EvolutionPhase.SYNCING) {
                  if (isLongPressActiveRef.current) {
                      const newProgress = Math.min(100, prev.evolution.progress + 2);
                      if (newProgress >= 100) {
                          setTimeout(() => finalizeEvolution(), 1000);
                          return { ...prev, evolution: { ...prev.evolution, phase: EvolutionPhase.DATA_REWRITE, progress: 100 } };
                      }
                      return { ...prev, evolution: { ...prev.evolution, progress: newProgress } };
                  } else {
                      const newProgress = Math.max(0, prev.evolution.progress - 5);
                      if (newProgress === 0) return { ...prev, evolution: { ...prev.evolution, phase: EvolutionPhase.SIGNAL_DETECTED } };
                      return { ...prev, evolution: { ...prev.evolution, progress: newProgress } };
                  }
              }
              return prev;
          });
      }, 30);
      return () => clearInterval(fastInterval);
  }, [gameState.isOn]);

  const finalizeEvolution = () => {
      setGameState(prev => {
          if (!prev.evolution.targetId) return prev;
          const newStage = prev.creature.stage === 'BABY' ? 'ROOKIE' : prev.creature.stage === 'ROOKIE' ? 'CHAMPION' : 'ULTIMATE'; 
          return {
              ...prev,
              creature: { ...prev.creature, id: prev.evolution.targetId, stage: newStage as any },
              evolution: { phase: EvolutionPhase.COMPLETE, progress: 0, targetId: null },
              currentScreen: ScreenMode.HOME
          };
      });
      setTimeout(() => setGameState(prev => ({ ...prev, evolution: { ...prev.evolution, phase: EvolutionPhase.IDLE } })), 3000);
  };

  // --- GESTURE LOGIC ---
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now()
      };
      
      // --- INTERACTIVE BOOT HANDSHAKE ---
      if (gameState.currentScreen === ScreenMode.BOOT && gameState.bootPhase === BootPhase.BIOMETRIC_HANDSHAKE) {
          // Success Feedback Trigger
          // navigator.vibrate?.(50);
          setGameState(p => ({ ...p, bootPhase: BootPhase.SYSTEM_READY }));
          return;
      }

      // Evolution / Long Press Logic
      isLongPressActiveRef.current = true;
      if (gameState.evolution.phase === EvolutionPhase.SIGNAL_DETECTED) {
           // Start Sync immediately on touch if signal is ready
           setGameState(prev => ({ ...prev, evolution: { ...prev.evolution, phase: EvolutionPhase.SYNCING } }));
      }
      
      // Generic Long Press trigger (for future use)
      longPressTimerRef.current = setTimeout(() => {
          // Could trigger specific "Deep Scan" or similar here
      }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      isLongPressActiveRef.current = false;
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      
      if (!touchStartRef.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // TAP
      if (deltaTime < 300 && dist < 10) {
          processInput(InputButton.CONFIRM);
          return;
      }

      // SWIPE UP (Open Menu / Up)
      if (deltaY < -50 && Math.abs(deltaX) < 50) {
          processInput(InputButton.MENU); // Use MENU as generic "Up/Open"
          return;
      }

      // SWIPE DOWN (Close Menu / Back)
      if (deltaY > 50 && Math.abs(deltaX) < 50) {
          processInput(InputButton.CANCEL);
          return;
      }

      // SWIPE LEFT/RIGHT (Tabs)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 80) {
          if (deltaX > 0) processInput(InputButton.L1); // Swipe Right -> Go Left (Natural scroll)
          else processInput(InputButton.R1); // Swipe Left -> Go Right
      }
  };

  const processInput = (btn: InputButton) => {
    // navigator.vibrate?.(10); // Haptic feedback if supported

    setGameState(prev => {
        const { currentScreen, menuSelection, uiState } = prev;
        
        // 1. MODAL
        if (uiState.modal === 'SHOP_CONFIRM') {
            if (btn === InputButton.CANCEL) return { ...prev, uiState: { ...prev.uiState, modal: 'NONE', modalData: null } };
            if (btn === InputButton.CONFIRM) return { ...prev, uiState: { ...prev.uiState, modal: 'NONE', modalData: null } }; // Buy logic omitted
            return prev;
        }

        // 2. LOGIN
        if (currentScreen === ScreenMode.LOGIN) {
            if (btn === InputButton.CONFIRM) {
                // Simplified Login: Just tap to enter
                return { ...prev, currentScreen: ScreenMode.HOME };
            }
            return prev;
        }

        // 3. HOME SCREEN
        if (currentScreen === ScreenMode.HOME) {
            if (btn === InputButton.MENU) return { ...prev, currentScreen: ScreenMode.TRAIN }; // Open Tray
            if (btn === InputButton.CONFIRM) {
                // Tap to Pet
                const { kernel } = processKernelStimulus(prev.creature.kernel, { type: 'PRAISE' }, prev.creature.stats);
                return { ...prev, creature: { ...prev.creature, kernel } };
            }
        }

        // 4. TRAY NAVIGATION (Any screen except HOME)
        if (currentScreen !== ScreenMode.HOME) {
            // Close Tray
            if (btn === InputButton.CANCEL) return { ...prev, currentScreen: ScreenMode.HOME };
            
            // Switch Tabs
            const tabs = [ScreenMode.TRAIN, ScreenMode.EVOLVE, ScreenMode.INVENTORY, ScreenMode.SHOP];
            const idx = tabs.indexOf(currentScreen);
            
            if (idx !== -1 && (btn === InputButton.L1 || btn === InputButton.R1)) {
                 const dir = btn === InputButton.L1 ? -1 : 1;
                 const next = tabs[(idx + dir + tabs.length) % tabs.length];
                 return { ...prev, currentScreen: next };
            }

            // Interact inside tray
            if (btn === InputButton.CONFIRM) {
                if (currentScreen === ScreenMode.SHOP) {
                    // Tap on Shop = Buy random item.
                    return { ...prev, uiState: { ...prev.uiState, modal: 'SHOP_CONFIRM', modalData: SHOP_ITEMS[0] } };
                }
            }
        }

        return prev;
    });
  };

  return (
    <div 
        className="relative w-screen h-[100dvh] bg-black overflow-hidden font-sans select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
      <WorldViewport gameState={gameState} />
      <Digivice gameState={gameState} />
    </div>
  );
}

export default App;