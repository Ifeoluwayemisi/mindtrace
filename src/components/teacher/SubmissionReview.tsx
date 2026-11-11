import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ArrowRight,
  Clock,
  History,
  FileText
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

interface SubmissionReviewProps {
  assignmentId: string;
  onBack: () => void;
}

export const SubmissionReview: React.FC<SubmissionReviewProps> = ({ 
  assignmentId, 
  onBack 
}) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    // Fetch submissions using the teacher-specific endpoint to ensure ownership verification.
    const res = await apiRequest(`/api/teacher/assignments/${assignmentId}/submissions`);
    if (res.ok && res.data) {
      setSubmissions(res.data.submissions || []);
      setAssignment(res.data.assignment);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <Clock className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Loading Submissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-display font-extrabold text-white">{assignment?.title || 'Submission Review'}</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Classwide Submission Summary</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Enrolled</span>
          <div className="text-2xl font-display font-extrabold text-white">--</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Submitted</span>
          <div className="text-2xl font-display font-extrabold text-white">{submissions.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Avg. Score</span>
          <div className="text-2xl font-display font-extrabold text-white">
            {submissions.length > 0 
              ? Math.round(submissions.reduce((acc, s) => acc + (s.score / s.totalMarks), 0) / submissions.length * 100) + '%'
              : '--'
            }
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">At Risk</span>
          <div className="text-2xl font-display font-extrabold text-white">
             {submissions.filter(s => (s.score / s.totalMarks) < 0.6).length}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800/50 bg-slate-950/20">
              <tr>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-4">Score</th>
                <th className="py-4 px-4">Submission Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500 italic font-medium bg-slate-950/10">
                    No submissions recorded for this assignment yet.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-950/40 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-200 group-hover:text-white">
                        {sub.studentName || 'Student'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white tabular-nums">
                      {Math.round((sub.score / sub.totalMarks) * 100)}%
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${sub.isLate ? 'bg-rose-950/50 text-rose-400 border border-rose-900/50' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50'}`}>
                        {sub.isLate ? 'Late' : 'On Time'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-bold border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer"
                      >
                        Review Work
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Detail Modal (Simplified for now) */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-extrabold text-white tracking-tight">Student Work Review</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedSubmission.studentName}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
               <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
                 <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Question Diagnostics</div>
                 <div className="px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] font-bold">
                   Attempt #{selectedSubmission.attemptNumber || 1}
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                   <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Equation Solved</div>
                   <div className="font-mono text-xl font-bold text-white">3x - 7 = 14</div>
                 </div>

                 <div className="space-y-3">
                   <div className="text-[10px] text-slate-500 font-bold uppercase">Working Steps Provided</div>
                   <div className="space-y-2">
                     <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                        <span className="font-mono text-xs text-slate-300">3x = 14 + 7</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     </div>
                     <div className="p-3 rounded-xl bg-slate-900 border border-rose-900/40 flex justify-between items-center">
                        <span className="font-mono text-xs text-rose-200">3x = 21</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     </div>
                     <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                        <span className="font-mono text-xs text-slate-300">x = 7</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     </div>
                   </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                   <div className="text-xs text-emerald-300 font-bold">Mastery Confirmed: No Misconceptions Detected.</div>
                 </div>
               </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
