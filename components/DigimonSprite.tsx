import React, { useMemo } from 'react';
import { DigimonStage, EvolutionPhase } from '../types';

interface SpriteProps {
    speciesId: string;
    stage: DigimonStage;
    mood: string;
    stress: number;
    stability: number;
    signalQuality?: number;
    evolutionPhase?: EvolutionPhase;
    evolutionProgress?: number;
}

const SpriteSVG: React.FC<{ speciesId: string, stage: DigimonStage, mood: string, color: string, phase: EvolutionPhase, progress: number }> = ({ speciesId, stage, mood, color, phase, progress }) => {
    const isRewriting = phase === EvolutionPhase.DATA_REWRITE;
    const isSyncing = phase === EvolutionPhase.SYNCING;
    
    // Staged visibility and line weight based on evolution stage
    const bodyOpacity = isRewriting ? 0.3 : (isSyncing ? 0.85 + (progress / 1000) : 1);
    const fill = isRewriting ? "none" : "currentColor";
    const stroke = (isRewriting || isSyncing) ? "currentColor" : "none";
    const strokeWidth = isRewriting ? "0.6" : (isSyncing ? (0.2 + (progress/200)).toString() : "0");

    const eyesOpen = mood !== 'SLEEPING' && mood !== 'TIRED' && mood !== 'REFUSING';
    
    const Face = ({ x, y, scale = 1 }: { x: number, y: number, scale?: number }) => (
        !isRewriting ? (
            <g transform={`translate(${x}, ${y}) scale(${scale})`} className="mix-blend-overlay" fill="white">
                <g transform={mood === 'HAPPY' ? "translate(0, -1)" : ""}>
                    {mood === 'ANGRY' ? (
                        <>
                            <path d="M-3 -1 L3 1 L-3 3 Z" />
                            <path d="M13 -1 L7 1 L13 3 Z" />
                        </>
                    ) : (
                        <>
                            <ellipse cx="0" cy="0" rx={2.2} ry={eyesOpen ? 2.8 : 0.4} />
                            <ellipse cx="10" cy="0" rx={2.2} ry={eyesOpen ? 2.8 : 0.4} />
                        </>
                    )}
                </g>
                {mood === 'HAPPY' && <path d="M3 5 Q5 7 7 5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
                {mood === 'SAD' && <path d="M3 6 Q5 4 7 6" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
                {mood === 'ANGRY' && <path d="M3 6 L7 6" stroke="white" strokeWidth="1.2" fill="none" />}
                {mood === 'NEUTRAL' && <circle cx="5" cy="5.5" r="0.8" />}
                {mood === 'REFUSING' && <path d="M3 6 L7 6" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />}
            </g>
        ) : null
    );

    if (speciesId === 'botamon') {
        return (
            <svg viewBox="0 0 60 60" className={`w-full h-full overflow-visible transition-all duration-700 ${color}`} style={{ opacity: bodyOpacity }}>
                <path d="M15 35 C10 35 5 25 15 15 C25 5 35 5 45 15 C55 25 50 35 45 35 C40 35 35 32 30 32 C25 32 20 35 15 35 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                <Face x={20} y={22} />
            </svg>
        );
    }

    if (speciesId === 'agumon') {
        return (
            <svg viewBox="0 0 80 80" className={`w-full h-full overflow-visible transition-all duration-700 ${color}`} style={{ opacity: bodyOpacity }}>
                <path d="M20 50 Q10 40 10 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" className="opacity-30" />
                <path d="M30 30 C20 30 20 55 30 60 C40 65 50 60 50 50 C50 40 40 30 30 30 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                <path d="M30 20 C20 20 20 40 30 40 L50 40 C60 40 60 20 50 20 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                <path d="M25 60 L20 70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <path d="M45 60 L50 70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <Face x={35} y={30} />
            </svg>
        );
    }

    if (speciesId === 'betamon') {
        return (
            <svg viewBox="0 0 80 80" className={`w-full h-full overflow-visible transition-all duration-700 ${color}`} style={{ opacity: bodyOpacity }}>
                <path d="M40 10 L40 40 L60 20 Z" fill="currentColor" className="opacity-25" />
                <path d="M20 40 C10 40 10 60 30 60 L50 60 C70 60 70 40 50 40 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                <circle cx="20" cy="65" r="3.5" fill="currentColor" />
                <circle cx="60" cy="65" r="3.5" fill="currentColor" />
                <Face x={30} y={48} />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 48 48" className={`w-full h-full overflow-visible transition-all duration-700 ${color}`} style={{ opacity: bodyOpacity }}>
            <rect x="14" y="14" width="20" height="24" rx="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            <Face x={19} y={22} />
        </svg>
    );
};

export const DigimonSprite: React.FC<SpriteProps> = ({ 
    speciesId, stage, mood, stress, stability, signalQuality = 1.0, evolutionPhase = EvolutionPhase.IDLE, evolutionProgress = 0
}) => {
    
    // 1. Posture Layer (Emotional timing & body language)
    const postureTransform = useMemo(() => {
        if (evolutionPhase === EvolutionPhase.SYNCING) return `translateY(-${evolutionProgress/10}%) scale(${1 + evolutionProgress/400})`;
        if (evolutionPhase === EvolutionPhase.DATA_REWRITE) return 'scale(0.85) rotate(8deg)';
        
        switch (mood) {
            case 'HAPPY': return 'scaleY(1.02) translateY(-3%)';
            case 'SAD': return 'scaleY(0.95) translateY(2%) skewX(1deg)';
            case 'ANGRY': return 'scale(1.1) skewX(-3deg) translateY(-2%)';
            case 'TIRED': return 'scaleY(0.97) rotate(1deg) translateY(1.5%)';
            case 'HYPER': return 'scale(1.08) translateY(-5%) rotate(2deg)';
            case 'FRACTURED': return 'scale(0.9) skewY(3deg) rotate(-2deg)';
            case 'REFUSING': return 'scale(0.95) skewX(2deg) translateX(-2%)';
            default: return 'scale(1)';
        }
    }, [mood, evolutionPhase, evolutionProgress]);

    // 2. Color & Glow (Staged evolution intensity)
    const { primaryColor, glowColor, glowSize } = useMemo(() => {
        if (evolutionPhase !== EvolutionPhase.IDLE) {
            const intensity = (evolutionProgress / 100);
            return { 
                primaryColor: "text-white", 
                glowColor: `rgba(255, 255, 255, ${0.4 + intensity * 0.6})`,
                glowSize: 20 + intensity * 60
            };
        }
        switch(mood) {
            case 'ANGRY': return { primaryColor: "text-red-500", glowColor: "rgba(239, 68, 68, 0.4)", glowSize: 15 };
            case 'SAD': return { primaryColor: "text-blue-400", glowColor: "rgba(96, 165, 250, 0.2)", glowSize: 10 };
            case 'HAPPY': return { primaryColor: "text-yellow-400", glowColor: "rgba(250, 204, 21, 0.5)", glowSize: 20 };
            case 'HYPER': return { primaryColor: "text-synapse-pink", glowColor: "rgba(244, 114, 182, 0.5)", glowSize: 25 };
            case 'FRACTURED': return { primaryColor: "text-white", glowColor: "rgba(255, 255, 255, 0.3)", glowSize: 12 };
            case 'REFUSING': return { primaryColor: "text-gray-500", glowColor: "rgba(107, 114, 128, 0.2)", glowSize: 5 };
            default: return { primaryColor: "text-bio-cyan", glowColor: "rgba(34, 211, 238, 0.3)", glowSize: 15 };
        }
    }, [mood, evolutionPhase, evolutionProgress]);

    // Micro-movements layer (Jitter for stress/instability)
    const jitterClass = stress > 70 || stability < 30 ? 'animate-jitter' : '';

    return (
        <div 
            className="relative w-full h-full flex items-center justify-center transition-all duration-1000"
            style={{ 
                filter: `drop-shadow(0 0 ${glowSize}px ${glowColor})`,
                opacity: 0.8 + (signalQuality * 0.2)
            }}
        >
            {/* 1. JITTER LAYER (Micro-movements) */}
            <div className={`w-full h-full flex items-center justify-center ${jitterClass}`}>
                
                {/* 2. POSTURE LAYER (Emotion/Timing) */}
                <div 
                    className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-engine origin-bottom"
                    style={{ transform: postureTransform }}
                >
                    {/* 3. BREATHING LAYER (Life cycle) */}
                    <div className="w-full h-full flex items-center justify-center animate-breathe origin-bottom">
                        <SpriteSVG 
                            speciesId={speciesId}
                            stage={stage} 
                            mood={mood} 
                            color={primaryColor} 
                            phase={evolutionPhase}
                            progress={evolutionProgress}
                        />
                    </div>
                </div>
            </div>

            {/* SYNCING RADIANCE - The consent-based "staged" feel */}
            {evolutionPhase === EvolutionPhase.SYNCING && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div 
                        className="border-2 border-white/20 rounded-full transition-all duration-200"
                        style={{ 
                            width: `${100 + evolutionProgress}%`, 
                            height: `${100 + evolutionProgress}%`, 
                            opacity: (evolutionProgress / 100) * 0.5,
                            transform: `rotate(${evolutionProgress * 3.6}deg)`
                        }}
                    ></div>
                    <div 
                        className="absolute inset-0 bg-white/10 rounded-full blur-2xl"
                        style={{ 
                            opacity: (evolutionProgress / 100) * 0.4,
                            transform: `scale(${1 + evolutionProgress/200})`
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
};