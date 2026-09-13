import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCloudUploadAlt, FaFileAlt } from 'react-icons/fa';

const UploadMaterialModal = ({ isOpen, onClose, onUpload }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'PDF',
        subject: 'Internet Programming'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpload({
            ...formData,
            id: Date.now(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            size: (Math.random() * 5 + 1).toFixed(1) + ' MB',
            downloaded: false
        });
        setFormData({ title: '', type: 'PDF', subject: 'Internet Programming' });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl relative"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }}
                    >
                        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                                <FaCloudUploadAlt className="text-[var(--theme-brand-strong)]" /> Upload Material
                            </h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5" style={{ color: 'var(--theme-text)' }}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>Material Title</label>
                                <input
                                    type="text" required name="title" value={formData.title} onChange={handleChange}
                                    className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                    style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                    placeholder="e.g. Unit 3 Lecture Notes"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>Subject</label>
                                <select
                                    name="subject" value={formData.subject} onChange={handleChange}
                                    className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                    style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                >
                                    <option value="Internet Programming">Internet Programming (CS8651)</option>
                                    <option value="Artificial Intelligence">Artificial Intelligence (CS8691)</option>
                                    <option value="Software Testing">Software Testing (IT8076)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>File Type</label>
                                <select
                                    name="type" value={formData.type} onChange={handleChange}
                                    className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                    style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                >
                                    <option value="PDF">PDF Document</option>
                                    <option value="Video">Video Lecture</option>
                                    <option value="Doc">Word Document</option>
                                    <option value="ZIP">ZIP Archive</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--theme-border)' }}>
                                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold transition-all hover:bg-black/5" style={{ color: 'var(--theme-text)' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg hover:opacity-90 active:scale-95 transition-all" style={{ background: 'var(--color-primary-navy)' }}>
                                    <FaCloudUploadAlt /> Upload
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UploadMaterialModal;
