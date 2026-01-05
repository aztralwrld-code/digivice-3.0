
import React from 'react';
import { GameState, ScreenMode } from '../types';
import { ShoppingBag, Activity, Dna, Zap, Moon, Brain, Utensils, ChevronLeft, Settings, User, Battery, Power, Shield, Volume2, Palette, Eye, Layout, Type } from 'lucide-react';
import { DIGIMON_DATABASE, SHOP_ITEMS } from '../constants';

interface ScreenProps {
  gameState: GameState;
  onNavigate: (mode: ScreenMode) => void;
}

const MenuGridItem = ({ icon: Icon, label, color, onClick, delay }: any) => (
    <div 
        onClick={onClick}
        className="aspect-square bg-white/[0.03] border border-white/5 rounded-[1.5rem] flex flex-col items-center justify-center space-y-2.5 cursor-pointer 
        active:scale-90 active:bg-white/10 transition-all duration-300 group relative overflow-hidden animate-[focusSnap_0.5s_ease-out_forwards]"
        style={{ animationDelay: `${delay}s`, opacity: 0 }}
    >
        <div className={`p-3 rounded-full bg-gray-900/40 ${color.replace('text-', 'group-hover:text-')} transition-colors border border-white/5`}>
            <Icon size={22} className={`text-gray-500 group-hover:text-white transition-colors duration-300 ${color}`} />
        </div>
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors uppercase">{label}</span>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-tr from-transparent via-white/5 to-white transition-opacity duration-500`}></div>
    </div>
);

const Header = ({ title, showBack = false, onBack }: { title: string, showBack?: boolean, onBack?: () => void }) => (
    <div className="flex items-center space-x-4 mb-6 select-none cursor-default shrink-0">
        {showBack && (
            <div onClick={onBack} className="cursor-pointer active:scale-75 transition-transform p-2 bg-white/5 rounded-full hover:bg-white/10 border border-white/5">
                <ChevronLeft size={18} className="text-gray-400 hover:text-white" />
            </div>
        )}
        <h1 className="text-2xl font-tech font-bold text-white tracking-[0.2em] uppercase">{title}</h1>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
    </div>
);

