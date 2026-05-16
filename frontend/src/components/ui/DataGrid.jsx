import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, MoreHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';

const DataGrid = ({ columns, data, searchPlaceholder = "Search records..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Handle Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter Data
  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (val) => String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort Data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  return (
    <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-700 overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-slate-50 dark:border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-dark-900/50">
        <div className="relative w-full md:w-96 group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm font-medium border border-slate-100 dark:border-dark-700 rounded-2xl bg-white dark:bg-dark-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="p-3 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-xl text-slate-500 hover:text-primary-600 transition-all hover:shadow-md">
             <Filter className="w-4 h-4" />
           </button>
           <button className="p-3 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-xl text-slate-500 hover:text-primary-600 transition-all hover:shadow-md">
             <MoreHorizontal className="w-4 h-4" />
           </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 border-collapse">
          <thead>
            <tr className="bg-white dark:bg-dark-800 border-b border-slate-50 dark:border-dark-700 transition-colors">
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400 ${col.sortable !== false ? 'cursor-pointer select-none hover:text-primary-600 transition-colors' : ''}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable !== false && (
                      <div className="flex flex-col opacity-0 group-hover:opacity-100">
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary-500" /> : <ChevronDown className="w-3 h-3 text-primary-500" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-dark-700/50">
            {sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/50 dark:hover:bg-primary-900/5 transition-all group">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-5 whitespace-nowrap">
                      <div className="transition-transform group-hover:translate-x-1 duration-300">
                        {col.render ? col.render(row) : <span className="font-medium">{row[col.key]}</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-dark-900 rounded-full flex items-center justify-center text-slate-300">
                         <Search className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching records found</p>
                      <button onClick={() => setSearchTerm('')} className="text-xs font-black text-primary-600 hover:underline uppercase tracking-widest">Clear Search Filters</button>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Premium Pagination */}
      <div className="p-6 border-t border-slate-50 dark:border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30 dark:bg-dark-900/30 transition-colors">
        <div className="flex items-center gap-2">
           <span className="text-slate-900 dark:text-white font-black">{sortedData.length}</span> Results Indexed
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-30 transition-all shadow-sm group" disabled>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Previous
          </button>
          <div className="flex items-center gap-1">
             <span className="w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-lg shadow-lg shadow-primary-600/20">1</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-30 transition-all shadow-sm group" disabled>
            Next <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
