import React, { useState, useEffect } from 'react';

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  emoji: string;
  content: string;
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/journal')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!newEntry.trim()) return;

    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "New Reflection",
        emoji: "📝",
        content: newEntry
      })
    });

    if (res.ok) {
      const saved = await res.json();
      setEntries([saved, ...entries]);
      setNewEntry('');
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto flex flex-col gap-10">
      {/* Header Section */}
      <header className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-3xl text-slate-900">Daily Journal</h1>
        <p className="font-body-md text-slate-500">Capture your thoughts and maintain your inner balance.</p>
      </header>

      {/* New Entry Section */}
      <section className="w-full">
        <div className="bg-white rounded-xl custom-entry-shadow p-8 border border-slate-100 transition-all">
          <div className="flex flex-col gap-4">
            <label className="font-label-md text-sm uppercase tracking-wider text-slate-500" htmlFor="journal-entry">New Entry</label>
            <textarea 
              className="w-full p-6 bg-slate-50 rounded-lg border-transparent focus:border-slate-200 focus:ring-0 font-body-lg text-lg text-slate-900 placeholder-slate-400 resize-none transition-all" 
              id="journal-entry" 
              placeholder="How are you feeling today, Shivi?" 
              rows={6}
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined">mood</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
              </div>
              <button 
                className="bg-slate-900 text-white px-10 py-3 rounded-lg font-label-md hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-50"
                onClick={handleSave}
                disabled={!newEntry.trim()}
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Previous Entries Section */}
      <section className="flex flex-col gap-6 mb-16">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-xl text-slate-900">Previous Entries</h2>
          <button className="text-slate-500 font-label-md text-sm hover:text-slate-900 transition-colors flex items-center gap-1">
            View Archive <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        
        <div className="grid gap-4">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading your history...</div>
          ) : entries.map(entry => (
            <div key={entry.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-400 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{entry.date}</span>
                  <span className="font-label-md text-slate-900 group-hover:text-primary transition-colors">{entry.title}</span>
                </div>
                <span className="text-2xl">{entry.emoji}</span>
              </div>
              <p className="font-body-md text-slate-500 line-clamp-2">{entry.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
