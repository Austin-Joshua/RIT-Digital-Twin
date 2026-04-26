import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSave, FaBook, FaGlobe, FaCalendarAlt, FaLink } from 'react-icons/fa';

const AddPublicationModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'Journal',
        publisher: '',
        date: '',
        status: 'Published',
        abstract: '',
        authors: '',
        doi: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: Date.now(),
            citations: 0
        });
        setFormData({
            title: '', type: 'Journal', publisher: '', date: '', status: 'Published', abstract: '', authors: '', doi: ''
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl relative"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }}
                    >
                        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                                <FaBook className="text-[var(--theme-brand-strong)]" /> Add New Publication
                            </h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5" style={{ color: 'var(--theme-text)' }}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>Paper Title</label>
                                    <input
                                        type="text" required name="title" value={formData.title} onChange={handleChange}
                                        className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                        style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)', focusRingcolor: 'var(--theme-brand-strong)' }}
                                        placeholder="e.g. Deep Learning in Healthcare..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>Type</label>
                                        <select
                                            name="type" value={formData.type} onChange={handleChange}
                                            className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                            style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                        >
                                            <option value="Journal">Journal</option>
                                            <option value="Conference">Conference</option>
                                            <option value="Book Chapter">Book Chapter</option>
                                            <option value="Patent">Patent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 uppercase tracking-wider tooltip" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>Publisher / Venue</label>
                                        <input
                                            type="text" required name="publisher" value={formData.publisher} onChange={handleChange}
                                            className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                            style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                            placeholder="e.g. IEEE Access"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--theme-text)', opacity: 0.9 }}><FaCalendarAlt /> Date Published</label>
                                        <input
                                            type="month" required name="date" value={formData.date} onChange={handleChange}
                                            className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                            style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 uppercase tracking-wider tooltip" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>Status</label>
                                        <select
                                            name="status" value={formData.status} onChange={handleChange}
                                            className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                            style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                        >
                                            <option value="Published">Published</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Accepted">Accepted</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>Authors</label>
                                    <input
                                        type="text" required name="authors" value={formData.authors} onChange={handleChange}
                                        className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                        style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                        placeholder="Comma separated authors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1 uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--theme-text)', opacity: 0.9 }}><FaLink /> DOI / Link</label>
                                    <input
                                        type="text" name="doi" value={formData.doi} onChange={handleChange}
                                        className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all"
                                        style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                        placeholder="e.g. 10.1109/ACCESS.2024..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>Abstract</label>
                                    <textarea
                                        rows="3" required name="abstract" value={formData.abstract} onChange={handleChange}
                                        className="w-full p-3 rounded-xl border focus:ring-2 focus:outline-none transition-all custom-scrollbar"
                                        style={{ background: 'var(--body-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)', resize: 'none' }}
                                        placeholder="Brief summary of the paper..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--theme-border)' }}>
                                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold transition-all hover:bg-black/5" style={{ color: 'var(--theme-text)' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg hover:opacity-90 active:scale-95 transition-all" style={{ background: 'var(--color-primary-navy)' }}>
                                    <FaSave /> Save Publication
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddPublicationModal;
