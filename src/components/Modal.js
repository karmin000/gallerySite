// src/components/Modal.js
import React from 'react';
import './Modal.css'; // Добавим стили для модального окна
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';


function Modal({ image, onClose, likes, dislikes, onLike, onDislike }) {
    if (!image) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                <img src={image.url} alt={image.title} className="modal-image"/>
                <h3>{image.title}</h3>
                <p>Uploaded by: {image.user}</p>
                <p>Upload Date: {image.uploadDate}</p>
                <button onClick={(e) => {
                    e.stopPropagation();
                    onLike();
                }}><FaThumbsUp />
                </button>
                <span>Нравится: {likes} Не нравится {dislikes}</span> {/* Показываем количество лайков */}
                <button onClick={(e) => {
                    e.stopPropagation();
                    onDislike();
                }}><FaThumbsDown />
                </button>


            </div>
        </div>
    );
}

export default Modal;
