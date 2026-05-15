import React, { useState, useEffect } from 'react';
import { Plus, ListChecks, ArrowRight, Settings } from 'lucide-react';
import CreatePlanModal from '../components/CreatePlanModal';

export default function PlansTab({ plansData, setPlansData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all inspection plans from the backend
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/inspection-plans');
      const data = await response.json();

      if (data.success) {
        const formatted = data.data.map(plan => ({
          ...plan,
          // Convert plan_type to uppercase for consistent styling (e.g., "MAINTENANCE")
          type: (plan.plan_type || 'Maintenance').toUpperCase(),
          // checklist_items may already be an array (not a string) from the API
          items: typeof plan.checklist_items === 'string'
            ? JSON.parse(plan.checklist_items)
            : plan.checklist_items || []
        }));
        setPlansData(formatted);
      }
    } catch (error) {
      console.error('FETCH PLANS ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load plans when component mounts
  useEffect(() => {
    fetchPlans();
  }, []);

  // After creating a new plan, refresh the list
  const handleAddPlan = () => {
    fetchPlans();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Inspection Plans & Templates</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Configure compliance checks and operational maintenance routines.</p>
         </div>
         <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors"
         >
            <Plus className="w-4 h-4 text-blue-600" /> Create New Plan
         </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm font-semibold text-slate-500">
          Loading Inspection Plans...
        </div>
      )}

      {/* Plans Grid */}
      {!loading && plansData.length === 0 ? (
        <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <h3 className="text-lg font-bold text-slate-700">No Inspection Plans Found</h3>
          <p className="text-sm text-slate-400 mt-2">
            Create your first inspection plan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plansData.map((plan, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col group hover:shadow-md transition-shadow relative overflow-hidden">
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                     <span className={`inline-flex px-2.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase mb-3 ${
                        plan.type === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                     }`}>
                        {plan.type}
                     </span>
                     <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{plan.title}</h3>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                     <Settings className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex-1 space-y-4 mb-6 relative z-10">
                  <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <ListChecks className="w-4 h-4 text-slate-400" />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checklist Items</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{(plan.items || []).length} Configured Checkpoints</p>
                     </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                     <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Includes:</p>
                     <ul className="text-xs text-slate-600 font-medium space-y-2">
                        {(plan.items || []).slice(0, 3).map((item, i) => (
                           <li key={i} className="flex gap-2 items-center truncate">
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
                              {item.desc || item}
                           </li>
                        ))}
                        {(plan.items || []).length > 3 && (
                           <li className="text-slate-400 text-[10px] font-bold italic pt-1">
                              + {(plan.items || []).length - 3} more items...
                           </li>
                        )}
                     </ul>
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-100 flex justify-between items-center relative z-10 mt-auto">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automated Schedule</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">Recurring</p>
                  </div>
                  <button className="text-xs font-bold text-blue-600 group-hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                     Edit Plan <ArrowRight className="w-3.5 h-3.5" />
                  </button>
               </div>

            </div>
          ))}
        </div>
      )}

      <CreatePlanModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onAddPlan={handleAddPlan}
      />

    </div>
  );
}