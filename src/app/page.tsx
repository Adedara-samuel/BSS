/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { FiHome, FiMusic, FiFilm, FiMic, FiSmile, FiUser, FiSearch, FiChevronRight, FiX, FiCalendar, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiLogIn, FiPlayCircle, FiAward, FiLogOut, FiMail, FiPhone, FiInfo, FiMenu, FiDollarSign, FiUsers, FiBarChart2, FiCreditCard, FiEyeOff, FiEye, FiChevronLeft } from 'react-icons/fi';
import { initializeApp } from 'firebase/app';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';
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

type Contest = {
  id: string;
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  contestants: Contestant[];
  createdAt: Date;
};

type Contestant = {
  id: string;
  name: string;
  bio: string;
  image: string;
  votes: number;
  amountGained: number;
  comments: Comment[];
  category?: string;
};

type Comment = {
  id: string;
  text: string;
  createdAt: Date;
};

type ContentItem = {
  id: number;
  title: string;
  type: string;
  image: string;
  featured?: boolean;
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
  ],
  about: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
};

// Google Maps component
const Map = ({ location }: { location: string }) => {
  return (
    <div className="h-full w-full">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
        className="min-h-[400px]"
      ></iframe>
    </div>
  );
};

function EntertainmentWebsite() {
  // State management
  const [activeSection, setActiveSection] = useState('home');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contests, setContests] = useState<Contest[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: '',
  });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [newContest, setNewContest] = useState({
    title: '',
    description: '',
    category: '',
    isActive: true
  });
  const [newContestant, setNewContestant] = useState({
    name: '',
    bio: '',
    image: '',
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    image: '',
  });
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [viewingContest, setViewingContest] = useState<Contest | null>(null);
  const [PaystackButton, setPaystackButton] = useState<any>(null);

  const companyLocation = "Ikerre 361101, Ekiti, Nigeria";

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load Paystack dynamically
  useEffect(() => {
    import('react-paystack').then((mod) => {
      setPaystackButton(() => mod.usePaystackPayment);
    });
  }, []);

  // Initialize dummy data
  useEffect(() => {
    // Sample contest data
    const sampleContestants: Contestant[] = [
      {
        id: '1',
        name: 'Dr. John Doe',
        bio: 'Senior Lecturer with 10 years experience',
        image: dummyImages.contestants[0],
        votes: 125,
        amountGained: 12500,
        comments: [
          { id: '1', text: 'Great lecturer, very knowledgeable', createdAt: new Date() },
          { id: '2', text: 'Always available for students', createdAt: new Date() }
        ]
      },
      {
        id: '2',
        name: 'Dr. Jane Smith',
        bio: 'Associate Professor specializing in Media Studies',
        image: dummyImages.contestants[1],
        votes: 98,
        amountGained: 9800,
        comments: [
          { id: '3', text: 'Excellent teaching methodology', createdAt: new Date() }
        ]
      }
    ];

    const sampleContests: Contest[] = [
      {
        id: '1',
        title: 'BSS Best Lecturer Award',
        description: 'Vote for your favorite lecturer in the Mass Communication department',
        category: 'BOUESTI MASS COM',
        isActive: true,
        contestants: sampleContestants,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Best Department Award',
        description: 'Vote for the best performing department this semester',
        category: 'University Wide',
        isActive: true,
        contestants: [
          {
            id: '3',
            name: 'Computer Science',
            bio: 'Department of Computer Science',
            image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            votes: 210,
            amountGained: 21000,
            comments: []
          },
          {
            id: '4',
            name: 'Mass Communication',
            bio: 'Department of Mass Communication',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            votes: 185,
            amountGained: 18500,
            comments: []
          }
        ],
        createdAt: new Date()
      }
    ];

    setContests(sampleContests);

    setContestants(
      dummyImages.contestants.map((img, index) => ({
        id: (index + 1).toString(),
        name: `Contestant ${index + 1}`,
        bio: ['DJ and producer', 'Stand-up comedian', 'Actor', 'Talk show host'][index % 4],
        image: img,
        votes: Math.floor(Math.random() * 1000),
        amountGained: Math.floor(Math.random() * 100000),
        comments: [],
        category: ['music', 'comedy', 'movie', 'talk'][index % 4],
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
        image: dummyImages.events[0],
      },
    ]);
  }, []);

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'events', 'contestants', 'contests', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Paystack config
  const config = {
    reference: new Date().getTime().toString(),
    email: user?.email || 'user@example.com',
    amount: 10000, // 100 Naira in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key',
  };

  const handleVotePayment = () => {
    if (PaystackButton && selectedContestant && selectedContest) {
      const initializePayment = PaystackButton(config);
      initializePayment({
        onSuccess: (reference: any) => {
          // Update votes and amount gained
          const updatedContests = contests.map(contest => {
            if (contest.id === selectedContest.id) {
              const updatedContestants = contest.contestants.map(c => {
                if (c.id === selectedContestant.id) {
                  return {
                    ...c,
                    votes: c.votes + 1,
                    amountGained: c.amountGained + 100
                  };
                }
                return c;
              });
              return { ...contest, contestants: updatedContestants };
            }
            return contest;
          });

          setContests(updatedContests);

          // Add comment if provided
          if (commentText.trim()) {
            const newComment: Comment = {
              id: Date.now().toString(),
              text: commentText,
              createdAt: new Date()
            };

            const updatedContestsWithComment = updatedContests.map(contest => {
              if (contest.id === selectedContest.id) {
                const updatedContestants = contest.contestants.map(c => {
                  if (c.id === selectedContestant.id) {
                    return {
                      ...c,
                      comments: [...c.comments, newComment]
                    };
                  }
                  return c;
                });
                return { ...contest, contestants: updatedContestants };
              }
              return contest;
            });

            setContests(updatedContestsWithComment);
            setCommentText('');
          }

          setShowVoteDialog(false);
          alert(`Vote successful! Reference: ${reference.reference}`);
        },
        onClose: () => {
          console.log('Payment closed');
        }
      });
    } else {
      console.error('Paystack not loaded yet');
      alert('Payment system is not ready. Please try again later.');
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

  const addContest = () => {
    if (newContest.title && newContest.category) {
      const newId = Date.now().toString();
      setContests([
        ...contests,
        {
          id: newId,
          title: newContest.title,
          description: newContest.description,
          category: newContest.category,
          isActive: newContest.isActive,
          contestants: [],
          createdAt: new Date()
        }
      ]);
      setNewContest({
        title: '',
        description: '',
        category: '',
        isActive: true
      });
    }
  };

  const updateContest = () => {
    if (editingContest) {
      setContests(
        contests.map(c =>
          c.id === editingContest.id ? editingContest : c
        )
      );
      setEditingContest(null);
    }
  };

  const deleteContest = (id: string) => {
    setContests(contests.filter(c => c.id !== id));
  };

  const addContestant = () => {
    if (newContestant.name && newContestant.image && selectedContest) {
      const newId = Date.now().toString();
      const updatedContests = contests.map(contest => {
        if (contest.id === selectedContest.id) {
          return {
            ...contest,
            contestants: [
              ...contest.contestants,
              {
                id: newId,
                name: newContestant.name,
                bio: newContestant.bio,
                image: newContestant.image,
                votes: 0,
                amountGained: 0,
                comments: []
              }
            ]
          };
        }
        return contest;
      });

      setContests(updatedContests);
      setNewContestant({
        name: '',
        bio: '',
        image: '',
      });
    }
  };

  const updateContestant = () => {
    if (editingContestant && selectedContest) {
      const updatedContests = contests.map(contest => {
        if (contest.id === selectedContest.id) {
          const updatedContestants = contest.contestants.map(c =>
            c.id === editingContestant.id ? editingContestant : c
          );
          return { ...contest, contestants: updatedContestants };
        }
        return contest;
      });

      setContests(updatedContests);
      setEditingContestant(null);
    }
  };

  const deleteContestant = (id: string) => {
    if (!selectedContest) return;

    const updatedContests = contests.map(contest => {
      if (contest.id === selectedContest.id) {
        return {
          ...contest,
          contestants: contest.contestants.filter(c => c.id !== id)
        };
      }
      return contest;
    });

    setContests(updatedContests);
  };

  const addEvent = () => {
    if (newEvent.title && newEvent.date) {
      const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
      setEvents([
        ...events,
        {
          id: newId,
          ...newEvent,
          image: newEvent.image || dummyImages.events[Math.floor(Math.random() * dummyImages.events.length)],
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

  const updateEvent = () => {
    if (editingEvent) {
      setEvents(
        events.map(e =>
          e.id === editingEvent.id ? editingEvent : e
        )
      );
      setEditingEvent(null);
    }
  };

  const deleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const toggleContestStatus = (contestId: string) => {
    setContests(contests.map(contest => {
      if (contest.id === contestId) {
        return { ...contest, isActive: !contest.isActive };
      }
      return contest;
    }));
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

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'events', label: 'Events' },
    { id: 'contestants', label: 'Contestants' },
    { id: 'contests', label: 'Contests' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setShowMobileMenu(false);
    }
  };


  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-gray-100">
        {/* Admin Header */}
        <header className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] shadow-lg">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FiAward className="text-white text-xl" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold">BSS Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAdmin(false)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <FiLogOut className="text-white" />
                <span className="hidden md:inline">Exit Admin</span>
              </button>
            </div>
          </div>
        </header>

        {/* Admin Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#2A2A2A] p-6 rounded-xl shadow-sm border border-[#333333] hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Contests</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#FFD700]">{contests.length}</h3>
                </div>
                <div className="p-3 bg-[#4F46E5]/10 rounded-lg">
                  <FiUsers className="text-[#FFD700] text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] p-6 rounded-xl shadow-sm border border-[#333333] hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Votes</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#7C3AED]">
                    {
                      contests.reduce(
                        (totalVotes: number, contest: Contest) =>
                          totalVotes + contest.contestants.reduce(
                            (contestVotes: number, contestant: Contestant) =>
                              contestVotes + contestant.votes,
                            0
                          ),
                        0
                      )
                    }
                  </h3>
                </div>
                <div className="p-3 bg-[#7C3AED]/10 rounded-lg">
                  <FiBarChart2 className="text-[#7C3AED] text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] p-6 rounded-xl shadow-sm border border-[#333333] hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#10B981]">
                    ₦{contests.reduce((sum, c) => sum + c.contestants.reduce((s, ct) => s + ct.amountGained, 0), 0).toLocaleString()}
                  </h3>
                </div>
                <div className="p-3 bg-[#10B981]/10 rounded-lg">
                  <FiCreditCard className="text-[#10B981] text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Contests Section */}
          <div className="bg-[#2A2A2A] rounded-xl shadow-sm border border-[#333333] mb-8 overflow-hidden">
            <div className="p-6 border-b border-[#333333] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#FFD700]">Contests Management</h2>
              <button
                onClick={() => {
                  setEditingContest(null);
                  setNewContest({
                    title: '',
                    description: '',
                    category: '',
                    isActive: true
                  });
                }}
                className="flex items-center space-x-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiPlus />
                <span>Add Contest</span>
              </button>
            </div>

            {/* Add/Edit Contest Form */}
            <div className="p-6 border-b border-[#333333]">
              <h3 className="text-lg font-medium mb-4 text-[#FFD700]">
                {editingContest ? 'Edit Contest' : 'Add New Contest'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Title</label>
                  <input
                    type="text"
                    value={editingContest ? editingContest.title : newContest.title}
                    onChange={(e) => editingContest
                      ? setEditingContest({ ...editingContest, title: e.target.value })
                      : setNewContest({ ...newContest, title: e.target.value })
                    }
                    className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Category</label>
                  <input
                    type="text"
                    value={editingContest ? editingContest.category : newContest.category}
                    onChange={(e) => editingContest
                      ? setEditingContest({ ...editingContest, category: e.target.value })
                      : setNewContest({ ...newContest, category: e.target.value })
                    }
                    className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] cursor-text"
                    placeholder="E.g. BOUESTI MASS COM"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-400">Description</label>
                  <textarea
                    value={editingContest ? editingContest.description : newContest.description}
                    onChange={(e) => editingContest
                      ? setEditingContest({ ...editingContest, description: e.target.value })
                      : setNewContest({ ...newContest, description: e.target.value })
                    }
                    className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] cursor-text"
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingContest ? editingContest.isActive : newContest.isActive}
                      onChange={(e) => editingContest
                        ? setEditingContest({ ...editingContest, isActive: e.target.checked })
                        : setNewContest({ ...newContest, isActive: e.target.checked })
                      }
                      className="form-checkbox h-5 w-5 text-[#4F46E5] rounded focus:ring-[#4F46E5]"
                    />
                    <span className="text-gray-400">Active Contest</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                {editingContest && (
                  <button
                    onClick={() => setEditingContest(null)}
                    className="px-4 py-2 border border-[#444444] text-gray-300 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={editingContest ? updateContest : addContest}
                  className="flex items-center space-x-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {editingContest ? (
                    <>
                      <FiEdit2 />
                      <span>Update Contest</span>
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      <span>Add Contest</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Contests Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#333333]">
                <thead className="bg-[#333333]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contestants</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#2A2A2A] divide-y divide-[#333333]">
                  {contests.map((contest) => (
                    <tr key={contest.id} className="hover:bg-[#333333] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{contest.title}</div>
                        <div className="text-sm text-gray-400 line-clamp-1">{contest.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 capitalize">{contest.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{contest.contestants.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${contest.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                          {contest.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingContest(contest);
                            setSelectedContest(contest);
                          }}
                          className="text-[#FFD700] hover:text-[#E6C200] mr-4"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => toggleContestStatus(contest.id)}
                          className={`mr-4 ${contest.isActive ? 'text-yellow-500 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'}`}
                        >
                          {contest.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteContest(contest.id)}
                          className="text-red-600 hover:text-red-500"
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

          {/* Contestants Section (when a contest is selected) */}
          {selectedContest && (
            <div className="bg-[#2A2A2A] rounded-xl shadow-sm border border-[#333333] mb-8 overflow-hidden">
              <div className="p-6 border-b border-[#333333] flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#FFD700]">
                  Contestants for: {selectedContest.title}
                </h2>
                <button
                  onClick={() => {
                    setEditingContestant(null);
                    setNewContestant({
                      name: '',
                      bio: '',
                      image: '',
                    });
                  }}
                  className="flex items-center space-x-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FiPlus />
                  <span>Add Contestant</span>
                </button>
              </div>

              {/* Add/Edit Contestant Form */}
              <div className="p-6 border-b border-[#333333]">
                <h3 className="text-lg font-medium mb-4 text-[#FFD700]">
                  {editingContestant ? 'Edit Contestant' : 'Add New Contestant'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
                    <input
                      type="text"
                      value={editingContestant ? editingContestant.name : newContestant.name}
                      onChange={(e) => editingContestant
                        ? setEditingContestant({ ...editingContestant, name: e.target.value })
                        : setNewContestant({ ...newContestant, name: e.target.value })
                      }
                      className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Bio</label>
                    <input
                      type="text"
                      value={editingContestant ? editingContestant.bio : newContestant.bio}
                      onChange={(e) => editingContestant
                        ? setEditingContestant({ ...editingContestant, bio: e.target.value })
                        : setNewContestant({ ...newContestant, bio: e.target.value })
                      }
                      className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] cursor-text"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-400">Image URL</label>
                    <input
                      type="text"
                      value={editingContestant ? editingContestant.image : newContestant.image}
                      onChange={(e) => editingContestant
                        ? setEditingContestant({ ...editingContestant, image: e.target.value })
                        : setNewContestant({ ...newContestant, image: e.target.value })
                      }
                      className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] cursor-text"
                      placeholder="Paste image URL here"
                    />
                  </div>
                  {editingContestant && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-400">Votes</label>
                      <input
                        type="number"
                        value={editingContestant.votes}
                        onChange={(e) => setEditingContestant({
                          ...editingContestant,
                          votes: parseInt(e.target.value) || 0
                        })}
                        className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] cursor-text"
                      />
                    </div>
                  )}
                  {editingContestant && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-400">Amount Gained (₦)</label>
                      <input
                        type="number"
                        value={editingContestant.amountGained}
                        onChange={(e) => setEditingContestant({
                          ...editingContestant,
                          amountGained: parseInt(e.target.value) || 0
                        })}
                        className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] cursor-text"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4 space-x-3">
                  {editingContestant && (
                    <button
                      onClick={() => setEditingContestant(null)}
                      className="px-4 py-2 border border-[#444444] text-gray-300 rounded-lg hover:bg-[#333333] transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={editingContestant ? updateContestant : addContestant}
                    className="flex items-center space-x-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {editingContestant ? (
                      <>
                        <FiEdit2 />
                        <span>Update Contestant</span>
                      </>
                    ) : (
                      <>
                        <FiPlus />
                        <span>Add Contestant</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Contestants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {selectedContest.contestants.map((contestant) => (
                  <div key={contestant.id} className="border border-[#333333] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={contestant.image}
                        alt={contestant.name}
                        layout="fill"
                        objectFit="cover"
                        unoptimized
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-white mb-2">{contestant.name}</h3>
                      <p className="text-gray-300 text-sm mb-4">{contestant.bio}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[#FFD700] font-bold">{contestant.votes} votes</span>
                          <div className="text-xs text-gray-400">₦{contestant.amountGained.toLocaleString()}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingContestant(contestant);
                            }}
                            className="text-[#4F46E5] hover:text-[#4338CA]"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => deleteContestant(contestant.id)}
                            className="text-red-600 hover:text-red-500"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      {contestant.comments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#333333]">
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Comments ({contestant.comments.length})</h4>
                          <div className="max-h-20 overflow-y-auto">
                            {contestant.comments.map(comment => (
                              <p key={comment.id} className="text-xs text-gray-500 mb-1">- {comment.text}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          <div className="bg-[#2A2A2A] rounded-xl shadow-sm border border-[#333333] overflow-hidden">
            <div className="p-6 border-b border-[#333333] flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-400">Events Management</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setNewEvent({
                    title: '',
                    date: '',
                    location: '',
                    image: '',
                  });
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] hover:opacity-90 text-[#1A1A1A] px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                <FiPlus />
                <span>Add Event</span>
              </button>
            </div>

            {/* Add/Edit Event Form */}
            <div className="p-6 border-b border-[#333333]">
              <h3 className="text-lg font-medium mb-4 text-gray-400">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">Title</label>
                  <input
                    type="text"
                    value={editingEvent ? editingEvent.title : newEvent.title}
                    onChange={(e) => editingEvent
                      ? setEditingEvent({ ...editingEvent, title: e.target.value })
                      : setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="w-full p-3 border border-[#333333] rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">Date</label>
                  <input
                    type="date"
                    value={editingEvent ? editingEvent.date : newEvent.date}
                    onChange={(e) => editingEvent
                      ? setEditingEvent({ ...editingEvent, date: e.target.value })
                      : setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="w-full p-3 border border-[#333333] rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">Location</label>
                  <input
                    type="text"
                    value={editingEvent ? editingEvent.location : newEvent.location}
                    onChange={(e) => editingEvent
                      ? setEditingEvent({ ...editingEvent, location: e.target.value })
                      : setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="w-full p-3 border border-[#333333] rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">Image URL</label>
                  <input
                    type="text"
                    value={editingEvent ? editingEvent.image : newEvent.image}
                    onChange={(e) => editingEvent
                      ? setEditingEvent({ ...editingEvent, image: e.target.value })
                      : setNewEvent({ ...newEvent, image: e.target.value })
                    }
                    className="w-full p-3 border border-[#333333] rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 cursor-text"
                    placeholder="Paste image URL here"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                {editingEvent && (
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 border border-[#333333] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={editingEvent ? updateEvent : addEvent}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] hover:opacity-90 text-[#1A1A1A] px-6 py-2 rounded-lg transition-colors font-semibold"
                >
                  {editingEvent ? (
                    <>
                      <FiEdit2 />
                      <span>Update Event</span>
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      <span>Add Event</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {events.map((event) => (
                <div key={event.id} className="border border-[#333333] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={event.image}
                      alt={event.title}
                      layout="fill"
                      objectFit="cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-300 mb-2">{event.title}</h3>
                    <div className="flex items-center text-gray-200 mb-1">
                      <FiCalendar className="mr-2 text-indigo-500" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-200 mb-4">
                      <FiMapPin className="mr-2 text-indigo-500" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
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
        </main>
      </div>
    );
  }

  // Admin Login Modal (updated design)
  if (showAdminLogin) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
        <div className="bg-[#2A2A2A] rounded-xl shadow-xl overflow-hidden max-w-md w-full border border-[#333333]">
          <div className="bg-gradient-to-r from-[#FFD700] to-[#E6C200] p-6 text-[#1A1A1A] text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-[#FFF8DC] p-3 rounded-full">
                <FiAward className="text-[#FFD700] text-2xl" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Admin Portal</h2>
            <p className="text-[#8B8000] mt-1">Enter your credentials to continue</p>
          </div>

          <div className="p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                    className="w-full pl-10 p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                    placeholder="Enter admin username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLogIn className="text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                    className="w-full pl-10 pr-10 p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-gray-400 hover:text-gray-300" />
                    ) : (
                      <FiEye className="text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowAdminLogin(false)}
                  className="px-5 py-2 border border-[#444444] text-gray-300 rounded-lg hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminLogin}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] text-[#1A1A1A] px-5 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer font-semibold"
                >
                  <span>Login</span>
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contest View Modal
  if (viewingContest) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white p-4">
        <div className="container mx-auto">
          <button
            onClick={() => setViewingContest(null)}
            className="flex items-center text-[#FFD700] mb-6 hover:underline"
          >
            <FiChevronLeft className="mr-1" /> Back to Contests
          </button>

          <div className="bg-[#2A2A2A] rounded-xl p-6 mb-8">
            <h1 className="text-3xl font-bold text-[#FFD700] mb-2">{viewingContest.title}</h1>
            <p className="text-gray-300 mb-4">{viewingContest.description}</p>
            <div className="flex items-center text-gray-400">
              <FiAward className="mr-2" />
              <span>Category: {viewingContest.category}</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">Contestants</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viewingContest.contestants.map(contestant => (
              <div key={contestant.id} className="bg-[#2A2A2A] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={contestant.image}
                    alt={contestant.name}
                    layout="fill"
                    objectFit="cover"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2">{contestant.name}</h3>
                  <p className="text-gray-300 mb-4">{contestant.bio}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[#FFD700] font-bold">{contestant.votes} votes</span>
                      <div className="text-xs text-gray-400">₦{contestant.amountGained.toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedContestant(contestant);
                        setSelectedContest(viewingContest);
                        setShowVoteDialog(true);
                      }}
                      className="bg-[#FFD700] text-[#1A1A1A] px-4 py-1 rounded-full hover:bg-[#E6C200] transition-colors"
                    >
                      Vote Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="bg-[#2A2A2A] sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => scrollToSection('home')}>
            <Image
              src="/images/logo.png"
              alt="BSS Logo"
              width={40}
              height={40}
              className="w-10 h-10"
              unoptimized
            />
            <span className="ml-3 text-xl font-bold text-[#FFD700]">BSS Entertainment</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-2 font-medium ${activeSection === item.id ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-gray-300 hover:text-[#FFD700]'} cursor-pointer`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center overflow-hidden cursor-pointer">
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
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#FFD700]/10 hover:text-[#FFD700] flex items-center cursor-pointer"
                  >
                    <FiLogOut className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="hidden md:block bg-[#FFD700] text-[#1A1A1A] px-4 py-2 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105 cursor-pointer"
              >
                Admin Login
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white focus:outline-none cursor-pointer"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden bg-[#2A2A2A] px-4 py-2">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 text-left font-medium ${activeSection === item.id ? 'text-[#FFD700]' : 'text-gray-300 hover:text-[#FFD700]'} cursor-pointer`}
                >
                  {item.label}
                </button>
              ))}
              {!user && (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="px-3 py-2 text-left font-medium text-gray-300 hover:text-[#FFD700] cursor-pointer"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section id="home" className="relative min-h-[80vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            {/* <Image
              src={dummyImages.landingBg}
              alt="Entertainment Platform"
              layout="fill"
              objectFit="cover"
              className="opacity-50"
              unoptimized
            /> */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#FFD700]">
                Welcome to BSS Entertainment
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Your premier destination for music, movies, comedy shows, and exciting contests
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => scrollToSection('events')}
                className="bg-[#FFD700] text-[#1A1A1A] px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#E6C200] transition-transform transform hover:scale-105 cursor-pointer"
              >
                View Events
              </button>
              <button
                onClick={() => scrollToSection('contests')}
                className="bg-transparent border-2 border-[#FFD700] text-[#FFD700] px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#FFD700]/10 transition-transform transform hover:scale-105 cursor-pointer"
              >
                Vote Now
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-[#2A2A2A]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#FFD700]">
              About BSS Entertainment
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="rounded-xl overflow-hidden shadow-2xl cursor-pointer">
                  <Image
                    src={dummyImages.about}
                    alt="About BSS Entertainment"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                </div>
              </div>

              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-4 text-white">Our Story</h3>
                <p className="text-gray-300 mb-6">
                  Founded in 2010, BSS Entertainment has grown to become one of the leading entertainment companies in the region.
                  We specialize in organizing world-class music festivals, comedy shows, movie premieres, and talent competitions.
                </p>
                <p className="text-gray-300 mb-6">
                  Our mission is to discover and promote exceptional talent while providing unforgettable entertainment experiences
                  for our audiences. With over 100 successful events under our belt, we continue to push boundaries and set new
                  standards in the entertainment industry.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1A1A] p-4 rounded-lg cursor-pointer hover:bg-[#FFD700]/10 transition-colors">
                    <h4 className="text-[#FFD700] font-bold mb-2">100+ Events</h4>
                    <p className="text-gray-300 text-sm">Successfully organized</p>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg cursor-pointer hover:bg-[#FFD700]/10 transition-colors">
                    <h4 className="text-[#FFD700] font-bold mb-2">50K+ Fans</h4>
                    <p className="text-gray-300 text-sm">Engaged community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 bg-[#1A1A1A]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#FFD700]">
              Our Services
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Event Production",
                  description: "Full-service event production for concerts, festivals, and shows.",
                  icon: <FiMusic size={40} className="text-[#FFD700] mb-4" />
                },
                {
                  title: "Talent Management",
                  description: "Discover, develop, and promote exceptional talent across various genres.",
                  icon: <FiUser size={40} className="text-[#FFD700] mb-4" />
                },
                {
                  title: "Content Creation",
                  description: "High-quality video and audio production for artists and brands.",
                  icon: <FiFilm size={40} className="text-[#FFD700] mb-4" />
                },
                {
                  title: "Marketing & Promotion",
                  description: "Comprehensive marketing strategies to maximize your event's reach.",
                  icon: <FiMic size={40} className="text-[#FFD700] mb-4" />
                },
                {
                  title: "Sponsorship Acquisition",
                  description: "Connecting brands with relevant entertainment opportunities.",
                  icon: <FiAward size={40} className="text-[#FFD700] mb-4" />
                },
                {
                  title: "Ticketing Solutions",
                  description: "End-to-end ticketing services for seamless event access.",
                  icon: <FiCalendar size={40} className="text-[#FFD700] mb-4" />
                }
              ].map((service, index) => (
                <div key={index} className="bg-[#2A2A2A] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="text-center">
                    {service.icon}
                    <h3 className="text-xl font-bold mb-2 text-white">{service.title}</h3>
                    <p className="text-gray-300">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="py-16 bg-[#2A2A2A]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#FFD700]">
              Upcoming Events
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event.id} className="bg-[#1A1A1A] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="relative h-48">
                    <Image
                      src={event.image}
                      alt={event.title}
                      layout="fill"
                      objectFit="cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
                    <div className="flex items-center text-gray-300 mb-2">
                      <FiCalendar className="mr-2 text-[#FFD700]" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-300 mb-4">
                      <FiMapPin className="mr-2 text-[#FFD700]" />
                      <span>{event.location}</span>
                    </div>
                    <button className="w-full bg-[#FFD700] text-[#1A1A1A] py-2 rounded-full font-medium hover:bg-[#E6C200] transition-colors cursor-pointer">
                      Get Tickets
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contestants Section */}
        <section id="contestants" className="py-16 bg-[#1A1A1A]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#FFD700]">
              Vote for Contestants
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {contestants.map((contestant) => (
                <div key={contestant.id} className="text-center">
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto mb-3 border-2 border-[#FFD700] cursor-pointer hover:shadow-lg transition-shadow"
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
                    onClick={() => {
                      setSelectedContestant(contestant);
                      setShowVoteDialog(true);
                    }}
                    className="mt-2 text-xs bg-[#FFD700] text-[#1A1A1A] px-3 py-1 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105 cursor-pointer"
                  >
                    Vote ({contestant.votes})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contests Section */}
        <section id="contests" className="py-16 bg-[#2A2A2A]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#FFD700]">
              Ongoing Contests
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contests.filter(c => c.isActive).map((contest) => (
                <div
                  key={contest.id}
                  className="bg-[#1A1A1A] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setViewingContest(contest)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-[#FFD700]">{contest.title}</h3>
                      <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{contest.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-gray-400">
                        <FiAward className="mr-2" />
                        <span>{contest.category}</span>
                      </div>
                      <button
                        className="text-[#FFD700] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingContest(contest);
                        }}
                      >
                        View Contestants
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-[#2A2A2A]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#FFD700]">
              Contact Us
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2 bg-[#1A1A1A] p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-white">Get In Touch</h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-[#FFD700] p-2 rounded-full mr-4">
                      <FiMapPin className="text-[#1A1A1A]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Address</h4>
                      <p className="text-gray-300">{companyLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-[#FFD700] p-2 rounded-full mr-4">
                      <FiMail className="text-[#1A1A1A]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Email</h4>
                      <p className="text-gray-300">bssentertainmentindustry@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-[#FFD700] p-2 rounded-full mr-4">
                      <FiPhone className="text-[#1A1A1A]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Phone</h4>
                      <p className="text-gray-300">+234 707 597 0102</p>
                    </div>
                  </div>
                </div>

                <form className="mt-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Your Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#2A2A2A] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Your Email</label>
                    <input
                      type="email"
                      className="w-full bg-[#2A2A2A] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Message</label>
                    <textarea
                      rows={4}
                      className="w-full bg-[#2A2A2A] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] cursor-text"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FFD700] text-[#1A1A1A] py-3 rounded-full font-bold hover:bg-[#E6C200] transition-colors cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              <div className="md:w-1/2 bg-[#1A1A1A] rounded-xl overflow-hidden shadow-lg">
                <Map location={companyLocation} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] py-8 border-t border-[#FFD700]/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Image
                src="/images/logo.png"
                alt="BSS Logo"
                width={40}
                height={40}
                className="w-10 h-10 cursor-pointer"
                onClick={() => scrollToSection('home')}
                unoptimized
              />
              <span className="ml-3 text-xl font-bold text-[#FFD700] cursor-pointer" onClick={() => scrollToSection('home')}>
                BSS Entertainment
              </span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#2A2A2A] text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} BSS Entertainment. All rights reserved.</p>
            <p className="mt-2">Powered by <span className="text-[#FFD700]">Sapok</span></p>
          </div>
        </div>
      </footer>

      {/* Vote Dialog */}
      {showVoteDialog && selectedContestant && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4">
          <div className="bg-[#2A2A2A] rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#FFD700]">{selectedContestant.name}</h2>
              <button
                onClick={() => setShowVoteDialog(false)}
                className="text-gray-400 hover:text-[#FFD700] cursor-pointer"
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
                {selectedContest && (
                  <>
                    <p className="text-sm text-gray-300 mb-2">
                      Contest: {selectedContest.title}
                    </p>
                    <p className="text-sm text-gray-300 mb-2">
                      Category: {selectedContest.category}
                    </p>
                  </>
                )}
                <p className="text-sm text-gray-300">Votes: {selectedContestant.votes}</p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-white">About</h3>
              <p className="text-gray-300 text-sm">{selectedContestant.bio}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Add a comment (optional)
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] cursor-text"
                rows={3}
                placeholder="Your anonymous comment..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVoteDialog(false)}
                className="px-4 py-2 border border-gray-600 rounded-full hover:bg-[#3A3A3A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVotePayment}
                className="px-4 py-2 bg-[#FFD700] text-[#1A1A1A] rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105 cursor-pointer"
              >
                Vote Now (₦100)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-30 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-[#FFD700] cursor-pointer"
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
                <button className="bg-[#FFD700] text-[#1A1A1A] px-6 py-2 rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105 cursor-pointer">
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

export default dynamic(() => Promise.resolve(EntertainmentWebsite), { ssr: false });