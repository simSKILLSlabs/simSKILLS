import React, { useState } from 'react';
import { Assessment } from '../types';
import { ChevronRight, ArrowLeft, X } from 'lucide-react';

interface AssessmentModalProps {
  onComplete: (data: Assessment, career: string) => void;
  onCancel: () => void;
}

const STEPS = ['TRACK', 'EXPERIENCE', 'GOAL', 'PACE'];

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
          <div className="space-y-5 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                What engineering track do you want to build?
              </h3>
              <p className="text-neutral-400 text-xs mt-1">
                Enter any programming language, framework, or computer science role.
              </p>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Python Backend, Full-Stack TypeScript, Rust Systems..."
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              className="w-full surface-recessed focus:border-white/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-neutral-500 transition-colors"
            />
            <div className="flex flex-wrap gap-2">
              {['Full-Stack Developer', 'Python Engineer', 'DevOps & Cloud', 'Mobile Engineer'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCareer(c)}
                  className="btn-secondary px-3 py-1.5 rounded-lg text-xs"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Select your current experience level
              </h3>
              <p className="text-neutral-400 text-xs mt-1">
                We calibrate Chapter 1 to match your starting point.
              </p>
            </div>
            <div className="grid gap-2.5">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setAssessment({ ...assessment, experience: level as any })}
                  className={`p-4 rounded-xl text-left transition-all ${
                    assessment.experience === level
                      ? 'surface-card border-white/40 text-white'
                      : 'surface-recessed text-neutral-400 hover:border-white/15'
                  }`}
                >
                  <span className="font-bold block text-sm mb-0.5 text-white">{level}</span>
                  <span className="text-xs text-neutral-300/80">
                    {level === 'Beginner'
                      ? 'Start from ground zero—variables, syntax, and core building blocks.'
                      : level === 'Intermediate'
                      ? 'Familiar with basic syntax; ready for real application architecture.'
                      : 'Experienced developer focusing on production patterns and systems.'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Primary objective
              </h3>
              <p className="text-neutral-400 text-xs mt-1">
                Tailors the complexity of your end-of-chapter coding assignments.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['Career', 'Skill-Up', 'Hobby'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setAssessment({ ...assessment, goal: g as any })}
                  className={`p-5 rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${
                    assessment.goal === g
                      ? 'surface-card border-white/40 text-white'
                      : 'surface-recessed text-neutral-400 hover:border-white/15'
                  }`}
                >
                  <span className="font-bold text-xs">{g}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Weekly schedule
              </h3>
              <p className="text-neutral-400 text-xs mt-1">
                Choose your preferred learning pace.
              </p>
            </div>
            <div className="grid gap-2.5">
              <button
                type="button"
                onClick={() => setAssessment({ ...assessment, commitment: 'Casual' })}
                className={`p-4 rounded-xl text-left transition-all ${
                  assessment.commitment === 'Casual'
                    ? 'surface-card border-white/40 text-white'
                    : 'surface-recessed text-neutral-400 hover:border-white/15'
                }`}
              >
                <span className="font-bold block text-sm mb-0.5 text-white">Standard Pace (2–5 hrs/week)</span>
                <span className="text-xs text-neutral-300/80">Focused, steady progression through each chapter.</span>
              </button>
              <button
                type="button"
                onClick={() => setAssessment({ ...assessment, commitment: 'Intense' })}
                className={`p-4 rounded-xl text-left transition-all ${
                  assessment.commitment === 'Intense'
                    ? 'surface-card border-white/40 text-white'
                    : 'surface-recessed text-neutral-400 hover:border-white/15'
                }`}
              >
                <span className="font-bold block text-sm mb-0.5 text-white">Accelerated (10+ hrs/week)</span>
                <span className="text-xs text-neutral-300/80">Intensive practice and deeper project requirements.</span>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="surface-card w-full max-w-lg rounded-2xl p-6 md:p-8 relative">
        <button
          onClick={onCancel}
          className="btn-secondary absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Bar */}
        <div className="flex gap-1.5 mb-6 pr-10">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-white' : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        <div className="min-h-[260px] flex flex-col justify-between">
          {renderStep()}

          <div className="flex justify-between items-center mt-8 pt-5 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleBack}
              className="text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 0 && !career.trim()}
              className="btn-primary px-5 py-2.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>{step === STEPS.length - 1 ? 'Create Track' : 'Continue'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;