import React, { useState } from 'react';
import { X, Upload, Calendar } from 'lucide-react';
import api from '../api';

const UploadFileModal = ({ isOpen, onClose, onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [clientName, setClientName] = useState('');
  const [category, setCategory] = useState('Audit');
  const [expiryDate, setExpiryDate] = useState(''); // New state for calendar
  const [uploading, setUploading] = useState(false);
  const [clientPhone, setClientPhone] = useState('');

  if (!isOpen) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_name', clientName);
    formData.append('client_phone', clientPhone); // Ensure this state exists
    formData.append('expiry_date', expiryDate);
    formData.append('category', category);
    
    try {
      // Sending client_name, category, and expiry_date as query params 
      // to match your FastAPI route structure
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onFileUploaded(response.data);
      // Reset local state
      setFile(null);
      setExpiryDate('');
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check backend console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-xl">Upload Document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Upload className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm text-slate-500 font-medium truncate px-4">
              {file ? file.name : "Click or drag file to upload"}
            </p>
          </div>

          {/* Client Name Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client Name</label>
            <input 
              required
              className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Apollo Hospitals"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WhatsApp Number</label>
            <input 
              required
              type="tel"
              style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
              className="w-full border border-[var(--border-color)] rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 919876543210"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category Select */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
              <select 
                className="w-full border border-slate-200 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Audit</option>
                <option>GST</option>
                <option>Income Tax</option>
                <option>KYC</option>
                <option>DSC</option>
              </select>
            </div>

            {/* Expiry Date Calendar Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Calendar size={10} /> Expiry Date
              </label>
              <input 
                type="date"
                className="w-full border border-slate-200 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Submission Button */}
          <button 
            disabled={uploading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
              uploading ? 'bg-slate-400' : 'bg-blue-700 hover:bg-blue-800 active:scale-95'
            }`}
          >
            {uploading ? "Uploading..." : "Start Upload"}
          </button>
          
          <p className="text-[10px] text-slate-400 text-center italic">
            Documents with expiry dates will automatically appear on the Partner Dashboard.
          </p>
        </form>
      </div>
    </div>
  );
};

export default UploadFileModal;