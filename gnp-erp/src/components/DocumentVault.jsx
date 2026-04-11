import React, { useState, useEffect } from 'react';
import { FileText, Search, HardDrive, Download, Eye } from 'lucide-react';
import api from '../api';
import UploadFileModal from './UploadFileModal';

const DocumentVault = () => {
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Vault</h1>
          <p className="text-slate-500 text-sm">Secure local storage for G&P records</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:bg-blue-800 transition-all"
        >
          + Upload File
        </button>
      </div>

      <UploadFileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onFileUploaded={fetchDocuments} 
      />

      {/* STORAGE WIDGET */}
      <div className="bg-blue-900 text-white p-6 rounded-3xl mb-8 flex items-center gap-6 shadow-xl max-w-md">
        <HardDrive size={32} className="opacity-50" />
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Local Storage Status</p>
          <div className="flex justify-between mb-1 text-sm font-bold">
            <span>{documents.length} Files</span>
            <span>Online</span>
          </div>
          <div className="w-full bg-blue-800 h-2 rounded-full"><div className="bg-blue-400 h-full w-1/4 rounded-full"></div></div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-8 py-4">File Details</th>
                <th className="px-8 py-4">Client</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400">Loading vault...</td></tr>
              ) : documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-500" size={20} />
                      <div className="font-bold text-slate-800 text-sm group-hover:text-blue-700">{doc.filename}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium">{doc.client_name}</td>
                  <td className="px-8 py-5"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold uppercase">{doc.category}</span></td>
                  <td className="px-8 py-5 text-sm text-slate-500">
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      
                      {/* VIEW BUTTON */}
                      <button 
                        onClick={() => window.open(`http://localhost:8000/api/documents/file/${doc.id}?action=view`, '_blank')}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        title="View in Browser"
                      >
                        <Eye size={18} />
                      </button>

                      {/* DOWNLOAD BUTTON */}
                      <button 
                        onClick={() => window.location.href = `http://localhost:8000/api/documents/file/${doc.id}?action=download`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        title="Download to PC"
                      >
                        <Download size={18} />
                      </button>
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;