import React from 'react';
import { formatCurrency } from '../utils/formatters';

export default function MetricCard({ title, amount, subtitle, icon: Icon, colorClass, gradientClass }) {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden transition duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {formatCurrency(amount)}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`} />
    </div>
  );
}
