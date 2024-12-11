// src/components/ImageItem.js
import React from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

function ImageItem({ image, likes, dislikes, onLike, onDislike, onClick }) {
    return (
        <div className="image-item" onClick={onClick}>
            <img src={image.url} alt={image.title} />
            <h3>{image.title}</h3>
            <div>
                <button onClick={(e) => { e.stopPropagation(); onLike(); }}><FaThumbsUp /></button>
                <span>Нравится: {likes} Не нравится {dislikes}</span> {/* Показываем количество лайков */}
                <button onClick={(e) => { e.stopPropagation(); onDislike(); }}><FaThumbsDown /></button>
            </div>
        </div>
    );
}

export default ImageItem;
