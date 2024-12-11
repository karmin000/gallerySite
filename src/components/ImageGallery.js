import React, { useState, useEffect } from 'react';
import ImageItem from './ImageItem';
import Pagination from './Pagination';
import Modal from './Modal';

function ImageGallery() {
    const [images, setImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [likes, setLikes] = useState({});
    const [dislikes, setDislikes] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [showFilters, setShowFilters] = useState(false); // Управление видимостью меню


    useEffect(() => {
        const fetchedImages = [
            { id: 1, url: '/images/1.jpeg', title: 'Image 1', user: 'User 1', uploadDate: '2024-12-01', theme: 'Nature' },
            { id: 2, url: '/images/2.jpeg', title: 'Image 2', user: 'User 2', uploadDate: '2021-12-02', theme: 'Architecture' },
            { id: 3, url: '/images/3.jpeg', title: 'Image 3', user: 'User 3', uploadDate: '2024-12-03', theme: 'Nature' },
            { id: 4, url: '/images/4.jpeg', title: 'Image 4', user: 'User 4', uploadDate: '2022-12-04', theme: 'Animals' },
            { id: 5, url: '/images/5.jpeg', title: 'Image 5', user: 'User 5', uploadDate: '2024-12-05', theme: 'Architecture' },
            { id: 6, url: '/images/4.jpeg', title: 'Image 6', user: 'User 6', uploadDate: '2024-12-06', theme: 'Nature' },
            { id: 8, url: '/images/1.jpeg', title: 'Image 7', user: 'User 8', uploadDate: '2024-12-07', theme: 'Nature' },
            { id: 9, url: '/images/2.jpeg', title: 'Image 8', user: 'User 9', uploadDate: '2024-12-07', theme: 'Animals' },
            { id: 10, url: '/images/3.jpeg', title: 'Image 9', user: 'User 10', uploadDate: '2024-12-07', theme: 'Architecture' },
            { id: 11, url: '/images/4.jpeg', title: 'Image 10', user: 'User 11', uploadDate: '2024-12-07', theme: 'Nature' },
            { id: 12, url: '/images/5.jpeg', title: 'Image 11', user: 'User 12', uploadDate: '2024-12-07', theme: 'Animals' },
            { id: 13, url: '/images/4.jpeg', title: 'Image 12', user: 'User 13', uploadDate: '2024-12-07', theme: 'Animals' },
            { id: 14, url: '/images/1.jpeg', title: 'Image 13', user: 'User 14', uploadDate: '2023-12-07', theme: 'Animals' },
            { id: 15, url: '/images/2.jpeg', title: 'Image 14', user: 'User 15', uploadDate: '2024-12-07', theme: 'Nature' },
            { id: 16, url: '/images/3.jpeg', title: 'Image 15', user: 'User 16', uploadDate: '2024-12-07', theme: 'Animals' },
            { id: 17, url: '/images/4.jpeg', title: 'Image 16', user: 'User 17', uploadDate: '2024-12-07', theme: 'Architecture' },
        ];
        setImages(fetchedImages);
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
        const imageDate = new Date(image.uploadDate);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        const isThemeMatch =
            selectedThemes.length === 0 || selectedThemes.includes(image.theme);

        const isDateMatch =
            (!startDate || imageDate >= startDate) &&
            (!endDate || imageDate <= endDate);

        return isThemeMatch && isDateMatch;
    });

    const handleLike = (id) => {
        setLikes((prevLikes) => ({
            ...prevLikes,
            [id]: (prevLikes[id] || 0) + 1,  // Увеличиваем количество лайков для картинки
        }));
    };

    // Обработчик для "не нравится"
    const handleDislike = (id) => {
        setDislikes((prevDislikes) => ({
            ...prevDislikes,
            [id]: (prevDislikes[id] || 0) + 1,  // Увеличиваем количество дизлайков для картинки
        }));
    };
    const openModal = (image) => {
        setSelectedImage(image);
    };

    // Закрыть модальное окно
    const closeModal = () => {
        setSelectedImage(null);
    };

    const imagesPerPage = 4;
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
