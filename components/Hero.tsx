
import React, { useState } from 'react';
import { Sparkles, Code2, PenTool, Terminal, Layout, Cpu, ArrowRight, ChevronDown, Brain, Target, BarChart3, Check, Zap, Crown } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const CAREERS = [
  { id: 'frontend', title: 'Frontend Developer', icon: Layout, desc: 'Master React, UI/UX, and the modern web.' },
  { id: 'backend', title: 'Backend Engineer', icon: Terminal, desc: 'Server logic, databases, and scalable APIs.' },
  { id: 'fullstack', title: 'Full Stack Developer', icon: Code2, desc: 'The complete package. Front to back.' },
  { id: 'uiux', title: 'UI/UX Designer', icon: PenTool, desc: 'Craft beautiful, user-centric digital experiences.' },
  { id: 'ai-engineer', title: 'AI Engineer', icon: Sparkles, desc: 'Machine Learning, LLMs, and Neural Networks.' },
  { id: 'embedded', title: 'Embedded Systems', icon: Cpu, desc: 'Programming hardware, IoT, and low-level logic.' },
];

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="bg-[#050505] text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden">
      
      {/* --- SECTION 1: ORIGINAL HERO --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center z-10 border-b border-gray-900/50">
        {/* Background Ambience for Hero */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up relative z-10">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-500 font-mono tracking-widest text-xs uppercase">System Online v2.5</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tighter text-white">
              MASTER THE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600">SOURCE CODE</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              A tailored, AI-architected career simulation. 
              From "Hello World" to Senior Engineer.
              Practice with real-world projects, get instant AI grading, and track your evolution.
            </p>

            <div className="pt-8 flex flex-col items-center gap-4">
              <button 
                onClick={onStart}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(52,211,153,0.6)]"
              >
                Start Your Career
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-gray-600 uppercase tracking-widest">Free for beginners • Pro for masters</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-12 opacity-50 hover:opacity-100 transition-opacity duration-500">
            {CAREERS.map((career) => (
              <div
                key={career.id}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-default"
              >
                <career.icon className="w-6 h-6 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                <span className="text-xs text-gray-500 group-hover:text-gray-300 font-medium">{career.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
            <ChevronDown className="w-6 h-6 text-white" />
        </div>
      </section>

      {/* --- SECTION 2: SYSTEM CAPABILITIES --- */}
      <section className="py-32 px-6 relative bg-[#080808]">
        <div className="max-w-7xl mx-auto">
            <div className="mb-16">
                <h2 className="text-emerald-500 font-mono text-sm uppercase tracking-widest mb-2">System Architecture</h2>
                <h3 className="text-4xl md:text-5xl font-bold text-white max-w-2xl leading-tight">
                    An adaptive learning engine built on <span className="text-gray-500">Gemini 2.5 Flash</span>.
                </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: Brain, title: "Neural Roadmaps", desc: "Custom curriculum generation based on your current skill level and career goals." },
                    { icon: Terminal, title: "Real-time Feedback", desc: "Instant code analysis and grading with detailed feedback on logic and syntax." },
                    { icon: Target, title: "Project Based", desc: "Learn by doing. Generate unlimited practice assignments tailored to your gaps." },
                    { icon: BarChart3, title: "Skill Vectoring", desc: "Visualize your growth across 5 key engineering dimensions with dynamic radar charts." }
                ].map((feature, i) => (
                    <div key={i} className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-500">
                        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                            <feature.icon className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- SECTION 3: VISUAL PREVIEW --- */}
      <section className="py-32 overflow-hidden relative border-y border-white/5 bg-[#050505]">
         <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 z-10">
                <h2 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                    COMPILE YOUR <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">POTENTIAL.</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                    Stop watching tutorials. Start building. simSkill places you in a simulated work environment where you complete tickets, debug code, and ship features.
                </p>
                <div className="flex gap-4">
                     <div className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Gemini 2.5 Integration
                     </div>
                     <div className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Live XP Tracking
                     </div>
                </div>
            </div>

            <div className="lg:w-1/2 relative">
                {/* Abstract UI Mockup */}
                <div className="relative z-10 bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700 w-full max-w-lg mx-auto">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono ml-2">grader_module.tsx</div>
                    </div>
                    <div className="space-y-3 font-mono text-xs">
                        <div className="flex gap-4">
                            <span className="text-gray-700">01</span>
                            <span className="text-purple-400">const</span> <span className="text-blue-400">analysis</span> = <span className="text-emerald-400">await</span> ai.grade(submission);
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-700">02</span>
                            <span className="text-gray-500">// Analyzing logic structure...</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-700">03</span>
                            <span className="text-emerald-500">{`> Optimization Found: O(n) complexity achieved.`}</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-700">04</span>
                            <span className="text-blue-400">{`> Security: Input validation verified.`}</span>
                        </div>
                        <div className="p-4 mt-4 bg-emerald-900/10 border border-emerald-900/30 rounded text-emerald-300">
                            <span className="font-bold">+450 XP Awarded.</span> Level Up Imminent.
                        </div>
                    </div>
                </div>
                
                {/* Glow Effect behind mockup */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-900/20 blur-[100px] pointer-events-none"></div>
            </div>
         </div>
      </section>

      {/* --- SECTION 4: PRICING --- */}
      <section className="py-32 px-6 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
             <div className="text-center mb-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Invest in your Stack.</h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Start for free. Upgrade when you're ready to commit to the professional workflow.
                </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="bg-[#0a0a0a] border border-gray-800 p-1 rounded-full flex relative">
                    <button 
                        onClick={() => setBilling('monthly')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 relative z-10 ${billing === 'monthly' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBilling('yearly')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 relative z-10 flex items-center gap-2 ${billing === 'yearly' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Yearly
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${billing === 'yearly' ? 'bg-black/10 border-black/20 text-black' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'}`}>
                            -20%
                        </span>
                    </button>
                    
                    {/* Sliding Background */}
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full transition-all duration-300 ease-out shadow-lg ${billing === 'monthly' ? 'left-1' : 'left-[calc(50%+0px)]'}`} 
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                 {/* Free Card */}
                 <div className="p-8 rounded-3xl bg-black border border-gray-800 flex flex-col relative overflow-hidden group">
                    <div className="mb-6 z-10">
                        <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                        <div className="text-4xl font-bold text-gray-500">$0<span className="text-lg font-normal text-gray-600">/mo</span></div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 z-10">
                        {['First 4 Roadmap Levels', 'Basic Code Analysis', 'Community Support', 'Standard Speed'].map((item,i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-gray-500" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={onStart}
                        className="w-full py-4 rounded-xl border border-gray-800 text-white font-bold hover:bg-gray-900 transition-colors z-10"
                    >
                        Start Learning
                    </button>
                 </div>

                 {/* Pro Card */}
                 <div className="p-8 rounded-3xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 relative overflow-hidden group flex flex-col hover:border-emerald-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4">
                        <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                    </div>
                    <div className="mb-6 z-10">
                        <h3 className="text-2xl font-bold text-white mb-2">Pro Architect</h3>
                        <div className="flex items-baseline gap-1">
                            <div className="text-4xl font-bold text-white">{billing === 'monthly' ? '$5' : '$4'}</div>
                            <span className="text-lg font-normal text-gray-500">/mo</span>
                        </div>
                         <div className="text-gray-500 text-sm mt-1 font-medium">
                            {billing === 'monthly' ? 'Billed monthly.' : <span className="text-emerald-400">Billed $48 yearly. Save 20%.</span>}
                        </div>
                    </div>
                     <ul className="space-y-4 mb-8 flex-1 z-10">
                        {['Unlimited Roadmaps (15+ Levels)', 'Advanced Gemini 2.5 Logic Grading', 'Infinite Practice Project Generator', 'Deep Dive Teaching Modules'].map((item,i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-white">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={onStart}
                        className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] z-10"
                    >
                        Get Pro Access
                    </button>

                    {/* Pro Glow */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-900/20 to-transparent pointer-events-none"></div>
                 </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-gray-900 bg-black text-center">
          <div className="flex flex-col items-center gap-6">
              <span className="text-2xl font-bold text-white tracking-tighter">simSkill</span>
              <p className="text-gray-600 text-sm">© 2024 simSkill. Powered by Google Gemini.</p>
          </div>
      </footer>

    </div>
  );
};

export default Hero;
