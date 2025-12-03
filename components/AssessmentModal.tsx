import React, { useState } from 'react';
import { Assessment } from '../types';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface AssessmentModalProps {
  onComplete: (data: Assessment, career: string) => void;
  onCancel: () => void;
}

const STEPS = ['CAREER', 'EXPERIENCE', 'GOAL', 'COMMITMENT'];

const AssessmentModal: React.FC<AssessmentModalProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [career, setCareer] = useState('');
  const [assessment, setAssessment] = useState<Assessment>({
    experience: 'Beginner',
    goal: 'Career',
    commitment: 'Casual',
  });

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(assessment, career);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else onCancel();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-white">What Tech Career are you targeting?</h3>
            <p className="text-gray-400 text-sm">SimSkill specializes in Engineering & Computer Science simulations.</p>
            <input 
              type="text" 
              autoFocus
              placeholder="e.g. Frontend Dev, Cloud Architect, Data Engineer..." 
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-700 py-4 text-3xl font-light text-white focus:border-emerald-500 focus:outline-none placeholder-gray-800"
            />
            <div className="flex flex-wrap gap-2">
                {['Full Stack Developer', 'Cybersecurity Analyst', 'DevOps Engineer', 'Mobile Developer'].map(c => (
                    <button key={c} onClick={() => setCareer(c)} className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                        {c}
                    </button>
                ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-white">What's your current experience?</h3>
            <div className="grid gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => setAssessment({ ...assessment, experience: level as any })}
                  className={`p-4 rounded-xl text-left border transition-all ${assessment.experience === level ? 'border-emerald-500 bg-emerald-900/20 text-white' : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-600'}`}
                >
                  <span className="font-bold block text-lg mb-1">{level}</span>
                  <span className="text-xs opacity-70">
                    {level === 'Beginner' ? 'I have zero to little coding knowledge.' : 
                     level === 'Intermediate' ? 'I have built a few small apps.' : 
                     'I work professionally or have deep knowledge.'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-white">What is your main goal?</h3>
            <div className="grid grid-cols-3 gap-3">
              {['Career', 'Skill-Up', 'Hobby'].map((g) => (
                <button
                  key={g}
                  onClick={() => setAssessment({ ...assessment, goal: g as any })}
                  className={`p-6 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 aspect-square ${assessment.goal === g ? 'border-emerald-500 bg-emerald-900/20 text-white' : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-600'}`}
                >
                  <span className="font-bold">{g}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-white">Weekly Time Commitment?</h3>
            <div className="grid gap-3">
               <button
                  onClick={() => setAssessment({ ...assessment, commitment: 'Casual' })}
                  className={`p-4 rounded-xl text-left border transition-all ${assessment.commitment === 'Casual' ? 'border-emerald-500 bg-emerald-900/20 text-white' : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-600'}`}
                >
                  <span className="font-bold block text-lg mb-1">Casual (2-5 hours)</span>
                  <span className="text-xs opacity-70">Slow and steady pace.</span>
                </button>
                <button
                  onClick={() => setAssessment({ ...assessment, commitment: 'Intense' })}
                  className={`p-4 rounded-xl text-left border transition-all ${assessment.commitment === 'Intense' ? 'border-emerald-500 bg-emerald-900/20 text-white' : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-600'}`}
                >
                  <span className="font-bold block text-lg mb-1">Intense (10+ hours)</span>
                  <span className="text-xs opacity-70">I want to learn as fast as possible.</span>
                </button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
            {STEPS.map((s, i) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-emerald-500' : 'bg-gray-800'}`} />
            ))}
        </div>

        <div className="min-h-[300px] flex flex-col justify-between">
            {renderStep()}

            <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-900">
                <button onClick={handleBack} className="text-gray-500 hover:text-white flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                    onClick={handleNext} 
                    disabled={step === 0 && !career}
                    className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {step === STEPS.length - 1 ? 'Build Roadmap' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;