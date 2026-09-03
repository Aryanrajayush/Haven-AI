import React, { useState } from 'react';
import { motion } from 'motion/react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [taskStatus, setTaskStatus] = useState<{ step: string, status: 'pending' | 'loading' | 'success' }[]>([]);
  const [homeState, setHomeState] = useState({
    tv: false,
    music: { playing: false, track: "" },
    lights: { livingRoom: false, bedroom: false },
    temperature: 72
  });
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<any>(null);

  // Manual Control Handlers
  const toggleTV = () => setHomeState(prev => ({ ...prev, tv: !prev.tv }));
  const toggleMusic = () => {
    setHomeState(prev => ({ ...prev, music: { ...prev.music, playing: !prev.music.playing, track: prev.music.playing ? "" : "Last Played" } }));
    if (!homeState.music.playing) handleOpenApp('music');
  };
  const toggleLights = () => setHomeState(prev => ({ ...prev, lights: { livingRoom: !prev.lights.livingRoom, bedroom: !prev.lights.livingRoom } }));

  const handleOpenApp = async (app: string) => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: `Direct system command: open ${app}` }],
          // This is a bit of a hack to trigger the tool call directly
        })
      });
      // The backend will execute the 'open' command
    } catch (e) {
      console.error("Failed to open app:", e);
    }
  };

  // Initialize Speech Recognition
  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Handle Listening Toggle
  React.useEffect(() => {
    if (isListening) {
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
    }
  }, [isListening]);

  // Text to Speech
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: customize voice
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    window.speechSynthesis.speak(utterance);
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent, directMessage?: string) => {
    if (e) e.preventDefault();
    const messageToSend = directMessage || input;
    if (!messageToSend.trim() || isTyping) return;

    const userMessage = messageToSend.trim();
    const lower = userMessage.toLowerCase();
    
    // Fast-path: intercept known app commands before AI gets involved
    const appToOpen = 
      (lower.includes('youtube') || lower.includes('video') || lower.includes('watch')) ? 'youtube' :
      (lower.includes('music') || lower.includes('song') || lower.includes('play')) ? 'music' :
      (lower.includes('finder') || lower.includes('files')) ? 'finder' :
      null;

    if (appToOpen) {
      const newMessages = [...messages, { role: 'user', content: userMessage }];
      setMessages(newMessages as any);
      setInput('');
      setIsListening(false);
      setTaskStatus([{ step: 'Intercepting Command', status: 'success' }, { step: `Launching ${appToOpen}...`, status: 'loading' }]);
      
      // Fire the direct open API — instant, no AI involved
      await fetch('/api/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: appToOpen })
      });

      await new Promise(r => setTimeout(r, 600));
      setTaskStatus(prev => [...prev.slice(0, 1), { ...prev[1], status: 'success' }, { step: 'Application Launched ✓', status: 'success' }]);
      
      // Update state for music widget
      if (appToOpen === 'music') {
        setHomeState(prev => ({ ...prev, music: { playing: true, track: 'Apple Music' } }));
      }

      const confirmMsg = appToOpen === 'youtube'
        ? '> EXEC: open youtube.com\n> STATUS: Browser launched. YouTube is now active.'
        : appToOpen === 'music'
        ? '> EXEC: open -a Music\n> STATUS: Apple Music launched. Audio pipeline active.'
        : `> EXEC: open ${appToOpen}\n> STATUS: Application opened.`;
      
      setMessages([...newMessages, { role: 'assistant', content: confirmMsg }] as any);
      await new Promise(r => setTimeout(r, 1200));
      setTaskStatus([]);
      return;
    }

    // Default path: send to AI
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages as any);
    setInput('');
    setIsListening(false);
    setIsTyping(true);
    setTaskStatus([]);
    
    try {
      setTaskStatus([{ step: 'Analyzing Request', status: 'loading' }]);
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();
      
      if (data.toolExecuted) {
        setTaskStatus(prev => [{ ...prev[0], status: 'success' }, { step: 'Connecting to Device', status: 'loading' }]);
        await new Promise(r => setTimeout(r, 800));
        setTaskStatus(prev => [{ ...prev[0] }, { ...prev[1], status: 'success' }, { step: `Executing ${data.toolExecuted.function}`, status: 'loading' }]);
        await new Promise(r => setTimeout(r, 600));
        setTaskStatus(prev => [...prev.slice(0, 2), { ...prev[2], status: 'success' }, { step: 'Task Completed', status: 'success' }]);
        await new Promise(r => setTimeout(r, 1000));
        setTaskStatus([]);
      } else {
        setTaskStatus([]);
      }

      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: `Error: ${data.error}` }] as any);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.response }] as any);
        speak(data.response);
        if (data.newState) setHomeState(data.newState);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Failed to connect to the server.' }] as any);
      setTaskStatus([]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[85vh] relative digital-grid overflow-hidden">
      <div className="scanline"></div>
      {/* Task Pipeline Overlay */}
      {taskStatus.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-manrope font-bold text-xs uppercase tracking-widest opacity-60">System Pipeline</h3>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150"></div>
              </div>
            </div>
            <div className="space-y-3">
              {taskStatus.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${step.status === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}>
                    <span className="material-symbols-outlined text-[12px] text-white">
                      {step.status === 'success' ? 'check' : 'sync'}
                    </span>
                  </div>
                  <span className={`text-sm font-manrope ${step.status === 'success' ? 'text-slate-400' : 'text-white'}`}>{step.step}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Home Status Widgets */}
      <div className="absolute top-4 right-4 flex flex-col gap-4 z-40">
        <button 
          onClick={toggleTV}
          className={`p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ${homeState.tv ? 'bg-blue-500/20 text-blue-900 border-blue-500/30' : 'bg-white/40 text-slate-400'}`}
        >
          <span className="material-symbols-outlined">{homeState.tv ? 'tv_gen' : 'tv_off'}</span>
          <span className="font-label-sm uppercase tracking-wider text-[10px] font-bold">TV: {homeState.tv ? 'ON' : 'OFF'}</span>
        </button>
        <button 
          onClick={toggleMusic}
          className={`p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ${homeState.music.playing ? 'bg-purple-500/20 text-purple-900 border-purple-500/30' : 'bg-white/40 text-slate-400'}`}
        >
          <span className="material-symbols-outlined animate-spin-slow" style={{ animationPlayState: homeState.music.playing ? 'running' : 'paused' }}>{homeState.music.playing ? 'music_note' : 'music_off'}</span>
          <div className="flex flex-col text-left">
            <span className="font-label-sm uppercase tracking-wider text-[10px] font-bold">Music</span>
            {homeState.music.playing && <span className="text-[9px] opacity-70 truncate max-w-[80px]">{homeState.music.track || "Playing..."}</span>}
          </div>
        </button>
        <button 
          onClick={toggleLights}
          className={`p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ${homeState.lights.livingRoom || homeState.lights.bedroom ? 'bg-amber-500/20 text-amber-900 border-amber-500/30' : 'bg-white/40 text-slate-400'}`}
        >
          <span className="material-symbols-outlined">{homeState.lights.livingRoom || homeState.lights.bedroom ? 'lightbulb' : 'lightbulb_outline'}</span>
          <span className="font-label-sm uppercase tracking-wider text-[10px] font-bold">Lights</span>
        </button>
        <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-3 text-slate-600">
          <span className="material-symbols-outlined">thermostat</span>
          <span className="font-label-sm uppercase tracking-wider text-[10px] font-bold">{homeState.temperature}°F</span>
        </div>

        {/* System Launchpad */}
        <div className="mt-8 pt-8 border-t border-blue-500/10">
          <p className="text-[10px] font-bold text-blue-500/50 uppercase tracking-[0.2em] mb-4 text-center">System Launchpad</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleOpenApp('music')}
              className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-all group relative shadow-lg"
              title="Open Apple Music"
            >
              <span className="material-symbols-outlined">library_music</span>
              <span className="absolute left-14 px-2 py-1 bg-slate-900 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Apple Music</span>
            </button>
            <button 
              onClick={() => handleOpenApp('youtube')}
              className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-red-600 transition-all group relative shadow-lg"
              title="Open YouTube"
            >
              <span className="material-symbols-outlined">video_library</span>
              <span className="absolute left-14 px-2 py-1 bg-slate-900 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">YouTube</span>
            </button>
            <button 
              onClick={() => handleOpenApp('finder')}
              className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-all group relative shadow-lg"
              title="Open Finder"
            >
              <span className="material-symbols-outlined">folder_open</span>
              <span className="absolute left-14 px-2 py-1 bg-slate-900 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Finder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Display Area */}
      <div
        ref={scrollRef}
        className="w-full max-w-[48rem] flex-1 overflow-y-auto px-4 py-8 space-y-8 no-scrollbar max-h-[60vh]"
      >
        {messages.length === 0 && !isTyping && (
          <div className="text-center space-y-4 py-20">
            <h1 className="font-headline-lg text-4xl lg:text-5xl text-on-background font-bold tracking-tight">
              Welcome to Haven, shivi
            </h1>
            <p className="font-body-md text-slate-500 max-w-md mx-auto">
              How can I help you settle into focus today?
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-900' : 'bg-blue-600'}`}>
              <span className="material-symbols-outlined text-white text-sm">
                {msg.role === 'user' ? 'person' : 'terminal'}
              </span>
            </div>
            <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' 
                : 'bg-slate-950 text-blue-400 border-blue-900/50 rounded-tl-none font-mono text-xs lg:text-sm'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 opacity-50 border-b border-blue-900/30 pb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="uppercase tracking-[0.2em] text-[10px]">System Log Output</span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">
                {msg.role === 'assistant' && "> "}{msg.content}
                {msg.role === 'assistant' && i === messages.length - 1 && !isTyping && <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 animate-pulse"></span>}
              </p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-2xl rounded-tl-none p-5 border border-white/20 shadow-sm">
              <div className="flex gap-1.5 py-1">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-blue-400 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Center Interaction (only if no messages) */}
      {messages.length === 0 && !isTyping && (
        <div className="pb-32">
          <div
            className="relative group cursor-pointer"
            onClick={() => setIsListening(!isListening)}
          >
            {/* Outer Glows */}
            <motion.div
              animate={{
                scale: isListening ? [1.1, 1.2, 1.1] : 1.1,
                opacity: isListening ? [0.2, 0.4, 0.2] : 0.2
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full blur-3xl scale-110 bg-blue-500/20"
            />

            {/* Main Circle */}
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border border-blue-400/30 flex items-center justify-center shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
              <div className="w-36 h-36 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-white/30 bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-4xl opacity-80 group-hover:opacity-100 transition-opacity">
                    {isListening ? 'graphic_eq' : 'mic'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interaction Zone */}
      <div className="fixed bottom-0 left-64 right-0 pb-12 flex flex-col items-center gap-6 z-30 transition-all duration-300">
        {/* Quick Action Chips & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {['turn on the tv', 'play lofi music', 'set temp to 68'].map((action) => (
              <button
                key={action}
                className="px-5 py-1.5 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300 font-label-md text-xs text-slate-500 active:scale-95 shadow-sm"
                onClick={() => {
                  handleSendMessage(undefined, action);
                }}
              >
                {action}
              </button>
            ))}
          </div>

          {messages.length > 0 && (
            <button
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all active:scale-90"
              onClick={() => setMessages([])}
              title="Clear conversation"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
            </button>
          )}
        </div>

        {/* Search Bar Container */}
        <form
          className="w-full max-w-[42rem] px-8"
          onSubmit={handleSendMessage}
        >
          <div className="relative flex items-center group">
            {/* Glass Background */}
            <div className={`absolute inset-0 bg-white/80 backdrop-blur-xl rounded-full border transition-all duration-500 shadow-xl ${isListening ? 'border-blue-400 ring-4 ring-blue-500/10' : 'border-slate-200 group-focus-within:border-slate-400'}`}></div>

            {/* Icon Prefix */}
            <div className="relative pl-6 pr-4 flex items-center justify-center">
              <span className={`material-symbols-outlined transition-colors ${isListening ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`}>
                {isListening ? 'graphic_eq' : 'local_florist'}
              </span>
            </div>

            {/* Input */}
            <input
              className="relative flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400 font-body-md py-5 focus:placeholder-transparent transition-all"
              placeholder={isListening ? "Listening..." : "Type your thought here..."}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />

            {/* Action Button (Send or Mic) */}
            <div className="relative pr-4">
              <button
                type={input.trim() ? "submit" : "button"}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all ${input.trim() ? 'bg-blue-600' : isListening ? 'bg-blue-500' : 'bg-slate-900'}`}
                onClick={(e) => {
                  if (!input.trim()) {
                    e.preventDefault();
                    setIsListening(!isListening);
                  }
                }}
              >
                <span className="material-symbols-outlined">
                  {input.trim() ? 'arrow_upward' : isListening ? 'stop' : 'mic'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
