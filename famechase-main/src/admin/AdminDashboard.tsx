import React, { useState } from 'react';
import { supabase } from '../backend/supabaseClient';

const AdminDashboard = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError('Login failed: ' + error.message);
        } else {
            setLoggedIn(true);
        }
    };

    if (!loggedIn) {
        return (
            <form onSubmit={handleLogin} style={{ maxWidth: 300, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2>Admin Login</h2>
                <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
                {error && <div style={{ color: 'red' }}>{error}</div>}
            </form>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: '2rem auto' }}>
            <h1>Admin Dashboard</h1>
            {/* Add dashboard features here */}
        </div>
    );
};

export default AdminDashboard;