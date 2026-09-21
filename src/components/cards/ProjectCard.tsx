import React from 'react';
import { Clock, Send, Users, Tag, ArrowUpRight } from 'lucide-react';
import { Project } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  onSubmitProposal: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onSubmitProposal }) => {
  const { formatAmount } = useCurrency();

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between text-slate-200">
      <div>
        {/* Header: Title, Budget, Category */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {project.categoryName}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {project.deadline}
              </span>
            </div>

            <h4
              onClick={onSelect}
              className="text-base font-bold text-white hover:text-blue-400 transition cursor-pointer leading-relaxed"
            >
              {project.title}
            </h4>
          </div>

          <div className="text-left shrink-0">
            <span className="text-[10px] text-slate-400 block">بودجه پیشنهادی:</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {formatAmount(project.budgetMinAFN, project.budgetMinUSD)} - {formatAmount(project.budgetMaxAFN, project.budgetMaxUSD)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Skills required */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.skillsRequired.map((skill, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-750"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info & Bid Button */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users className="w-4 h-4 text-slate-500" />
          <span>{project.proposalsCount} پیشنهاد ثبت شده</span>
        </div>

        <button
          onClick={onSubmitProposal}
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ارسال پیشنهاد قیمت</span>
        </button>
      </div>
    </div>
  );
};
