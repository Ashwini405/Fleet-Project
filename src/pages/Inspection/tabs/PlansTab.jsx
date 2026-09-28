import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CreatePlanModal from '../components/CreatePlanModal';

const getPlanTypeBadge = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('maint')) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (t.includes('safet')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (t.includes('operat')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (t.includes('pre-trip') || t.includes('pretrip')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (t.includes('post-trip') || t.includes('posttrip')) return 'bg-teal-50 text-teal-700 border-teal-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

export default function PlansTab({ plansData = [], setPlansData, fetchPlans, loadingPlans }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    if (fetchPlans) {
      fetchPlans();
    }
  }, []);

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const getScheduleText = (plan) => {
    if (plan.frequency) return plan.frequency;
    if (plan.schedule_type) return plan.schedule_type;
    return 'Daily';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Inspection Plans</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage checklist templates and inspection schedules.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create New Plan
        </button>
      </div>

      {/* Loading State */}
      {loadingPlans && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs font-semibold text-slate-500">
          Loading Inspection Plans...
        </div>
      )}

      {/* Plans Grid */}
      {!loadingPlans && plansData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <h3 className="text-base font-bold text-slate-700">No Inspection Plans Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click "Create New Plan" to configure your first inspection template.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {plansData.map((plan, idx) => {
            const planType = plan.plan_type || plan.type || 'Maintenance';
            const badgeClass = getPlanTypeBadge(planType);
            const itemsList = plan.items || (typeof plan.checklist_items === 'string' ? JSON.parse(plan.checklist_items) : plan.checklist_items) || [];
            const checkpointsCount = plan.total_checkpoints || itemsList.length || 0;

            return (
              <div 
                key={plan.id || idx} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Plan Type Badge */}
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border mb-3 ${badgeClass}`}>
                    {planType}
                  </span>

                  {/* Plan Title */}
                  <h3 className="text-base font-bold text-slate-800 leading-snug tracking-tight mb-3">
                    {plan.title}
                  </h3>

                  {/* Checklist Count & Schedule */}
                  <div className="space-y-1 text-xs text-slate-500 font-medium">
                    <p>{checkpointsCount} Configured Checkpoints</p>
                    <p>Automated Schedule: <span className="font-bold text-slate-700">{getScheduleText(plan)}</span></p>
                  </div>
                </div>

                {/* Edit Plan Button */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleEditPlan(plan)}
                    className="w-full py-2 px-4 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors text-center"
                  >
                    Edit Plan
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      <CreatePlanModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={() => {
          if (fetchPlans) fetchPlans();
        }}
        planData={editingPlan}
      />

    </div>
  );
}