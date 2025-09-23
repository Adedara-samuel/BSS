/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { FiHome, FiMusic, FiFilm, FiMic, FiSmile, FiUser, FiSearch, FiChevronRight, FiX, FiCalendar, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiLogIn, FiPlayCircle, FiAward, FiLogOut, FiMail, FiPhone, FiInfo, FiMenu, FiDollarSign, FiUsers, FiBarChart2, FiCreditCard, FiEyeOff, FiEye, FiChevronLeft, FiUpload, FiPauseCircle } from 'react-icons/fi';
import { initializeApp } from 'firebase/app';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import * as Toast from '@radix-ui/react-toast';
import emailjs from '@emailjs/browser';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
const db = getFirestore(app);

// Image upload function using /api/upload (secure server-side upload)
const uploadImage = async (file: File, folder: string = 'contestant') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Image upload failed');
  }

  const data = await res.json();
  return data.url;
};

const AddContestantForm = ({
  contest,
  onAddContestant
}: {
  contest: Contest,
  onAddContestant: (contestant: Omit<Contestant, 'id' | 'votes' | 'amountGained' | 'comments'>, imageFile: File | null) => void
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

    if (newContestant.name && (imagePreview || newContestant.image)) {
      onAddContestant(newContestant, imageFile);
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
                <img
                  src={imagePreview}
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
  isActive?: boolean;
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
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
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
  const [contests, setContests] = useState<Contest[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean, message: string } | null>(null);
  const [newContestant, setNewContestant] = useState({
    name: '',
    bio: '',
    image: '',
    isActive: true
  });
  const [contestantImageFile, setContestantImageFile] = useState<File | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    image: '',
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
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

  // Fetch real data from Firestore in real-time
  useEffect(() => {
    // Fetch contests
    const unsubscribeContests = onSnapshot(collection(db, 'contests'), (snapshot) => {
      const contestsData = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          contestants: data.contestants || [],
        } as Contest;
      });
      setContests(contestsData);
    });

    // Fetch events
    const unsubscribeEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as Event));
      setEvents(eventsData);
    });

    return () => {
      unsubscribeContests();
      unsubscribeEvents();
    };
  }, []);

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'events', 'contests', 'contact'];
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
        onSuccess: async (reference: any) => {
          // Update in DB
          const contestRef = doc(db, 'contests', selectedContest.id);
          const updatedContestants = selectedContest.contestants.map(c => {
            if (c.id === selectedContestant.id) {
              return {
                ...c,
                votes: c.votes + voteAmount,
                amountGained: c.amountGained + (voteAmount * 100)
              };
            }
            return c;
          });

          await updateDoc(contestRef, { contestants: updatedContestants });

          // Add comment if provided
          if (commentText.trim()) {
            const newComment: Comment = {
              id: Date.now().toString(),
              text: commentText,
              createdAt: new Date()
            };

            const updatedContestantsWithComment = updatedContestants.map(c => {
              if (c.id === selectedContestant.id) {
                return {
                  ...c,
                  comments: [...c.comments, newComment]
                };
              }
              return c;
            });

            await updateDoc(contestRef, { contestants: updatedContestantsWithComment });
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

  const addEvent = async () => {
    let imageUrl = newEvent.image;
    if (eventImageFile) {
      try {
        imageUrl = await uploadImage(eventImageFile, 'events');
      } catch (error) {
        showToast('Error', 'Failed to upload image', 'error');
        return;
      }
    }

    if (newEvent.title && newEvent.date && imageUrl) {
      try {
        await addDoc(collection(db, 'events'), {
          title: newEvent.title,
          date: newEvent.date,
          location: newEvent.location,
          image: imageUrl,
        });
        setNewEvent({
          title: '',
          date: '',
          location: '',
          image: '',
        });
        setEventImageFile(null);
        showToast('Success', 'Event added successfully');
      } catch (error) {
        showToast('Error', 'Failed to add event', 'error');
      }
    } else {
      showToast('Error', 'Please fill all required fields', 'error');
    }
  };

  const updateEvent = async () => {
    if (editingEvent) {
      let imageUrl = editingEvent.image;
      if (eventImageFile) {
        try {
          imageUrl = await uploadImage(eventImageFile, 'events');
        } catch (error) {
          showToast('Error', 'Failed to upload image', 'error');
          return;
        }
      }

      try {
        await updateDoc(doc(db, 'events', editingEvent.id), {
          title: editingEvent.title,
          date: editingEvent.date,
          location: editingEvent.location,
          image: imageUrl,
        });
        setEditingEvent(null);
        setEventImageFile(null);
        showToast('Success', 'Event updated successfully');
      } catch (error) {
        showToast('Error', 'Failed to update event', 'error');
      }
    }
  };

  const deleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
        showToast('Success', 'Event deleted successfully');
      } catch (error) {
        showToast('Error', 'Failed to delete event', 'error');
      }
    }
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
              <img
                src={contestant.image}
                alt={contestant.name}
                className="w-full h-full object-cover"
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

  // Contest View Modal
  const handleAddContestant = async (contestant: Omit<Contestant, 'id' | 'votes' | 'amountGained' | 'comments'>, imageFile: File | null) => {
    if (!viewingContest) return;

    let imageUrl = contestant.image;
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile, 'contestant');
      } catch (error) {
        showToast('Error', 'Failed to upload image', 'error');
        return;
      }
    }

    const newId = doc(collection(db, 'contests')).id;
    const newContestantData = {
      ...contestant,
      id: newId,
      image: imageUrl,
      votes: 0,
      amountGained: 0,
      comments: []
    };

    try {
      await updateDoc(doc(db, 'contests', viewingContest.id), {
        contestants: arrayUnion(newContestantData)
      });
      setShowAddContestant(false);
      showToast('Success', 'Contestant added successfully');
    } catch (error) {
      showToast('Error', 'Failed to add contestant', 'error');
    }
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

          <h2 className="text-2xl font-bold text-white mb-6">Contestants ({viewingContest.contestants.filter(c => c.isActive).length})</h2>

          {viewingContest.contestants.filter(c => c.isActive).length === 0 ? (
            <div className="bg-[#1A1A1A] rounded-xl p-8 text-center shadow-lg">
              <h3 className="text-2xl font-bold text-[#FFD700] mb-2">Coming Soon</h3>
              <p className="text-gray-300">No contestants available yet. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {viewingContest.contestants.filter(c => c.isActive).map(contestant => (
                <div key={contestant.id} className="bg-[#2A2A2A] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={contestant.image}
                      alt={contestant.name}
                      className="w-full h-full object-cover"
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

                    {/* Vote Dialog - shown inline when active */}
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
          )}
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
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section - Updated with new content */}
        <section id="home" className="relative min-h-[80vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
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
                BSS Entertainment Industry
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Dominating the Entertainment World
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

        {/* About Section - Updated with new content */}
        <section id="about" className="py-16 bg-[#2A2A2A]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#FFD700]">
              Our Story
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <div className="rounded-xl overflow-hidden shadow-2xl cursor-pointer">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="About BSS Entertainment"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                </div>
              </div>

              <div className="md:w-1/2">
                <p className="text-gray-300 mb-6">
                  BSS Entertainment Industry started as a group of passionate students with a shared love for creativity and performance.
                  Which began on the 12th of March, 2024 with small ideas that has grown into a thriving platform for Movies, Comedy,
                  Dance, Music, Events and all things entertainment.
                </p>
                <p className="text-gray-300 mb-6">
                  We exist to discover, showcase, and celebrate young talents, giving students a voice and a stage to shine.
                  From viral skits to live shows and campus contests, BSS is where raw talent meets real opportunity.
                </p>
                <p className="text-gray-300 mb-6 font-bold">
                  We're more than a group, we're a movement. And this is just the beginning.
                </p>
                <p className="text-[#FFD700] text-xl font-bold">
                  BSS: Dominating the Entertainment World
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-[#1A1A1A] p-4 rounded-lg cursor-pointer hover:bg-[#FFD700]/10 transition-colors">
                    <h4 className="text-[#FFD700] font-bold mb-2">Founded</h4>
                    <p className="text-gray-300 text-sm">March 12, 2024</p>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg cursor-pointer hover:bg-[#FFD700]/10 transition-colors">
                    <h4 className="text-[#FFD700] font-bold mb-2">Focus Areas</h4>
                    <p className="text-gray-300 text-sm">Movies, Comedy, Music, Events</p>
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

            {events.length === 0 ? (
              <div className="bg-[#1A1A1A] rounded-xl p-8 text-center shadow-lg">
                <h3 className="text-2xl font-bold text-[#FFD700] mb-2">Coming Soon</h3>
                <p className="text-gray-300">No upcoming events available yet. Check back later!</p>
              </div>
            ) : (
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
            )}
          </div>
        </section>

        {/* Contests Section - Only show active contests */}
        <section id="contests" className="py-16 bg-[#2A2A2A]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#FFD700]">
              Ongoing Contests
            </h2>

            {contests.filter(c => c.isActive).length === 0 ? (
              <div className="bg-[#1A1A1A] rounded-xl p-8 text-center shadow-lg">
                <h3 className="text-2xl font-bold text-[#FFD700] mb-2">Coming Soon</h3>
                <p className="text-gray-300">No ongoing contests available yet. Check back later!</p>
              </div>
            ) : (
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
            )}
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
                    <Alert variant={sendStatus.success ? "default" : "destructive"}>
                      <AlertTitle>{sendStatus.success ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{sendStatus.message}</AlertDescription>
                    </Alert>
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