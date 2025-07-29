/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { FiHome, FiMusic, FiFilm, FiMic, FiSmile, FiUser, FiSearch, FiChevronRight, FiX, FiCalendar, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiLogIn, FiPlayCircle, FiAward, FiLogOut, FiMail, FiPhone, FiInfo, FiMenu, FiDollarSign, FiUsers, FiBarChart2, FiCreditCard, FiEyeOff, FiEye, FiChevronLeft, FiUpload, FiPauseCircle } from 'react-icons/fi';
import { initializeApp } from 'firebase/app';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import * as Toast from '@radix-ui/react-toast';
import emailjs from '@emailjs/browser';

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

const AddContestantForm = ({
  contest,
  onAddContestant
}: {
  contest: Contest,
  onAddContestant: (contestant: Omit<Contestant, 'id' | 'votes' | 'amountGained' | 'comments'>) => void
}) => {
  const [newContestant, setNewContestant] = useState({
    name: '',
    bio: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, you would upload the image file to a storage service here
    // For this example, we'll just use the preview URL as a placeholder
    const imageUrl = imagePreview || '';

    if (newContestant.name && imageUrl) {
      onAddContestant({
        ...newContestant,
        image: imageUrl
      });
      setNewContestant({
        name: '',
        bio: '',
        image: '',
      });
      setImageFile(null);
      setImagePreview(null);
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-xl p-6">
      <h3 className="text-xl font-bold text-[#FFD700] mb-4">Add New Contestant to {contest.title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
          <input
            type="text"
            value={newContestant.name}
            onChange={(e) => setNewContestant({ ...newContestant, name: e.target.value })}
            className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            placeholder="Enter contestant name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Bio</label>
          <textarea
            value={newContestant.bio}
            onChange={(e) => setNewContestant({ ...newContestant, bio: e.target.value })}
            className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            rows={3}
            placeholder="Enter contestant bio/description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Image</label>
          <div className="flex items-center space-x-4">
            {imagePreview ? (
              <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  layout="fill"
                  objectFit="cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-20 w-20 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                <FiPlus className="text-gray-400" />
              </div>
            )}
            <label className="cursor-pointer">
              <span className="bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2 px-4 rounded-lg transition-colors">
                Upload Image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3 rounded-lg font-medium transition-colors"
        >
          Add Contestant
        </button>
      </form>
    </div>
  );

  const ContestantDetailsView = ({ contestant, contest }: { contestant: Contestant, contest: Contest }) => {
    return (
      <div className="bg-[#2A2A2A] rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={contestant.image}
                alt={contestant.name}
                layout="fill"
                objectFit="cover"
                unoptimized
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-[#FFD700]">{contestant.name}</h3>
              <p className="text-gray-300 capitalize">{contestant.category}</p>
              <div className="mt-4 bg-[#333333] p-3 rounded-lg">
                <p className="text-[#FFD700] font-bold">Votes: {contestant.votes}</p>
                <p className="text-green-400">Amount Raised: ₦{contestant.amountGained.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="md:w-2/3">
            <h3 className="text-2xl font-bold text-[#FFD700] mb-4">About</h3>
            <p className="text-gray-300 mb-6">{contestant.bio}</p>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-white mb-2">Contest Details</h4>
              <p className="text-gray-300">{contest.title}</p>
              <p className="text-gray-400 text-sm">{contest.description}</p>
            </div>

            {contestant.comments.length > 0 && (
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Comments ({contestant.comments.length})</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {contestant.comments.map(comment => (
                    <div key={comment.id} className="bg-[#333333] p-3 rounded-lg">
                      <p className="text-gray-300 text-sm">{comment.text}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#2A2A2A] rounded-xl p-6">
      <h3 className="text-xl font-bold text-[#FFD700] mb-4">Add New Contestant to {contest.title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
          <input
            type="text"
            value={newContestant.name}
            onChange={(e) => setNewContestant({ ...newContestant, name: e.target.value })}
            className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            placeholder="Enter contestant name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Bio</label>
          <textarea
            value={newContestant.bio}
            onChange={(e) => setNewContestant({ ...newContestant, bio: e.target.value })}
            className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            rows={3}
            placeholder="Enter contestant bio/description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Image URL</label>
          <input
            type="text"
            value={newContestant.image}
            onChange={(e) => setNewContestant({ ...newContestant, image: e.target.value })}
            className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            placeholder="Enter image URL"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3 rounded-lg font-medium transition-colors"
        >
          Add Contestant
        </button>
      </form>
    </div>
  );
};

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
  landingBg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean, message: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendStatus(null);

    // Replace these with your actual EmailJS service details
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
        setSendStatus({ success: true, message: 'Message sent successfully!' });
        setFormData({ name: '', email: '', message: '' });
        showToast('Message Sent', 'Your message has been sent successfully!');
      })
      .catch((error: any) => {
        console.error('Failed to send message:', error);
        setSendStatus({ success: false, message: 'Failed to send message. Please try again.' });
        showToast('Error', 'Failed to send message. Please try again.', 'error');
      })
      .finally(() => {
        setIsSending(false);
      });
  };

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
  const [showContestForm, setShowContestForm] = useState(false);
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [viewingContest, setViewingContest] = useState<Contest | null>(null);
  const [showAddContestant, setShowAddContestant] = useState(false);
  const [PaystackButton, setPaystackButton] = useState<any>(null);
  const [toasts, setToasts] = useState<{ id: string; title: string; description: string; type: 'success' | 'error' }[]>([]);

  const companyLocation = "Ikerre 361101, Ekiti, Nigeria";

  // Toast functions
  const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

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
        title: 'Most Popular Lecturer',
        description: 'Vote for the most popular lecturer this semester',
        category: 'University Wide',
        isActive: true,
        contestants: [
          {
            id: '3',
            name: 'Dr. Adebayo Johnson',
            bio: 'Senior Lecturer with 15 years experience in Media Studies',
            image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            votes: 210,
            amountGained: 21000,
            comments: []
          },
          {
            id: '4',
            name: 'Prof. Grace Oluwale',
            bio: 'Professor of Communication and Media Arts',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1976&q=80',
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
  const [isPaystackReady, setIsPaystackReady] = useState(false);

  const getPaystackConfig = (amount: number) => ({
    reference: new Date().getTime().toString(),
    email: user?.email || 'user@example.com',
    amount: amount * 100, // Convert to kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key',
    currency: 'NGN',
  });

  useEffect(() => {
    const initializePaystack = async () => {
      try {
        const { usePaystackPayment } = await import('react-paystack');
        setPaystackButton(() => usePaystackPayment);
        setIsPaystackReady(true);
      } catch (error) {
        console.error('Failed to load Paystack:', error);
        showToast('Error', 'Payment system failed to load', 'error');
        setIsPaystackReady(false);
      }
    };

    initializePaystack();
  }, []);

  // Add vote amount state
  const [voteAmount, setVoteAmount] = useState(1); // Default to 1 vote
  const [voteAmountError, setVoteAmountError] = useState('');

  // Update the handleVotePayment function
  const handleVotePayment = async () => {
    if (!selectedContestant || !selectedContest) {
      showToast('Error', 'Please select a contestant to vote for', 'error');
      return;
    }

    if (voteAmount < 1) {
      setVoteAmountError('You must vote at least once');
      return;
    }

    if (!isPaystackReady) {
      showToast('Processing', 'Payment system is initializing, please wait...');
      return;
    }

    try {
      const initializePayment = PaystackButton(getPaystackConfig(voteAmount * 100)); // 100 Naira per vote
      initializePayment({
        onSuccess: (reference: any) => {
          // Update votes and amount gained
          const updatedContests = contests.map(contest => {
            if (contest.id === selectedContest.id) {
              const updatedContestants = contest.contestants.map(c => {
                if (c.id === selectedContestant.id) {
                  return {
                    ...c,
                    votes: c.votes + voteAmount,
                    amountGained: c.amountGained + (voteAmount * 100)
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
          showToast('Vote Successful', `Your ${voteAmount} vote(s) for ${selectedContestant.name} has been recorded!`);
          setVoteAmount(1); // Reset to default
        },
        onClose: () => {
          console.log('Payment closed');
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Payment Error', 'Failed to process payment. Please try again.', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      showToast('Signed Out', 'You have been successfully signed out');
    } catch (error) {
      console.error('Sign Out Error:', error);
      showToast('Error', 'Failed to sign out. Please try again.', 'error');
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
      showToast('Admin Login', 'Welcome back, Admin!');
    } else {
      showToast('Login Failed', 'Invalid admin credentials', 'error');
    }
  };

  // const addContest = () => {
  //   if (newContest.title && newContest.category) {
  //     const newId = Date.now().toString();
  //     setContests([
  //       ...contests,
  //       {
  //         id: newId,
  //         title: newContest.title,
  //         description: newContest.description,
  //         category: newContest.category,
  //         isActive: newContest.isActive,
  //         contestants: [],
  //         createdAt: new Date()
  //       }
  //     ]);
  //     setNewContest({
  //       title: '',
  //       description: '',
  //       category: '',
  //       isActive: true
  //     });
  //     showToast('Contest Added', `${newContest.title} has been added successfully`);
  //   } else {
  //     showToast('Error', 'Please fill all required fields', 'error');
  //   }
  // };
  const addContest = () => {
  const newContestToAdd: Contest = {
    id: Date.now().toString(), // Generate unique ID
    title: newContest.title,
    description: newContest.description,
    category: newContest.category,
    isActive: newContest.isActive,
    contestants: [],
    createdAt: new Date(),
  };
  
  setContests([...contests, newContestToAdd]);
  setNewContest({
    title: '',
    description: '',
    category: '',
    isActive: true
  });
  setShowContestForm(false);
};
  const updateContest = () => {
    if (editingContest) {
      setContests(
        contests.map(c =>
          c.id === editingContest.id ? editingContest : c
        )
      );
      setEditingContest(null);
      showToast('Contest Updated', `${editingContest.title} has been updated`);
    }
  };

  const deleteContest = (id: string) => {
    const contest = contests.find(c => c.id === id);
    if (contest) {
      if (window.confirm(`Are you sure you want to delete "${contest.title}"? This action cannot be undone.`)) {
        setContests(contests.filter(c => c.id !== id));
        showToast('Contest Removed', `${contest.title} has been deleted`);

        // If we're viewing the deleted contest, clear the view
        if (viewingContest?.id === id) {
          setViewingContest(null);
        }
        if (selectedContest?.id === id) {
          setSelectedContest(null);
        }
      }
    }
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
      showToast('Contestant Added', `${newContestant.name} has been added to ${selectedContest.title}`);
    } else {
      showToast('Error', 'Please fill all required fields', 'error');
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
      showToast('Contestant Updated', `${editingContestant.name} has been updated`);
    }
  };

  const deleteContestant = (id: string) => {
    if (!selectedContest) return;

    const contestant = selectedContest.contestants.find(c => c.id === id);
    if (contestant) {
      if (window.confirm(`Are you sure you want to delete contestant "${contestant.name}"? This action cannot be undone.`)) {
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

        // Update the selected contest if it's the current one
        if (selectedContest) {
          setSelectedContest({
            ...selectedContest,
            contestants: selectedContest.contestants.filter(c => c.id !== id)
          });
        }

        // If we're viewing this contestant, clear the view
        if (selectedContestant?.id === id) {
          setSelectedContestant(null);
        }

        showToast('Contestant Removed', `${contestant.name} has been deleted`);
      }
    }
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
      showToast('Event Added', `${newEvent.title} has been added to events`);
    } else {
      showToast('Error', 'Please fill all required fields', 'error');
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
      showToast('Event Updated', `${editingEvent.title} has been updated`);
    }
  };

  const deleteEvent = (id: number) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setEvents(events.filter(e => e.id !== id));
      showToast('Event Removed', `${event.title} has been deleted`);
    }
  };

  const toggleContestStatus = (contestId: string) => {
    if (window.confirm(`Are you sure you want to ${contests.find(c => c.id === contestId)?.isActive ? 'deactivate' : 'activate'} this contest?`)) {
      setContests(contests.map(contest => {
        if (contest.id === contestId) {
          const newStatus = !contest.isActive;
          showToast(
            newStatus ? 'Contest Activated' : 'Contest Deactivated',
            `${contest.title} has been ${newStatus ? 'activated' : 'deactivated'}`
          );
          return { ...contest, isActive: newStatus };
        }
        return contest;
      }));
    }
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

  // Contestant Details View
  const ContestantDetails = ({
    contestant,
    contest,
    showVoteInfo = true
  }: {
    contestant: Contestant,
    contest: Contest,
    showVoteInfo?: boolean
  }) => {
    return (
      <div className="bg-[#2A2A2A] rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="relative h-full rounded-lg overflow-hidden">
              <Image
                src={contestant.image}
                alt={contestant.name}
                layout="fill"
                objectFit="cover"
                unoptimized
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <h3 className="text-2xl font-bold text-[#FFD700] mb-4">About</h3>
            <p className="text-gray-300 mb-6">{contestant.bio}</p>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-white mb-2">Contest Details</h4>
              <p className="text-gray-300">{contest.title}</p>
              <p className="text-gray-400 text-sm">{contest.description}</p>
            </div>

            {contestant.comments.length > 0 && (
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Comments ({contestant.comments.length})</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {contestant.comments.map(comment => (
                    <div key={comment.id} className="bg-[#333333] p-3 rounded-lg">
                      <p className="text-gray-300 text-sm">{comment.text}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-gray-100">
        {/* Admin Header - Mobile Optimized */}
        <header className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1 sm:p-2 bg-white/10 rounded-lg">
                  <FiAward className="text-white text-lg sm:text-xl" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate max-w-[180px] sm:max-w-none">
                  BSS Admin Dashboard
                </h1>
              </div>
              <button
                onClick={() => setIsAdmin(false)}
                className="flex items-center space-x-1 sm:space-x-2 bg-white/10 hover:bg-white/20 p-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-200"
              >
                <FiLogOut className="text-white" />
                <span className="hidden sm:inline">Exit Admin</span>
              </button>
            </div>
          </div>
        </header>

        {/* Admin Main Content */}
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {/* Stats Cards - Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {/* Total Contests Card */}
            <div className="bg-[#2A2A2A] p-4 sm:p-6 rounded-lg shadow-sm border border-[#333333]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Total Contests</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-[#FFD700]">
                    {contests.length}
                  </h3>
                </div>
                <div className="p-2 sm:p-3 bg-[#4F46E5]/10 rounded-lg">
                  <FiUsers className="text-[#FFD700] text-lg sm:text-xl" />
                </div>
              </div>
            </div>

            {/* Total Votes Card */}
            <div className="bg-[#2A2A2A] p-4 sm:p-6 rounded-lg shadow-sm border border-[#333333]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Total Votes</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-[#7C3AED]">
                    {contests.reduce(
                      (totalVotes, contest) =>
                        totalVotes +
                        contest.contestants.reduce(
                          (contestVotes, contestant) => contestVotes + contestant.votes,
                          0
                        ),
                      0
                    )}
                  </h3>
                </div>
                <div className="p-2 sm:p-3 bg-[#7C3AED]/10 rounded-lg">
                  <FiBarChart2 className="text-[#7C3AED] text-lg sm:text-xl" />
                </div>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-[#2A2A2A] p-4 sm:p-6 rounded-lg shadow-sm border border-[#333333]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Total Revenue</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-[#10B981]">
                    ₦
                    {contests
                      .reduce(
                        (sum, c) =>
                          sum + c.contestants.reduce((s, ct) => s + ct.amountGained, 0),
                        0
                      )
                      .toLocaleString()}
                  </h3>
                </div>
                <div className="p-2 sm:p-3 bg-[#10B981]/10 rounded-lg">
                  <FiCreditCard className="text-[#10B981] text-lg sm:text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Contests Management Section */}
          <div className="bg-[#2A2A2A] rounded-lg shadow-sm border border-[#333333] mb-6 overflow-hidden">
            {/* Header with Add Button */}
            <div className="p-4 sm:p-6 border-b border-[#333333] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-[#FFD700]">
                Contests Management
              </h2>
              <button
                onClick={() => {
                  setEditingContest(null); // Clear any editing state
                  setShowContestForm(true); // Show the form
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
            {(showContestForm || editingContest) && (
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
                      onChange={(e) =>
                        editingContest
                          ? setEditingContest({ ...editingContest, title: e.target.value })
                          : setNewContest({ ...newContest, title: e.target.value })
                      }
                      className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Category</label>
                    <input
                      type="text"
                      value={editingContest ? editingContest.category : newContest.category}
                      onChange={(e) =>
                        editingContest
                          ? setEditingContest({ ...editingContest, category: e.target.value })
                          : setNewContest({ ...newContest, category: e.target.value })
                      }
                      className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                      placeholder="E.g. BOUESTI MASS COM"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-400">Description</label>
                    <textarea
                      value={editingContest ? editingContest.description : newContest.description}
                      onChange={(e) =>
                        editingContest
                          ? setEditingContest({ ...editingContest, description: e.target.value })
                          : setNewContest({ ...newContest, description: e.target.value })
                      }
                      className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingContest ? editingContest.isActive : newContest.isActive}
                        onChange={(e) =>
                          editingContest
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
                  <button
                    onClick={() => {
                      setEditingContest(null);
                      setShowContestForm(false);
                    }}
                    className="px-4 py-2 border border-[#444444] text-gray-300 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      if (editingContest) {
                        updateContest();
                      } else {
                        addContest(); // This should add to your contests array
                      }
                      setShowContestForm(false);
                    }}
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
            )}

            {/* Contests Table - Responsive */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#333333]">
                <thead className="bg-[#333333]">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Contestants
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#2A2A2A] divide-y divide-[#333333]">
                  {contests.map((contest) => (
                    <tr
                      key={contest.id}
                      className="hover:bg-[#333333] transition-colors cursor-pointer"
                      onClick={() => setSelectedContest(contest)} // Maintain drawer functionality
                    >
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <div className="font-medium text-white text-sm sm:text-base">
                          {contest.title}
                          <div className="text-xs text-gray-400 line-clamp-1 sm:hidden">
                            {contest.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400 capitalize">
                        {contest.category}
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400">
                        {contest.contestants.length}
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${contest.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                          }`}>
                          {contest.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                        <div className="flex justify-end space-x-2 sm:space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingContest(contest);
                            }}
                            className="text-[#FFD700] hover:text-[#E6C200]"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleContestStatus(contest.id);
                            }}
                            className={`${contest.isActive
                              ? 'text-yellow-500 hover:text-yellow-400'
                              : 'text-green-500 hover:text-green-400'
                              }`}
                            title={contest.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {contest.isActive ? (
                              <FiPauseCircle size={16} />
                            ) : (
                              <FiPlayCircle size={16} />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteContest(contest.id);
                            }}
                            className="text-red-600 hover:text-red-500"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedContest && (
              <div className="fixed inset-0 bg-black/70 z-90 flex justify-end">
                <div className="bg-[#2A2A2A] w-full max-w-2xl h-full overflow-y-auto">
                  {/* Drawer Header */}
                  <div className="sticky top-0 bg-[#2A2A2A] z-10 p-4 border-b border-[#333333] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#FFD700]">
                      {selectedContest.title} - Contestants
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedContest(null);
                        setEditingContestant(null);
                        setNewContestant({
                          name: '',
                          bio: '',
                          image: '',
                        });
                      }}
                      className="text-gray-400 hover:text-[#FFD700] p-1 rounded-full"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  {/* Drawer Content - Responsive */}
                  <div className="p-4 sm:p-6">
                    {/* Contest Info */}
                    <div className="bg-[#333333] p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-bold text-[#FFD700] mb-2">Contest Information</h3>
                      <p className="text-gray-300 mb-2">{selectedContest.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-400">Category</p>
                          <p className="text-white">{selectedContest.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <p className={`${selectedContest.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                            {selectedContest.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Contestants</p>
                          <p className="text-white">{selectedContest.contestants.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Votes</p>
                          <p className="text-white">
                            {selectedContest.contestants.reduce((sum, c) => sum + c.votes, 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Add Contestant Form - Responsive */}
                    <div className="bg-[#333333] p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-bold text-[#FFD700] mb-4">
                        {editingContestant ? 'Edit Contestant' : 'Add New Contestant'}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
                          <input
                            type="text"
                            value={editingContestant ? editingContestant.name : newContestant.name}
                            onChange={(e) => editingContestant
                              ? setEditingContestant({ ...editingContestant, name: e.target.value })
                              : setNewContestant({ ...newContestant, name: e.target.value })
                            }
                            className="w-full p-3 bg-[#2A2A2A] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                            placeholder="Enter contestant name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-400">Bio</label>
                          <textarea
                            value={editingContestant ? editingContestant.bio : newContestant.bio}
                            onChange={(e) => editingContestant
                              ? setEditingContestant({ ...editingContestant, bio: e.target.value })
                              : setNewContestant({ ...newContestant, bio: e.target.value })
                            }
                            className="w-full p-3 bg-[#2A2A2A] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                            rows={3}
                            placeholder="Enter contestant bio/description"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-400">Image</label>
                          <div className="flex items-center space-x-4">
                            {(editingContestant?.image || newContestant.image) ? (
                              <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                                <img
                                  src={editingContestant?.image || newContestant.image}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-20 w-20 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                                <FiPlus className="text-gray-400" />
                              </div>
                            )}
                            <label className="cursor-pointer">
                              <span className="bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2 px-4 rounded-lg transition-colors">
                                Upload Image
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const imageUrl = URL.createObjectURL(file);
                                    if (editingContestant) {
                                      setEditingContestant({ ...editingContestant, image: imageUrl });
                                    } else {
                                      setNewContestant({ ...newContestant, image: imageUrl });
                                    }
                                  }
                                }}
                                className="hidden"
                                required={!editingContestant}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          {editingContestant && (
                            <button
                              onClick={() => setEditingContestant(null)}
                              className="px-4 py-2 border border-[#444444] text-gray-300 rounded-lg hover:bg-[#333333] transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (editingContestant) {
                                updateContestant();
                              } else {
                                addContestant();
                              }
                            }}
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
                    </div>

                    {/* Contestants List - Responsive */}
                    <h3 className="text-xl font-bold text-[#FFD700] mb-4">Contestants ({selectedContest.contestants.length})</h3>

                    {selectedContest.contestants.length === 0 ? (
                      <div className="bg-[#333333] p-8 rounded-lg text-center">
                        <FiUser className="mx-auto text-gray-500 mb-4 text-3xl" />
                        <p className="text-gray-400">No contestants added yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedContest.contestants.map((contestant) => (
                          <div key={contestant.id} className="bg-[#333333] rounded-lg overflow-hidden">
                            <div className="flex flex-col sm:flex-row">
                              <div className="sm:w-1/4">
                                <div className="relative h-48 sm:h-full">
                                  <img
                                    src={contestant.image}
                                    alt={contestant.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="sm:w-3/4 p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-lg font-bold text-[#FFD700]">{contestant.name}</h4>
                                    <p className="text-gray-300 text-sm mb-4">{contestant.bio}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => setEditingContestant(contestant)}
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

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div className="bg-[#2A2A2A] p-2 rounded">
                                    <p className="text-sm text-gray-400">Votes</p>
                                    <p className="text-[#FFD700] font-bold">{contestant.votes}</p>
                                  </div>
                                  <div className="bg-[#2A2A2A] p-2 rounded">
                                    <p className="text-sm text-gray-400">Amount Raised</p>
                                    <p className="text-green-400">₦{contestant.amountGained.toLocaleString()}</p>
                                  </div>
                                </div>

                                {contestant.comments.length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="text-sm font-bold text-gray-300 mb-2">Recent Comments ({contestant.comments.length})</h5>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                      {contestant.comments.slice(0, 3).map(comment => (
                                        <div key={comment.id} className="bg-[#2A2A2A] p-2 rounded text-sm">
                                          <p className="text-gray-300">{comment.text}</p>
                                          <p className="text-gray-500 text-xs mt-1">
                                            {new Date(comment.createdAt).toLocaleString()}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contestant Management Section */}
          <div className="bg-[#2A2A2A] rounded-lg shadow-sm border border-[#333333] mb-6 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[#333333] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-[#FFD700]">
                Contestant Management
              </h2>
              <div className="w-full sm:w-auto">
                <select
                  value={selectedContest?.id || ''}
                  onChange={(e) => {
                    const contest = contests.find((c) => c.id === e.target.value);
                    setSelectedContest(contest || null);
                  }}
                  className="w-full sm:w-64 bg-[#333333] border border-[#444444] text-white rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                >
                  <option value="">Select a contest</option>
                  {contests.map((contest) => (
                    <option key={contest.id} value={contest.id}>
                      {contest.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contestant Form */}
            {selectedContest && (
              <div className="p-4 sm:p-6 border-b border-[#333333]">
                <h3 className="text-md sm:text-lg font-medium mb-3 sm:mb-4 text-[#FFD700]">
                  {editingContestant ? 'Edit Contestant' : 'Add New Contestant'}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-400">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editingContestant ? editingContestant.name : newContestant.name}
                      onChange={(e) =>
                        editingContestant
                          ? setEditingContestant({ ...editingContestant, name: e.target.value })
                          : setNewContestant({ ...newContestant, name: e.target.value })
                      }
                      className="w-full p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                      placeholder="Contestant name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-400">
                      Bio/Description
                    </label>
                    <textarea
                      value={editingContestant ? editingContestant.bio : newContestant.bio}
                      onChange={(e) =>
                        editingContestant
                          ? setEditingContestant({ ...editingContestant, bio: e.target.value })
                          : setNewContestant({ ...newContestant, bio: e.target.value })
                      }
                      className="w-full p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                      rows={3}
                      placeholder="Detailed description about the contestant"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-400">
                      Image URL
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={editingContestant ? editingContestant.image : newContestant.image}
                        onChange={(e) =>
                          editingContestant
                            ? setEditingContestant({ ...editingContestant, image: e.target.value })
                            : setNewContestant({ ...newContestant, image: e.target.value })
                        }
                        className="flex-1 p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                        placeholder="Paste image URL here"
                      />
                      <button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white p-2 sm:p-3 rounded-lg">
                        <FiUpload size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-3 sm:mt-4 space-x-2 sm:space-x-3">
                  {editingContestant && (
                    <button
                      onClick={() => setEditingContestant(null)}
                      className="px-3 sm:px-4 py-1 sm:py-2 border border-[#444444] text-gray-300 rounded-lg hover:bg-[#333333] transition-colors text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={editingContestant ? updateContestant : addContestant}
                    className="flex items-center space-x-1 sm:space-x-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 sm:px-6 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    {editingContestant ? (
                      <>
                        <FiEdit2 size={14} />
                        <span>Update</span>
                      </>
                    ) : (
                      <>
                        <FiPlus size={14} />
                        <span>Add Contestant</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Contestants Grid - Responsive */}
            {selectedContest && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
                {selectedContest.contestants.map((contestant) => (
                  <div
                    key={contestant.id}
                    className="border border-[#333333] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-40 sm:h-48">
                      <img
                        src={contestant.image}
                        alt={contestant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-sm sm:text-base text-white mb-1 sm:mb-2 truncate">
                        {contestant.name}
                      </h3>
                      <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                        {contestant.bio}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs sm:text-sm text-gray-400">
                          Votes: <span className="text-[#FFD700]">{contestant.votes}</span>
                        </div>
                        <div className="flex space-x-2 sm:space-x-3">
                          <button
                            onClick={() => {
                              setEditingContestant(contestant);
                            }}
                            className="text-[#4F46E5] hover:text-[#4338CA]"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteContestant(contestant.id)}
                            className="text-red-600 hover:text-red-500"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events Management Section */}
          <div className="bg-[#2A2A2A] rounded-lg shadow-sm border border-[#333333] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[#333333] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-400">
                Events Management
              </h2>
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
                className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] hover:opacity-90 text-[#1A1A1A] px-3 sm:px-4 py-2 rounded-lg transition-colors font-semibold text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <FiPlus size={16} />
                <span>Add Event</span>
              </button>
            </div>

            {/* Add/Edit Event Form */}
            <div className="p-4 sm:p-6 border-b border-[#333333]">
              <h3 className="text-md sm:text-lg font-medium mb-3 sm:mb-4 text-gray-400">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-600">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingEvent ? editingEvent.title : newEvent.title}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, title: e.target.value })
                        : setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 border border-[#333333] rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingEvent ? editingEvent.date : newEvent.date}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, date: e.target.value })
                        : setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 border border-[#333333] rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-600">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingEvent ? editingEvent.location : newEvent.location}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, location: e.target.value })
                        : setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 border border-[#333333] rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-600">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editingEvent ? editingEvent.image : newEvent.image}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, image: e.target.value })
                        : setNewEvent({ ...newEvent, image: e.target.value })
                    }
                    className="w-full p-2 sm:p-3 border border-[#333333] rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-sm sm:text-base"
                    placeholder="Paste image URL here"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3 sm:mt-4 space-x-2 sm:space-x-3">
                {editingEvent && (
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="px-3 sm:px-4 py-1 sm:py-2 border border-[#333333] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={editingEvent ? updateEvent : addEvent}
                  className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] hover:opacity-90 text-[#1A1A1A] px-4 sm:px-6 py-1 sm:py-2 rounded-lg transition-colors font-semibold text-xs sm:text-sm"
                >
                  {editingEvent ? (
                    <>
                      <FiEdit2 size={14} />
                      <span>Update</span>
                    </>
                  ) : (
                    <>
                      <FiPlus size={14} />
                      <span>Add Event</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Events Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-[#333333] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 sm:h-48">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-base text-gray-300 mb-1 sm:mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-gray-200 text-xs sm:text-sm mb-1">
                      <FiCalendar className="mr-2 text-indigo-500" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-200 text-xs sm:text-sm mb-3">
                      <FiMapPin className="mr-2 text-indigo-500" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
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
  const handleAddContestant = (contestant: Omit<Contestant, 'id' | 'votes' | 'amountGained' | 'comments'>) => {
    if (!viewingContest) return;

    const newId = Date.now().toString();
    const updatedContest = {
      ...viewingContest,
      contestants: [
        ...viewingContest.contestants,
        {
          ...contestant,
          id: newId,
          votes: 0,
          amountGained: 0,
          comments: []
        }
      ]
    };

    setContests(contests.map(c => c.id === viewingContest.id ? updatedContest : c));
    setViewingContest(updatedContest);
    setShowAddContestant(false);
    showToast('Success', 'Contestant added successfully');
  };

  // Update the contest view rendering
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-[#FFD700] mb-2">{viewingContest.title}</h1>
                <p className="text-gray-300 mb-4">{viewingContest.description}</p>
                <div className="flex items-center text-gray-400">
                  <FiAward className="mr-2" />
                  <span>Category: {viewingContest.category}</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">Contestants ({viewingContest.contestants.length})</h2>

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
                  <p className="text-gray-300 mb-4 line-clamp-3">{contestant.bio}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                    </div>
                    <button
                      onClick={() => {
                        setSelectedContestant(contestant);
                        setSelectedContest(viewingContest);
                        setShowVoteDialog(true);
                      }}
                      className="bg-[#FFD700] text-[#1A1A1A] px-4 py-1 rounded-full font-bold hover:bg-[#E6C200] transition-colors cursor-pointer"
                    >
                      Vote
                    </button>
                  </div>

                  Vote Dialog - shown inline when active
                  {showVoteDialog && selectedContestant && selectedContest && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                      <div className="bg-[#2A2A2A] rounded-xl w-full max-w-md mx-auto shadow-2xl border border-[#3A3A3A] overflow-hidden">
                        {/* Header - Sticky on mobile */}
                        <div className="sticky top-0 bg-[#2A2A2A] z-10 p-4 flex justify-between items-center border-b border-[#3A3A3A]">
                          <h2 className="text-xl font-bold text-[#FFD700] truncate">
                            Vote for {selectedContestant.name}
                          </h2>
                          <button
                            onClick={() => {
                              setShowVoteDialog(false);
                              setVoteAmount(1);
                              setVoteAmountError('');
                            }}
                            className="text-gray-400 hover:text-[#FFD700] p-1"
                          >
                            <FiX size={24} />
                          </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-4 overflow-y-auto max-h-[80vh]">
                          {/* Contestant Card - Mobile Optimized */}
                          <div className="flex items-center mb-4 bg-[#333333] rounded-lg p-3">
                            <div className="w-20 h-20 flex-shrink-0 mr-3">
                              <img
                                src={selectedContestant.image}
                                alt={selectedContestant.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium truncate">{selectedContestant.name}</h3>
                              <p className="text-[#FFD700] text-sm truncate">{selectedContest.title}</p>
                              <p className="text-gray-400 text-xs mt-1">Tap photo to enlarge</p>
                            </div>
                          </div>

                          {/* Vote Input - Mobile Friendly */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-300">
                              Number of Votes <span className="text-[#FFD700]">(₦100/vote)</span>
                            </label>
                            <div className="flex items-center">
                              <button
                                onClick={() => setVoteAmount(prev => Math.max(1, prev - 1))}
                                className="bg-[#333333] text-white p-3 rounded-l-lg border border-[#444444]"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={voteAmount}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1;
                                  setVoteAmount(Math.max(1, value));
                                  setVoteAmountError('');
                                }}
                                className="flex-1 bg-[#333333] border-y border-[#444444] text-white text-center p-3 focus:outline-none"
                              />
                              <button
                                onClick={() => setVoteAmount(prev => prev + 1)}
                                className="bg-[#333333] text-white p-3 rounded-r-lg border border-[#444444]"
                              >
                                +
                              </button>
                            </div>
                            {voteAmountError && (
                              <p className="text-red-500 text-xs mt-1">{voteAmountError}</p>
                            )}
                          </div>

                          {/* Comment - Mobile Optimized */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-300">
                              Comment <span className="text-gray-500 text-xs">(optional)</span>
                            </label>
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-1 focus:ring-[#FFD700] text-sm"
                              rows={3}
                              placeholder="Your message..."
                              maxLength={120}
                            />
                            <p className="text-right text-xs text-gray-500 mt-1">
                              {commentText.length}/120
                            </p>
                          </div>

                          {/* Payment Summary - Always Visible */}
                          <div className="sticky bottom-0 bg-[#2A2A2A] border-t border-[#3A3A3A] p-4 -mx-4 -mb-4">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <p className="text-gray-400 text-sm">Total Votes</p>
                                <p className="text-white font-medium">{voteAmount}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400 text-sm">Amount to Pay</p>
                                <p className="text-[#FFD700] font-bold text-lg">
                                  ₦{(voteAmount * 100).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons - Full Width on Mobile */}
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setShowVoteDialog(false);
                                  setVoteAmount(1);
                                  setVoteAmountError('');
                                }}
                                className="flex-1 py-3 border border-[#444444] text-gray-300 rounded-lg hover:bg-[#3A3A3A] text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleVotePayment}
                                className="flex-1 py-3 bg-[#FFD700] hover:bg-[#E6C200] text-[#1A1A1A] font-bold rounded-lg text-sm"
                              >
                                Pay Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
      {/* Toast Provider */}
      <Toast.Provider swipeDirection="right">
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            className={`bg-[#2A2A2A] border ${toast.type === 'success' ? 'border-[#4ade80]/30' : 'border-[#f87171]/30'} rounded-lg shadow-lg p-4 grid grid-cols-[auto_max-content] items-center gap-x-4`}
          >
            <div className="flex flex-col gap-1">
              <Toast.Title className={`font-medium ${toast.type === 'success' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                {toast.title}
              </Toast.Title>
              <Toast.Description className="text-sm text-gray-300">
                {toast.description}
              </Toast.Description>
            </div>
            <Toast.Close className="text-gray-400 hover:text-white">
              <FiX />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-xs" />
      </Toast.Provider>

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

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#2A2A2A] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] cursor-text"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#2A2A2A] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] cursor-text"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-300">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#2A2A2A] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] cursor-text"
                    ></textarea>
                  </div>

                  {sendStatus && (
                    <div className={`p-3 rounded-lg ${sendStatus.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {sendStatus.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSending}
                    className={`w-full bg-[#FFD700] text-[#1A1A1A] py-3 rounded-full font-bold hover:bg-[#E6C200] transition-colors cursor-pointer ${isSending ? 'opacity-70' : ''}`}
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
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
      {showVoteDialog && selectedContestant && selectedContest && (
        <div className="fixed inset-0 bg-black/20 overflow-auto z-40 flex items-center justify-center p-4">
          <div className="bg-[#2A2A2A] rounded-xl h-fit max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#FFD700]">Vote for {selectedContestant.name}</h2>
              <button
                onClick={() => {
                  setShowVoteDialog(false);
                  setVoteAmount(1);
                  setVoteAmountError('');
                }}
                className="text-gray-400 hover:text-[#FFD700] cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>

            <ContestantDetails
              contestant={selectedContestant}
              contest={selectedContest}
              showVoteInfo={false}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Number of Votes (₦100 per vote)
              </label>
              <input
                type="number"
                min="1"
                value={voteAmount}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1) {
                    setVoteAmount(value);
                    setVoteAmountError('');
                  } else {
                    setVoteAmount(1);
                  }
                }}
                className="w-full p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] cursor-text"
              />
              {voteAmountError && (
                <p className="text-red-500 text-sm mt-1">{voteAmountError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300 mt-4">
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

            <div className="mt-6 bg-[#333333] p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Votes:</span>
                <span className="text-white">{voteAmount}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-300">Total Amount:</span>
                <span className="text-[#FFD700]">₦{(voteAmount * 100).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowVoteDialog(false);
                  setVoteAmount(1);
                  setVoteAmountError('');
                }}
                className="px-4 py-2 border border-gray-600 rounded-full hover:bg-[#3A3A3A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVotePayment}
                className="px-4 py-2 bg-[#FFD700] text-[#1A1A1A] rounded-full hover:bg-[#E6C200] transition-transform transform hover:scale-105 cursor-pointer"
              >
                Pay ₦{(voteAmount * 100).toLocaleString()}
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