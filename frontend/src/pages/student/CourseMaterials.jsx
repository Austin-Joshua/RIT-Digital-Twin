import React, { useState, useEffect } from 'react';
import { FaBook, FaDownload, FaFilePdf, FaFileArchive, FaSearch, FaFolderOpen, FaCheckCircle, FaLock } from 'react-icons/fa';

const CourseMaterials = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('notes');

    // Mock Data
    const subjects = [
        { id: 1, code: 'CS3451', name: 'Introduction to Operating Systems', progress: 85 },
        { id: 2, code: 'CS3491', name: 'Artificial Intelligence & Machine Learning', progress: 40 },
        { id: 3, code: 'IT3401', name: 'Web Essentials', progress: 100 },
        { id: 4, code: 'CS3401', name: 'Algorithms', progress: 60 },
    ];

    const initialNotes = [
        { id: 101, subject: 'CS3451', title: 'Unit 1: Process Management', type: 'pdf', size: '2.4 MB', date: '2 days ago', downloaded: true },
        { id: 102, subject: 'CS3451', title: 'Unit 2: Scheduling Algorithms', type: 'pdf', size: '1.8 MB', date: '1 week ago', downloaded: false },
        { id: 103, subject: 'CS3491', title: 'Intro to Neural Networks', type: 'pdf', size: '4.1 MB', date: '3 days ago', downloaded: true },
        { id: 104, subject: 'IT3401', title: 'React Hooks Complete Guide', type: 'zip', size: '12 MB', date: '2 weeks ago', downloaded: false },
    ];

    const [notes, setNotes] = useState(initialNotes);

    useEffect(() => {
        const loadMaterials = () => {
            const stored = localStorage.getItem('connectivity_materials');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Format the faculty materials to match student view layout
                const formatted = parsed.map(mat => ({
                    id: mat.id,
                    subject: mat.subject.substring(0, 15) + (mat.subject.length > 15 ? '...' : ''), // truncate long names
                    title: mat.title,
                    type: mat.type.toLowerCase(),
                    size: mat.size,
                    date: mat.date,
                    downloaded: mat.downloaded || false
                }));
                setNotes([...formatted, ...initialNotes]);
            }
        };
        loadMaterials();
        window.addEventListener('storage', loadMaterials);
        return () => window.removeEventListener('storage', loadMaterials);
    }, []);

    const materials = {
        notes: notes,
        papers: [
            { id: 201, subject: 'CS3451', title: 'Nov/Dec 2023 End Semester', type: 'pdf', size: '800 KB', date: '1 month ago', downloaded: false },
            { id: 202, subject: 'CS3451', title: 'Apr/May 2023 End Semester', type: 'pdf', size: '850 KB', date: '2 months ago', downloaded: true },
        ],
        curriculums: [
            { id: 301, subject: 'Computer Science', title: 'B.E CSE Latest Regulation Curriculum', type: 'pdf', size: 'Unknown', date: 'Just now', downloaded: false, fileUrl: '/curriculums/Computer_Science_Curriculum.pdf' },
        ]
    };

    const activeMaterials = materials[activeTab] || [];
    const filteredMaterials = activeMaterials.filter(mat =>
        mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mat.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaFolderOpen className="text-gold-500" /> Digital Library & Materials
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Download official lecture notes and previous year questions</p>
                </div>

                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search by subject or title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-navy-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar: Subjects Overview */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm">
                        <h3 className="font-bold text-navy-900 dark:text-white mb-4 border-b border-gray-100 dark:border-navy-700 pb-2">Sem 5 Syllabus Progress</h3>
                        <div className="space-y-4">
                            {subjects.map(sub => (
                                <div key={sub.id}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">{sub.code}</span>
                                        <span className={`font-bold ${sub.progress === 100 ? 'text-green-500' : 'text-blue-500'}`}>{sub.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-navy-900 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${sub.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${sub.progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate">{sub.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-navy-900 to-blue-900 p-5 rounded-xl shadow-md text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <FaLock className="text-gold-500" />
                            <h3 className="font-bold">Pro-Tip</h3>
                        </div>
                        <p className="text-sm opacity-80 leading-relaxed mb-4">
                            Always download required materials over campus Wi-Fi. Access to materials is restricted for users with pending tuition fee dues.
                        </p>
                        <button className="text-xs bg-white text-navy-900 font-bold px-4 py-2 rounded-lg hover:bg-gold-500 hover:text-white transition-colors">
                            Check Fee Status
                        </button>
                    </div>
                </div>

                {/* Right Area: Material List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm overflow-hidden">

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50">
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'notes' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                            >
                                <FaBook /> Official Notes
                            </button>
                            <button
                                onClick={() => setActiveTab('papers')}
                                className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'papers' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                            >
                                <FaFileArchive className="hidden sm:block" /> Previous Year QPs
                            </button>
                            <button
                                onClick={() => setActiveTab('curriculums')}
                                className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'curriculums' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                            >
                                <FaFolderOpen className="hidden sm:block" /> Curriculums
                            </button>
                        </div>

                        {/* List */}
                        <div className="p-2">
                            {filteredMaterials.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                                    <FaSearch className="text-4xl mx-auto mb-3 opacity-20" />
                                    <p>No materials found matching your search.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredMaterials.map(mat => (
                                        <div key={mat.id} className="group flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-900/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-navy-700">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg flex items-center justify-center ${mat.type === 'pdf' ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                                    {mat.type === 'pdf' ? <FaFilePdf className="text-xl" /> : <FaFileArchive className="text-xl" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-navy-900 dark:text-gold-500 tracking-widest uppercase">{mat.subject}</span>
                                                        {mat.downloaded && <FaCheckCircle className="text-[10px] text-green-500" title="Downloaded previously" />}
                                                    </div>
                                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{mat.title}</h4>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-3">
                                                        <span>{mat.size}</span>
                                                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                                        <span>Uploaded {mat.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {mat.fileUrl ? (
                                                <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-900 dark:hover:bg-gold-500 transition-colors">
                                                    <FaDownload />
                                                </a>
                                            ) : (
                                                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-900 dark:hover:bg-gold-500 transition-colors">
                                                    <FaDownload />
                                                </button>
                                            )}
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

export default CourseMaterials;
