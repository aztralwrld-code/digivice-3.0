import React from 'react';

interface SignalProcessorProps {
    children: React.ReactNode;
    clarity: number; // 0.0 - 1.0 (Trust/Bond)
    stability: number; // 0.0 - 1.0 (Sanity/Glitches)
    stress: number; // 0.0 - 1.0 (Aggression/Heat)
}

export const SignalProcessor: React.FC<SignalProcessorProps> = ({ children, clarity, stability, stress }) => {
    
    // 1. Calculate Filters (NO BLUR on main content)
    
    // Low Clarity = Grayscale + Noise (The "Encryption Wall")
    const grayscaleAmount = Math.max(0, (1 - clarity) * 90);
    
    // Low Stability = Contrast Boost + RGB Misalignment
    const contrastAmount = 100 + ((1 - stability) * 30);

    // High Stress = Saturation Boost + Red Shift
    const saturateAmount = 100 + (stress * 40);
    const sepiaAmount = stress * 20; // Slight sepia for "heat"

    const wrapperStyle: React.CSSProperties = {
        filter: `grayscale(${grayscaleAmount}%) contrast(${contrastAmount}%) saturate(${saturateAmount}%) sepia(${sepiaAmount}%)`,
        transition: 'filter 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div style={wrapperStyle} className="signal-layer">
            
            {/* 2. Visual Artifacts Layers */}

            {/* A. NOISE FLOOR (Static) - Clarity Indicator */}
            {/* Visible at low Clarity. Does not blur text, just adds texture. */}
            <div 
                className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                    opacity: Math.max(0, (1 - clarity) * 0.15) // Reduced opacity for subtle grain
                }}
            ></div>

            {/* B. CHROMATIC ABERRATION (Misalignment) - Stability Indicator */}
            {stability < 0.7 && (
                <div className="absolute inset-0 pointer-events-none z-40 animate-pulse mix-blend-screen overflow-hidden" style={{ opacity: (1 - stability) * 0.5 }}>
                     <div className="absolute inset-0 translate-x-[1px] text-red-500/20 mix-blend-multiply"></div>
                     <div className="absolute inset-0 -translate-x-[1px] text-blue-500/20 mix-blend-multiply"></div>
                </div>
            )}

            {/* C. SCANLINES - Context Texture */}
            <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%] opacity-10"></div>

            {/* D. DEAD PIXELS - Trauma/Critical Stability only */}
            {stability < 0.2 && (
                <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-black pointer-events-none z-50 opacity-90 mask-image-[radial-gradient(circle,black_50%,transparent_100%)]"></div>
            )}

            {/* E. CONTENT LAYER - Remains Sharp */}
            {children}
            
            {/* F. VIGNETTE - Stress Indicator */}
            {/* Darkens edges, keeps center sharp */}
            <div 
                className="absolute inset-0 pointer-events-none z-50"
                style={{
                    background: `radial-gradient(circle at center, transparent 60%, rgba(0,0,0,${stress * 0.6}) 100%)`
                }}
            ></div>

        </div>
    );
};