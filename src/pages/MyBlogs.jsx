import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  BookOpen, Calendar, User, Sparkles, Tag, Eye, Globe, Users, Lock, Edit3, Save,
  Image as ImageIcon, Upload, X, Trash2, Edit, Bold, Italic, Underline, List,
  Link, Quote, Code, Heart, MessageCircle, Share, Bookmark, Send, Smile,
  Bot, MessageSquare, Wand2, RefreshCw, Copy, Check, Minimize2, Maximize2
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Groq AI Service Handler
class GroqAIService {
  constructor() {
    // Hardcoded API key as requested
    this.apiKey = `${import.meta.env.VITE_GROQ_API_KEY}`; 
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama-3.3-70b-versatile';
  }

  async generateResponse(userMessage) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.getFallbackResponse(userMessage);
    } catch (error) {
      console.error('Groq AI Service Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  getSystemPrompt() {
    return `You are an expert AI writing assistant for bloggers. Your specialties include:

CORE ABILITIES:
• Writing Enhancement: Improve clarity, engagement, and readability
• Title Generation: Create compelling, SEO-friendly headlines
• Content Creation: Write introductions, conclusions, and body paragraphs
• Grammar & Style: Fix errors and improve writing flow
• Creative Writing: Add storytelling elements and engaging content

RESPONSE GUIDELINES:
• Keep responses under 300 words unless specifically asked for longer content
• Be specific and actionable in your advice
• When improving text, provide the improved version
• When generating titles, provide 3-5 options
• Use markdown formatting when helpful
• Be encouraging and supportive

WRITING STYLE:
• Professional yet conversational
• Creative and engaging
• Clear and concise
• Focused on practical value

Always aim to help users create content that engages readers and achieves their blogging goals.`;
  }

  getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('title') || lowerMessage.includes('headline')) {
      return `Here are some engaging title ideas based on your request:

• **"The Ultimate Guide to [Your Topic]: Everything You Need to Know"**
• **"5 Surprising Ways [Your Topic] Can Transform Your Life"**
• **"Why Everyone's Talking About [Your Topic] Right Now"**
• **"The Secret to [Your Topic] That Experts Don't Want You to Know"**
• **"From Beginner to Pro: Mastering [Your Topic] in 2025"**

💡 **Tip**: Replace [Your Topic] with your specific subject for maximum impact!`;
    }
    
    if (lowerMessage.includes('introduction') || lowerMessage.includes('intro')) {
      return `Here's an engaging introduction template you can customize:

**"Have you ever wondered why some blog posts capture your attention from the very first sentence? The secret lies in crafting an introduction that speaks directly to your reader's curiosity and needs. In today's fast-paced digital world, you have just seconds to hook your audience and make them want to read more.**

**This post will reveal the strategies that top content creators use to create irresistible openings that keep readers engaged until the very last word."**

🎯 **Customize this** by replacing the topic with your specific subject!`;
    }
    
    if (lowerMessage.includes('conclusion') || lowerMessage.includes('ending')) {
      return `Here's a compelling conclusion template:

**"As we wrap up this journey together, remember that every great story has the power to inspire, educate, and transform. The insights we've explored today are just the beginning of your own unique adventure.**

**Take these ideas, make them your own, and don't forget to share your experiences along the way. Your story matters, and the world is waiting to hear it.**

**What will you create next?"**

✨ **This template** creates emotional connection and encourages action!`;
    }
    
    return `I'm your AI writing assistant 🚀

**I can help you with:**

🎯 **Content Creation**
• Generate engaging blog titles
• Write compelling introductions
• Create powerful conclusions
• Develop body paragraphs

✍️ **Content Improvement** 
• Enhance writing style and clarity
• Fix grammar and spelling
• Improve readability and flow
• Add creative elements

📝 **Writing Support**
• Overcome writer's block
• Structure your ideas
• Optimize for engagement
• Polish your final draft

**What would you like to work on today?** Just describe what you need help with!`;
  }

  isConfigured() {
    return this.apiKey && this.apiKey.length > 0;
  }
}

