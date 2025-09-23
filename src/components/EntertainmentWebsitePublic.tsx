/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { FiHome, FiMusic, FiUser, FiX, FiCalendar, FiMapPin, FiAward, FiMail, FiMenu } from 'react-icons/fi';
import { Contest, Event, ContentItem } from '@/types';
import emailjs from '@emailjs/browser';
import * as Toast from '@radix-ui/react-toast';
import Slideshow from './Slideshow';

interface EntertainmentWebsitePublicProps {
    contests: Contest[];
    events: Event[];
    activeSection: string;
    onNavigate: (sectionId: string) => void;
    mockContent: ContentItem[];
}

const navItems = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'about', label: 'About', icon: FiUser },
    { id: 'services', label: 'Services', icon: FiMusic },
    { id: 'events', label: 'Events', icon: FiCalendar },
    { id: 'contests', label: 'Contests', icon: FiAward },
    { id: 'contact', label: 'Contact', icon: FiMail },
];

const EntertainmentWebsitePublic = ({
    contests,
    events,
    activeSection,
    onNavigate,
    mockContent,
}: EntertainmentWebsitePublicProps) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSending, setIsSending] = useState(false);
    const [toasts, setToasts] = useState<{ id: string; title: string; description: string; type: 'success' | 'error' }[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_jxydp5u';
        const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_klygytj';
        const userID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID || 'W6z-f_nbHSrrhFapR';

        emailjs.send(serviceID, templateID, {
            name: formData.name,
            email: formData.email,
            message: formData.message,
            to_name: 'BSS Entertainment'
        }, userID)
            .then(() => {
                showToast('Message Sent', 'Your message has been sent successfully!');
                setFormData({ name: '', email: '', message: '' });
            })
            .catch((error: any) => {
                console.error('Failed to send message:', error);
                showToast('Error', 'Failed to send message. Please try again.', 'error');
            })
            .finally(() => {
                setIsSending(false);
            });
    };

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-gray-100">
            <header className="fixed top-0 z-50 w-full bg-[#1A1A1A] bg-opacity-90 backdrop-blur-sm shadow-md">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FiAward className="text-3xl text-[#FFD700]" />
                        <span className="text-xl font-bold">BSS Entertainment</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6 font-medium">
                        {navItems.map((item) => (
                            <a
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`cursor-pointer transition-colors duration-200 ${activeSection === item.id ? 'text-[#FFD700]' : 'text-gray-300 hover:text-white'}`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden text-gray-300 hover:text-white transition-colors"
                    >
                        <FiMenu size={24} />
                    </button>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden bg-[#2A2A2A] py-2 px-4 shadow-inner">
                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <a
                                    key={item.id}
                                    onClick={() => { onNavigate(item.id); setShowMobileMenu(false); }}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === item.id ? 'bg-[#FFD700] text-[#1A1A1A]' : 'text-gray-300 hover:bg-[#333333] hover:text-white'}`}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            <main className="pt-20">
                <section id="home" className="py-20 px-4 sm:px-6">
                    <div className="container mx-auto">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#FFD700] mb-4">
                            Welcome to <span className="text-white">BSS Entertainment</span>
                        </h2>
                        <p className="text-lg text-gray-300 max-w-2xl">
                            Your hub for the latest music, film, and live events. Discover talented contestants and vote for your favorites!
                        </p>
                        <div className="mt-8">
                            <Slideshow content={mockContent.filter(item => item.featured)} />
                        </div>
                    </div>
                </section>

                <section id="contests" className="py-20 px-4 sm:px-6 bg-[#222222]">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-center text-[#FFD700] mb-8">Current Contests</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {contests.length > 0 ? (
                                contests.map((contest) => (
                                    <div key={contest.id} className="bg-[#2A2A2A] rounded-xl p-6 shadow-md transition-transform hover:scale-105 duration-300">
                                        <h3 className="text-xl font-bold text-white mb-2">{contest.title}</h3>
                                        <p className="text-gray-400 mb-4">{contest.description}</p>
                                        <div className="flex items-center space-x-2 mb-4 text-sm text-gray-400">
                                            <FiAward />
                                            <span>{contest.contestants.length} Contestants</span>
                                        </div>
                                        <div className="space-y-4 max-h-48 overflow-y-auto">
                                            {contest.contestants.map((contestant) => (
                                                <div key={contestant.id} className="flex items-center space-x-4">
                                                    <img
                                                        src={contestant.image}
                                                        alt={contestant.name}
                                                        className="w-16 h-16 rounded-full object-cover border-2 border-[#FFD700]"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-white">{contestant.name}</p>
                                                        <p className="text-sm text-gray-400">Votes: {contestant.votes}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400">No active contests at the moment.</p>
                            )}
                        </div>
                    </div>
                </section>

                <section id="events" className="py-20 px-4 sm:px-6">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-center text-[#FFD700] mb-8">Upcoming Events</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.length > 0 ? (
                                events.map((event) => (
                                    <div key={event.id} className="relative bg-[#2A2A2A] rounded-xl overflow-hidden shadow-md">
                                        <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                                            <p className="text-gray-400 mb-4 flex items-center">
                                                <FiCalendar className="mr-2" />{event.date}
                                            </p>
                                            <p className="text-gray-400 flex items-center">
                                                <FiMapPin className="mr-2" />{event.location}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400">No upcoming events at the moment.</p>
                            )}
                        </div>
                    </div>
                </section>

                <section id="contact" className="py-20 px-4 sm:px-6 bg-[#222222]">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-center text-[#FFD700] mb-8">Contact Us</h2>
                        <div className="max-w-xl mx-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-400">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-400">Message</label>
                                    <textarea name="message" value={formData.message} onChange={handleInputChange} className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]" rows={4} required />
                                </div>
                                <button type="submit" className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3 rounded-lg font-medium transition-colors" disabled={isSending}>
                                    {isSending ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            {/* Toast Notifications */}
            <Toast.Provider swipeDirection="right">
                {toasts.map(toast => (
                    <Toast.Root
                        className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                        key={toast.id}
                    >
                        <div className="flex-1">
                            <Toast.Title className="text-lg font-semibold text-white">{toast.title}</Toast.Title>
                            <Toast.Description className="text-sm text-gray-200">{toast.description}</Toast.Description>
                        </div>
                        <Toast.Close className="text-gray-200 hover:text-white">
                            <FiX size={20} />
                        </Toast.Close>
                    </Toast.Root>
                ))}
                <Toast.Viewport />
            </Toast.Provider>

        </div>
    );
};

export { EntertainmentWebsitePublic };