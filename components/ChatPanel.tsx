import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon, ChevronUpIcon, ChevronDownIcon, ChatBubbleLeftRightIcon } from './icons';

interface ChatPanelProps {
    chatSession: any | null;
    assetName: string;
    isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ chatSession, assetName, isLoading }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // When a new asset is selected (and thus a new chat session),
        // clear messages and set a welcome message.
        if (chatSession && !isLoading) {
            setMessages([
                { role: 'model', content: `Hello! I'm MarketLens Pro. Ask me anything about ${assetName}.` }
            ]);
        } else {
            setMessages([]);
        }
    }, [chatSession, assetName, isLoading]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent, prompt?: string) => {
        e.preventDefault();
        const messageText = (prompt || userInput).trim();
        if (!messageText || !chatSession) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: messageText }];
        setMessages(newMessages);
        setUserInput('');
        setIsSending(true);

        try {
            const stream = await chatSession.sendMessageStream({ message: messageText });
            
            let currentResponse = '';
            setMessages(prev => [...prev, { role: 'model', content: '...' }]);

            for await (const chunk of stream) {
                currentResponse += chunk.text;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'model', content: currentResponse + '...' };
                    return updated;
                });
            }
            
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'model', content: currentResponse };
                return updated;
            });

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsSending(false);
        }
    };
    
    const examplePrompts = [
        "What are the biggest risks?",
        "Summarize the bull case.",
        "Compare with its main competitor.",
        "Recent news summary?",
    ];

    return (
        <div className="flex flex-col bg-brand-bg">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 flex justify-between items-center bg-brand-surface hover:bg-brand-border/30 transition-colors"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center space-x-2">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-brand-primary" />
                    <h3 className="font-semibold text-brand-text-primary text-sm">AI Chat Assistant</h3>
                </div>
                {isExpanded ? <ChevronDownIcon className="w-5 h-5 text-brand-text-secondary" /> : <ChevronUpIcon className="w-5 h-5 text-brand-text-secondary" />}
            </button>

            {isExpanded && (
                <div className="flex flex-col h-[350px]">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-brand-text-secondary">Initializing AI Chat...</p>
                            </div>
                        ) : messages.length === 0 ? (
                             <div className="flex justify-center items-center h-full">
                                <p className="text-brand-text-secondary">No messages yet.</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${
                                            msg.role === 'user'
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-brand-surface text-brand-text-primary'
                                        }`}
                                    >
                                        <div
                                            className="prose prose-sm prose-invert max-w-none prose-p:my-1"
                                            dangerouslySetInnerHTML={{ __html: marked.parse(msg.content.replace(/\.\.\.$/, '▌')) }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {!isLoading && chatSession && (
                        <>
                        <div className="p-2 flex-shrink-0 flex items-center space-x-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {examplePrompts.map(prompt => (
                                <button
                                key={prompt}
                                onClick={(e) => handleSendMessage(e, prompt)}
                                disabled={isSending}
                                className="text-xs text-brand-text-secondary bg-brand-surface px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-brand-border/50 disabled:opacity-50 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 flex items-center space-x-2 border-t border-brand-border">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ask a follow-up question..."
                                className="flex-1 w-full bg-brand-surface border border-brand-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                disabled={isSending || !chatSession}
                                autoComplete="off"
                            />
                            <button type="submit" disabled={isSending || !userInput.trim()} className="bg-brand-primary text-white p-2 rounded-md disabled:bg-brand-primary/50 disabled:cursor-not-allowed transition-colors">
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatPanel;
