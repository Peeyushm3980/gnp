import React, { useState, useEffect } from 'react';
import { RefreshCw, Mail, FileText, Plus, ChevronDown, ChevronUp, User, Clock, Inbox } from 'lucide-react';
import NewTicketModal from './NewTicketModal';
import api from '../api';

const GmailInbox = () => {
  const [emails, setEmails] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [expandedEmailId, setExpandedEmailId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // CRITICAL: Fetch emails as soon as the page loads
  useEffect(() => {
    fetchEmails();
  }, []);

  const handleCreateTicketFromEmail = (email) => {
        setSelectedEmail(email); 
        setIsModalOpen(true);
    };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gmail/emails');
      setEmails(res.data);
    } catch (err) {
      console.error("Failed to load mailbox:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/gmail/sync');
      await fetchEmails(); // Refresh list after sync
    } catch (err) {
      alert("Sync failed. Check backend logs.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase italic">Firm Mailbox</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Convert client communications into audit tickets</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          style={{ backgroundColor: 'var(--primary)' }}
          className="w-full md:w-auto text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:opacity-90 transition-all disabled:opacity-50"
        >
          <RefreshCw className={syncing ? 'animate-spin' : ''} size={20} />
          {syncing ? 'Synchronizing...' : 'Sync Gmail'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="font-bold text-xs uppercase tracking-widest">Loading Ingested Emails...</p>
        </div>
      ) : emails.length > 0 ? (
        <div className="grid gap-4">
          {emails.map(email => (
            <div key={email.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden transition-all hover:border-blue-300 shadow-sm group">
              
              {/* MAIN EMAIL ROW - RESPONSIVE GRID */}
              <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 flex gap-4 items-center">
                  <div className="hidden sm:flex p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <Mail size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg truncate pr-4">{email.subject || '(No Subject)'}</h3>
                    <p className="text-sm text-slate-500 font-medium truncate">{email.sender}</p>
                    <div className="flex gap-3 mt-2">
                      {email.has_attachments && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-1 rounded-md">
                          <FileText size={12}/> Attachments
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {new Date(email.received_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS - STACK ON MOBILE */}
                <div className="md:col-span-4 flex flex-row md:flex-row gap-2 w-full">
                  <button 
                    onClick={() => setExpandedEmailId(expandedEmailId === email.id ? null : email.id)}
                    className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                  >
                    {expandedEmailId === email.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    {expandedEmailId === email.id ? 'Hide' : 'Details'}
                  </button>
                  <button 
                    onClick={() => { setSelectedEmail(email); setIsModalOpen(true); }}
                    style={{ backgroundColor: 'var(--primary)' }}
                    className="flex-1 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:opacity-90 transition-all"
                  >
                    <Plus size={14}/> Create Ticket
                  </button>
                </div>
              </div>

              {/* EXPANDED AUDIT SECTION */}
              {expandedEmailId === email.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8 animate-in slide-in-from-top duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Metadata Panel */}
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Audit Info</label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <User size={14} className="text-blue-500"/> {email.sender}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Clock size={14} className="text-blue-500"/> {new Date(email.received_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {email.has_attachments && (
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Documents</label>
                          <div className="flex flex-wrap gap-2">
                            {email.attachments_metadata?.map((file, i) => (
                              <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-[10px] font-bold text-slate-700">
                                <FileText size={12} className="text-blue-500"/> {file.filename}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Panel */}
                    <div className="lg:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message Body</label>
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-medium shadow-inner">
                        {email.body || 'No content found in the message body.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="inline-flex p-6 bg-slate-50 text-slate-300 rounded-full mb-4">
            <Inbox size={48} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Mailbox is empty</h2>
          <p className="text-slate-400 max-w-xs mx-auto mt-2">No emails have been ingested yet. Click the Synchronize button to pull latest messages.</p>
        </div>
      )}

      {/* Conversion Modal */}
      <NewTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTicketAdded={() => {
            fetchEmails(); // Refresh list to potentially mark as converted
            setIsModalOpen(false);
        }}
        initialData={selectedEmail} 
      />
    </div>
  );
};

export default GmailInbox;