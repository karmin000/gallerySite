import React, { useState } from 'react';
import ImageGallery from './components/ImageGallery';
import AuthForm from './components/AuthForm';
import AdminGallery from './components/AdminGallery';

function App() {
    const [userRole, setUserRole] = useState(null); // null, 'user', 'admin'

    const handleAuthSuccess = (role) => {
        setUserRole(role); // Запоминаем роль пользователя
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserRole(null); // Сбрасываем роль при выходе
    };

    return (
        <div className="App">
            {userRole && <button onClick={handleLogout}>Logout</button>}
            {!userRole && (
                <>
                    <AuthForm onAuthSuccess={handleAuthSuccess} />
                </>
            )}
            {userRole === 'user' && <ImageGallery />}
            {userRole === 'admin' && <AdminGallery />}
        </div>
    );
}

export default App;
