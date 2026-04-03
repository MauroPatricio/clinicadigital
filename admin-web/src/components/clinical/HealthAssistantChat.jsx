import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, MessageCircle, Sparkles } from 'lucide-react';
import { aiService } from '../../services/apiService';

const HealthAssistantChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Olá! Sou seu assistente de saúde IA da Clínica Digital. Como posso ajudar hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const context = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
            const response = await aiService.chat(input, context);
            
            setMessages(prev => [...prev, { role: 'assistant', content: response.data }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, estou com dificuldades técnicas no momento.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all hover:scale-110 z-50 animate-bounce-slow"
            >
                <MessageCircle className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 border border-gray-200 ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white rounded-t-2xl flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Assistente Digital IA</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            <span className="text-[10px] text-indigo-100 uppercase font-bold tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-white/20 p-1 rounded transition-colors">
                        <Minimize2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Body */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Footer */}
                    <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
                        <form onSubmit={handleSend} className="flex gap-2 bg-gray-100 p-2 rounded-xl focus-within:ring-2 ring-indigo-500/20 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Descreva seu sintoma ou dúvida..."
                                className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-gray-700"
                                disabled={isLoading}
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                        <div className="mt-2 flex items-center justify-center gap-1 opacity-40">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span className="text-[10px] font-medium text-gray-500">Powered by Clínica Digital AI</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HealthAssistantChat;
