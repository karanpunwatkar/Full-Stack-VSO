import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { mockChatMessages, chatSuggestions } from "@/lib/mock-data";
import { api, ChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, Shield, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";



export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-send message from query param
  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) {
      // Clear param immediately to avoid double-send on refresh
      setSearchParams({}, { replace: true });
      sendMessage(msg);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };
    
    // Create new array to send to the API including history
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsTyping(true);
    
    try {
      // Send the history (excluding the ID or formatting it appropriately)
      const data = await api.chat(newHistory.map(m => ({ role: m.role, content: m.content })));
      
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: `**Error:** Could not connect to the AI service. Please confirm your GEMINI_API_KEY is properly set in the backend .env if using the free Gemini API. Details: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
          <div className="w-11 h-11 rounded-xl gradient-cyber-bg flex items-center justify-center cyber-glow">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              AI Security Officer
              <span className="live-indicator text-[10px]">ONLINE</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">Ask about your security posture in plain English</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === "assistant" ? "bg-primary/10 border border-primary/20" : "gradient-cyber-bg"
                }`}>
                  {msg.role === "assistant" ? (
                    <Bot className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "card-cyber"
                    : "gradient-cyber-bg text-primary-foreground"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="markdown-format prose prose-invert prose-p:leading-relaxed prose-headings:text-primary max-w-none prose-a:text-primary">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="p-4 rounded-xl card-cyber">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {chatSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                className="px-3 py-2 rounded-xl text-xs font-medium border border-border/50 bg-card/50 text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
              >
                <Sparkles className="inline h-3 w-3 mr-1.5 text-primary" />
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 h-12 px-4 rounded-xl card-cyber border-border/50 focus-within:border-primary/30 transition-colors">
            <Terminal className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about your security..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
            />
          </div>
          <Button
            size="icon"
            className="h-12 w-12 gradient-cyber-bg text-primary-foreground shrink-0 rounded-xl cyber-glow"
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
