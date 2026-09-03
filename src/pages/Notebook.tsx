import React from 'react';

export default function Notebook() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-12rem)]">
      {/* Welcome Greeting */}
      <div className="text-center mb-12">
        <h2 className="font-headline-lg text-3xl text-slate-900 mb-2">Welcome to Haven, shivi</h2>
        <p className="font-body-lg text-slate-500 max-w-lg mx-auto">Your sanctuary for deep thought and quiet productivity.</p>
      </div>

      {/* Writing Pad Surface */}
      <div className="writing-surface bg-white rounded-xl border border-slate-200/50 flex-1 flex flex-col p-12 lg:p-16">
        {/* Metadata Row */}
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-1">
            <p className="font-label-sm text-xs text-slate-400 uppercase tracking-[0.15em]">Tuesday, May 14, 2024</p>
            <h1 className="font-headline-lg text-3xl text-slate-900 outline-none" contentEditable="true" suppressContentEditableWarning>Daily Reflections</h1>
          </div>
          <div className="text-right">
            <p className="font-label-sm text-xs text-slate-300">Last edited 2m ago</p>
          </div>
        </div>

        {/* Note Body Content */}
        <article className="flex-1">
          <div className="font-body-lg text-lg text-slate-600 leading-relaxed outline-none space-y-6" contentEditable="true" suppressContentEditableWarning>
            <p>Starting the day with a focused intent on the upcoming AI integration modules. The goal is to create a seamless synergy between human intuition and algorithmic efficiency.</p>
            <p>Key priorities for today:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Review the user feedback on the "Digital Paper" aesthetic.</li>
              <li>Finalize the typography scale for high-density information displays.</li>
              <li>Prototype the floating action controls for the notebook canvas.</li>
            </ul>
            <p className="italic text-slate-400 border-l-2 border-slate-200 pl-6 py-2">"The best way to predict the future is to create it." — Thinking about how this applies to the Haven ecosystem.</p>
          </div>
        </article>

        {/* Embedded Assets Area */}
        <div className="mt-16 grid grid-cols-3 gap-6">
          {[
            { icon: 'add_a_photo', label: 'Photo' },
            { icon: 'mic', label: 'Record' },
            { icon: 'edit', label: 'Annotate' },
          ].map((asset) => (
            <div key={asset.label} className="aspect-square bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-slate-300 text-4xl mb-3 group-hover:text-slate-900 transition-colors">
                {asset.icon}
              </span>
              <p className="font-label-sm text-xs text-slate-400 font-semibold uppercase tracking-wider group-hover:text-slate-900 transition-colors">{asset.label}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Floating Help Button */}
      <div className="fixed bottom-8 right-8">
        <button className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>
    </div>
  );
}
