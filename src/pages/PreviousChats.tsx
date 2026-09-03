import React from 'react';

export default function PreviousChats() {
  const sections = [
    {
      label: 'Today',
      chats: [
        { title: 'Morning Routine', icon: 'sunny', time: '07:15 AM', excerpt: 'Haven turned on the coffee maker and set the bedroom lights to 40%...' },
        { title: 'Living Room Setup', icon: 'tv_gen', time: '10:42 AM', excerpt: 'Command executed: Turned on TV and dimmed living room lights for a movie...' },
      ]
    },
    {
      label: 'Yesterday',
      chats: [
        { title: 'Lofi Focus Session', icon: 'music_note', time: '4:20 PM', excerpt: "Played 'Chill Study Beats' and set temperature to 68°F for maximum focus..." },
        { title: 'Security Check', icon: 'security', time: '11:00 PM', excerpt: 'Verified all doors were locked and bedroom lights were turned off...' },
      ]
    },
    {
      label: 'Last Week',
      chats: [
        { title: 'Home Automation Setup', icon: 'settings_input_component', time: 'Oct 24', excerpt: 'Configured new smart bulb groups for the hallway and kitchen...' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <header className="mb-12">
        <h2 className="font-headline-lg text-3xl text-slate-900 mb-2">Previous Chats</h2>
        <p className="font-body-lg text-slate-500">Your history of intellectual explorations and reflections.</p>
      </header>

      {/* Chat History Sections */}
      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.label}>
            <div className="flex items-center space-x-6 mb-8">
              <span className="font-label-md text-xs text-slate-400 uppercase tracking-widest">{section.label}</span>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>
            
            <div className="grid gap-6">
              {section.chats.map((chat, i) => (
                <div 
                  key={i} 
                  className={`group bg-white p-6 rounded-xl border border-slate-200 digital-paper-shadow hover:border-slate-400 transition-all duration-300 cursor-pointer ${chat.muted ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-start space-x-6">
                    <div className="bg-slate-50 p-4 rounded-full flex-shrink-0 group-hover:bg-slate-100 transition-colors">
                      <span className="material-symbols-outlined text-slate-900">{chat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-headline-sm text-lg text-slate-900 truncate pr-4">{chat.title}</h3>
                        <span className="font-label-sm text-xs text-slate-400 whitespace-nowrap">{chat.time}</span>
                      </div>
                      <p className="font-body-md text-slate-500 line-clamp-1">{chat.excerpt}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-200 group-hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all">
                      arrow_forward
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Load More Action */}
      <div className="mt-16 flex justify-center pb-12">
        <button className="flex items-center font-manrope text-sm font-bold text-slate-900 hover:text-slate-500 transition-colors group">
          View Complete Archive
          <span className="material-symbols-outlined ml-2 text-sm group-hover:translate-y-1 transition-transform">keyboard_double_arrow_down</span>
        </button>
      </div>
    </div>
  );
}
