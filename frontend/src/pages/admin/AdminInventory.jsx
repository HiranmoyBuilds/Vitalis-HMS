import React, { useState, useEffect } from 'react';
import DataGrid from '../../components/ui/DataGrid';
import Modal from '../../components/ui/Modal';
import { Package, AlertTriangle, ArrowDown, Plus, RefreshCw, BarChart2, Edit2, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import PageTransition from '../../components/layout/PageTransition';
import { toast } from 'sonner';

const AdminInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/inventory`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      toast.error('Failed to sync inventory database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const formData = new FormData(e.target);
    const newItem = {
      itemName: formData.get('name'),
      category: formData.get('category'),
      stock: Number(formData.get('stock')),
      unit: formData.get('unit'),
      minStock: Number(formData.get('minStock'))
    };

    try {
      const res = await fetch(`${API_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        fetchInventory();
        toast.success(`${newItem.itemName} added to inventory`);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add item');
        toast.error(data.message || 'Failed to add item');
      }
    } catch (err) {
      setError('Connection error');
      toast.error('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    const newStock = Number(formData.get('stock'));

    try {
      const res = await fetch(`${API_URL}/api/inventory/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchInventory();
        toast.success(`Stock updated for ${selectedItem.itemName}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Stock': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Low Stock': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Out of Stock': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const columns = [
    { 
      key: 'itemName', 
      header: 'Item Identifier',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-dark-900 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
             <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{row.itemName}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.category}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'stock', 
      header: 'Availability',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{row.stock}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.unit}</span>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'System Status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-transparent ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Operational Control',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedItem(row);
              setIsEditModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-primary-100/50 dark:border-primary-900/50 shadow-sm"
          >
            <Edit2 className="w-3 h-3" /> Update Stock
          </button>
        </div>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Facility Inventory</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Global resource monitoring and supply chain management.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-primary-600/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Provision Resource
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Asset Total', value: items.length, icon: Package, color: 'blue' },
            { label: 'Low Reserves', value: items.filter(i => i.status === 'Low Stock').length, icon: AlertTriangle, color: 'amber' },
            { label: 'Depleted Stock', value: items.filter(i => i.status === 'Out of Stock').length, icon: ArrowDown, color: 'red' },
            { label: 'Logistics Clusters', value: new Set(items.map(i => i.category)).size, icon: BarChart2, color: 'emerald' }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-100 dark:border-dark-700 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-8 -mt-8`}></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl transition-transform group-hover:scale-110 duration-500`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-700 overflow-hidden transition-all duration-300">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Scanning Inventory...</p>
            </div>
          ) : (
            <DataGrid columns={columns} data={items} searchPlaceholder="Filter system resources..." />
          )}
        </div>

        {/* Add Item Modal */}
        <Modal 
          isOpen={isAddModalOpen} 
          onClose={() => !submitting && setIsAddModalOpen(false)} 
          title="New Resource Provision"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleAddItem} className="p-2 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/30 font-bold">
                <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Nomenclature</label>
              <input name="name" type="text" required placeholder="Enter item name..." className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistic Cluster</label>
                <select name="category" className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-bold">
                  <option>PPE</option>
                  <option>Consumables</option>
                  <option>Pharmacy</option>
                  <option>Surgical</option>
                  <option>Medical Kits</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Specification</label>
                <input name="unit" type="text" placeholder="e.g., Boxes" required className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Reserve</label>
                <input name="stock" type="number" required className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-black" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Critical Floor</label>
                <input name="minStock" type="number" required className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-black" />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)} 
                disabled={submitting}
                className="flex-1 py-4 bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="flex-1 py-4 bg-slate-900 dark:bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-primary-600/20 flex justify-center items-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Provision Asset</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </Modal>

        {/* Update Stock Modal */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => !submitting && setIsEditModalOpen(false)} 
          title={`Inventory Recalibration`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateStock} className="p-2 space-y-6">
            <div className="bg-slate-50 dark:bg-dark-900 p-6 rounded-2xl border border-slate-100 dark:border-dark-700 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Item</p>
               <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{selectedItem?.itemName}</h4>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Reserve Quantity ({selectedItem?.unit})</label>
              <input name="stock" type="number" defaultValue={selectedItem?.stock} required className="w-full px-6 py-5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-3xl text-3xl font-black text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-4 text-slate-500 font-bold hover:text-slate-700 transition-colors"
              >
                Dismiss
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="flex-1 py-4 bg-slate-900 dark:bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Commit Change"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminInventory;
