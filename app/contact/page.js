'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { Mail, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const { t } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('support');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          topic: subject,
          subject: `Inquiry from ${name}`,
          message
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setErrorMsg(data.error || 'Failed to dispatch inquiry. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center space-y-2 mb-8">
          <Mail className="w-10 h-10 text-brand-500 mx-auto" />
          <h1 className="text-3xl font-black">{t.contactUs}</h1>
          <p className="text-xs text-slate-500">
            Have a question or feedback? Send a direct message to our support desk.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-black text-lg">Message Dispatched!</h3>
              <p className="text-xs text-slate-500">
                An email alert has been sent to our support teams. We typically reply within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Your Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Maya Chen"
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. maya@example.com"
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Inquiry Topic</label>
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold outline-none"
                >
                  <option value="support">Technical Support & Reader Help</option>
                  <option value="author">Author Guidelines & Publishing</option>
                  <option value="copyright">Copyright / DMCA Notice</option>
                  <option value="brand">Brand Partnerships & Press</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Message Content</label>
                <textarea 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Describe your inquiry in detail..."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 leading-relaxed outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-200 dark:border-rose-900">
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold shadow-md shadow-brand-500/25 transition-all cursor-pointer"
              >
                {loading ? 'Dispatching Message...' : 'Send Support Message'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