const SettingRow = ({ label, value, type = 'toggle', onClick }: { label: string, value?: string | boolean, type?: 'toggle' | 'value' | 'action', onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl active:bg-white/5 transition-all group cursor-pointer shadow-premium-inner"
    >
        <span className="text-[11px] text-gray-400 font-mono tracking-wider group-hover:text-white transition-colors uppercase">{label}</span>
        {type === 'toggle' && (
            <div className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-bio-cyan/40' : 'bg-gray-800'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${value ? 'left-6' : 'left-1'}`}></div>
            </div>
        )}
        {type === 'value' && <span className="text-[11px] text-bio-cyan font-bold font-mono">{value}</span>}
        {type === 'action' && <ChevronLeft size={14} className="text-gray-600 rotate-180" />}
    </div>
);

export const Screen: React.FC<ScreenProps> = ({ gameState, onNavigate }) => {
  const { currentScreen, creature } = gameState;
  const staticData = DIGIMON_DATABASE[creature.id];
  
  const renderDesignGuide = () => (
      <div className="h-full flex flex-col animate-slide-in-right">
           <Header title="VISUAL SPECS" showBack onBack={() => onNavigate(ScreenMode.SETTINGS)} />
           
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-1 pb-10">
                {/* 1. PALETTE */}
                <section>
                    <div className="flex items-center space-x-2 mb-4 opacity-50">
                        <Palette size={12} className="text-white" />
                        <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">Chromatics</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <div className="aspect-square rounded-2xl bg-bio-cyan shadow-cyan-glow"></div>
                            <div className="text-[8px] font-mono text-center text-bio-cyan">#22D3EE</div>
                        </div>
                        <div className="space-y-2">
                            <div className="aspect-square rounded-2xl bg-synapse-pink shadow-pink-glow"></div>
                            <div className="text-[8px] font-mono text-center text-synapse-pink">#F472B6</div>
                        </div>
                        <div className="space-y-2">
                            <div className="aspect-square rounded-2xl bg-alert-amber shadow-amber-glow"></div>
                            <div className="text-[8px] font-mono text-center text-alert-amber">#F59E0B</div>
                        </div>
                    </div>
                </section>

                {/* 2. MATERIALS */}
                <section>
                    <div className="flex items-center space-x-2 mb-4 opacity-50">
                        <Layout size={12} className="text-white" />
                        <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">Materials</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl premium-blur shadow-premium-inner">
                            <div className="text-[10px] text-white font-tech tracking-widest uppercase mb-1">Frosted Glass</div>
                            <div className="text-[8px] text-gray-500 font-mono">BACKDROP-BLUR: 20PX | SATURATE: 180%</div>
                        </div>
                        <div className="p-4 bg-ceramic-dark border border-white/[0.02] rounded-2xl shadow-premium-edge">
                            <div className="text-[10px] text-white font-tech tracking-widest uppercase mb-1">Ceramic Obsidian</div>
                            <div className="text-[8px] text-gray-500 font-mono">DIFFUSE: 0.05 | SPECULAR: HIGH</div>
                        </div>
                    </div>
                </section>

                {/* 3. TYPOGRAPHY */}
                <section>
                    <div className="flex items-center space-x-2 mb-4 opacity-50">
                        <Type size={12} className="text-white" />
                        <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">Typography</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="border-l border-bio-cyan/30 pl-4">
                            <div className="text-2xl font-tech text-white uppercase tracking-tighter">RAJ-DHANI SEVEN</div>
                            <div className="text-[8px] font-mono text-bio-cyan/60">HEADER / HIGH IMPACT / TECH-SIGNAL</div>
                        </div>
                        <div className="border-l border-white/10 pl-4">
                            <div className="text-base font-sans text-white/90">Inter Dynamic Sans</div>
                            <div className="text-[8px] font-mono text-gray-600 uppercase">Utility / Body / Reading Text</div>
                        </div>
                        <div className="border-l border-synapse-pink/30 pl-4">
                            <div className="text-sm font-mono text-synapse-pink">JETBRAINS_MONO_CORE</div>
                            <div className="text-[8px] font-mono text-synapse-pink/40">DATA_ARRAYS / SYSTEM_LOGS / IO</div>
                        </div>
                    </div>
                </section>

                {/* 4. ACCESSIBILITY */}
                <section>
                    <div className="flex items-center space-x-2 mb-4 opacity-50">
                        <Eye size={12} className="text-white" />
                        <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">Universal Signals</h2>
                    </div>
                    <div className="p-4 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
                        <ul className="text-[9px] font-mono text-gray-400 space-y-2 list-disc pl-3">
                            <li>REDUCED MOTION: Snap transitions replace spring physics.</li>
                            <li>HIGH CONTRAST: Luminosity > Hue for status detection.</li>
                            <li>HAPTIC SYNC: Pulse feedback tied to core breathing.</li>
                        </ul>
                    </div>
                </section>
           </div>
      </div>
  );

  const renderMainMenu = () => (
      <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-6 opacity-60">
              <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">System Launcher</span>
              <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-bio-cyan rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
              </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 auto-rows-min">
              <MenuGridItem icon={User} label="Partner" color="text-bio-cyan" delay={0.05} onClick={() => onNavigate(ScreenMode.STATUS)} /> 
              <MenuGridItem icon={Utensils} label="Feed" color="text-synapse-pink" delay={0.1} onClick={() => onNavigate(ScreenMode.INVENTORY)} />
              <MenuGridItem icon={Dna} label="Train" color="text-alert-amber" delay={0.15} onClick={() => onNavigate(ScreenMode.TRAIN)} />
              <MenuGridItem icon={ShoppingBag} label="Market" color="text-white" delay={0.2} onClick={() => onNavigate(ScreenMode.SHOP)} />
              <MenuGridItem icon={Brain} label="Archive" color="text-blue-400" delay={0.25} onClick={() => onNavigate(ScreenMode.DIGIDEX)} />
              <MenuGridItem icon={Moon} label="Sleep" color="text-purple-400" delay={0.3} onClick={() => onNavigate(ScreenMode.SLEEP)} />
              <div className="col-span-3 mt-4 pt-4 border-t border-white/5">
                 <MenuGridItem icon={Settings} label="System Settings" color="text-gray-400" delay={0.35} onClick={() => onNavigate(ScreenMode.SETTINGS)} />
              </div>
          </div>
      </div>
  );

  const renderStatus = () => (
      <div className="h-full flex flex-col animate-slide-in-right">
           <Header title="Partner Profile" showBack onBack={() => onNavigate(ScreenMode.MENU)} />
           
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1 pb-4">
               {/* Identity Card */}
               <div className="p-6 bg-gradient-to-br from-white/10 to-white/[0.02] rounded-[2rem] border border-white/10 flex items-start space-x-5 relative overflow-hidden group shadow-premium-inner">
                   <div className="absolute top-[-20%] right-[-10%] p-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 rotate-12 scale-150"><Dna size={120} /></div>
                   <div className="w-20 h-20 bg-black/60 rounded-2xl border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                       <Activity size={32} className="text-bio-cyan animate-pulse" />
                   </div>
                   <div className="relative z-10 flex-1">
                       <div className="text-3xl font-tech font-bold text-white tracking-tighter mb-0.5">{creature.name.toUpperCase()}</div>
                       <div className="text-[11px] text-bio-cyan font-mono tracking-[0.3em] mb-3 opacity-80">{staticData.species}</div>
                       <div className="flex items-center space-x-2">
                           <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-[9px] text-blue-300 font-mono border border-blue-500/20 uppercase">{staticData.attribute}</span>
                           <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-[9px] text-purple-300 font-mono border border-purple-500/20 uppercase">{creature.stage}</span>
                       </div>
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                   {[
                       { label: 'Weight', value: `${creature.stats.weight} GB`, color: 'text-white' },
                       { label: 'Cycle', value: `${creature.stats.age} Days`, color: 'text-white' },
                       { label: 'Mood', value: creature.condition.mood, color: 'text-bio-cyan' },
                       { label: 'Resonance', value: `${creature.kernel.axes.sync.toFixed(0)}%`, color: 'text-synapse-pink' },
                   ].map((stat, i) => (
                       <div key={i} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex flex-col justify-between hover:bg-white/[0.05] transition-colors shadow-premium-inner">
                           <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">{stat.label}</div>
                           <div className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</div>
                       </div>
                   ))}
               </div>
               
               <div className="p-5 bg-black/30 rounded-[1.5rem] border border-white/5 relative shadow-premium-edge">
                   <div className="flex items-center space-x-2 mb-3 opacity-40">
                       <Shield size={12} className="text-white" />
                       <span className="text-[10px] font-mono text-white uppercase tracking-widest">Archive Log</span>
                   </div>
                   <p className="text-[11px] text-gray-400 italic leading-relaxed font-sans">
                       "{staticData.description}"
                   </p>
               </div>
           </div>
      </div>
  );

  const renderSettings = () => (
    <div className="h-full flex flex-col animate-slide-in-right">
         <Header title="Config Terminal" showBack onBack={() => onNavigate(ScreenMode.MENU)} />
         
         <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-1 pb-4">
             <div className="space-y-3">
                 <div className="flex items-center space-x-2 mb-1 pl-1">
                     <Volume2 size={12} className="text-gray-500" />
                     <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Interface & Audio</div>
                 </div>
                 <SettingRow label="Haptic Engine" value={true} type="toggle" />
                 <SettingRow label="Ambient Kernel Hum" value={true} type="toggle" />
                 <SettingRow label="System Volume" value="80%" type="value" />
             </div>

             <div className="space-y-3">
                 <div className="flex items-center space-x-2 mb-1 pl-1">
                     <Shield size={12} className="text-gray-500" />
                     <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Specifications</div>
                 </div>
                 <SettingRow label="Visual Style Guide" type="action" onClick={() => onNavigate(ScreenMode.DESIGN_GUIDE)} />
             </div>

             <div className="space-y-3 pt-4">
                 <div className="text-[10px] text-red-900/60 font-mono uppercase pl-1 tracking-widest">Danger Zone</div>
                 <div className="border border-red-900/30 bg-red-950/10 rounded-2xl p-4 flex justify-between items-center group active:bg-red-950/30 transition-all cursor-pointer">
                     <div className="flex flex-col">
                         <span className="text-[11px] text-red-500 font-mono font-bold uppercase">Purge Local Data</span>
                         <span className="text-[9px] text-red-900 font-mono">Irreversible kernel reset</span>
                     </div>
                     <Power size={20} className="text-red-700 group-hover:text-red-500 transition-colors" />
                 </div>
             </div>
             
             <div className="text-center opacity-20 py-6">
                 <div className="text-[9px] text-gray-500 font-mono">HW_ID: {gameState.creature.id.toUpperCase()}_v0.92-ALPHA</div>
             </div>
         </div>
    </div>
  );

  switch (currentScreen) {
      case ScreenMode.MENU: return renderMainMenu();
      case ScreenMode.STATUS: return renderStatus();
      case ScreenMode.SETTINGS: return renderSettings();
      case ScreenMode.DESIGN_GUIDE: return renderDesignGuide();
      case ScreenMode.INVENTORY: return <div className="h-full flex flex-col"><Header title="Nutrition" showBack onBack={() => onNavigate(ScreenMode.MENU)} /><div className="flex-1 grid grid-cols-3 gap-3 overflow-y-auto content-start pb-4">{SHOP_ITEMS.filter(i => i.category === 'FOOD').map(item => <div key={item.id} className="aspect-square bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/5"><Utensils size={20} className="text-synapse-pink mb-2 opacity-60" /><span className="text-[9px] text-gray-300 font-bold px-1 text-center">{item.name}</span></div>)}</div></div>;
      case ScreenMode.TRAIN: return <div className="h-full flex flex-col items-center justify-center"><Header title="Training" showBack onBack={() => onNavigate(ScreenMode.MENU)} /><div className="flex-1 flex flex-col items-center justify-center w-full space-y-8"><div className="w-40 h-40 rounded-full border border-dashed border-white/10 animate-spin-slow flex items-center justify-center relative"><div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20"></div><Dna size={48} className="text-alert-amber animate-pulse" /></div><button className="px-8 py-2.5 bg-bio-cyan/10 hover:bg-bio-cyan/20 border border-bio-cyan/20 rounded-full text-[11px] text-bio-cyan font-bold tracking-[0.3em] transition-all uppercase">Initiate Session</button></div></div>;
      case ScreenMode.SHOP: return <div className="h-full flex flex-col"><Header title="Market" showBack onBack={() => onNavigate(ScreenMode.MENU)} /><div className="flex-1 flex items-center justify-center text-[10px] text-gray-600 font-mono tracking-widest">LINK_OFFLINE</div></div>;
      case ScreenMode.DIGIDEX: return <div className="h-full flex flex-col"><Header title="Archive" showBack onBack={() => onNavigate(ScreenMode.MENU)} /><div className="flex-1 flex items-center justify-center text-[10px] text-gray-600 font-mono tracking-widest">ACCESS_DENIED</div></div>;
      case ScreenMode.SLEEP: return <div className="h-full flex flex-col"><Header title="System" showBack onBack={() => onNavigate(ScreenMode.MENU)} /><div className="flex-1 flex items-center justify-center text-[10px] text-gray-600 font-mono tracking-widest">HIBERNATION_READY</div></div>;
      default: return null;
  }
};
