"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { MessageCircle, X, Send, Sparkles, Bot, User, Loader2, Mic, MicOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ChatAssistant() {
    const { userData } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "model",
            content: "Hello! 👋 I'm your FruitFlow Smart Assistant. I can help answer supply chain questions, advise on fruit markets, or assist with anything else you need. How can I help today?"
        }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll on new message
    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage((prev) => prev ? `${prev} ${transcript}` : transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                if (event.error !== 'no-speech') {
                    toast.error(`Mic Error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = (e) => {
        e.preventDefault();
        if (!recognitionRef.current) {
            toast.error("Your browser doesn't support Voice Assistants. Please use Google Chrome.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error(err);
                setIsListening(false);
            }
        }
    };

    // Don't show the tool if the user isn't logged in yet
    if (!userData?.uid) return null;

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMsg = inputMessage.trim();
        setInputMessage("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

        // Navigation Command Interceptor
        const lowerMsg = userMsg.toLowerCase();
        const navMatch = lowerMsg.match(/(open|go to|show me|take me to|navigate to)\s+(my\s+)?(orders|inventory|dashboard|payments|profile|settings|browse|cart)/);

        if (navMatch && userData?.role) {
            let section = navMatch[3];

            // Map variations
            if (section === 'cart' || section === 'browse') {
                if (userData.role === 'wholesaler') section = 'dashboard'; // fallback for wholesaler
            }

            const route = `/${userData.role}/${section}`;

            setMessages((prev) => [...prev, {
                role: "model",
                content: `🚀 Navigating you to your ${section}...`
            }]);

            setTimeout(() => {
                router.push(route);
                setIsOpen(false);
            }, 1000);

            return;
        }

        setIsLoading(true);

        try {
            const history = messages.slice(1); // skip initial greeting to save token space if needed

            const payload = {
                message: userMsg,
                history: history,
                context: {
                    role: userData.role,
                    name: userData.name || "User",
                    shopName: userData.shopName || userData.companyName || "Your business",
                }
            };

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to respond");
            }

            setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "model", content: `❌ Error: ${error.message}` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className={`fixed bottom-6 right-6 z-[90] transition-all duration-500 ease-in-out ${isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 focus:outline-none"
                >
                    <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping group-hover:animate-none" />
                    <MessageCircle className="w-6 h-6 text-white relative z-10" />
                    <Sparkles className="w-4 h-4 text-purple-200 absolute -top-1 -right-1 z-10 animate-bounce" />
                </button>
            </div>

            {/* Chat Window Panel */}
            <div
                className={`fixed bottom-6 right-6 z-[100] w-[380px] h-[600px] max-h-[85vh] max-w-[calc(100vw-48px)] bg-background/95 backdrop-blur-3xl border border-purple-500/20 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right transform dark:bg-[#0a0a0a]/95
        ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-20 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-md border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">FruitFlow Smart AI</h3>
                            <p className="text-xs text-purple-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Online & Ready
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                    {messages.map((message, idx) => (
                        <div
                            key={idx}
                            className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === "user" ? "bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/30 dark:text-emerald-400" : "bg-purple-500/20 text-purple-600 dark:bg-purple-500/30 dark:text-purple-400"}`}>
                                    {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                {/* Bubble - Using Markdown to render cleanly */}
                                <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm overflow-hidden text-left
                  ${message.role === "user"
                                        ? "bg-emerald-500 text-white rounded-tr-sm"
                                        : "bg-muted/80 backdrop-blur-md border border-border text-foreground rounded-tl-sm dark:bg-white/5 dark:border-white/10"}
                `}>
                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:p-2 prose-pre:rounded-lg break-words [&>p]:mb-0 [&>p]:break-words whitespace-pre-wrap">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex w-full justify-start">
                            <div className="flex gap-2 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-muted/80 border border-border rounded-tl-sm flex items-center gap-1.5 dark:bg-white/5 dark:border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-card border-t border-border shrink-0 dark:bg-[#0f0f0f] dark:border-white/10">
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2 bg-muted/50 border border-border rounded-full p-1 pl-4 transition-colors focus-within:border-purple-500/50 focus-within:bg-card dark:bg-white/5 dark:border-white/10 dark:focus-within:border-purple-500/50 dark:focus-within:bg-[#1a1a1a]"
                    >
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-foreground py-2 outline-none"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={toggleListening}
                            aria-label="Toggle voice input"
                            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-transparent text-muted-foreground hover:bg-muted dark:hover:bg-white/10 dark:text-white/60'}`}
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || isLoading}
                            className="w-9 h-9 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-purple-600"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-muted-foreground mt-2 font-medium opacity-70">
                        Powered by Google Gemini 1.5 Flash
                    </p>
                </div>
            </div>
        </>
    );
}
