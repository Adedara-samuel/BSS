'use client';

import { useState } from 'react';
// import styles from './admin.module.css';

export default function Admin() {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add contestant logic here (e.g., API call)
        console.log('Adding contestant:', { name, image });
        setMessage('Contestant added successfully!');
        setName('');
        setImage('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white font-sans p-12">
            <h1 className="text-4xl font-bold mb-6">Admin Panel</h1>
            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                <div>
                    <label className="block mb-2">Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-2 bg-indigo-800 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-2">Image URL:</label>
                    <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        required
                        className="w-full p-2 bg-indigo-800 rounded"
                    />
                </div>
                <button
                    type="submit"
                    className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded"
                >
                    Add Contestant
                </button>
            </form>
            {message && <p className="mt-4">{message}</p>}
        </div>
    );
}