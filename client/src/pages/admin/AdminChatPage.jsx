import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FaSearch, FaCircle, FaPaperPlane, FaTimes } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';

const AdminChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    const API = import.meta.env.VITE_API_URL || '';
    const adminName = localStorage.getItem('adminName') || 'Admin';

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(() => {
            if (selectedConversation) {
                fetchConversationById(selectedConversation);
            } else {
                fetchConversations();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation?.messages]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/forms/contact?limit=100&status=all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch conversations');

            const data = await response.json();
            setConversations(data.data || []);
            setLoading(false);

            if (!selectedConversation && data.data && data.data.length > 0) {
                setSelectedConversation(data.data[0]);
                fetchConversationById(data.data[0]);
            }
        } catch (error) {
            console.error('Fetch conversations error:', error);
            toast.error('Failed to load conversations');
            setLoading(false);
        }
    };

    const fetchConversationById = async (conversation) => {
        if (!conversation || !conversation._id) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/forms/contact/${conversation._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch conversation');

            const data = await response.json();
            setSelectedConversation(data.data);
        } catch (error) {
            console.error('Fetch conversation error:', error);
            toast.error('Failed to load conversation');
        }
    };

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        fetchConversationById(conversation);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (!selectedConversation) {
            toast.error('Please select a conversation');
            return;
        }

        setSendingMessage(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/forms/contact/admin/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userEmail: selectedConversation.userEmail,
                    message: message.trim(),
                    senderName: adminName
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            toast.success('Message sent');
            setMessage('');
            fetchConversationById(selectedConversation.conversationId);
        } catch (error) {
            console.error('Send message error:', error);
            toast.error(error.message || 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        (conv.userEmail && conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (conv.userName && conv.userName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <AdminLayout activeTab="chat">
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mb-4"></div>
                        <p className="text-gray-600">Loading conversations...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeTab="chat">
            <div className="flex h-[calc(100vh-64px)]" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                {/* Conversations Sidebar */}
                <div className="w-80" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderRightWidth: '1px' }} >
                    {/* Header */}
                    <div className="p-4" style={{ borderColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Support Chat</h1>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3" style={{ color: 'var(--color-text-light)' }} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}
                                onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px var(--color-accent-primary)33`}
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-4 text-center" style={{ color: 'var(--color-text-light)' }}>
                                {searchTerm ? 'No conversations found' : 'No conversations yet'}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <div
                                    key={conv.conversationId}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-50 ${selectedConversation?.conversationId === conv.conversationId ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 mt-1 ${conv.lastMessageSender === 'admin' ? 'text-green-500' : 'text-blue-500'}`}>
                                            <FaCircle size={12} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{conv.userName || conv.userEmail || 'Unknown'}</p>
                                            <p className="text-sm text-gray-600 truncate">{conv.userEmail || ''}</p>
                                            <p className="text-xs text-gray-500 mt-1">{conv.messageCount} messages</p>
                                        </div>
                                        <span className="flex-shrink-0 text-xs text-gray-500">
                                            {formatDate(conv.lastMessageAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedConversation.userName || selectedConversation.userEmail}</h2>
                                        <p className="text-gray-600">{selectedConversation.userEmail}</p>
                                        {selectedConversation.userPhone && <p className="text-gray-600">{selectedConversation.userPhone}</p>}
                                    </div>
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                                    selectedConversation.messages.map((msg, idx) => (
                                        <div key={msg._id || idx} className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`${msg.sender === 'admin' ? 'bg-green-100 text-gray-900 border-l-4 border-green-500' : 'bg-blue-500 text-white'} p-4 rounded-lg max-w-xs shadow-md`}>
                                                <p className={`text-sm font-semibold mb-1 ${msg.sender === 'admin' ? 'text-gray-700' : 'text-blue-100'}`}>
                                                    {msg.senderName}
                                                </p>
                                                <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                                <p className={`text-xs mt-2 ${msg.sender === 'admin' ? 'text-gray-600' : 'text-blue-100'}`}>
                                                    {new Date(msg.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex justify-center items-center h-full text-gray-500">
                                        No messages yet
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Bar */}
                            <div className="border-t p-4 flex-shrink-0" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-primary)' }}>
                                <form onSubmit={handleSendMessage} className="space-y-3">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm"
                                        style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}
                                        rows="2"
                                        disabled={sendingMessage}
                                        onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px var(--color-accent-primary)33`}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={sendingMessage || !message.trim()}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transition text-sm"
                                            style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                            onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = 'var(--color-accent-light)')}
                                            onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = 'var(--color-accent-primary)')}
                                        >
                                            <FaPaperPlane size={14} />
                                            {sendingMessage ? 'Sending...' : 'Send Message'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMessage('')}
                                            className="px-4 py-2 rounded-lg font-semibold transition text-sm"
                                            style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border-light)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-section)'}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <p className="text-lg">Select a conversation to start</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminChatPage;
