import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, X, FileText, Trash2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: newMessages,
          pdfContext: pdfContext || undefined
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...newMessages, { role: 'ai', content: data.response }]);
      } else {
        setMessages([...newMessages, { role: 'ai', content: 'Sorry, I could not answer that.' }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'ai', content: 'Sorry, there was an error.' }]);
    }
    setLoading(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setPdfLoading(true);
    setPdfName(file.name);
    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'chatbot-pdf');
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Failed to upload file');
      const uploadData = await uploadRes.json();
      // Analyze PDF
      const analyzeRes = await fetch('/api/chatbot-analyze-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: uploadData.fileId })
      });
      const analyzeData = await analyzeRes.json();
      if (analyzeData.success) {
        setPdfContext(analyzeData.content);
      } else {
        throw new Error(analyzeData.error || 'Failed to analyze PDF');
      }
    } catch (err) {
      alert('Failed to analyze PDF.');
      setPdfContext(null);
      setPdfName(null);
    }
    setPdfLoading(false);
  };

  return (
    <>
      {/* Floating Chatbot Icon */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          onClick={() => setOpen(true)}
          aria-label="Open chatbot"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </button>
      )}
      {/* Chatbot Window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-full max-w-sm z-50 bg-white dark:bg-black border rounded-lg shadow-lg flex flex-col h-[480px] animate-fade-in">
          <div className="flex items-center px-4 py-2 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg justify-between">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              <span className="font-bold">AI Chatbot</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chatbot">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* PDF context indicator */}
          {pdfContext && pdfName && !pdfLoading && (
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900 rounded px-2 py-1 mx-4 mt-2">
              <FileText className="w-4 h-4" />
              <span className="truncate max-w-[120px]">{pdfName}</span>
              <Button size="icon" variant="ghost" onClick={() => { setPdfContext(null); setPdfName(null); }} aria-label="Remove PDF">
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          )}
          {pdfLoading && <div className="text-xs text-blue-600 mx-4 mt-2">Analyzing PDF...</div>}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">Ask me anything about your flash cards or quizzes!{pdfContext && ' (PDF context loaded)'}</div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center p-2 border-t gap-2">
            <Input
              className="flex-1"
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              disabled={loading}
            />
            <label className="relative">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfUpload}
                disabled={pdfLoading}
              />
              <Button size="icon" variant="ghost" asChild disabled={pdfLoading} aria-label="Upload PDF">
                <span><FileText className="w-5 h-5 text-blue-600" /></span>
              </Button>
            </label>
            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? '...' : 'Send'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
} 