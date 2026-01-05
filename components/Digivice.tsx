
import React, { useMemo } from 'react';
import { GameState, ScreenMode } from '../types';
import { Screen } from './Screen';
import { Activity, Battery, Triangle } from 'lucide-react';

interface DigiviceProps {
  gameState: GameState;
  onNavigate?: (mode: ScreenMode) => void;
}

const StatBar = ({ value, max, color, label, icon: Icon, isStressed, stability }: { value: number, max: number, color: string, label: string, icon: any, isStressed: boolean, stability: number }) => {
    const pct = Math.min(100, (value / max) * 100);
    // Stability creates a synchronized breathing link between device and creature
    const isStable = stability > 60;
    const breatheClass = isStable ? 'animate-breathe' : '';
    const jitterClass = isStressed ? 'animate-jitter' : '';

    return (
        <div className={`flex flex-col items-start w-28 transition-all duration-300 ${breatheClass} ${jitterClass}`}>
             <div className="flex items-center space-x-2 mb-2 opacity-80">
                 <Icon size={12} className={`${color} drop-shadow-[0_0_5px_currentColor]`} />
                 <span className={`text-[10px] font-mono font-bold tracking-[0.1em] ${color} uppercase`}>{label}</span>
             </div>
             <div className="w-full h-1.5 bg-gray-900/90 rounded-full overflow-hidden backdrop-blur-md border border-white/5 relative shadow-inner">
                 <div 
                    className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000 ease-engine shadow-[0_0_12px_currentColor] relative z-10`}
                    style={{ width: `${pct}%` }}
                 >
                    {/* Micro scanning light */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[slideInRight_3s_infinite]"></div>
                 </div>
                 {/* Secondary faint background bar */}
                 <div className={`absolute inset-0 ${color.replace('text-', 'bg-')} opacity-10`}></div>
             </div>
        </div>
    );
};

export const Digivice: React.FC<DigiviceProps> = ({ gameState, onNavigate }) => {
  const { currentScreen, creature, evolution } = gameState;
  const { stats, condition, kernel } = creature;
  
  // HUD VISIBILITY RULES
  const isBooting = currentScreen === ScreenMode.BOOT;
  const isTitle = currentScreen === ScreenMode.TITLE;
  const isHome = currentScreen === ScreenMode.HOME;
  const isLogin = currentScreen === ScreenMode.LOGIN;
  
  // Hide HUD on Title, Boot, and Login to keep the focus on the cinematic visuals
  const hideHud = isTitle || isBooting || isLogin;
  
  // Tray is only visible when NOT on Home/Boot/Title/Login
  const showTray = !isHome && !hideHud;
  const trayTransform = showTray ? 'translate-y-0' : 'translate-y-[100%]';

  const stress = kernel.axes.stress;
  const stability = kernel.axes.stability;
  const isStressed = stress > 75;
  const isUnstable = stability < 30;

  const moodColor = useMemo(() => {
      switch (condition.mood) {
          case 'ANGRY': return 'text-red-500';
          case 'SAD': return 'text-blue-400';
          case 'HAPPY': return 'text-yellow-400';
          case 'TIRED': return 'text-gray-400';
          case 'HYPER': return 'text-synapse-pink';
          case 'REFUSING': return 'text-gray-600';
          default: return 'text-bio-cyan';
      }
  }, [condition.mood]);

  const trayStyle = {
      filter: isUnstable ? `contrast(1.1) brightness(1.1) drop-shadow(0 0 15px rgba(255,255,255,${0.1 + (1 - stability/100)*0.15}))` : 'none',
  };

  return (
    <div className={`absolute inset-0 z-20 pointer-events-none flex flex-col justify-between overflow-hidden transition-all duration-700 ${isUnstable ? 'grayscale-[0.1]' : ''}`}>
      
      {/* HUD HEADER */}
      <div className={`h-28 w-full flex justify-between items-start px-8 pt-10 transition-all duration-1000 ${hideHud ? 'opacity-0' : 'opacity-100'} pointer-events-auto bg-gradient-to-b from-black/95 via-black/40 to-transparent`}>
          <StatBar value={stats.hp} max={stats.maxHp} color={moodColor} label="VITALITY" icon={Activity} isStressed={isStressed} stability={stability} />
          
          <div className={`flex flex-col items-center mt-2 transition-opacity duration-700 ${isUnstable ? 'animate-pulse opacity-30' : 'opacity-100'}`}>
               <div className="flex space-x-1.5 mb-2 items-center">
                   <div className="w-1 h-1 bg-bio-cyan/40 rounded-full"></div>
                   <div className="w-8 h-[1px] bg-white/10"></div>
                   <Activity size={10} className="text-bio-cyan animate-pulse" />
                   <div className="w-8 h-[1px] bg-white/10"></div>
                   <div className="w-1 h-1 bg-bio-cyan/40 rounded-full"></div>
               </div>
               <div className="text-[9px] font-mono tracking-[0.5em] text-white/50 uppercase font-bold">{creature.name}</div>
          </div>

          <StatBar value={stats.energy} max={stats.maxEnergy} color="text-alert-amber" label="ENERGY" icon={Battery} isStressed={isStressed} stability={stability} />
      </div>

      {/* HOME CONTEXTUAL HINTS */}
      {isHome && (
          <div className="absolute bottom-24 w-full flex flex-col items-center pointer-events-none space-y-4">
               <div className="flex flex-col items-center space-y-4 opacity-70 animate-[pulse_5s_infinite]">
                    <div className="text-[9px] font-mono text-bio-cyan tracking-[0.6em] uppercase bg-black/60 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                        SWIPE UP / DEPLOY
                    </div>
                    <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-bio-cyan/50 to-transparent"></div>
               </div>
          </div>
      )}

      {/* TRAY LAYER */}
      <div 
        style={trayStyle}
        className={`absolute inset-0 top-24 bg-gray-950/90 backdrop-blur-3xl border-t border-white/15 rounded-t-[3.5rem] transition-transform duration-700 cubic-bezier(0.19, 1, 0.22, 1) ${trayTransform} pointer-events-auto shadow-[0_-30px_120px_rgba(0,0,0,1)] flex flex-col z-50 ${isStressed ? 'animate-shake' : ''}`}
      >
          {/* Handle */}
          <div className="w-full h-14 flex justify-center items-center shrink-0 cursor-grab active:cursor-grabbing group">
              <div className="relative w-20 h-1 rounded-full bg-white/10 group-hover:bg-white/25 transition-all overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bio-cyan/30 to-transparent animate-[slideInRight_4s_infinite]"></div>
              </div>
          </div>

          <div className="flex-1 w-full overflow-hidden px-8 pb-12 relative">
             {onNavigate && <Screen gameState={gameState} onNavigate={onNavigate} />}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent pointer-events-none"></div>
      </div>

      {/* STAGED EVOLUTION SEQUENCE */}
      {evolution.phase === 2 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/80 backdrop-blur-2xl z-[100] animate-focus-snap">
               <div className="relative w-32 h-32 mb-10">
                   <div className="absolute inset-0 border-2 border-bio-cyan/20 rounded-full animate-ping"></div>
                   <div className="absolute inset-2 border-t-2 border-bio-cyan rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                        <Triangle size={40} className="text-bio-cyan animate-pulse" />
                   </div>
               </div>
               <div className="flex flex-col items-center space-y-4">
                   <div className="text-sm font-mono text-bio-cyan tracking-[0.6em] animate-pulse font-bold">
                       SYNC_RESONANCE
                   </div>
                   <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <div 
                            className="h-full bg-bio-cyan shadow-[0_0_15px_#22D3EE] transition-all duration-300"
                            style={{ width: `${evolution.progress}%` }}
                        ></div>
                   </div>
                   <div className="text-[10px] text-bio-cyan/50 font-mono uppercase">Hold to maintain link</div>
               </div>
          </div>
      )}
    </div>
  );
};
