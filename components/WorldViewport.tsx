
import React, { useEffect, useState, useMemo } from 'react';
import { GameState, ScreenMode, BootPhase, EvolutionPhase } from '../types';
import { DigimonSprite } from './DigimonSprite';
import { SignalProcessor } from './SignalProcessor';
import { Fingerprint, Cpu, ShieldCheck, Activity, Lock, Disc, Terminal, CheckCircle2 } from 'lucide-react';

interface WorldViewportProps {
    gameState: GameState;
}

const TitleScreen = () => {
    const [blink, setBlink] = useState(true);
    useEffect(() => {
        const i = setInterval(() => setBlink(p => !p), 800);
        return () => clearInterval(i);
    }, []);

    return (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[length:40px_40px] opacity-20 perspective-[500px] rotate-x-12 animate-[pulse_4s_infinite]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)]"></div>

            <div className="relative z-10 flex flex-col items-center transform scale-105">
                <div className="relative mb-2">
                    <Disc className="text-bio-cyan absolute -left-8 -top-2 animate-spin-slow opacity-50" size={32} />
                    <div className="text-6xl font-tech font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 tracking-tighter filter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-float">
                        DIGICORE
                    </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-2 opacity-80">
                    <div className="h-[1px] w-8 bg-bio-cyan/50"></div>
                    <div className="text-xs font-mono text-bio-cyan tracking-[0.4em]">PROJECT VER. 1.0</div>
                    <div className="h-[1px] w-8 bg-bio-cyan/50"></div>
                </div>

                <div className={`mt-32 flex flex-col items-center space-y-2 transition-opacity duration-300 ${blink ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">System Standby</div>
                    <div className="text-sm font-bold text-white tracking-widest border border-white/20 px-4 py-2 rounded bg-white/5 backdrop-blur-sm">
                        TOUCH TO INITIALIZE
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-8 text-[9px] text-gray-700 font-mono tracking-widest uppercase">
                © Digital Monster Labs // Secure Link
            </div>
        </div>
    );
};

const BootSequence = ({ phase, scanProgress }: { phase: BootPhase, scanProgress: number }) => {
    // Randomized hardware checks for authenticity
    const checks = useMemo(() => [
        { label: 'MEM_INTEGRITY', addr: '0x000FF1', status: 'OK' },
        { label: 'BIO_KERNEL', addr: '0x88A23C', status: 'OK' },
        { label: 'NET_INTERFACE', addr: '0x55F101', status: 'CONNECTED' },
        { label: 'CRYPTO_SHARD', addr: '0x99B002', status: 'VERIFIED' },
        { label: 'GPS_TRIANGULATION', addr: '0x12C55A', status: 'LOCKED' },
        { label: 'HAPTIC_ENGINE', addr: '0x33A001', status: 'ACTIVE' },
        { label: 'EVO_MATRIX', addr: '0xFF009A', status: 'READY' },
    ], []);

    const [visibleChecks, setVisibleChecks] = useState<number>(0);

    useEffect(() => {
        if (phase === BootPhase.HARDWARE_CHECK) {
            setVisibleChecks(0);
            const interval = setInterval(() => {
                setVisibleChecks(prev => Math.min(checks.length, prev + 1));
            }, 300); // Fast scrolling
            return () => clearInterval(interval);
        }
    }, [phase, checks]);

    return (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono overflow-hidden">
            {/* Visual Hum Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                 <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_70%)] animate-pulse"></div>
            </div>

            {/* PHASE 1: HARDWARE CHECK */}
            {phase === BootPhase.HARDWARE_CHECK && (
                <div className="w-72 space-y-2 animate-focus-snap">
                    <div className="flex items-center space-x-2 text-bio-cyan mb-6 border-b border-bio-cyan/30 pb-2">
                        <Terminal size={14} className="animate-pulse" />
                        <span className="text-xs tracking-widest font-bold">BOOT_SEQUENCE_INIT</span>
                    </div>
                    {checks.slice(0, visibleChecks).map((check, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1 animate-slide-in-right">
                            <span className="text-gray-600 font-mono">[{check.addr}]</span>
                            <span className="text-gray-300 tracking-widest flex-1 ml-3">{check.label}</span>
                            <span className="text-bio-cyan font-bold flex items-center"><CheckCircle2 size={8} className="mr-1" /> {check.status}</span>
                        </div>
                    ))}
                    {visibleChecks === checks.length && (
                        <div className="mt-6 text-[10px] text-synapse-pink animate-pulse text-center tracking-[0.2em] font-bold border border-synapse-pink/20 py-1 bg-synapse-pink/5 rounded">
                            >> KERNEL LOAD REQUESTED <<
                        </div>
                    )}
                </div>
            )}

            {/* PHASE 2: KERNEL LOAD */}
            {phase === BootPhase.KERNEL_LOAD && (
                <div className="flex flex-col items-center space-y-8 animate-focus-snap">
                    <div className="relative">
                        {/* Progress Circle */}
                        <svg className="w-32 h-32 -rotate-90">
                            <circle cx="64" cy="64" r="60" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                            <circle 
                                cx="64" cy="64" r="60" 
                                stroke="#22D3EE" strokeWidth="2" fill="none" 
                                strokeDasharray={377} strokeDashoffset={377 - (377 * scanProgress / 100)}
                                className="transition-all duration-75"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Cpu className="text-bio-cyan animate-pulse mb-1" size={32} />
                            <span className="text-xs font-bold text-white font-mono">{Math.floor(scanProgress)}%</span>
                        </div>
                        <div className="absolute inset-0 w-32 h-32 rounded-full border-t-2 border-bio-cyan animate-spin"></div>
                    </div>
                    
                    <div className="text-center space-y-2">
                        <div className="text-xs text-bio-cyan tracking-[0.4em] font-bold">NEURAL_LINK</div>
                        <div className="text-[9px] text-gray-500 font-mono uppercase tracking-[0.2em]">Syncing Emotional Cores...</div>
                    </div>
                </div>
            )}

            {/* PHASE 3: BIOMETRIC HANDSHAKE */}
            {phase === BootPhase.BIOMETRIC_HANDSHAKE && (
                <div className="flex flex-col items-center space-y-10 animate-focus-snap">
                    <div className="relative group cursor-pointer active:scale-95 transition-transform duration-200">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-bio-cyan/20 blur-3xl rounded-full animate-pulse"></div>
                        
                        {/* Fingerprint Scanner UI */}
                        <div className="relative z-10 w-28 h-28 border border-white/10 bg-white/[0.03] rounded-3xl flex items-center justify-center backdrop-blur-md shadow-premium-inner ring-1 ring-bio-cyan/30 ring-offset-2 ring-offset-black transition-all active:ring-bio-cyan active:bg-bio-cyan/10">
                            <Fingerprint size={64} className="text-bio-cyan animate-float opacity-80" strokeWidth={1} />
                            
                            {/* Scanning Line */}
                            <div className="absolute inset-0 border-b-2 border-bio-cyan/50 animate-[unfoldY_1.5s_infinite_alternate] opacity-50 bg-gradient-to-b from-transparent to-bio-cyan/10"></div>
                        </div>
                        
                        {/* Ping Animation */}
                        <div className="absolute -inset-6 border border-bio-cyan/20 rounded-full scale-110 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"></div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-3">
                        <div className="flex items-center space-x-2 text-bio-cyan/80">
                            <Lock size={14} />
                            <span className="text-[10px] tracking-[0.5em] font-bold">SECURITY_GATE</span>
                        </div>
                        <div className="text-xs font-bold text-white tracking-[0.2em] animate-pulse bg-white/10 px-8 py-3 rounded-full border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            TOUCH TO VERIFY
                        </div>
                    </div>
                </div>
            )}

            {/* PHASE 4: SYSTEM READY */}
            {phase === BootPhase.SYSTEM_READY && (
                <div className="flex flex-col items-center animate-focus-snap">
                    <div className="relative mb-8">
                        <ShieldCheck size={80} className="text-green-400 drop-shadow-[0_0_25px_rgba(74,222,128,0.6)]" />
                        <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping opacity-50"></div>
                    </div>
                    <div className="text-3xl font-tech font-bold text-white tracking-[0.2em] uppercase mb-2">ACCESS GRANTED</div>
                    <div className="text-[10px] text-green-400 font-mono tracking-widest bg-green-900/20 px-4 py-1.5 rounded border border-green-500/20">
                        WELCOME BACK, TAMER
                    </div>
                    <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none mix-blend-screen"></div>
                </div>
            )}

            {/* CRT Scanline Overlay for retro feel */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_3px,3px_100%] opacity-30"></div>
        </div>
    );
};

export const WorldViewport: React.FC<WorldViewportProps> = ({ gameState }) => {
    const { creature, bootPhase, currentScreen, evolution, scanProgress } = gameState;
    const kernel = creature.kernel.axes;
    
    const signalClarity = Math.max(0.1, kernel.trust / 100);
    const signalStability = Math.max(0.1, kernel.stability / 100);
    const stressLevel = kernel.stress / 100;

    const atmosphere = useMemo(() => {
        const mood = creature.condition.mood;
        switch(mood) {
            case 'ANGRY': return { bg: 'bg-[radial-gradient(circle_at_center,#450a0a_0%,#000000_100%)]', ambient: 'bg-red-900/20' };
            case 'SAD': return { bg: 'bg-[radial-gradient(circle_at_center,#0f172a_0%,#000000_100%)]', ambient: 'bg-blue-900/20' };
            case 'HAPPY': return { bg: 'bg-[radial-gradient(circle_at_center,#064e3b_0%,#000000_100%)]', ambient: 'bg-green-500/10' };
            case 'HYPER': return { bg: 'bg-[radial-gradient(circle_at_center,#4a044e_0%,#000000_100%)]', ambient: 'bg-pink-500/10' };
            case 'FRACTURED': return { bg: 'bg-[radial-gradient(circle_at_center,#111827_0%,#000000_100%)]', ambient: 'bg-white/5' };
            case 'REFUSING': return { bg: 'bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000000_100%)]', ambient: 'bg-gray-500/5' };
            default: return { bg: 'bg-[radial-gradient(circle_at_center,#111827_0%,#000000_100%)]', ambient: 'bg-bio-cyan/5' };
        }
    }, [creature.condition.mood]);

    if (currentScreen === ScreenMode.TITLE) return <TitleScreen />;
    if (currentScreen === ScreenMode.BOOT || currentScreen === ScreenMode.LOGIN) return <BootSequence phase={bootPhase} scanProgress={scanProgress} />;

    return (
        <div className="absolute inset-0 z-0 overflow-hidden flex flex-col items-center justify-center bg-gray-950">
            <SignalProcessor clarity={signalClarity} stability={signalStability} stress={stressLevel}>
                <div className="absolute inset-0 transition-all duration-[2000ms] ease-in-out">
                    <div className={`absolute inset-0 transition-colors duration-[2000ms] ${atmosphere.bg}`}></div>
                    <div className={`absolute inset-0 ${atmosphere.ambient} transition-all duration-[2000ms] opacity-50 mix-blend-screen`}></div>
                    
                    {/* Perspective Grid Floor */}
                    <div className="absolute bottom-[-20%] w-[300%] h-[120%] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:60px_60px] [transform:rotateX(75deg)_translateX(-33%)] opacity-30 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                </div>

                {/* DIGIMON STAGING AREA (60-70% height guaranteed) */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-8">
                    <div className="w-full h-[65vh] flex items-center justify-center animate-float">
                        <div className="h-full aspect-square relative">
                            <DigimonSprite 
                                speciesId={creature.id}
                                stage={creature.stage} 
                                mood={creature.condition.mood}
                                stress={kernel.stress}
                                stability={kernel.stability}
                                signalQuality={signalClarity}
                                evolutionPhase={evolution.phase}
                                evolutionProgress={evolution.progress}
                            />
                        </div>
                    </div>
                </div>
                
                {creature.condition.isSleeping && (
                    <div className="absolute inset-0 bg-blue-900/50 mix-blend-multiply pointer-events-none transition-opacity duration-2000"></div>
                )}
            </SignalProcessor>
        </div>
    );
};
