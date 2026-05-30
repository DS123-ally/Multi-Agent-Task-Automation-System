"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Clock, BrainCircuit, Wrench, Briefcase, Mail, FileText, Search, ChevronDown, ChevronRight, User, LogOut, Plus, MessageSquare, Menu, X, PanelLeft, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Login } from "@/components/Login";

type Role = "user" | "agent";

interface Message {
  id: string;
  role: Role;
  content: string;
  plan?: string;
  tool?: string;
  duration?: number;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: any;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, loading: authLoading } = useAuth();

  // Close sidebar by default on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // 1. Fetch Conversations List
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "conversations"),
      orderBy("updatedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Conversation[] = [];
      snapshot.forEach((doc) => {
        loaded.push({ id: doc.id, ...doc.data() } as Conversation);
      });
      setConversations(loaded);
      
      // Auto-select the first conversation if none active and there are conversations
      if (!activeConversationId && loaded.length > 0) {
        setActiveConversationId(loaded[0].id);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Fetch Messages for Active Conversation
  useEffect(() => {
    if (!user || !activeConversationId) {
      setMessages([]);
      return;
    }
    
    const q = query(
      collection(db, "users", user.uid, "conversations", activeConversationId, "messages"),
      orderBy("createdAt", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          role: data.role,
          content: data.content,
          plan: data.plan,
          tool: data.tool,
          duration: data.duration
        });
      });
      setMessages(loadedMessages);
    });
    return () => unsubscribe();
  }, [user, activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const getToolIcon = (tool: string) => {
    switch (tool.toLowerCase()) {
      case "email": return <Mail className="w-4 h-4 text-blue-500" />;
      case "linkedin": return <Briefcase className="w-4 h-4 text-blue-700" />;
      case "summary": return <FileText className="w-4 h-4 text-purple-500" />;
      case "research": return <Search className="w-4 h-4 text-emerald-500" />;
      default: return <Wrench className="w-4 h-4 text-gray-500" />;
    }
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (activeConversationId === convId) {
      setActiveConversationId(null);
    }
    await deleteDoc(doc(db, "users", user.uid, "conversations", convId));
  };

  const handleExecute = async () => {
    if (!input.trim() || isLoading || !user) return;
    
    const content = input;
    setInput("");
    setIsLoading(true);

    let currentConvId = activeConversationId;
    
    // Create new conversation if none active
    if (!currentConvId) {
      const newConvRef = doc(collection(db, "users", user.uid, "conversations"));
      currentConvId = newConvRef.id;
      await setDoc(newConvRef, {
        title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
        updatedAt: serverTimestamp()
      });
      setActiveConversationId(currentConvId);
    } else {
      // Update existing conversation timestamp so it jumps to top
      await updateDoc(doc(db, "users", user.uid, "conversations", currentConvId), {
        updatedAt: serverTimestamp()
      });
    }

    // 1. Save user message to Firestore
    await addDoc(collection(db, "users", user.uid, "conversations", currentConvId, "messages"), {
      role: "user",
      content: content,
      createdAt: serverTimestamp()
    });

    // Build chat_history string array for backend compatibility
    const chatHistory = messages.map(m => 
      m.role === "user" ? `User: ${m.content}` : `Agent: ${m.content}`
    );

    try {
      const res = await axios.post("https://multi-agent-task-automation-system-3.onrender.com/execute", {
        input: content,
        chat_history: chatHistory
      });
      
      // 2. Save agent message to Firestore
      await addDoc(collection(db, "users", user.uid, "conversations", currentConvId, "messages"), {
        role: "agent",
        content: res.data.output,
        plan: res.data.plan || null,
        tool: res.data.tool || null,
        duration: res.data.duration || null,
        createdAt: serverTimestamp()
      });
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to execute task";
      await addDoc(collection(db, "users", user.uid, "conversations", currentConvId, "messages"), {
        role: "agent",
        content: `[Error] ${errorMsg}`,
        createdAt: serverTimestamp()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    setActiveConversationId(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:relative z-50 h-full bg-slate-950 border-slate-800 flex flex-col transition-all duration-300 ease-in-out shrink-0
        ${isSidebarOpen ? "w-72 translate-x-0 border-r" : "w-72 -translate-x-full md:w-0 md:translate-x-0 md:border-r-0"}
      `}>
        {/* Inner fixed width container to prevent content squishing during animation */}
        <div className="w-72 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
            <button 
              onClick={createNewChat}
              className="flex-1 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden ml-2 p-2 text-slate-400 hover:text-slate-200 outline-none"
            >
              <X className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="hidden md:block ml-2 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors outline-none"
              title="Close Sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
            <div className="text-xs font-semibold text-slate-500 px-3 py-1 mb-2">Recent</div>
            {conversations.length === 0 ? (
              <div className="text-sm text-slate-500 px-3 py-4 text-center">No past conversations</div>
            ) : (
              conversations.map(conv => (
                <div key={conv.id} className="relative group w-full">
                  <button
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm transition-colors text-left ${
                      activeConversationId === conv.id 
                        ? "bg-slate-800 text-slate-100 font-medium pr-10" 
                        : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 pr-10"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${activeConversationId === conv.id ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"}`} />
                      <span className="truncate">{conv.title}</span>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                  {user.email?.[0].toUpperCase() || "U"}
                </div>
                <div className="text-sm font-medium text-slate-300 truncate w-32">
                  {user.displayName || user.email?.split('@')[0]}
                </div>
              </div>
              <button onClick={() => signOut(auth)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-900" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-20 flex items-center justify-between p-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-slate-200">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Agent OS</h1>
          </div>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex sticky top-0 z-20 items-center p-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 gap-3">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors outline-none"
              title="Open Sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            <h1 className="font-bold text-lg tracking-tight text-slate-200">Agent OS</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
          <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/10">
                  <BrainCircuit className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Hello, {user.displayName || user.email?.split('@')[0]}</h2>
                <h3 className="text-xl text-slate-300 font-medium mb-4">How can I help you today?</h3>
                <p className="text-slate-400 max-w-md">I'm an autonomous agent capable of researching, emailing, summarizing, and reasoning.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} getToolIcon={getToolIcon} />
              ))
            )}

            {isLoading && (
              <div className="flex gap-4 w-full">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/20 flex items-center justify-center shrink-0 shadow-sm">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex flex-col max-w-[85%] items-start">
                  <div className="text-xs font-semibold text-slate-400 mb-1 px-1">Agent OS</div>
                  <div className="flex flex-col gap-3 p-4 md:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 rounded-tl-sm shadow-xl">
                    <div className="flex gap-1.5 items-center pl-1 py-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-400/80 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-400/80 animate-bounce delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-400/80 animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 w-full p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-10">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 transition duration-500 group-focus-within:opacity-40"></div>
            <div className="relative flex items-end gap-3 bg-slate-900 border border-slate-700 rounded-3xl p-2 shadow-2xl">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleExecute();
                  }
                }}
                placeholder="Message Agent OS..."
                className="w-full bg-transparent border-0 focus:ring-0 resize-none text-slate-200 placeholder:text-slate-500 p-4 min-h-[60px] max-h-48 text-base font-medium scrollbar-thin rounded-2xl"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleExecute}
                disabled={isLoading || !input.trim()}
                className="p-3 mb-2 mr-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mt-3 text-xs text-slate-500 font-medium pb-2">
              AI can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg, getToolIcon }: { msg: Message, getToolIcon: (t: string) => React.ReactNode }) {
  const isUser = msg.role === "user";
  const [showThought, setShowThought] = useState(false);

  return (
    <div className={`flex gap-4 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isUser ? 'bg-slate-700' : 'bg-indigo-500/10 ring-1 ring-indigo-500/20'}`}>
        {isUser ? <User className="w-5 h-5 text-slate-300" /> : <BrainCircuit className="w-5 h-5 text-indigo-400" />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        
        {/* Author Name */}
        <div className="text-xs font-semibold text-slate-400 mb-1 px-1">
          {isUser ? "You" : "Agent OS"}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col gap-3 p-4 md:p-5 rounded-3xl ${
          isUser 
            ? "bg-slate-800 text-slate-100 rounded-tr-sm" 
            : "bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-sm shadow-xl"
        }`}>
          
          {/* Thought Process (Agent Only) */}
          {!isUser && msg.plan && (
            <div className="bg-slate-950/50 rounded-xl border border-slate-800/80 overflow-hidden mb-2">
              <button 
                onClick={() => setShowThought(!showThought)}
                className="w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-500" />
                  Thought Process {msg.tool && <span className="flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-slate-800 rounded-md text-slate-300 border border-slate-700">{getToolIcon(msg.tool)} {msg.tool}</span>}
                </div>
                {showThought ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {showThought && (
                <div className="p-4 border-t border-slate-800 text-sm text-slate-400 whitespace-pre-wrap leading-relaxed bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-2 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Execution Time: {msg.duration?.toFixed(2)}s
                  </div>
                  {msg.plan}
                </div>
              )}
            </div>
          )}

          {/* Actual Content */}
          <div className="text-sm md:text-base leading-relaxed overflow-x-auto max-w-none">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 break-all" />
                ),
                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 my-2 space-y-1" />,
                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 my-2 space-y-1" />,
                p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
          
        </div>
      </div>

    </div>
  );
}
