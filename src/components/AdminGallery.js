import React, { useEffect, useState } from 'react';

function AdminGallery() {
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // Get the token from localStorage
                const token = localStorage.getItem('adminToken');

                // Make the API call with the Authorization header using fetch
                const response = await fetch('/api/admin/images', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch images');
                }

                const data = await response.json();

                // Set the images in the state
                setImages(data);
            } catch (err) {
                setError('Failed to fetch images. Please check your admin credentials.');
                console.error(err);
            }
        };

        fetchImages();
    }, []);

    const updateVisibility = async (id, hidden) => {
        try {
            console.log('Update visibility for image ID:', id, 'Hidden:', hidden);  // Логируем данные
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/admin/images/${id}/hide`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ hidden }),
            });

            if (!response.ok) {
                throw new Error('Failed to update image visibility');
            }

            setImages(images.map(img => (img.id === id ? { ...img, hidden } : img)));
        } catch (err) {
            setError('Failed to update image visibility. Please try again.');
            console.error(err);  // Логируем ошибку
        }
    };

    return (
        <div>
            <h1>Admin Gallery</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table>
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Theme</th>
                    <th>Hidden</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {images.map(img => (
                    <tr key={img.id}>
                        <td>{img.title}</td>
                        <td>{img.theme}</td>
                        <td>{img.hidden ? 'Yes' : 'No'}</td>
                        <td>
                            {img.hidden ? (
                                <button onClick={() => updateVisibility(img.id, false)}>Unhide</button>
                            ) : (
                                <button onClick={() => updateVisibility(img.id, true)}>Hide</button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminGallery;
