import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight,
  Send,
  Calendar,
  Layers
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

interface AssignmentManagerProps {
  classroomId: string;
  onViewSubmissions: (assignmentId: string) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({ 
  classroomId,
  onViewSubmissions 
}) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    const res = await apiRequest(`/api/teacher/classrooms/${classroomId}/assignments`);
    if (res.ok && res.data?.assignments) {
      setAssignments(res.data.assignments);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const res = await apiRequest(`/api/teacher/classrooms/${classroomId}/assignments`, {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        instructions: instructions.trim(),
        dueDate,
        gradeLevel: 'SS2', // Defaulting for now
        subject: 'Mathematics',
        questions: [
          { questionId: 'q-lin-01', displayOrder: 1, marks: 10 },
          { questionId: 'q-lin-02', displayOrder: 2, marks: 10 },
          { questionId: 'q-lin-03', displayOrder: 3, marks: 10 },
        ]
      }),
    });

    setIsSubmitting(false);
    if (res.ok) {
      setShowCreateModal(false);
      setTitle('');
      setInstructions('');
      setDueDate('');
      fetchAssignments();
    }
  };

  const handlePublish = async (id: string) => {
    const res = await apiRequest(`/api/teacher/assignments/${id}/publish`, {
      method: 'PATCH',
    });
    if (res.ok) {
      fetchAssignments();
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <Clock className="w-8 h-8 text-indigo-500 animate-pulse" />
        <span className="text-xs text-slate-500 font-medium">Loading Assignments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>Active Assignments</span>
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Assignment</span>
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 border-dashed space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-600">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-white font-bold">No assignments yet</p>
            <p className="text-xs text-slate-500">Create your first diagnostic assignment to start tracking student mastery.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold hover:bg-indigo-600/20 transition"
          >
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{assignment.title}</h3>
                  {assignment.published ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-900/60 text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                      Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline'}
                  </span>
                  <span>·</span>
                  <span>{assignment.subject}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!assignment.published && (
                  <button
                    onClick={() => handlePublish(assignment.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-700 hover:border-emerald-500 transition-all"
                  >
                    Publish Now
                  </button>
                )}
                <button
                  onClick={() => onViewSubmissions(assignment.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-bold border border-indigo-500/20 hover:border-indigo-500 transition-all cursor-pointer"
                >
                  <span>View Submissions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal Overlay */}
      {showCreateForm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleCreateAssignment} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-extrabold text-white tracking-tight">Create Assignment</h3>
                <p className="text-xs text-slate-500">Assign curriculum questions to your students</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Quiz: Linear Equations I"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Instructions (Optional)</label>
                <textarea
                  placeholder="Explain line-by-line working requirements..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-colors min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Due Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Target Grade</label>
                  <div className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-400 font-bold">
                    SS2 (Nigeria)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <p className="text-[11px] text-indigo-300 leading-relaxed">
                  Defaulting to <span className="font-bold text-white">WAEC-Aligned Linear Equations</span> question set. Advanced question selection will be available in the next release.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
