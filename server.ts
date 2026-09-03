import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Direct App Opener - no AI involved, instant execution
  app.post("/api/open", (req, res) => {
    const { app: appName } = req.body;
    console.log(`[Haven OS] Direct open: ${appName}`);
    
    if (appName === "youtube") exec('open https://www.youtube.com');
    else if (appName === "music") exec('open -a Music');
    else if (appName === "finder") exec('open .');
    else if (appName === "browser") exec('open https://www.google.com');
    else if (appName === "terminal") exec('open -a Terminal');
    
    res.json({ success: true, opened: appName });
  });

  // Mock State for "Remote Objects"
  let homeState = {
    tv: false,
    music: { playing: false, track: "" },
    lights: { livingRoom: false, bedroom: false },
    temperature: 72
  };

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
      const ollamaModel = process.env.OLLAMA_MODEL || "gemma4:e4b";

      console.log(`[Haven OS] Requesting ${ollamaModel}...`);

      const systemPrompt = {
        role: "system",
        content: `You are Haven OS, an advanced technical home management system. 
        Your communication style is technical, precise, and pipeline-oriented. 
        Report on system status and execution logs using technical terminology.

        To execute a command, you MUST include a tool tag in your response like this:
        [TOOL: {"function": "open_app", "args": {"app": "youtube"}}]

        Available functions:
        - toggle_tv(state: boolean)
        - play_music(track: string)
        - toggle_lights(room: "livingRoom" | "bedroom", state: boolean)
        - set_temp(value: number)
        - open_app(app: "music" | "youtube" | "finder" | "terminal" | "browser")
        - watch_video(topic: string)

        Current Home State: ${JSON.stringify(homeState)}`
      };

      const messagesWithSystem = [systemPrompt, ...messages];
      
      const response = await fetch(`${ollamaHost}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: messagesWithSystem,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Haven OS] Ollama Request Failed:", errorText);
        throw new Error(`Ollama error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      let assistantResponse = data.message.content;
      console.log("[Haven OS] Raw Response:", assistantResponse);
      
      let executedTool = null;

      // Robust Tag-based Tool Parser
      const toolMatch = assistantResponse.match(/\[TOOL: (.*?)\]/);
      if (toolMatch) {
        try {
          const toolData = JSON.parse(toolMatch[1]);
          executedTool = toolData;
          console.log(`[Haven OS] Executing tool:`, toolData.function);
          
          if (toolData.function === "toggle_tv") {
            homeState.tv = toolData.args.state;
          } else if (toolData.function === "play_music") {
            homeState.music = { playing: true, track: toolData.args.track };
            exec('open -a Music');
          } else if (toolData.function === "toggle_lights") {
            homeState.lights[toolData.args.room as keyof typeof homeState.lights] = toolData.args.state;
          } else if (toolData.function === "set_temp") {
            homeState.temperature = toolData.args.value;
          } else if (toolData.function === "open_app") {
            const app = toolData.args.app;
            if (app === "music") exec('open -a Music');
            else if (app === "youtube") exec('open https://youtube.com');
            else if (app === "finder") exec('open .');
            else if (app === "terminal") exec('open -a Terminal');
            else if (app === "browser") exec('open https://google.com');
          } else if (toolData.function === "watch_video") {
            const query = encodeURIComponent(toolData.args.topic);
            exec(`open "https://www.youtube.com/results?search_query=${query}"`);
          }
          
          // Remove the tag from the verbal response
          assistantResponse = assistantResponse.replace(/\[TOOL: .*?\]/, "").trim();
        } catch (e) {
          console.error("[Haven OS] Tool Tag Parse Error:", e);
        }
      }

      res.json({ 
        response: assistantResponse,
        toolExecuted: executedTool,
        newState: homeState 
      });
    } catch (error) {
      console.error("Error calling Ollama:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to connect to Ollama." });
    }
  });

  // Mock data for the "app.py" functionality requested
  let journalEntries = [
    { id: 1, date: "Oct 24, 2023", title: "Morning Reflection", emoji: "😌", content: "Today started with a quiet cup of tea and some light meditation. I feel more centered than I have in weeks, though I still have some lingering anxiety about..." },
    { id: 2, date: "Oct 23, 2023", title: "Gratitude List", emoji: "✨", content: "Things to be thankful for today: 1. The warm sunlight hitting my desk. 2. A productive sync with the design team. 3. Finishing that book finally..." },
    { id: 3, date: "Oct 21, 2023", title: "Working through stress", emoji: "🌱", content: "The deadline is approaching and I can feel the tension in my shoulders. Trying to break tasks into smaller pieces to manage the overwhelm..." }
  ];

  app.get("/api/journal", (req, res) => {
    res.json(journalEntries);
  });

  app.post("/api/journal", (req, res) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...req.body
    };
    journalEntries = [newEntry, ...journalEntries];
    res.json(newEntry);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
