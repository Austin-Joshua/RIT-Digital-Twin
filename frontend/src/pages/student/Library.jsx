import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { FaBookOpen, FaBook, FaSearch, FaHistory, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Library = () => {
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('browse'); // browse, my-books

    const books = [
        { id: 1, title: 'Operating System Concepts', author: 'Silberschatz', copies: 4, category: 'Computer Science', cover: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' },
        { id: 2, title: 'Deep Learning', author: 'Ian Goodfellow', copies: 0, category: 'AI/ML', cover: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' },
        { id: 3, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', copies: 12, category: 'Algorithms', cover: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500' },
        { id: 4, title: 'Clean Code', author: 'Robert C. Martin', copies: 2, category: 'Software Engg', cover: 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' },
    ];

    const myBooks = [
        { id: 101, title: 'Computer Networks', author: 'Andrew S. Tanenbaum', issueDate: '2024-02-15', dueDate: '2024-03-01', status: 'overdue', fine: 15 },
        { id: 102, title: 'Pattern Recognition', author: 'Christopher Bishop', issueDate: '2024-02-25', dueDate: '2024-03-10', status: 'active', fine: 0 },
    ];

    const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleReserve = (book) => {
        if (book.copies === 0) {
            addToast(`"${book.title}" is currently out of stock. Added to waitlist.`, 'error');
        } else {
            addToast(`Successfully reserved "${book.title}". Collect from counter within 24hrs.`, 'success');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaBookOpen className="text-gold-500" /> Digital Library
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Reserve books, check availability, and track issue history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Panel: Analytics / Status */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="card bg-gradient-to-br from-navy-900 to-blue-900 text-white shadow-md">
                            <h3 className="font-bold mb-1 opacity-80 text-xs uppercase">Books Issued</h3>
                            <div className="text-4xl font-black">{myBooks.length} <span className="text-sm font-normal opacity-60">/ 5 Limit</span></div>
                        </div>
                        <div className="card border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                            <h3 className="font-bold text-red-800 dark:text-red-400 mb-1 text-xs uppercase flex items-center gap-2">
                                <FaExclamationTriangle /> Outstanding Fine
                            </h3>
                            <div className="text-3xl font-black text-red-600 dark:text-red-500">
                                ₹{myBooks.reduce((acc, curr) => acc + curr.fine, 0)}
                            </div>
                            <button className="mt-3 w-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 py-2 rounded-lg hover:bg-red-200 transition-colors">Pay Fine</button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Catalog & My Books */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm overflow-hidden">

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50">
                            <button
                                onClick={() => setActiveTab('browse')}
                                className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'browse' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                            >
                                <FaSearch /> Browse Catalog
                            </button>
                            <button
                                onClick={() => setActiveTab('my-books')}
                                className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'my-books' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                            >
                                <FaHistory /> My Issued Books
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'browse' && (
                                <>
                                    <div className="mb-6 relative">
                                        <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by book title, author, or publisher..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500 text-gray-800 dark:text-white transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        {filteredBooks.map(book => (
                                            <div key={book.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 dark:border-navy-700 rounded-xl hover:shadow-md transition-all bg-white dark:bg-navy-800 group">
                                                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                    <div className={`w-12 h-16 rounded-lg ${book.cover} flex items-center justify-center`}>
                                                        <FaBook className="text-2xl" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-navy-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-gold-500 transition-colors">{book.title}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
                                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1 block">{book.category}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                    <div className="text-right">
                                                        <div className={`text-sm font-bold ${book.copies > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                            {book.copies > 0 ? `${book.copies} Available` : 'Waitlist Only'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">Section C2</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleReserve(book)}
                                                        className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${book.copies > 0 ? 'bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-navy-900 dark:hover:bg-gold-600 shadow-sm' : 'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400 border border-gray-200 dark:border-navy-600'}`}
                                                    >
                                                        {book.copies > 0 ? 'Reserve' : 'Join Waitlist'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {activeTab === 'my-books' && (
                                <div className="space-y-4">
                                    {myBooks.map(book => (
                                        <div key={book.id} className={`p-5 rounded-xl border ${book.status === 'overdue' ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10' : 'border-gray-100 bg-white dark:border-navy-700 dark:bg-navy-800'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-navy-900 dark:text-white text-lg">{book.title}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
                                                </div>
                                                {book.status === 'overdue' ? (
                                                    <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-red-200 dark:border-red-800">
                                                        <FaExclamationTriangle /> Overdue
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-green-200 dark:border-green-800">
                                                        <FaCheckCircle /> Issued
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-navy-700/50 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-0.5">Issue Date</span>
                                                    <span className="text-navy-900 dark:text-gray-200 font-medium flex items-center gap-1.5"><FaClock className="text-gray-400" /> {book.issueDate}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-0.5">Return By</span>
                                                    <span className={`font-medium flex items-center gap-1.5 ${book.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-navy-900 dark:text-gray-200'}`}><FaClock className="text-gray-400" /> {book.dueDate}</span>
                                                </div>
                                                {book.status === 'overdue' && (
                                                    <div className="flex flex-col ml-auto">
                                                        <span className="text-red-500 text-xs uppercase tracking-wider font-bold mb-0.5 text-right">Accumulated Fine</span>
                                                        <span className="text-red-600 dark:text-red-400 font-black text-right text-lg">₹{book.fine}</span>
                                                    </div>
                                                )}
                                                {book.status === 'active' && (
                                                    <button className="ml-auto text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">
                                                        Request Renewal
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Library;
