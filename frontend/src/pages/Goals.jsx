import React, { useEffect, useState } from 'react';
import { useCarbon } from '../context/CarbonContext.jsx';
import Modal from '../components/Modal.jsx';
import { Plus, Edit2, Trash2, Calendar, Target, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Goals() {
  const { goals, fetchGoalsOnly, createUserGoal, updateUserGoal, deleteUserGoal } = useCarbon();

  // Create Goal Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('total');
  const [targetValue, setTargetValue] = useState(50);
  const [timeframeWeeks, setTimeframeWeeks] = useState(4);

  // Edit Goal Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('total');
  const [editTargetValue, setEditTargetValue] = useState(50);
  const [editCurrentValue, setEditCurrentValue] = useState(0);
  const [editIsCompleted, setEditIsCompleted] = useState(false);

  useEffect(() => {
    fetchGoalsOnly();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + timeframeWeeks * 7);

      await createUserGoal({
        title,
        category,
        targetValue: Number(targetValue),
        endDate: endDate.toISOString(),
      });

      setTitle('');
      setTargetValue(50);
      setTimeframeWeeks(4);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditCategory(goal.category);
    setEditTargetValue(goal.targetValue);
    setEditCurrentValue(goal.currentValue);
    setEditIsCompleted(goal.isCompleted);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserGoal(editingGoal._id, {
        title: editTitle,
        category: editCategory,
        targetValue: Number(editTargetValue),
        currentValue: Number(editCurrentValue),
        isCompleted: editIsCompleted || Number(editCurrentValue) >= Number(editTargetValue),
      });
      setIsEditOpen(false);
      setEditingGoal(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Edit Goal Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Carbon Reduction Goal">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Focus Category</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="total">Overall Emissions</option>
              <option value="transport">Transportation</option>
              <option value="energy">Home Energy</option>
              <option value="food">Diet Habits</option>
              <option value="shopping">Shopping Habits</option>
              <option value="waste">Waste output</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Current Progress (kg)</label>
              <input
                type="number"
                min="0"
                required
                value={editCurrentValue}
                onChange={(e) => setEditCurrentValue(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target Reduction (kg)</label>
              <input
                type="number"
                min="0.1"
                required
                value={editTargetValue}
                onChange={(e) => setEditTargetValue(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isCompletedCheck"
              checked={editIsCompleted}
              onChange={(e) => setEditIsCompleted(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <label htmlFor="isCompletedCheck" className="text-xs text-gray-400 font-semibold cursor-pointer">
              Mark Goal as Completed manually
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Save Goal Changes
          </button>
        </form>
      </Modal>

      {/* Left Create Goal panel */}
      <div className="glass-panel p-6 rounded-2xl h-fit shadow-xl border border-gray-900">
        <h3 className="font-bold text-white text-base mb-4">Set Carbon Reduction Goal</h3>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
              placeholder="e.g., Reduce commuter footprint"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Focus Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="total">Overall Emissions</option>
              <option value="transport">Transportation</option>
              <option value="energy">Home Energy</option>
              <option value="food">Diet Habits</option>
              <option value="shopping">Shopping Habits</option>
              <option value="waste">Waste output</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target Carbon Reduction (kg CO₂)</label>
            <input
              type="number"
              min="1"
              required
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Timeframe (Weeks)</label>
            <input
              type="number"
              min="1"
              max="52"
              required
              value={timeframeWeeks}
              onChange={(e) => setTimeframeWeeks(Number(e.target.value))}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Activate Goal</span>
          </button>
        </form>
      </div>

      {/* Right Ongoing/History lists */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6 shadow-xl border border-gray-900">
        <div>
          <h3 className="font-bold text-white text-base">Carbon Mitigation Targets</h3>
          <p className="text-xs text-gray-400 mt-1">Goal updates trigger dynamically as you complete recommendation actions.</p>
        </div>

        <div className="space-y-4">
          {goals.length > 0 ? (
            goals.map((g) => (
              <div key={g._id} className="glass-card p-5 rounded-xl border-l-4 border-l-blue-500 space-y-3 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm pr-12">{g.title}</h4>
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-bold bg-gray-900 text-blue-400 border border-blue-900/40 rounded px-1.5 py-0.5">
                      {g.category} Category
                    </span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute right-4 top-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(g)}
                      className="p-1.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-emerald-400 rounded transition-all cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteUserGoal(g._id)}
                      className="p-1.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-red-400 rounded transition-all cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Progress: <strong className="text-white">{g.currentValue}</strong> / {g.targetValue} kg CO₂</span>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {Math.round(Math.min(100, (g.currentValue / g.targetValue) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 flex justify-between pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Started: {new Date(g.startDate).toLocaleDateString()}</span>
                  </span>
                  <span>Ends: {new Date(g.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 text-xs">You have no carbon reduction goals set. Use the form to start one!</div>
          )}
        </div>
      </div>

    </div>
  );
}
