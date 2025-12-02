import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Winston, your AI course assistant. I can help you create engaging courses, suggest talk points, and answer questions about your content. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(input),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('talk point') || lowerQuery.includes('talkpoint')) {
      return "I'd recommend structuring your talk points with a clear opening hook, 2-3 key points with examples, and a summary. Would you like me to generate some suggestions based on your slide content?";
    }
    if (lowerQuery.includes('assessment') || lowerQuery.includes('quiz')) {
      return "For effective assessments, mix question types: use multiple choice for factual recall, and open-ended questions for deeper understanding. I can help you create questions that align with your learning goals.";
    }
    if (lowerQuery.includes('voice') || lowerQuery.includes('tone')) {
      return "Based on your audience settings, I'd recommend a professional yet approachable tone. The 'Professional Female US' voice tends to work well for corporate training content.";
    }
    return "I'm here to help you create an engaging course. You can ask me about talk points, assessments, voice selection, or any other aspect of course creation!";
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 border-2 border-foreground bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:shadow-lg transition-all ${isOpen ? 'hidden' : ''}`}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-card border-2 border-foreground shadow-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-foreground bg-secondary">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Winston</h3>
                <p className="text-xs text-muted-foreground">AI Course Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary border border-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t-2 border-foreground">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Winston..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
