import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ChevronRight, FileCheck, Circle } from 'lucide-react';
import { dummyVehicles } from '../data/dummyData';

export default function NewInspectionModal({ isOpen, onClose, plansData, onSubmit }) {
  const [step, setStep] = useState(1);
  
  // Form State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [vehicle, setVehicle] = useState('');
  const [odometer, setOdometer] = useState('');
  const [checklistResults, setChecklistResults] = useState({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPlan(null);
      setVehicle('');
      setOdometer('');
      setChecklistResults({});
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    // Calculate final status
    const hasFailures = Object.values(checklistResults).includes('Fail');
    const finalStatus = hasFailures ? 'Failed' : 'Passed';

    const newRecord = {
      id: `INS-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString().split('T')[0],
      vehicle: vehicle,
      inspector: 'Current User', // Stubbed current user
      status: finalStatus,
      details: {
         odo: `${odometer} KM`,
         plan: selectedPlan.title,
         location: 'Depot Screen',
         notes: notes,
         checklist: selectedPlan.items.map(item => ({
            name: item,
            result: checklistResults[item] || 'Pass' // Default Pass if untouched
         }))
      }
    };
    
    onSubmit(newRecord);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col min-h-[600px] max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#1e1b4b] text-white p-6 shrink-0 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <FileCheck className="w-40 h-40 transform translate-x-10 -translate-y-10" />
             </div>
             <div className="relative z-10 flex justify-between items-start">
                <div>
                   <h2 className="text-xl font-black tracking-tight flex items-center gap-2">New Inspection</h2>
                   <p className="text-indigo-200 text-xs font-bold tracking-widest uppercase mt-1">
                      Step {step} of 4: {
                        step === 1 ? 'Select Plan' : 
                        step === 2 ? 'Vehicle Info' : 
                        step === 3 ? 'Checklist' : 'Submission'
                      }
                   </p>
                </div>
                <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             {/* Progress Bar */}
             <div className="relative z-10 w-full bg-indigo-900/50 rounded-full h-1.5 mt-6 overflow-hidden">
                <motion.div 
                   className="h-full bg-indigo-400"
                   initial={{ width: '25%' }}
                   animate={{ width: `${(step / 4) * 100}%` }}
                />
             </div>
          </div>

          {/* Dynamic Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8">
             <AnimatePresence mode="wait">
                
                {/* STEP 1: Plan Selection */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                     <h3 className="text-lg font-bold text-slate-800 tracking-tight">Select Inspection Template</h3>
                     <p className="text-sm text-slate-500 mb-6">Choose a recurring plan or template to begin.</p>
                     
                     <div className="grid gap-4">
                        {plansData.map((plan, idx) => {
                           const isSelected = selectedPlan?.title === plan.title;
                           return (
                              <div 
                                 key={idx} 
                                 onClick={() => setSelectedPlan(plan)}
                                 className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                                    isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                                 }`}
                              >
                                 <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-transparent'}`}>
                                    {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-slate-800 text-base">{plan.title}</h4>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Type: {plan.type}</p>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </motion.div>
                )}

                {/* STEP 2: Vehicle & Odometer */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                     <h3 className="text-lg font-bold text-slate-800 tracking-tight">Vehicle Identification</h3>
                     
                     <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                        <FileCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-xs font-bold text-indigo-800">Inspection Plan: {selectedPlan.title}</p>
                           <p className="text-xs text-indigo-600 mt-1">You are about to start a multi-step inspection sequence. Ensure vehicle is parked safely.</p>
                        </div>
                     </div>

                     <div className="grid gap-5 mt-6">
                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Vehicle</label>
                           <select 
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm"
                              value={vehicle}
                              onChange={(e) => setVehicle(e.target.value)}
                           >
                              <option value="">Select an active vehicle...</option>
                              {dummyVehicles.map(v => <option key={v} value={v.split(' ')[0]}>{v}</option>)}
                           </select>
                        </div>

                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Current Odometer (KM)</label>
                           <input 
                              type="number"
                              placeholder="e.g. 45416"
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-black font-mono text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
                              value={odometer}
                              onChange={(e) => setOdometer(e.target.value)}
                           />
                        </div>
                     </div>
                  </motion.div>
                )}

                {/* STEP 3: Checklist */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                     <h3 className="text-lg font-bold text-slate-800 tracking-tight">Active Checklist: {selectedPlan.title}</h3>
                     
                     <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm pt-2 pb-2">
                        {selectedPlan.items.map((item, idx) => {
                           const currentRes = checklistResults[item] || 'Pass';
                           return (
                              <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                                 <p className="text-sm font-bold text-slate-700">{item}</p>
                                 
                                 <div className="flex bg-slate-100 rounded-lg p-1 shrink-0 self-start sm:self-auto">
                                    <button 
                                       onClick={() => setChecklistResults({...checklistResults, [item]: 'Pass'})}
                                       className={`relative px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentRes === 'Pass' ? 'text-green-800 bg-white shadow flex gap-1 items-center z-10' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                       {currentRes === 'Pass' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 block"></span>} Pass
                                    </button>
                                    <button 
                                       onClick={() => setChecklistResults({...checklistResults, [item]: 'Fail'})}
                                       className={`relative px-4 py-1.5 text-xs font-bold rounded-md transition-all ${currentRes === 'Fail' ? 'text-red-800 bg-white shadow flex gap-1 items-center z-10' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                       {currentRes === 'Fail' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 block"></span>} Fail
                                    </button>
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  </motion.div>
                )}

                {/* STEP 4: Submission */}
                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                     <h3 className="text-lg font-bold text-slate-800 tracking-tight">Summary & Notes</h3>
                     
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Additional Audit Notes</label>
                        <textarea 
                           className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm min-h-[120px] resize-none"
                           placeholder="Note any specific issues, repairs needed, or general observations..."
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                        />
                     </div>

                     <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center mt-6">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                           <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="text-emerald-800 font-bold tracking-tight">Ready to Submit</h4>
                        <p className="text-xs text-emerald-600 mt-1">Report will be saved and logged to {vehicle}</p>
                     </div>

                  </motion.div>
                )}

             </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="bg-white p-5 border-t border-slate-100 flex justify-between items-center shrink-0">
             {step > 1 ? (
               <button onClick={handleBack} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Back
               </button>
             ) : (
               <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
               </button>
             )}

             {step < 4 ? (
               <button 
                  onClick={handleNext} 
                  disabled={(step === 1 && !selectedPlan) || (step === 2 && (!vehicle || !odometer))}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#4f46e5] text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Next Step <ChevronRight className="w-4 h-4" />
               </button>
             ) : (
               <button 
                  onClick={handleSubmit} 
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
               >
                  Submit Report
               </button>
             )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
