import React, { useState, useEffect } from 'react';
import { RefreshCw, Mail, FileText, Plus, Inbox } from 'lucide-react';
import NewTicketModal from './NewTicketModal';
import api from '../api';

const GmailInbox = () => {
  const [emails, setEmails] = useState([]);
  const [syncing, setSyncing] = useState(false);
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
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Firm Mailbox</h1>
          <p className="text-slate-500 font-medium text-sm">Convert client communications into audit tickets</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
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
            <div key={email.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex justify-between items-center hover:shadow-lg hover:border-blue-200 transition-all group">
              <div className="flex gap-5 items-center">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{email.subject || '(No Subject)'}</h3>
                  <p className="text-sm text-slate-500 font-medium">{email.sender}</p>
                  <div className="flex gap-3 mt-2">
                    {email.has_attachments && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-1 rounded-md">
                        <FileText size={12}/> Attachments
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Received: {new Date(email.received_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all"
                onClick={() => handleCreateTicketFromEmail(email)}
              >
                <Plus size={14}/> Create Ticket
              </button>
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
      <NewTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTicketAdded={() => {
            // Optional: refresh list or show success toast
            setIsModalOpen(false);
        }}
        initialData={selectedEmail} // PASSING THE EMAIL DATA HERE
        />
    </div>
  );
};

export default GmailInbox;