import React, { useState, useEffect } from 'react';
import ImageItem from './ImageItem';
import Pagination from './Pagination';
import Modal from './Modal';

function ImageGallery() {
    const [images, setImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [likes, setLikes] = useState({});
    const [dislikes, setDislikes] = useState({});
    const [userVotes, setUserVotes] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [showFilters, setShowFilters] = useState(false); // Управление видимостью меню
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        theme: '',
        upload_date: new Date().toISOString().slice(0, 10) // текущая дата
    });


    useEffect(() => {
        async function fetchImages() {
            const response = await fetch('http://localhost:5000/api/images');
            const data = await response.json();
            setImages(data);

            const likesData = {};
            const dislikesData = {};
            const userVotesData = {};

            data.forEach((image) => {
                likesData[image.id] = image.likes || 0;
                dislikesData[image.id] = image.dislikes || 0;
                userVotesData[image.id] = { liked: false, disliked: false };
            });

            setLikes(likesData);
            setDislikes(dislikesData);
            setUserVotes(userVotesData);
        }
        fetchImages();
    }, []);


    const handleThemeChange = (theme) => {
        setSelectedThemes((prevThemes) =>
            prevThemes.includes(theme)
                ? prevThemes.filter((t) => t !== theme)
                : [...prevThemes, theme]
        );
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange((prevRange) => ({
            ...prevRange,
            [name]: value,
        }));
    };

    const handleResetFilters = () => {
        setSelectedThemes([]);
        setDateRange({ start: '', end: '' });
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };



    const filteredImages = images.filter((image) => {
        const imageDate = new Date(image.upload_date);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        const isThemeMatch =
            selectedThemes.length === 0 || selectedThemes.includes(image.theme);

        const isDateMatch =
            (!startDate || imageDate >= startDate) &&
            (!endDate || imageDate <= endDate);

        return isThemeMatch && isDateMatch;
    });

    const handleLike = async (id) => {
        if (userVotes[id]?.liked) return; // Prevent multiple likes

        if (userVotes[id]?.disliked) {
            // If the user previously disliked the image, decrement dislike
            await fetch(`http://localhost:5000/api/images/${id}/dislike`, { method: 'PUT' });
            setDislikes((prevDislikes) => ({
                ...prevDislikes,
                [id]: (prevDislikes[id] || 0) - 1,
            }));
        }

        // Update backend to register like
        await fetch(`http://localhost:5000/api/images/${id}/like`, { method: 'PUT' });
        setLikes((prevLikes) => ({
            ...prevLikes,
            [id]: (prevLikes[id] || 0) + 1,
        }));

        setUserVotes((prevVotes) => ({
            ...prevVotes,
            [id]: { liked: true, disliked: false },
        }));

        // Update backend with the user's liked image
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/user/like-image`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ imageId: id }),
        });
    };

    const handleDislike = async (id) => {
        if (userVotes[id]?.disliked) return; // Prevent multiple dislikes

        if (userVotes[id]?.liked) {
            // If the user previously liked the image, decrement like
            await fetch(`http://localhost:5000/api/images/${id}/like`, { method: 'PUT' });
            setLikes((prevLikes) => ({
                ...prevLikes,
                [id]: (prevLikes[id] || 0) - 1,
            }));
        }

        // Update backend to register dislike
        await fetch(`http://localhost:5000/api/images/${id}/dislike`, { method: 'PUT' });
        setDislikes((prevDislikes) => ({
            ...prevDislikes,
            [id]: (prevDislikes[id] || 0) + 1,
        }));

        setUserVotes((prevVotes) => ({
            ...prevVotes,
            [id]: { liked: false, disliked: true },
        }));

        // Update backend with the user's disliked image
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/user/dislike-image`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ imageId: id }),
        });
    };

    const openModal = (image) => {
        setSelectedImage(image);
    };

    // Закрыть модальное окно
    const closeModal = () => {
        setSelectedImage(null);
    };

    const imagesPerPage = 20;
    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

    return (
        <div>
            <h1>Gallery</h1>

            <div className="filter-container">

                <button className="toggle-filters" onClick={toggleFilters}>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                {showFilters && (
                    <div className="filter-menu">
                        <div className="theme-filter">
                            <label>Filter by Themes:</label>
                            <div>
                                {['Nature', 'Architecture', 'Animals'].map((theme) => (
                                    <label key={theme}>
                                        <input
                                            type="checkbox"
                                            value={theme}
                                            checked={selectedThemes.includes(theme)}
                                            onChange={() => handleThemeChange(theme)}
                                        />
                                        {theme}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="date-filter">
                            <label>Filter by Date:</label>
                            <div>
                                <input
                                    type="date"
                                    name="start"
                                    value={dateRange.start}
                                    onChange={handleDateChange}
                                />
                                <span>to</span>
                                <input
                                    type="date"
                                    name="end"
                                    value={dateRange.end}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>
                        <button onClick={handleResetFilters} className="reset-filters">
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            <div className="gallery">
                {filteredImages.slice(indexOfFirstImage, indexOfLastImage).map((image) => (
                    <ImageItem
                        key={image.id}
                        image={image}
                        likes={likes[image.id] || 0}
                        dislikes={dislikes[image.id] || 0}
                        onLike={() => handleLike(image.id)}
                        onDislike={() => handleDislike(image.id)}
                        disabledLike={userVotes[image.id]?.liked}
                        disabledDislike={userVotes[image.id]?.disliked}
                        onClick={() => openModal(image)}
                    />
                ))}
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            <Modal
                image={selectedImage}
                onClose={closeModal}
                likes={likes[selectedImage?.id] || 0}
                dislikes={dislikes[selectedImage?.id] || 0}
                onLike={() => handleLike(selectedImage?.id)}
                onDislike={() => handleDislike(selectedImage?.id)}
            />

        </div>
    );
}

export default ImageGallery;
