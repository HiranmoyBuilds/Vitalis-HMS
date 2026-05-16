import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-slate-50 dark:bg-dark-800 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-dark-700 shadow-inner">
        {Icon && <Icon className="w-10 h-10 text-slate-300 dark:text-dark-600" />}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
