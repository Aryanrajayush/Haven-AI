import React from 'react';

export default function Reminders() {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const calendarDays = [];
  
  // Simple mock calendar grid for Oct 2023
  for (let i = 24; i <= 30; i++) calendarDays.push({ day: i, otherMonth: true });
  for (let i = 1; i <= 31; i++) calendarDays.push({ day: i, currentMonth: true, active: i === 23 });
  for (let i = 1; i <= 4; i++) calendarDays.push({ day: i, otherMonth: true });

  const careItems = [
    { title: 'Take medication', sub: 'Lisinopril 10mg • 8:00 AM', icon: 'medical_services', done: true },
    { title: 'Physical therapy', sub: 'Knee strengthening • 2:30 PM', icon: 'fitness_center', done: false },
    { title: 'Hydration Check', sub: 'Daily water goal • 10:00 AM', icon: 'water_drop', done: false },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <section className="bg-white rounded-xl soft-shadow p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-headline-md text-slate-900 underline underline-offset-8 decoration-slate-200">October 2023</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 rounded-full hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
          {days.map(d => (
            <div key={d} className="bg-white p-3 text-center text-xs font-bold text-slate-400">{d}</div>
          ))}
          {calendarDays.map((d, i) => (
            <div 
              key={i} 
              className={`bg-white min-h-[100px] p-3 text-sm transition-colors hover:bg-slate-50 cursor-pointer ${d.otherMonth ? 'text-slate-300' : 'text-slate-900'}`}
            >
              <span className={`flex items-center justify-center w-8 h-8 rounded-full ${d.active ? 'bg-slate-900 text-white' : ''}`}>
                {d.day}
              </span>
              {d.active && (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="h-1 w-full bg-blue-100 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-headline-sm text-slate-900">Today's Care</h3>
        <div className="grid gap-3">
          {careItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-white rounded-xl soft-shadow border border-transparent hover:border-slate-200 transition-colors group cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-400">{item.sub}</p>
                </div>
              </div>
              <div className="flex items-center">
                {item.done ? (
                  <span className="material-symbols-outlined text-slate-900 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ) : (
                  <div className="w-6 h-6 rounded-lg border-2 border-slate-200 hover:border-slate-900 transition-colors" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="fixed bottom-0 left-64 right-0 p-8 flex justify-center pointer-events-none">
        <div className="w-full max-w-5xl pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-full soft-shadow border border-slate-200 flex items-center px-8 py-4 gap-4 shadow-xl">
            <span className="material-symbols-outlined text-slate-400">edit</span>
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400" 
              placeholder="Add a reminder..." 
              type="text"
            />
            <button className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
