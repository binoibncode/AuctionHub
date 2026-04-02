import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';

interface ChatMessage {
  id: string;
  from: 'user' | 'bot';
  text: string;
  time: string;
}

const CATEGORIES = ['General Inquiry', 'Technical Support', 'Billing', 'Auction Help', 'Feedback'];

const BOT_REPLIES: Record<string, string> = {
  'General Inquiry': "Thanks for reaching out! Our team will review your message and get back to you soon.",
  'Technical Support': "We've noted your technical issue. Our support team will assist you shortly.",
  'Billing': "Your billing query has been received. We'll respond within 24 hours.",
  'Auction Help': "Got your auction question! Our auction specialists will follow up soon.",
  'Feedback': "Thank you for your feedback! We truly appreciate it.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !category) {
      Swal.fire({ text: 'Please fill in all required fields.', icon: 'warning', background: '#1f2937', color: '#fff', confirmButtonColor: '#ef4444' });
      return;
    }

    const greeting: ChatMessage = {
      id: `msg-${Date.now()}`,
      from: 'bot',
      text: `Hi ${name.split(' ')[0]}! 👋 Welcome to AuctionHub support. How can we help you today?`,
      time: now(),
    };
    setMessages([greeting]);
    setStep('chat');

    if (message.trim()) {
      setTimeout(() => {
        const userMsg: ChatMessage = { id: `msg-${Date.now() + 1}`, from: 'user', text: message.trim(), time: now() };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setTimeout(() => {
          const botReply: ChatMessage = {
            id: `msg-${Date.now() + 2}`,
            from: 'bot',
            text: BOT_REPLIES[category] || BOT_REPLIES['General Inquiry'],
            time: now(),
          };
          setMessages(prev => [...prev, botReply]);
        }, 1200);
      }, 600);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, from: 'user', text: chatInput.trim(), time: now() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      const replies = [
        "Thanks for your message! Our team is looking into this.",
        "Got it! We'll get back to you shortly.",
        "Noted! Is there anything else you'd like to know?",
        "Our team will follow up on this. Hang tight!",
        "Thank you! We appreciate your patience.",
      ];
      const botReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        from: 'bot',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: now(),
      };
      setMessages(prev => [...prev, botReply]);
    }, 1000 + Math.random() * 1500);
  };

  const handleBack = () => {
    setStep('form');
    setMessages([]);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after animation
    setTimeout(() => {
      setStep('form');
      setMessages([]);
      setName('');
      setEmail('');
      setCategory('');
      setMessage('');
      setChatInput('');
    }, 300);
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open
            ? 'bg-dark-700 hover:bg-dark-600 rotate-0'
            : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-110'
        }`}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-[9990] w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl shadow-dark-900/80 border border-dark-700 transition-all duration-300 origin-bottom-right ${
          open ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-primary-500 px-5 py-4 flex items-center gap-3">
          {step === 'chat' && (
            <button onClick={handleBack} className="text-white/80 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Chat with us now</p>
            <p className="text-white/70 text-xs">We typically reply in a few minutes</p>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          /* ─── Contact Form ─── */
          <form onSubmit={handleStartChat} className="bg-dark-800 p-5 space-y-4 max-h-[420px] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Email address <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="text-dark-500">Choose a category</option>
                {CATEGORIES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                placeholder="Type your message and hit 'Start Chat'"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Start Chat
            </button>
          </form>
        ) : (
          /* ─── Chat View ─── */
          <div className="bg-dark-800 flex flex-col" style={{ height: '420px' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-dark-700 text-dark-200 rounded-bl-md'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-white/50' : 'text-dark-500'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-dark-700">
              <div className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-dark-900 border border-dark-600 rounded-full px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
