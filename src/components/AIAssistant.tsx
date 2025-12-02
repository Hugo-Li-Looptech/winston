import { useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm Winston, your AI course assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSpeaking(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm here to help you create an engaging course. Feel free to ask me anything about content organization, assessment strategies, or best practices for online learning.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsSpeaking(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 z-40 ${isOpen ? 'hidden' : ''}`}
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Side Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-foreground">Conversation</h3>
                <p className="text-xs text-muted-foreground">All speech is transcribed to text</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isSpeaking && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
                  </div>
                  <span className="text-sm">Winston is speaking...</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full"
                />
                <Button size="icon" onClick={handleSend} className="rounded-full">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
