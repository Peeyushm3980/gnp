import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, User, ShieldCheck } from 'lucide-react';
import api from '../api';

const TreeNode = ({ node }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.subordinates && node.subordinates.length > 0;

  return (
    <div className="ml-6 mt-2">
      <div className="flex items-center gap-2 group">
        {hasChildren ? (
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-blue-600">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        
        <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all w-64 ${
          node.role === 'root' ? 'bg-blue-50 border-blue-200' : 'bg-[var(--bg-card)] border-[var(--border-color)]'
        }`}>
          <div className={`p-2 rounded-lg ${node.role === 'root' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {node.role === 'root' ? <ShieldCheck size={16} /> : <User size={16} />}
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-main)]">{node.username}</p>
            <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">{node.role}</p>
          </div>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="border-l-2 border-slate-100 ml-2">
          {node.subordinates.map((sub) => (
            <TreeNode key={sub.id} node={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

const StaffHierarchy = ({ loggedInUserId }) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await api.get(`/users/hierarchy/${loggedInUserId}`);
        setTreeData(res.data);
      } catch (err) {
        console.error("Hierarchy load failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [loggedInUserId]);

  if (loading) return <div className="p-10 text-slate-400">Loading firm structure...</div>;

  return (
    <div className="p-8 bg-[var(--bg-main)] min-h-screen">
      <h1 className="text-2xl font-bold text-[var(--text-main)] mb-6">Staff Reporting Structure</h1>
      <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm">
        <TreeNode node={treeData} />
      </div>
    </div>
  );
};

export default StaffHierarchy;