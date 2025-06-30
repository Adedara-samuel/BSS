/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { FiHome, FiMusic, FiFilm, FiMic, FiSmile, FiUser, FiSearch, FiChevronRight, FiX, FiCalendar, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiLogIn, FiPlayCircle, FiAward, FiLogOut } from 'react-icons/fi';
import { usePaystackPayment } from 'react-paystack';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Firebase configuration - REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyABC123XYZ456DEF789GHI",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
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

export default function EntertainmentPlatform() {
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
    description: ''
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    image: ''
  });
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [showContestantDrawer, setShowContestantDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Paystack config
  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || "user@example.com",
    amount: 10000, // 100 Naira in kobo
    publicKey: 'pk_test_your_paystack_public_key', // REPLACE WITH YOUR PAYSTACK KEY
  };

  const initializePayment = usePaystackPayment(config);

  type PaystackReference = {
    reference: string;
    status?: string;
    trans?: string;
    transaction?: string;
    message?: string;
  };

  const onSuccess = (reference: PaystackReference) => {
    if (selectedContestant) {
      setContestants(contestants.map(c => 
        c.id === selectedContestant.id ? {...c, votes: c.votes + 1} : c
      ));
    }
    setShowVoteDialog(false);
    alert(`Vote successful! Reference: ${reference.reference}`);
  };

  const onClose = () => {
    console.log('Payment closed');
  };

  const handleVoteClick = (contestant: Contestant) => {
    setSelectedContestant(contestant);
    setShowVoteDialog(true);
  };

  const handleVotePayment = () => {
    initializePayment({ onSuccess, onClose });
  };

  // Auth functions
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Dummy images from Unsplash
  const dummyImages = {
    landingBg: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    trending: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    music: [
      'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2013&q=80',
      'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    movies: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80',
      'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80'
    ],
    contestants: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80'
    ],
    events: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ]
  };

  // Sample data with dummy images
  const categories = {
    trending: {
      title: 'Trending Now',
      items: [
        { id: 1, title: 'Summer Beat Festival', type: 'music', image: dummyImages.trending[0], featured: true },
        { id: 2, title: 'Comedy Kings Tour', type: 'comedy', image: dummyImages.trending[1], featured: false },
        { id: 3, title: 'Blockbuster Premiere', type: 'movie', image: dummyImages.trending[2], featured: false },
        { id: 4, title: 'Talk Show Special', type: 'talk', image: dummyImages.trending[3], featured: false },
      ]
    },
    music: {
      title: 'Hot Music',
      items: [
        { id: 5, title: 'DJ Night Live', type: 'music', image: dummyImages.music[0], featured: false },
        { id: 6, title: 'Pop Revolution', type: 'music', image: dummyImages.music[1], featured: false },
      ]
    },
    movies: {
      title: 'New Releases',
      items: [
        { id: 7, title: 'Action Thriller', type: 'movie', image: dummyImages.movies[0], featured: false },
        { id: 8, title: 'Drama Series', type: 'movie', image: dummyImages.movies[1], featured: false },
      ]
    }
  };

  // Initialize with dummy data
  useEffect(() => {
    setContestants(
      dummyImages.contestants.map((img, index) => ({
        id: index + 1,
        name: `Contestant ${index + 1}`,
        category: ['music', 'comedy', 'movie', 'talk'][index % 4],
        bio: ['DJ and producer', 'Stand-up comedian', 'Actor', 'Talk show host'][index % 4],
        description: `This is a detailed description about Contestant ${index + 1}. They are participating in the ${['music', 'comedy', 'movie', 'talk'][index % 4]} category. Vote for them to support their talent and help them win the competition.`,
        image: img,
        votes: Math.floor(Math.random() * 1000)
      }))
    );

    setEvents([
      {
        id: 1,
        title: 'Summer Music Fest',
        date: 'July 15, 2024',
        location: 'Central Park',
        image: dummyImages.events[0]
      },
      {
        id: 2,
        title: 'Comedy Night Live',
        date: 'July 22, 2024',
        location: 'Downtown Theater',
        image: dummyImages.events[1]
      },
      {
        id: 3,
        title: 'Film Premiere',
        date: 'August 5, 2024',
        location: 'Hollywood Cinema',
        image: dummyImages.events[2]
      }
    ]);
  }, []);

  // Admin functions
  const handleAdminLogin = () => {
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'password') {
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
          votes: 0
        }
      ]);
      setNewContestant({
        name: '',
        category: 'music',
        bio: '',
        image: '',
        description: ''
      });
    }
  };

  const deleteContestant = (id: number) => {
    setContestants(contestants.filter(c => c.id !== id));
  };

  const addEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.image) {
      setEvents([
        ...events,
        {
          id: events.length + 1,
          ...newEvent
        }
      ]);
      setNewEvent({
        title: '',
        date: '',
        location: '',
        image: ''
      });
    }
  };

  const deleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
  };

  // Render landing page
  if (isLanding) {
    return (
      <div className="relative h-screen bg-black text-white overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={dummyImages.landingBg}
            alt="Entertainment Platform"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex justify-between items-center p-6">
          <div className="text-3xl font-bold text-red-600 cursor-pointer">BSS Entertainment</div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsLanding(false)}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md font-medium transition-colors cursor-pointer"
            >
              Enter Platform
            </button>
          </div>
        </nav>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-20 flex items-center justify-center p-4">
            <div className="bg-white text-gray-800 p-6 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Enter admin username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="px-4 py-2 border rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdminLogin}
                    className="px-4 py-2 bg-red-600 text-white rounded flex items-center cursor-pointer"
                  >
                    <FiLogIn className="mr-2" />
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-center h-[70vh] px-6 md:px-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-2xl">
            Unlimited Entertainment, One Platform
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-xl">
            Stream the best in music, movies, comedy, and talk shows. Anytime, anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsLanding(false)}
              className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-md font-medium text-lg transition-colors flex items-center justify-center cursor-pointer"
            >
              Get Started
              <FiChevronRight className="ml-2" size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render admin interface
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        {/* Admin Header */}
        <header className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-red-600 cursor-pointer">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setIsAdmin(false);
                  setIsLanding(true);
                }}
                className="text-gray-600 hover:text-red-600 cursor-pointer"
              >
                Back to Platform
              </button>
              <button
                onClick={() => setIsAdmin(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Admin Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto flex space-x-6 p-4">
            <button
              onClick={() => setAdminView('dashboard')}
              className={`px-4 py-2 ${adminView === 'dashboard' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'} cursor-pointer`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setAdminView('contestants')}
              className={`px-4 py-2 ${adminView === 'contestants' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'} cursor-pointer`}
            >
              Manage Contestants
            </button>
            <button
              onClick={() => setAdminView('events')}
              className={`px-4 py-2 ${adminView === 'events' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'} cursor-pointer`}
            >
              Manage Events
            </button>
          </div>
        </nav>

        {/* Admin Content */}
        <main className="container mx-auto p-6">
          {adminView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Total Contestants</h3>
                <p className="text-3xl font-bold text-red-600">{contestants.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
                <p className="text-3xl font-bold text-red-600">{events.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Total Votes</h3>
                <p className="text-3xl font-bold text-red-600">
                  {contestants.reduce((sum, c) => sum + c.votes, 0)}
                </p>
              </div>
            </div>
          )}

          {adminView === 'contestants' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Add New Contestant</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={newContestant.name}
                      onChange={(e) => setNewContestant({ ...newContestant, name: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={newContestant.category}
                      onChange={(e) => setNewContestant({ ...newContestant, category: e.target.value })}
                      className="w-full p-2 border rounded cursor-pointer"
                    >
                      <option value="music">Music</option>
                      <option value="comedy">Comedy</option>
                      <option value="movie">Movie</option>
                      <option value="talk">Talk Show</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                      value={newContestant.bio}
                      onChange={(e) => setNewContestant({ ...newContestant, bio: e.target.value })}
                      className="w-full p-2 border rounded"
                      rows={3}
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={newContestant.description}
                      onChange={(e) => setNewContestant({ ...newContestant, description: e.target.value })}
                      className="w-full p-2 border rounded"
                      rows={4}
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      type="text"
                      value={newContestant.image}
                      onChange={(e) => setNewContestant({ ...newContestant, image: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="Paste image URL here"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={addContestant}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer"
                    >
                      <FiPlus className="inline mr-2" />
                      Add Contestant
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">All Contestants</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contestants.map((contestant) => (
                        <tr key={contestant.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full" src={contestant.image} alt={contestant.name} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{contestant.name}</div>
                                <div className="text-sm text-gray-500">{contestant.bio}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">{contestant.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{contestant.votes}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-red-600 hover:text-red-900 mr-4 cursor-pointer">
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => deleteContestant(contestant.id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
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
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Add New Event</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full p-2 border rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      type="text"
                      value={newEvent.image}
                      onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="Paste image URL here"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={addEvent}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer"
                    >
                      <FiPlus className="inline mr-2" />
                      Add Event
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">All Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                      <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                        <div className="flex items-center text-gray-600 mb-1">
                          <FiCalendar className="mr-2" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-4">
                          <FiMapPin className="mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <button className="text-gray-600 hover:text-red-600 cursor-pointer">
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="text-gray-600 hover:text-red-600 cursor-pointer"
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

  // Main platform interface
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-black z-20 flex justify-around items-center p-2 border-t border-gray-800">
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
              className={`flex flex-col items-center p-2 ${activeCategory === item.id ? 'text-red-500' : 'text-gray-400'} cursor-pointer`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="fixed left-0 top-0 h-full w-16 md:w-64 bg-black z-20">
          <div className="p-4 flex justify-center md:justify-start">
            <span className="text-red-600 font-bold text-2xl hidden md:block cursor-pointer">BSS</span>
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
                className={`flex items-center w-full p-4 ${activeCategory === item.id ? 'bg-gray-800 text-red-500' : 'hover:bg-gray-800'} cursor-pointer`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="ml-4 hidden md:block">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${!isMobile ? 'ml-16 md:ml-64' : 'pb-16'}`}>
        {/* Top Navigation */}
        <header className="bg-gray-800 bg-opacity-90 p-4 sticky top-0 z-10 flex justify-between items-center">
          <div className="relative w-full max-w-xl">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for music, movies, shows..."
              className="w-full bg-gray-700 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center ml-4">
            <button
              onClick={() => setShowContestantDrawer(true)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors mr-4 flex items-center cursor-pointer"
            >
              <FiAward className="mr-2" />
              <span className="hidden md:inline">Vote</span>
            </button>
            {user ? (
              <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser size={18} />
                  )}
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                    {user.displayName || 'User'}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center cursor-pointer"
                  >
                    <FiLogOut className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center bg-white text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-md cursor-pointer"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
                  alt="Google logo" 
                  className="w-4 h-4 mr-2"
                />
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Contestant Side Drawer */}
        {showContestantDrawer && (
          <div className="fixed inset-0 z-30">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 cursor-pointer"
              onClick={() => setShowContestantDrawer(false)}
            ></div>
            <div className={`absolute ${isMobile ? 'bottom-0 left-0 right-0 h-3/4' : 'right-0 top-0 h-full w-full md:w-96'} bg-gray-800 shadow-lg overflow-y-auto`}>
              <div className="p-4 flex justify-between items-center border-b border-gray-700">
                <h2 className="text-xl font-bold">Vote for Contestants</h2>
                <button 
                  onClick={() => setShowContestantDrawer(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {contestants.map((contestant) => (
                  <div 
                    key={contestant.id} 
                    className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setSelectedContestant(contestant);
                      setShowVoteDialog(true);
                    }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img src={contestant.image} alt={contestant.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{contestant.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{contestant.category}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContestant(contestant);
                        setShowVoteDialog(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm cursor-pointer"
                    >
                      Vote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vote Dialog */}
        {showVoteDialog && selectedContestant && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-40 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedContestant.name}</h2>
                <button 
                  onClick={() => setShowVoteDialog(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="flex mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden mr-4">
                  <img 
                    src={selectedContestant.image} 
                    alt={selectedContestant.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-2 capitalize">
                    Category: {selectedContestant.category}
                  </p>
                  <p className="text-sm text-gray-300">
                    Votes: {selectedContestant.votes}
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-medium mb-2">About</h3>
                <p className="text-gray-300 text-sm">
                  {selectedContestant.description}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowVoteDialog(false)}
                  className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVotePayment}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded cursor-pointer"
                >
                  Vote Now (₦100)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <main className="p-6">
          {/* Hero Banner */}
          {categories[activeCategory as keyof typeof categories]?.items.find(item => item.featured) && (
            <div className="relative rounded-xl overflow-hidden mb-8 h-64 md:h-96 cursor-pointer" onClick={() => {
              setSelectedContent(categories[activeCategory as keyof typeof categories].items.find(item => item.featured) || null);
              setShowVideoModal(true);
            }}>
              <img
                src={categories[activeCategory as keyof typeof categories].items.find(item => item.featured)?.image}
                alt="Featured"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-10">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">
                  {categories[activeCategory as keyof typeof categories].items.find(item => item.featured)?.title}
                </h2>
                <p className="text-gray-300 mb-4 max-w-lg">
                  Experience the hottest event this season with premium entertainment and exclusive performances.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContent(categories[activeCategory as keyof typeof categories].items.find(item => item.featured) || null);
                      setShowVideoModal(true);
                    }}
                    className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-md font-medium flex items-center cursor-pointer"
                  >
                    Play Trailer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Grid */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-4">{categories[activeCategory as keyof typeof categories]?.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories[activeCategory as keyof typeof categories]?.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={() => {
                    setSelectedContent(item);
                    setShowVideoModal(true);
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 md:h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Sections */}
          {activeCategory === 'trending' && (
            <>
              <section className="mt-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl md:text-2xl font-bold">Popular Contestants</h2>
                  <button 
                    onClick={() => setShowContestantDrawer(true)}
                    className="text-red-500 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {contestants.slice(0, 6).map((contestant) => (
                    <div key={contestant.id} className="text-center">
                      <div 
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto mb-2 border-2 border-red-500 cursor-pointer"
                        onClick={() => {
                          setSelectedContestant(contestant);
                          setShowVoteDialog(true);
                        }}
                      >
                        <img
                          src={contestant.image}
                          alt={contestant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-medium">{contestant.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{contestant.category}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContestant(contestant);
                          setShowVoteDialog(true);
                        }}
                        className="mt-2 text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full cursor-pointer"
                      >
                        Vote ({contestant.votes})
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl md:text-2xl font-bold">Upcoming Events</h2>
                  <button className="text-red-500 hover:underline cursor-pointer">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                        <div className="flex items-center text-gray-400 mb-1">
                          <FiCalendar className="mr-2" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <FiMapPin className="mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <button className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-md cursor-pointer">
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

      {/* Video Modal */}
      {showVideoModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-30 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-red-500 cursor-pointer"
            >
              <FiX size={24} />
            </button>
            <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-lg overflow-hidden">
              <div className="w-full h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPlayCircle size={32} className="text-white" />
                  </div>
                  <p className="text-xl">Video Preview</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold">{selectedContent.title}</h3>
              <div className="flex gap-4 mt-4">
                <button className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-md cursor-pointer">
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