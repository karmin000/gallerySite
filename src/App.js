// src/App.js
import React, { useState } from 'react';
import ImageGallery from './components/ImageGallery';
import AuthForm from './components/AuthForm';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <div className="App">
            {isAuthenticated ? (
                <>
                    <button onClick={handleLogout}>Logout</button>
                    <ImageGallery />
                </>
            ) : (
                <AuthForm onAuthSuccess={handleAuthSuccess} />
            )}
        </div>
    );
}

export default App;
