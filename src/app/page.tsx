'use client';

import { useState, useEffect } from 'react';
import { FiHome, FiMusic, FiFilm, FiMic, FiSmile, FiUser, FiSearch, FiChevronRight, FiX, FiCalendar, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiLogIn, FiPlayCircle, FiAward, FiLogOut } from 'react-icons/fi';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

type ContentItem = {
  id: number;
  title: string;
  type: string;
  image: string;
  featured?: boolean;
};

type Contestant = {
  id: number;
  name: string;
  category: string;
  bio: string;
  image: string;
  votes: number;
  description: string;
};

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
};

// Dummy images from Unsplash
const dummyImages = {
  landingBg: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  trending: [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  ],
  music: [
    'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2013&q=80',
    'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  ],
  movies: [
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2025&q=80',
    'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
  ],
  contestants: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
  ],
  events: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  ],
};

function EntertainmentPlatform() {
  // State management
  const [isLanding, setIsLanding] = useState(true);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminView, setAdminView] = useState('dashboard');
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [newContestant, setNewContestant] = useState({
    name: '',
    category: 'music',
    bio: '',
    image: '',
    description: '',
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    image: '',
  });
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: '',
  });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [showContestantDrawer, setShowContestantDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  type PaystackConfig = {
    reference: string;
    email: string;
    amount: number;
    publicKey: string;
    [key: string]: unknown;
  };

  type PaystackHandlers = {
    onSuccess: (reference: PaystackReference) => void;
    onClose: () => void;
  };

  const [PaystackButton, setPaystackButton] = useState<((config: PaystackConfig) => (handlers: PaystackHandlers) => void) | null>(null);

  // Check for mobile view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Load Paystack dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-paystack').then((mod) => {
        setPaystackButton(() => mod.usePaystackPayment);
      });
    }
  }, []);

  // Initialize dummy data
  useEffect(() => {
    setContestants(
      dummyImages.contestants.map((img, index) => ({
        id: index + 1,
        name: `Contestant ${index + 1}`,
        category: ['music', 'comedy', 'movie', 'talk'][index % 4],
        bio: ['DJ and producer', 'Stand-up comedian', 'Actor', 'Talk show host'][index % 4],
        description: `This is a detailed description about Contestant ${index + 1}. They are participating in the ${['music', 'comedy', 'movie', 'talk'][index % 4]} category. Vote for them to support their talent and help them win the competition.`,
        image: img,
        votes: Math.floor(Math.random() * 1000),
      }))
    );

    setEvents([
      {
        id: 1,
        title: 'Summer Music Fest',
        date: 'July 15, 2025',
        location: 'Central Park',
        image: dummyImages.events[0],
      },
      {
        id: 2,
        title: 'Comedy Night Live',
        date: 'July 22, 2025',
        location: 'Downtown Theater',
        image: dummyImages.events[1],
      },
      {
        id: 3,
        title: 'Film Premiere',
        date: 'August 5, 2025',
        location: 'Hollywood Cinema',
        image: dummyImages.events[2],
      },
    ]);
  }, []);

  // Paystack config
  const config = {
    reference: new Date().getTime().toString(),
    email: user?.email || 'adedarasapok@gmail.com',
    amount: 10000,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_53b845fbac1a719357828d7b418952de27c1ec84',
  };

  type PaystackReference = {
    reference: string;
    [key: string]: unknown;
  };

  const onSuccess = (reference: PaystackReference) => {
    if (selectedContestant) {
      setContestants(
        contestants.map((c) =>
          c.id === selectedContestant.id ? { ...c, votes: c.votes + 1 } : c
        )
      );
    }
    setShowVoteDialog(false);
    alert(`Vote successful! Reference: ${reference.reference}`);
  };

  const onClose = () => {
    console.log('Payment closed');
  };

  const handleVotePayment = () => {
    if (PaystackButton) {
      const initializePayment = PaystackButton(config);
      initializePayment({ onSuccess, onClose });
    } else {
      console.error('Paystack not loaded yet');
      alert('Payment system is not ready. Please try again later.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleAdminLogin = () => {
    if (
      adminCredentials.username === process.env.NEXT_PUBLIC_ADMIN_USERNAME &&
      adminCredentials.password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    ) {
      setIsAdmin(true);
      setShowAdminLogin(false);
    } else {
      alert('Invalid credentials');
    }
  };

  const addContestant = () => {
    if (newContestant.name && newContestant.image) {
      setContestants([
        ...contestants,
        {
          id: contestants.length + 1,
          ...newContestant,
          votes: 0,
        },
      ]);
      setNewContestant({
        name: '',
        category: 'music',
        bio: '',
        image: '',
        description: '',
      });
    }
  };

  const deleteContestant = (id: number) => {
    setContestants(contestants.filter((c) => c.id !== id));
  };

  const addEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.image) {
      setEvents([
        ...events,
        {
          id: events.length + 1,
          ...newEvent,
        },
      ]);
      setNewEvent({
        title: '',
        date: '',
        location: '',
        image: '',
      });
    }
  };

  const deleteEvent = (id: number) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const categories = {
    trending: {
      title: 'Trending Now',
      items: [
        { id: 1, title: 'Summer Beat Festival', type: 'music', image: dummyImages.trending[0], featured: true },
        { id: 2, title: 'Comedy Kings Tour', type: 'comedy', image: dummyImages.trending[1], featured: false },
        { id: 3, title: 'Blockbuster Premiere', type: 'movie', image: dummyImages.trending[2], featured: false },
        { id: 4, title: 'Talk Show Special', type: 'talk', image: dummyImages.trending[3], featured: false },
      ],
    },
    music: {
      title: 'Hot Music',
      items: [
        { id: 5, title: 'DJ Night Live', type: 'music', image: dummyImages.music[0], featured: false },
        { id: 6, title: 'Pop Revolution', type: 'music', image: dummyImages.music[1], featured: false },
      ],
    },
    movies: {
      title: 'New Releases',
      items: [
        { id: 7, title: 'Action Thriller', type: 'movie', image: dummyImages.movies[0], featured: false },
        { id: 8, title: 'Drama Series', type: 'movie', image: dummyImages.movies[1], featured: false },
      ],
    },
  };

  if (isLanding) {
    return (
      <div className="relative min-h-screen bg-[#1A1A1A] text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={dummyImages.landingBg}
            alt="Entertainment Platform"
            layout="fill"
            objectFit="cover"
            className="opacity-50"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent"></div>
        </div>

        <nav className="relative z-10 flex justify-between items-center p-6 md:p-8">
          <div className="text-3xl md:text-4xl font-extrabold text-[#FFD700] cursor-pointer tracking-tight">
            BSS Entertainment
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-white hover:text-[#FFD700] px-4 py-2 rounded-md font-medium transition-colors"
            >
              Admin Login
            </button>
            <button
              onClick={() => setIsLanding(false)}
              className="bg-[#FFD700] text-[#1A1A1A] hover:bg-[#E6C200] px-6 py-2 rounded-full font-semibold transition-transform transform hover:scale-105"
            >
              Explore Now
            </button>
          </div>
        </nav>

        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-20 flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="bg-white text-[#1A1A1A] p-8 rounded-xl max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-[#FFD700]">Admin Login</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:outline-none"
                    placeholder="Enter admin username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:outline-none"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdminLogin}
                    className="px-5 py-2 bg-[#FFD700] text-[#1A1A1A] rounded-lg flex items-center hover:bg-[#E6C200] transition-transform transform hover:scale-105"
                  >
                    <FiLogIn className="mr-2" />
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col justify-center items-center h-[80vh] px-6 md:px-16 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 max-w-3xl leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#FFD700]">
              Discover Epic Entertainment
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-xl text-gray-300">
            Immerse yourself in a world of music, movies, comedy, and talk shows with BSS Entertainment.
          </p>
          <button
            onClick={() => setIsLanding(false)}
            className="bg-[#FFD700] text-[#1A1A1A] px-8 py-3 rounded-full font-semibold text-lg transition-transform transform hover:scale-105 flex items-center"
          >
            Get Started
            <FiChevronRight className="ml-2" size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        <header className="bg-white text-[#1A1A1A] shadow-lg p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#FFD700] cursor-pointer">
              BSS Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setIsAdmin(false);
                  setIsLanding(true);
                }}
                className="text-[#1A1A1A] hover:text-[#FFD700] transition-colors"
              >
                Back to Platform
              </button>
              <button
                onClick={() => setIsAdmin(false)}
                className="bg-[#FFD700] text-[#1A1A1A] px-4 py-2 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <nav className="bg-[#2A2A2A] shadow-sm">
          <div className="container mx-auto flex space-x-6 p-4">
            {['dashboard', 'contestants', 'events'].map((view) => (
              <button
                key={view}
                onClick={() => setAdminView(view)}
                className={`px-4 py-2 font-medium capitalize ${adminView === view ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-300 hover:text-[#FFD700]'}`}
              >
                {view}
              </button>
            ))}
          </div>
        </nav>

        <main className="container mx-auto p-6">
          {adminView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Total Contestants', value: contestants.length },
                { title: 'Upcoming Events', value: events.length },
                { title: 'Total Votes', value: contestants.reduce((sum, c) => sum + c.votes, 0) },
              ].map((stat) => (
                <div key={stat.title} className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                  <h3 className="text-lg font-semibold mb-2 text-[#1A1A1A]">{stat.title}</h3>
                  <p className="text-3xl font-bold text-[#FFD700]">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {adminView === 'contestants' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-[#FFD700]">Add New Contestant</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1A1A1A]">Name</label>
                    <input
                      type="text"
                      value={newContestant.name}
                      onChange={(e) => setNewContestant({ ...newContestant, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1A1A1A]">Category</label>
                    <select
                      value={newContestant.category}
                      onChange={(e) => setNewContestant({ ...newContestant, category: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                    >
                      <option value="music">Music</option>
                      <option value="comedy">Comedy</option>
                      <option value="movie">Movie</option>
                      <option value="talk">Talk Show</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-[#1A1A1A]">Bio</label>
                    <textarea
                      value={newContestant.bio}
                      onChange={(e) => setNewContestant({ ...newContestant, bio: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                      rows={3}
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-[#1A1A1A]">Description</label>
                    <textarea
                      value={newContestant.description}
                      onChange={(e) => setNewContestant({ ...newContestant, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                      rows={4}
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-[#1A1A1A]">Image URL</label>
                    <input
                      type="text"
                      value={newContestant.image}
                      onChange={(e) => setNewContestant({ ...newContestant, image: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                      placeholder="Paste image URL here"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={addContestant}
                      className="bg-[#FFD700] text-[#1A1A1A] px-5 py-2 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105 flex items-center"
                    >
                      <FiPlus className="mr-2" />
                      Add Contestant
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-[#FFD700]">All Contestants</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#F5F5F5]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#1A1A1A] uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#1A1A1A] uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#1A1A1A] uppercase">Votes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#1A1A1A] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contestants.map((contestant) => (
                        <tr key={contestant.id} className="hover:bg-[#F5F5F5] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <Image
                                  src={contestant.image}
                                  alt={contestant.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                  unoptimized
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-[#1A1A1A]">{contestant.name}</div>
                                <div className="text-sm text-gray-500">{contestant.bio}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1A1A1A] capitalize">{contestant.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1A1A1A]">{contestant.votes}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-[#FFD700] hover:text-[#E6C200] mr-4">
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => deleteContestant(contestant.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {adminView === 'events' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-[#FFD700]">Add New Event</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1A1A1A]">Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1A1A1A]">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1A1A1A]">Location</label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1A1A1A]">Image URL</label>
                    <input
                      type="text"
                      value={newEvent.image}
                      onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                      placeholder="Paste image URL here"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={addEvent}
                      className="bg-[#FFD700] text-[#1A1A1A] px-5 py-2 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105 flex items-center"
                    >
                      <FiPlus className="mr-2" />
                      Add Event
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-[#FFD700]">All Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="bg-[#2A2A2A] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                      <Image
                        src={event.image}
                        alt={event.title}
                        width={300}
                        height={160}
                        className="w-full h-40 object-cover"
                        unoptimized
                      />
                      <div className="p-4">
                        <h4 className="font-bold text-lg mb-2 text-white">{event.title}</h4>
                        <div className="flex items-center text-gray-300 mb-1">
                          <FiCalendar className="mr-2" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-300 mb-4">
                          <FiMapPin className="mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <button className="text-[#FFD700] hover:text-[#E6C200]">
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#2A2A2A] z-20 flex justify-around items-center p-3 border-t border-[#FFD700]/20 shadow-lg">
          {[
            { icon: <FiHome size={24} />, label: 'Home', id: 'trending' },
            { icon: <FiMusic size={24} />, label: 'Music', id: 'music' },
            { icon: <FiFilm size={24} />, label: 'Movies', id: 'movies' },
            { icon: <FiMic size={24} />, label: 'Talk Shows', id: 'talks' },
            { icon: <FiSmile size={24} />, label: 'Comedy', id: 'comedy' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={`flex flex-col items-center p-2 ${activeCategory === item.id ? 'text-[#FFD700]' : 'text-gray-400'} hover:text-[#FFD700] transition-colors`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {!isMobile && (
        <div className="fixed left-0 top-0 h-full w-16 md:w-64 bg-[#2A2A2A] z-20 shadow-lg">
          <div className="p-4 flex justify-center md:justify-start">
            <span className="text-[#FFD700] font-extrabold text-2xl hidden md:block">BSS</span>
          </div>
          <nav className="mt-8">
            {[
              { icon: <FiHome size={24} />, label: 'Home', id: 'trending' },
              { icon: <FiMusic size={24} />, label: 'Music', id: 'music' },
              { icon: <FiFilm size={24} />, label: 'Movies', id: 'movies' },
              { icon: <FiMic size={24} />, label: 'Talk Shows', id: 'talks' },
              { icon: <FiSmile size={24} />, label: 'Comedy', id: 'comedy' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.id)}
                className={`flex items-center w-full p-4 ${activeCategory === item.id ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'hover:bg-[#FFD700]/10 text-gray-300'} transition-colors`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="ml-4 hidden md:block">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className={`flex-1 ${!isMobile ? 'ml-16 md:ml-64' : 'pb-16'}`}>
        <header className="bg-[#2A2A2A] bg-opacity-95 p-4 sticky top-0 z-10 flex justify-between items-center shadow-md">
          <div className="relative w-full max-w-xl">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for music, movies, shows..."
              className="w-full bg-[#3A3A3A] text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all"
            />
          </div>
          <div className="flex items-center ml-4 gap-3">
            <button
              onClick={() => setShowContestantDrawer(true)}
              className="bg-[#FFD700] text-[#1A1A1A] px-4 py-2 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105 flex items-center"
            >
              <FiAward className="mr-2" />
              <span className="hidden md:inline">Vote</span>
            </button>
            {user ? (
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <FiUser size={20} className="text-[#1A1A1A]" />
                  )}
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-[#2A2A2A] rounded-xl shadow-lg py-2 z-50 hidden group-hover:block">
                  <div className="px-4 py-2 text-sm text-gray-300 border-b border-[#FFD700]/20">
                    {user.displayName || 'User'}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#FFD700]/10 hover:text-[#FFD700] flex items-center"
                  >
                    <FiLogOut className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center bg-white text-[#1A1A1A] hover:bg-[#FFD700] px-4 py-2 rounded-full transition-transform transform hover:scale-105"
              >
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                  alt="Google logo"
                  width={16}
                  height={16}
                  className="mr-2"
                  unoptimized
                />
                Sign In
              </button>
            )}
          </div>
        </header>

        {showContestantDrawer && (
          <div className="fixed inset-0 z-30 transition-opacity duration-300">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowContestantDrawer(false)}
            ></div>
            <div className={`absolute ${isMobile ? 'bottom-0 left-0 right-0 h-3/4' : 'right-0 top-0 h-full w-full md:w-96'} bg-[#2A2A2A] shadow-2xl overflow-y-auto transition-transform duration-300 ${isMobile ? 'translate-y-0' : 'translate-x-0'}`}>
              <div className="p-4 flex justify-between items-center border-b border-[#FFD700]/20">
                <h2 className="text-xl font-bold text-[#FFD700]">Vote for Contestants</h2>
                <button
                  onClick={() => setShowContestantDrawer(false)}
                  className="text-gray-400 hover:text-[#FFD700]"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {contestants.map((contestant) => (
                  <div
                    key={contestant.id}
                    className="flex items-center p-3 bg-[#3A3A3A] rounded-lg hover:bg-[#FFD700]/10 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedContestant(contestant);
                      setShowVoteDialog(true);
                    }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-[#FFD700]">
                      <Image
                        src={contestant.image}
                        alt={contestant.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{contestant.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{contestant.category}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContestant(contestant);
                        setShowVoteDialog(true);
                      }}
                      className="bg-[#FFD700] text-[#1A1A1A] px-3 py-1 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105"
                    >
                      Vote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showVoteDialog && selectedContestant && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="bg-[#2A2A2A] rounded-xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-[#FFD700]">{selectedContestant.name}</h2>
                <button
                  onClick={() => setShowVoteDialog(false)}
                  className="text-gray-400 hover:text-[#FFD700]"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="flex mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden mr-4 border-2 border-[#FFD700]">
                  <Image
                    src={selectedContestant.image}
                    alt={selectedContestant.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-2 capitalize">
                    Category: {selectedContestant.category}
                  </p>
                  <p className="text-sm text-gray-300">Votes: {selectedContestant.votes}</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-white">About</h3>
                <p className="text-gray-300 text-sm">{selectedContestant.description}</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowVoteDialog(false)}
                  className="px-4 py-2 border border-gray-600 rounded-full hover:bg-[#3A3A3A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVotePayment}
                  className="px-4 py-2 bg-[#FFD700] text-[#1A1A1A] rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105"
                >
                  Vote Now (₦100)
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="p-6">
          {categories[activeCategory as keyof typeof categories]?.items.find((item) => item.featured) && (
            <div
              className="relative rounded-xl overflow-hidden mb-8 h-64 md:h-96 cursor-pointer shadow-xl"
              onClick={() => {
                setSelectedContent(
                  categories[activeCategory as keyof typeof categories].items.find((item) => item.featured) || null
                );
                setShowVideoModal(true);
              }}
            >
              <Image
                src={categories[activeCategory as keyof typeof categories].items.find((item) => item.featured)?.image || ''}
                alt="Featured"
                layout="fill"
                objectFit="cover"
                className="transform hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-10">
                <h2 className="text-2xl md:text-4xl font-extrabold mb-2 text-[#FFD700]">
                  {categories[activeCategory as keyof typeof categories].items.find((item) => item.featured)?.title}
                </h2>
                <p className="text-gray-300 mb-4 max-w-lg">
                  Experience the hottest event this season with premium entertainment and exclusive performances.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedContent(
                      categories[activeCategory as keyof typeof categories].items.find((item) => item.featured) || null
                    );
                    setShowVideoModal(true);
                  }}
                  className="bg-[#FFD700] text-[#1A1A1A] px-6 py-2 rounded-full font-semibold flex items-center hover:bg-[#E6C200] transition-transform transform hover:scale-105"
                >
                  Play Trailer
                  <FiPlayCircle className="ml-2" />
                </button>
              </div>
            </div>
          )}

          <section>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#FFD700]">
              {categories[activeCategory as keyof typeof categories]?.title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories[activeCategory as keyof typeof categories]?.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#FFD700]/20"
                  onClick={() => {
                    setSelectedContent(item);
                    setShowVideoModal(true);
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={300}
                    height={208}
                    className="w-full h-40 md:h-52 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {activeCategory === 'trending' && (
            <>
              <section className="mt-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#FFD700]">Popular Contestants</h2>
                  <button
                    onClick={() => setShowContestantDrawer(true)}
                    className="text-[#FFD700] hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {contestants.slice(0, 6).map((contestant) => (
                    <div key={contestant.id} className="text-center">
                      <div
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto mb-2 border-2 border-[#FFD700] cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          setSelectedContestant(contestant);
                          setShowVoteDialog(true);
                        }}
                      >
                        <Image
                          src={contestant.image}
                          alt={contestant.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <h3 className="font-medium text-white">{contestant.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{contestant.category}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContestant(contestant);
                          setShowVoteDialog(true);
                        }}
                        className="mt-2 text-xs bg-[#FFD700] text-[#1A1A1A] px-3 py-1 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105"
                      >
                        Vote ({contestant.votes})
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#FFD700]">Upcoming Events</h2>
                  <button className="text-[#FFD700] hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-[#2A2A2A] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-[#FFD700]/20"
                    >
                      <Image
                        src={event.image}
                        alt={event.title}
                        width={300}
                        height={160}
                        className="w-full h-40 object-cover transform hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 text-white">{event.title}</h3>
                        <div className="flex items-center text-gray-300 mb-1">
                          <FiCalendar className="mr-2" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <FiMapPin className="mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <button className="mt-4 w-full bg-[#FFD700] text-[#1A1A1A] py-2 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105">
                          Get Tickets
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {showVideoModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-30 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-[#FFD700]"
            >
              <FiX size={24} />
            </button>
            <div className="aspect-w-16 aspect-h-9 bg-[#2A2A2A] rounded-xl overflow-hidden shadow-lg">
              <div className="w-full h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPlayCircle size={32} className="text-[#1A1A1A]" />
                  </div>
                  <p className="text-xl text-white">Video Preview</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold text-[#FFD700]">{selectedContent.title}</h3>
              <div className="flex gap-4 mt-4">
                <button className="bg-[#FFD700] text-[#1A1A1A] px-6 py-2 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105">
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(EntertainmentPlatform), { ssr: false });