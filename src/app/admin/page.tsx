/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { FiAward, FiUsers, FiPlayCircle, FiCreditCard, FiPlus, FiEdit2, FiTrash2, FiPauseCircle, FiLogOut, FiX, FiCalendar, FiMapPin } from 'react-icons/fi';
import * as Toast from '@radix-ui/react-toast';
import { db, collection, doc, updateDoc } from '@/lib/firebase';
import { onSnapshot } from 'firebase/firestore';
import { uploadImage } from '@/lib/cloudinary';
import { addContest, updateContest, deleteContest, addContestant as serviceAddContestant, updateContestant as serviceUpdateContestant, deleteContestant as serviceDeleteContestant } from '@/services/firebase/contests';
import { addEvent as serviceAddEvent, updateEvent as serviceUpdateEvent, deleteEvent as serviceDeleteEvent, subscribeToEvents } from '@/services/event';
import { Contest, Contestant, Event, AppComment } from '@/types';

function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [contests, setContests] = useState<Contest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
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
    isActive: true
  });
  const [contestantImageFile, setContestantImageFile] = useState<File | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    image: '',
    isActive: true,
    tickets: [
      { type: 'regular', price: 0, available: 0 },
      { type: 'vip', price: 0, available: 0 }
    ]
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [showContestForm, setShowContestForm] = useState(false);
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [toasts, setToasts] = useState<{ id: string; title: string; description: string; type: 'success' | 'error' }[]>([]);

  // Toast functions
  const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

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
    }, (error) => {
      console.error('Error fetching contests:', error);
      showToast('Error', 'Failed to load contests', 'error');
    });

    // Fetch events
    const unsubscribeEvents = subscribeToEvents(setEvents);

    return () => {
      unsubscribeContests();
      unsubscribeEvents();
    };
  }, []);

  const addContestHandler = async () => {
    if (!newContest.title || !newContest.category) {
      showToast('Error', 'Title and category are required', 'error');
      return;
    }
    try {
      await addContest(newContest);
      setNewContest({
        title: '',
        description: '',
        category: '',
        isActive: true
      });
      setShowContestForm(false);
      showToast('Success', 'Contest added successfully');
    } catch (error: any) {
      console.error('Add contest error:', error);
      showToast('Error', `Failed to add contest: ${error.message}`, 'error');
    }
  };

  const updateContestHandler = async () => {
    if (editingContest) {
      if (!editingContest.title || !editingContest.category) {
        showToast('Error', 'Title and category are required', 'error');
        return;
      }
      try {
        await updateContest(editingContest.id, {
          title: editingContest.title,
          description: editingContest.description,
          category: editingContest.category,
          isActive: editingContest.isActive,
        });
        setEditingContest(null);
        showToast('Success', 'Contest updated successfully');
      } catch (error: any) {
        console.error('Update contest error:', error);
        showToast('Error', `Failed to update contest: ${error.message}`, 'error');
      }
    }
  };

  const deleteContestHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contest?')) {
      try {
        await deleteContest(id);
        showToast('Success', 'Contest deleted successfully');
      } catch (error: any) {
        console.error('Delete contest error:', error);
        showToast('Error', `Failed to delete contest: ${error.message}`, 'error');
      }
    }
  };

  const addContestantHandler = async () => {
    if (newContestant.name && selectedContest) {
      let imageUrl = '';
      if (contestantImageFile) {
        try {
          console.log('Uploading file:', contestantImageFile.name, contestantImageFile.type, contestantImageFile.size);
          imageUrl = await uploadImage(contestantImageFile);
        } catch (error: any) {
          console.error('Image upload error:', error);
          showToast('Error', `Failed to upload image: ${error.message}`, 'error');
          return;
        }
      } else {
        showToast('Error', 'Image is required', 'error');
        return;
      }

      const newId = doc(collection(db, 'contests')).id;
      const newContestantData: Contestant = {
        id: newId,
        name: newContestant.name,
        bio: newContestant.bio,
        image: imageUrl,
        votes: 0,
        amountGained: 0,
        comments: [],
        isActive: newContestant.isActive
      };

      try {
        await serviceAddContestant(selectedContest.id, newContestantData);
        setNewContestant({
          name: '',
          bio: '',
          image: '',
          isActive: true
        });
        setContestantImageFile(null);
        showToast('Success', 'Contestant added successfully');
      } catch (error: any) {
        console.error('Add contestant error:', error);
        showToast('Error', `Failed to add contestant: ${error.message}`, 'error');
      }
    } else {
      showToast('Error', 'Please fill all required fields', 'error');
    }
  };

  const updateContestantHandler = async () => {
    if (editingContestant && selectedContest) {
      let imageUrl = editingContestant.image;
      if (contestantImageFile) {
        try {
          console.log('Uploading file:', contestantImageFile.name, contestantImageFile.type, contestantImageFile.size);
          imageUrl = await uploadImage(contestantImageFile);
        } catch (error: any) {
          console.error('Image upload error:', error);
          showToast('Error', `Failed to upload image: ${error.message}`, 'error');
          return;
        }
      }

      const updatedContestantData: Contestant = {
        ...editingContestant,
        image: imageUrl
      };

      try {
        await serviceUpdateContestant(selectedContest.id, updatedContestantData);
        setEditingContestant(null);
        setContestantImageFile(null);
        showToast('Success', 'Contestant updated successfully');
      } catch (error: any) {
        console.error('Update contestant error:', error);
        showToast('Error', `Failed to update contestant: ${error.message}`, 'error');
      }
    }
  };

  const deleteContestantHandler = async (id: string) => {
    if (!selectedContest) return;

    const contestant = selectedContest.contestants.find(c => c.id === id);
    if (contestant && window.confirm(`Are you sure you want to delete "${contestant.name}"?`)) {
      try {
        await serviceDeleteContestant(selectedContest.id, contestant);
        showToast('Success', 'Contestant deleted successfully');
      } catch (error: any) {
        console.error('Delete contestant error:', error);
        showToast('Error', `Failed to delete contestant: ${error.message}`, 'error');
      }
    }
  };

  const addEventHandler = async () => {
    if (!newEvent.title || !newEvent.date) {
      showToast('Error', 'Title and date are required', 'error');
      return;
    }
    let imageUrl = '';
    if (eventImageFile) {
      try {
        console.log('Uploading file:', eventImageFile.name, eventImageFile.type, eventImageFile.size);
        imageUrl = await uploadImage(eventImageFile);
      } catch (error: any) {
        console.error('Image upload error:', error);
        showToast('Error', `Failed to upload image: ${error.message}`, 'error');
        return;
      }
    } else {
      showToast('Error', 'Image is required', 'error');
      return;
    }

    const eventData: Omit<Event, 'id'> = {
      title: newEvent.title,
      date: newEvent.date,
      location: newEvent.location,
      image: imageUrl,
      isActive: newEvent.isActive,
      tickets: newEvent.tickets
    };
    try {
      await serviceAddEvent(eventData);
      setNewEvent({
        title: '',
        date: '',
        location: '',
        image: '',
        isActive: true,
        tickets: [
          { type: 'regular', price: 0, available: 0 },
          { type: 'vip', price: 0, available: 0 }
        ]
      });
      setEventImageFile(null);
      showToast('Success', 'Event added successfully');
    } catch (error: any) {
      console.error('Add event error:', error);
      showToast('Error', `Failed to add event: ${error.message}`, 'error');
    }
  };

  const updateEventHandler = async () => {
    if (editingEvent) {
      if (!editingEvent.title || !editingEvent.date) {
        showToast('Error', 'Title and date are required', 'error');
        return;
      }
      let imageUrl = editingEvent.image;
      if (eventImageFile) {
        try {
          console.log('Uploading file:', eventImageFile.name, eventImageFile.type, eventImageFile.size);
          imageUrl = await uploadImage(eventImageFile);
        } catch (error: any) {
          console.error('Image upload error:', error);
          showToast('Error', `Failed to upload image: ${error.message}`, 'error');
          return;
        }
      }
      try {
        await serviceUpdateEvent(editingEvent.id, {
          title: editingEvent.title,
          date: editingEvent.date,
          location: editingEvent.location,
          image: imageUrl,
          isActive: editingEvent.isActive,
          tickets: editingEvent.tickets
        });
        setEditingEvent(null);
        setEventImageFile(null);
        showToast('Success', 'Event updated successfully');
      } catch (error: any) {
        console.error('Update event error:', error);
        showToast('Error', `Failed to update event: ${error.message}`, 'error');
      }
    }
  };

  const deleteEventHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await serviceDeleteEvent(id);
        showToast('Success', 'Event deleted successfully');
      } catch (error: any) {
        console.error('Delete event error:', error);
        showToast('Error', `Failed to delete event: ${error.message}`, 'error');
      }
    }
  };

  const toggleContestStatus = async (contestId: string) => {
    const contest = contests.find(c => c.id === contestId);
    if (contest && window.confirm(`Are you sure you want to ${contest.isActive ? 'deactivate' : 'activate'} this contest?`)) {
      try {
        const updatedContest = { ...contest, isActive: !contest.isActive };
        if (!updatedContest.isActive) {
          updatedContest.contestants = updatedContest.contestants.map((c) => ({ ...c, isActive: false }));
        }
        await updateDoc(doc(db, 'contests', contestId), updatedContest);
        showToast('Success', `Contest ${updatedContest.isActive ? 'activated' : 'deactivated'} successfully`);
      } catch (error: any) {
        console.error('Toggle contest status error:', error);
        showToast('Error', `Failed to toggle contest status: ${error.message}`, 'error');
      }
    }
  };

  const toggleContestantStatus = async (contestantId: string) => {
    if (!selectedContest) return;

    const contestant = selectedContest.contestants.find(c => c.id === contestantId);
    if (contestant && selectedContest.isActive) {
      const updated = { ...contestant, isActive: !contestant.isActive };
      try {
        await serviceUpdateContestant(selectedContest.id, updated);
        showToast('Success', 'Contestant status toggled successfully');
      } catch (error: any) {
        console.error('Toggle contestant status error:', error);
        showToast('Error', `Failed to toggle contestant status: ${error.message}`, 'error');
      }
    } else if (!selectedContest.isActive) {
      showToast('Error', 'Cannot toggle contestant status for an inactive contest', 'error');
    }
  };

  const toggleEventStatus = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event && window.confirm(`Are you sure you want to ${event.isActive ? 'deactivate' : 'activate'} this event?`)) {
      try {
        await updateDoc(doc(db, 'events', eventId), { isActive: !event.isActive });
        showToast('Success', `Event ${!event.isActive ? 'activated' : 'deactivated'} successfully`);
      } catch (error: any) {
        console.error('Toggle event status error:', error);
        showToast('Error', `Failed to toggle event status: ${error.message}`, 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-100">
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

          <div className="bg-[#2A2A2A] p-4 sm:p-6 rounded-lg shadow-sm border border-[#333333]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Active Contests</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-[#7C3AED]">
                  {contests.filter(c => c.isActive).length}
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-[#7C3AED]/10 rounded-lg">
                <FiPlayCircle className="text-[#7C3AED] text-lg sm:text-xl" />
              </div>
            </div>
          </div>

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
          <div className="p-4 sm:p-6 border-b border-[#333333] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#FFD700]">
              Contests Management
            </h2>
            <button
              onClick={() => {
                setEditingContest(null);
                setShowContestForm(true);
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
                    required
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
                    required
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
                  onClick={editingContest ? updateContestHandler : addContestHandler}
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
                    onClick={() => setSelectedContest(contest)}
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
                      <span className={`px-2 py-1 text-xs rounded-full ${contest.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
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
                          className={`${contest.isActive ? 'text-yellow-500 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'}`}
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
                            deleteContestHandler(contest.id);
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
                        isActive: true
                      });
                    }}
                    className="text-gray-400 hover:text-[#FFD700] p-1 rounded-full"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="p-4 sm:p-6">
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
                        <p className="text-sm text-gray-400">Active Contestants</p>
                        <p className="text-white">
                          {selectedContest.contestants.filter(c => c.isActive).length}
                        </p>
                      </div>
                    </div>
                  </div>

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
                                  setContestantImageFile(file);
                                  const previewUrl = URL.createObjectURL(file);
                                  if (editingContestant) {
                                    setEditingContestant({ ...editingContestant, image: previewUrl });
                                  } else {
                                    setNewContestant({ ...newContestant, image: previewUrl });
                                  }
                                }
                              }}
                              className="hidden"
                              required={!editingContestant}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingContestant ? editingContestant.isActive : newContestant.isActive}
                            onChange={(e) =>
                              editingContestant
                                ? setEditingContestant({ ...editingContestant, isActive: e.target.checked })
                                : setNewContestant({ ...newContestant, isActive: e.target.checked })
                            }
                            className="form-checkbox h-5 w-5 text-[#4F46E5] rounded focus:ring-[#4F46E5]"
                          />
                          <span className="text-gray-400">Active Contestant</span>
                        </label>
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
                          onClick={editingContestant ? updateContestantHandler : addContestantHandler}
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

                  <h3 className="text-xl font-bold text-[#FFD700] mb-4">Contestants ({selectedContest.contestants.length})</h3>

                  {selectedContest.contestants.length === 0 ? (
                    <div className="bg-[#333333] p-8 rounded-lg text-center">
                      <FiUsers className="mx-auto text-gray-500 mb-4 text-3xl" />
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
                                    onClick={() => deleteContestantHandler(contestant.id)}
                                    className="text-red-600 hover:text-red-500"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="bg-[#2A2A2A] p-2 rounded">
                                  <p className="text-sm text-gray-400">Votes</p>
                                  <p className="text-[#FFD700] font-bold">{contestant.votes}</p>
                                </div>
                                <div className="bg-[#2A2A2A] p-2 rounded">
                                  <p className="text-sm text-gray-400">Amount Raised</p>
                                  <p className="text-green-400">₦{contestant.amountGained.toLocaleString()}</p>
                                </div>
                                <div className="bg-[#2A2A2A] p-2 rounded">
                                  <p className="text-sm text-gray-400">Status</p>
                                  <p className={`${contestant.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                                    {contestant.isActive ? 'Active' : 'Inactive'}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex justify-between">
                                <button
                                  onClick={() => toggleContestantStatus(contestant.id)}
                                  className={`px-3 py-1 text-xs rounded-full ${contestant.isActive ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}
                                  disabled={!selectedContest.isActive}
                                >
                                  {contestant.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>

                              {contestant.comments.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="text-sm font-bold text-gray-300 mb-2">Recent Comments ({contestant.comments.length})</h5>
                                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                    {contestant.comments.map((comment: AppComment, index: number) => (
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

        {/* Events Management Section */}
        <div className="bg-[#2A2A2A] rounded-lg shadow-sm border border-[#333333] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#333333] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-400">
              Events Management
            </h2>
          </div>

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
                  className="w-full p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                  required
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
                  className="w-full p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                  required
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
                  className="w-full p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-600">
                  Image
                </label>
                <div className="flex items-center space-x-3">
                  {(editingEvent?.image || newEvent.image) ? (
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                      <img
                        src={editingEvent?.image || newEvent.image}
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
                          setEventImageFile(file);
                          const previewUrl = URL.createObjectURL(file);
                          if (editingEvent) {
                            setEditingEvent({ ...editingEvent, image: previewUrl });
                          } else {
                            setNewEvent({ ...newEvent, image: previewUrl });
                          }
                        }
                      }}
                      className="hidden"
                      required={!editingEvent}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEvent ? editingEvent.isActive : newEvent.isActive}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({ ...editingEvent, isActive: e.target.checked })
                        : setNewEvent({ ...newEvent, isActive: e.target.checked })
                    }
                    className="form-checkbox h-5 w-5 text-[#4F46E5] rounded focus:ring-[#4F46E5]"
                  />
                  <span className="text-gray-400">Active Event</span>
                </label>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-bold text-gray-300 mb-2">Tickets</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-600">
                      Regular Price (₦)
                    </label>
                    <input
                      type="number"
                      value={editingEvent ? editingEvent.tickets[0].price : newEvent.tickets[0].price}
                      onChange={(e) =>
                        editingEvent
                          ? setEditingEvent({
                              ...editingEvent,
                              tickets: editingEvent.tickets.map((t: { type: string; price: number; available: number }, i: number) => i === 0 ? { ...t, price: Number(e.target.value) } : t)
                            })
                          : setNewEvent({
                              ...newEvent,
                              tickets: newEvent.tickets.map((t: { type: string; price: number; available: number }, i: number) => i === 0 ? { ...t, price: Number(e.target.value) } : t)
                            })
                      }
                      className="w-full p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-600">
                      Regular Available
                    </label>
                    <input
                      type="number"
                      value={editingEvent ? editingEvent.tickets[0].available : newEvent.tickets[0].available}
                      onChange={(e) =>
                        editingEvent
                          ? setEditingEvent({
                              ...editingEvent,
                              tickets: editingEvent.tickets.map((t: { type: string; price: number; available: number }, i: number) => i === 0 ? { ...t, available: Number(e.target.value) } : t)
                            })
                          : setNewEvent({
                              ...newEvent,
                              tickets: newEvent.tickets.map((t: { type: string; price: number; available: number }, i: number) => i === 0 ? { ...t, available: Number(e.target.value) } : t)
                            })
                      }
                      className="w-full p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-600">
                      VIP Price (₦)
                    </label>
                    <input
                      type="number"
                      value={editingEvent ? editingEvent.tickets[1].price : newEvent.tickets[1].price}
                      onChange={(e) =>
                        editingEvent
                          ? setEditingEvent({
                              ...editingEvent,
                              tickets: editingEvent.tickets.map((t: { type: string; price: number; available: number }, i: number) => i === 1 ? { ...t, price: Number(e.target.value) } : t)
                            })
                          : setNewEvent({
                              ...newEvent,
                              tickets: newEvent.tickets.map((t: { type: string; price: number; available: number }, i: number) => i === 1 ? { ...t, price: Number(e.target.value) } : t)
                            })
                      }
                      className="w-full p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-600">
                      VIP Available
                    </label>
                    <input
                      type="number"
                      value={editingEvent ? editingEvent.tickets[1].available : newEvent.tickets[1].available}
                      onChange={(e) =>
                        editingEvent
                          ? setEditingEvent({
                              ...editingEvent,
                              tickets: editingEvent.tickets.map((t: { type: string; price: number; available: number }, i: number) => i === 1 ? { ...t, available: Number(e.target.value) } : t)
                            })
                          : setNewEvent({
                              ...newEvent,
                              tickets: newEvent.tickets.map((t: { type: string; price: number; available: number }, i: number) => i === 1 ? { ...t, available: Number(e.target.value) } : t)
                            })
                      }
                      className="w-full p-2 sm:p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-3 sm:mt-4 space-x-2 sm:space-x-3">
              {editingEvent && (
                <button
                  onClick={() => setEditingEvent(null)}
                  className="px-3 sm:px-4 py-1 sm:py-2 border border-[#444444] text-gray-300 rounded-lg hover:bg-[#333333] transition-colors text-xs sm:text-sm"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={editingEvent ? updateEventHandler : addEventHandler}
                className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] hover:opacity-90 text-[#1A1A1A] px-4 sm:px-6 py-1 sm:py-2 rounded-lg transition-colors font-semibold text-xs sm:text-sm"
              >
                {editingEvent ? (
                  <>
                    <FiEdit2 size={14} />
                    <span>Update Event</span>
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
                  <div className="flex items-center text-gray-200 text-xs sm:text-sm mb-1">
                    <FiMapPin className="mr-2 text-indigo-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="text-gray-200 text-xs sm:text-sm mb-3">
                    {event.tickets && event.tickets.length >= 2 ? (
                      <>
                        <p>Regular: ₦{event.tickets[0].price.toLocaleString()} ({event.tickets[0].available} available)</p>
                        <p>VIP: ₦{event.tickets[1].price.toLocaleString()} ({event.tickets[1].available} available)</p>
                      </>
                    ) : (
                      <p>No ticket information available</p>
                    )}
                  </div>
                  <div className="flex items-center text-gray-200 text-xs sm:text-sm mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${event.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </span>
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
                      onClick={() => toggleEventStatus(event.id)}
                      className={`${event.isActive ? 'text-yellow-500 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'}`}
                      title={event.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {event.isActive ? (
                        <FiPauseCircle size={16} />
                      ) : (
                        <FiPlayCircle size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => deleteEventHandler(event.id)}
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

export default AdminPanel;