// Rate limiting for API protection
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) { // 10 requests per minute
    this.requests = [];
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getTimeUntilNextRequest() {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    const timeUntilReset = this.timeWindow - (Date.now() - oldestRequest);
    return Math.max(0, Math.ceil(timeUntilReset / 1000));
  }
}

// Initialize services
const groqService = new GroqAIService();
const rateLimiter = new RateLimiter();

// Emoji picker component
const EmojiPicker = ({ onEmojiSelect, isOpen, onClose }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃',
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👈', '👉', '👆', '🔥', '⭐',
    '🌟', '✨', '⚡', '💥', '💢', '💫', '💦', '💨', '💖', '💝', '💗', '💓',
    '💞', '💕', '💘', '💯', '🎉', '🎊'
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 w-64 max-h-48 overflow-y-auto">
      <div className="grid grid-cols-8 gap-1">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded text-lg"
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// Rich text editor toolbar
const TextEditor = ({ content, onChange, placeholder }) => {
  const textAreaRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const insertText = (before, after = '') => {
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || ' ';
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatText = (type) => {
    switch (type) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'underline':
        insertText('<u>', '</u>');
        break;
      case 'quote':
        insertText('> ');
        break;
      case 'code':
        insertText('`', '`');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) insertText(`[`, `](${url})`);
        break;
      case 'list':
        insertText('- ');
        break;
      default:
        break;
    }
  };

  const insertEmoji = (emoji) => {
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const newText = content.substring(0, start) + emoji + content.substring(start);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const parseContent = (text) => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
    const modifiedText = text.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
    const parsed = marked.parse(modifiedText);
    const sanitized = DOMPurify.sanitize(parsed, {
      ALLOWED_TAGS: ['strong', 'em', 'u', 'a', 'code', 'blockquote', 'ul', 'li', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
    });
    return sanitized;
  };

  const renderContent = (text) => {
    const parsed = parseContent(text);
    const wrapped = parsed.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    return wrapped;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200 flex-wrap">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => formatText('quote')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('code')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('list')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('link')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Link"
        >
          <Link className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          <EmojiPicker
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onEmojiSelect={insertEmoji}
          />
        </div>
      </div>
      
      <textarea
        ref={textAreaRef}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#088395] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
        rows="10"
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
      
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div 
          className="prose max-w-none text-gray-700 leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: renderContent(content) }} 
        />
      </div>
      
      <div className="text-xs text-gray-500">
        Supports: **bold**, *italic*, <u>underline</u>, `code`, quote, [link](url), - list
      </div>
    </div>
  );
};

// Social interaction component
const SocialActions = ({ blog, onLike, onComment, onSave, onShare }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(blog.comments || []);
  const [newComment, setNewComment] = useState('');

  const handleLike = async () => {
    try {
      await onLike(blog._id);
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      await onComment(blog._id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              liked
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm">{blog.likes?.length || 0}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-[#088395] hover:bg-[#EBF4F6] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{comments.length}</span>
          </button>

          <button
            onClick={() => onShare(blog._id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-[#088395] hover:bg-[#EBF4F6] transition-colors"
          >
            <Share className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSaved(!saved);
              onSave(blog._id);
            }}
            className={`p-2 rounded-lg transition-colors ${
              saved
                ? 'text-[#088395] bg-[#EBF4F6]'
                : 'text-gray-600 hover:text-[#088395] hover:bg-[#EBF4F6]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>

          <button className="p-2 rounded-lg text-gray-600 hover:text-[#088395] hover:bg-[#EBF4F6] transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#088395] focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-[#088395] text-white rounded-lg hover:bg-[#071952] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map((comment, index) => (
              <div key={comment._id || index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#088395] rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {comment.author?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.author?.name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// AI Chatbot Component
const AIChatbot = ({ isOpen, onClose, onContentSuggestion }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "🚀 **Hi! I'm your AI writing assistant!**\n\nI'm here to help you create amazing blog content:\n\n✨ **Generate catchy titles**\n📝 **Write engaging introductions**\n🎯 **Improve your writing style**\n✅ **Fix grammar and flow**\n💡 **Add creative elements**\n\n**Just tell me what you need help with!** 🤖"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick action buttons
  const quickActions = [
    { label: "Generate titles", prompt: "Generate 5 creative and engaging blog titles for:" },
    { label: "Write introduction", prompt: "Write an engaging introduction paragraph for a blog post about:" },
    { label: "Improve text", prompt: "Please improve and enhance this text to make it more engaging:" },
    { label: "Fix grammar", prompt: "Please fix grammar, spelling, and improve clarity of this text:" },
    { label: "Add conclusion", prompt: "Write a compelling conclusion that summarizes:" },
    { label: "Make creative", prompt: "Rewrite this text to be more creative and engaging:" }
  ];

  const generateAIResponse = async (userMessage) => {
    return await groqService.generateResponse(userMessage);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check rate limiting
    if (!rateLimiter.canMakeRequest()) {
      const waitTime = rateLimiter.getTimeUntilNextRequest();
      setApiError(`⏱️ Rate limit reached. Please wait ${waitTime} seconds before trying again.`);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await generateAIResponse(inputMessage);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: error.message.includes('401')
          ? `😔 **API Key Issue**: Your key returned 401 (Unauthorized). Please check the hardcoded key or regenerate it at [console.groq.com/keys](https://console.groq.com/keys).`
          : "😔 Connection issue—check your network or try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt) => {
    setInputMessage(prompt + " ");
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('copied');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const insertIntoContent = (text) => {
    onContentSuggestion(text);
    setCopySuccess('inserted');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071952] to-[#088395] p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-1">
                Blog AI Assistant
                {groqService.isConfigured() && <span className="w-2 h-2 bg-green-400 rounded-full"></span>}
              </h3>
              {!isMinimized && (
                <p className="text-white/70 text-sm">
                  {groqService.isConfigured() ? 'Ready to help with your writing!' : 'AI not configured'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-white" />
              ) : (
                <Minimize2 className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 h-96 overflow-y-auto bg-gray-50">
              {/* API Status */}
              <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-700 font-medium">🤖 Blog AI (Mixtral-8x7B)</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    groqService.isConfigured()
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {groqService.isConfigured() ? '🟢 Connected' : '🟡 API Key Needed'}
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {apiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-700">{apiError}</span>
                    <button
                      onClick={() => setApiError(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Copy Success Notification */}
              {copySuccess && (
                <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4" />
                    {copySuccess === 'copied' ? 'Text copied to clipboard!' : 'Text inserted into content!'}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-[#088395] text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      <div 
                        className="whitespace-pre-wrap text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(marked.parse(message.content))
                        }}
                      />
                      {message.type === 'bot' && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={() => insertIntoContent(message.content)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Insert into content"
                          >
                            <Wand2 className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#088395]" />
                        <span className="text-sm text-gray-600">Groq AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1">
                {quickActions.slice(0, 3).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading}
                    className="text-xs bg-[#EBF4F6] text-[#071952] px-2 py-1 rounded-full hover:bg-[#088395] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                  placeholder="Ask me to help improve your content..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#088395] focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2 bg-[#088395] text-white rounded-xl hover:bg-[#071952] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function MyBlog() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editingBlog, setEditingBlog] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  const categories = [
    "Technology", "Lifestyle", "Travel", "Food", "Health",
    "Business", "Education", "Entertainment", "Sports", "Other"
  ];

  // Get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    return token;
  };

  // API calls with proper authentication
  const apiCall = async (method, url, data = null) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const config = {
        method,
        url: `${import.meta.env.VITE_API_URL}/api/blogs${url}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axios(config);
      return response;
    } catch (error) {
      console.error('API Call Error:', error.response || error);
      throw error;
    }
  };

  // Fetch user's blogs
  const fetchBlogs = async () => {
    try {
      const res = await apiCall('GET', '/my-blogs');
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      alert('Failed to fetch blogs. Please try again.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchBlogs();
    }
  }, [user]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Create or update blog
  const handlePublish = async (saveAsDraft = false) => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add blog data
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('category', category.trim() || 'Other');
      formData.append('tags', JSON.stringify(tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []));
      formData.append('visibility', visibility);
      formData.append('isDraft', saveAsDraft.toString());
      
      // Add image file if exists
      if (imageFile) {
        formData.append('coverImage', imageFile);
      }

      const token = getAuthToken();
      
      let response;
      if (editingBlog) {
        // Update existing blog
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/blogs/${editingBlog._id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Create new blog
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/blogs`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      if (response.data.success) {
        resetForm();
        fetchBlogs();
        alert(editingBlog ? 'Blog updated successfully!' : 'Blog created successfully!');
      } else {
        alert(response.data.message || 'Unexpected server response. Please try again.');
      }
    } catch (err) {
      console.error('Detailed error:', err);
      let errorMessage = "Failed to save blog. Please try again.";
      
      if (err.response?.status === 413) {
        errorMessage = 'File too large. Please select an image under 5MB.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else if (err.message.includes('No authentication token')) {
        errorMessage = 'Please log in again.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Social interaction handlers
  const handleLike = async (blogId) => {
    try {
      await apiCall('POST', `/${blogId}/like`);
      fetchBlogs();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (blogId, content) => {
    try {
      await apiCall('POST', `/${blogId}/comment`, { content });
      fetchBlogs();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleSave = async (blogId) => {
    console.log('Save post:', blogId);
  };

  const handleShare = async (blogId) => {
    try {
      const blog = blogs.find(b => b._id === blogId);
      if (blog) {
        const shareUrl = `${window.location.origin}/blog/${blogId}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('Blog link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("");
    setTags("");
    setVisibility("public");
    setIsDraft(false);
    setImageFile(null);
    setImagePreview("");
    setEditingBlog(null);
    removeImage();
  };

  // Edit blog
  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setCategory(blog.category || "");
    setTags(blog.tags ? blog.tags.join(', ') : "");
    setVisibility(blog.visibility || "public");
    setIsDraft(blog.isDraft || false);
    setImagePreview(blog.coverImage || "");

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete blog
  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await apiCall('DELETE', `/${blogId}`);
      fetchBlogs();
      alert('Blog deleted successfully!');
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const getVisibilityIcon = (vis) => {
    switch (vis) {
      case "public": return <Globe className="w-4 h-4" />;
      case "friends": return <Users className="w-4 h-4" />;
      case "private": return <Lock className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (vis) => {
    switch (vis) {
      case "public": return "text-[#088395] bg-[#EBF4F6]";
      case "friends": return "text-[#37B7C3] bg-[#EBF4F6]";
      case "private": return "text-gray-600 bg-gray-100";
      default: return "text-[#088395] bg-[#EBF4F6]";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (text, maxLength = 150) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Parse content for display
  const parseContent = (text) => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
    const modifiedText = text.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
    const parsed = marked.parse(modifiedText);
    const sanitized = DOMPurify.sanitize(parsed, {
      ALLOWED_TAGS: ['strong', 'em', 'u', 'a', 'code', 'blockquote', 'ul', 'li', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
    });
    return sanitized;
  };

  const renderContent = (text) => {
    const parsed = parseContent(text);
    const wrapped = parsed.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    return wrapped;
  };

  // Handle content suggestions from AI chatbot
  const handleContentSuggestion = (suggestedContent) => {
    // Clean the content from markdown formatting for insertion
    const cleanContent = suggestedContent.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    
    if (cleanContent.toLowerCase().includes('title') && cleanContent.includes('•')) {
      // If it's title suggestions, don't auto-insert
      alert('Title suggestions are ready! You can copy them from the chatbot and use them manually.');
    } else if (content.trim() === '') {
      // If content is empty, replace it
      setContent(cleanContent);
    } else {
      // Append to existing content
      setContent(prev => prev + '\n\n' + cleanContent);
    }
    setShowChatbot(false); // Close chatbot after suggestion
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF4F6] via-[#EBF4F6] to-[#37B7C3]/20">
      <style>
        {`
          .prose strong {
            font-weight: 700;
          }
          .prose em {
            font-style: italic;
          }
          .prose u {
            text-decoration: underline;
          }
          .prose a {
            color: #088395;
            text-decoration: underline;
          }
          .prose code {
            background-color: #f3f4f6;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
          }
          .prose blockquote {
            border-left: 4px solid #d1d5db;
            padding-left: 1rem;
            font-style: italic;
          }
          .prose ul {
            list-style-type: disc;
            padding-left: 1.5rem;
          }
          .prose p {
            margin: 0.5rem 0;
          }
        `}
      </style>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-[#071952] to-[#088395] rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#071952]">
              My Blog Studio
            </h1>
            <Sparkles className="w-5 h-5 text-[#088395]" />
          </div>
          <p className="text-gray-600 text-lg">Create, organize, and share your stories with the world</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Blog Creation Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-[#071952] to-[#088395] px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <h2 className="text-lg font-semibold">
                  {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChatbot(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  Get AI Help
                </button>
                {editingBlog && (
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 block">Title *</label>
                <button
                  onClick={() => setShowChatbot(true)}
                  className="text-xs text-[#088395] hover:text-[#071952] flex items-center gap-1"
                >
                  <Bot className="w-3 h-3" />
                  Generate titles with AI
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter an engaging title for your blog post..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#088395] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Cover Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#088395] transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Upload a cover image for your blog post</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload').click()}
                  className="mt-4 px-4 py-2 bg-[#EBF4F6] text-[#071952] border border-[#37B7C3] rounded-lg hover:bg-[#37B7C3]/10 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </button>
              </div>
            </div>

            {/* Category and Tags Row */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Category</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#088395] focus:border-transparent transition-all duration-200 text-gray-900"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Tags</label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#088395] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-gray-500">Example: react, javascript, web development</p>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Visibility</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "public", label: "Public", icon: Globe, desc: "Everyone can see" },
                  { value: "friends", label: "Friends", icon: Users, desc: "Only friends" },
                  { value: "private", label: "Private", icon: Lock, desc: "Only you" }
                ].map(({ value, label, icon: Icon, desc }) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      visibility === value ? 'border-[#088395] bg-[#EBF4F6]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={value}
                      checked={visibility === value}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <Icon className={`w-5 h-5 mb-2 ${visibility === value ? 'text-[#088395]' : 'text-gray-400'}`} />
                      <span className={`font-medium text-sm ${visibility === value ? 'text-[#071952]' : 'text-gray-700'}`}>
                        {label}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">{desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Rich Text Editor with AI Integration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 block">Content *</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChatbot(true)}
                    className="text-xs text-[#088395] hover:text-[#071952] flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    Improve with AI
                  </button>
                  <span className="text-xs text-gray-400">|</span>
                  <button
                    onClick={() => setShowChatbot(true)}
                    className="text-xs text-[#088395] hover:text-[#071952] flex items-center gap-1"
                  >
                    <Bot className="w-3 h-3" />
                    Get writing help
                  </button>
                </div>
              </div>
              <TextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your blog content here. Use the toolbar above to format your text, or click 'Get writing help' to use Groq AI assistance..."
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDraft}
                    onChange={(e) => setIsDraft(e.target.checked)}
                    className="w-4 h-4 text-[#088395] border-gray-300 rounded focus:ring-[#088395]"
                  />
                  <span className="text-sm text-gray-600">Save as draft</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePublish(true)}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handlePublish(false)}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-[#071952] to-[#088395] text-white font-medium rounded-xl hover:from-[#051440] hover:to-[#066b7a] focus:ring-2 focus:ring-[#088395] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingBlog ? 'Updating...' : 'Publishing...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {editingBlog ? 'Update Post' : 'Publish Post'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#071952]" />
              <h2 className="text-2xl font-bold text-[#071952]">My Posts</h2>
              <span className="bg-[#EBF4F6] text-[#088395] text-sm font-medium px-3 py-1 rounded-full">
                {blogs.length} {blogs.length === 1 ? 'post' : 'posts'}
              </span>
            </div>
          </div>

          {blogs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-[#EBF4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#088395]" />
              </div>
              <h3 className="text-xl font-semibold text-[#071952] mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-6">Start sharing your thoughts by creating your first blog post above.</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Bot className="w-4 h-4" />
                <span>Pro tip: Use our Groq AI assistant to help you get started!</span>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {blog.isDraft && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <Edit3 className="w-3 h-3" />
                              Draft
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getVisibilityColor(blog.visibility)}`}>
                            {getVisibilityIcon(blog.visibility)}
                            {blog.visibility.charAt(0).toUpperCase() + blog.visibility.slice(1)}
                          </span>
                          {blog.category && (
                            <span className="bg-[#37B7C3]/20 text-[#071952] px-2 py-1 rounded-full text-xs font-medium">
                              {blog.category}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-[#071952] mb-2 leading-tight">
                          {blog.title}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{user?.name || 'You'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{blog.createdAt ? formatDate(blog.createdAt) : 'Just now'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{blog.views || 0} views</span>
                          </div>
                        </div>

                        {/* Cover Image */}
                        {blog.coverImage && (
                          <div className="mb-4 w-full" style={{ height: '12rem' }}>
                            <img
                              src={blog.coverImage}
                              alt={blog.title}
                              className="w-full h-full object-contain rounded-lg shadow-sm"
                            />
                          </div>
                        )}

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {blog.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="bg-[#EBF4F6] text-[#088395] px-2 py-1 rounded text-xs border border-[#37B7C3]/30"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content with parsed formatting */}
                    <div className="prose max-w-none mb-4">
                      <div
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderContent(truncateContent(blog.content, 200)) }}
                      />
                    </div>

                    {/* Social Actions */}
                    <SocialActions
                      blog={blog}
                      onLike={handleLike}
                      onComment={handleComment}
                      onSave={handleSave}
                      onShare={handleShare}
                    />

                    {/* Footer with Edit/Delete Actions */}
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                          <span>Updated {formatDate(blog.updatedAt)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="px-3 py-1.5 text-[#088395] border border-[#088395] rounded-lg hover:bg-[#EBF4F6] transition-colors text-sm flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="px-3 py-1.5 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        onContentSuggestion={handleContentSuggestion}
      />

      {/* Floating AI Assistant Button */}
      {!showChatbot && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowChatbot(true)}
            className="bg-gradient-to-r from-[#071952] to-[#088395] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group relative"
          >
            <Bot className="w-6 h-6" />
            {groqService.isConfigured() && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
            )}
          </button>
          <div className="absolute bottom-16 right-0 bg-[#071952] text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {groqService.isConfigured() ? 'AI Assistant Ready!' : 'Need AI help? Configure API key'}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#071952]"></div>
          </div>
        </div>
      )}

      {/* Custom styles for better text rendering */}
      <style jsx>{`
        .prose {
          max-width: none;
        }
        .prose strong {
          font-weight: 700;
          color: #071952;
        }
        .prose em {
          font-style: italic;
        }
        .prose u {
          text-decoration: underline;
        }
        .prose a {
          color: #088395;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #071952;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          color: #071952;
        }
        .prose blockquote {
          border-left: 4px solid #088395;
          padding-left: 1rem;
          font-style: italic;
          color: #4b5563;
          margin: 1rem 0;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .prose li {
          margin: 0.25rem 0;
        }
        .prose p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}