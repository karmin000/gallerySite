import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleFirst = () => {
        if (currentPage > 1) {
            onPageChange(1);
        }
    }
    const handleLast = () => {
        if (currentPage < totalPages) {
            onPageChange(totalPages);
        }
    }

    return (
        <div className="pagination">
            <button onClick={handleFirst} disabled={currentPage === 1}>
                &#60;&#60;
            </button>
            <button onClick={handlePrev} disabled={currentPage === 1}>
                &#60;
            </button>

            {/* Генерация номеров страниц */}
            {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1; // Номер страницы
                return (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={page === currentPage ? 'active' : ''}
                        disabled={currentPage === page}
                    >
                        {page}
                    </button>
                );
            })}

            <button onClick={handleNext} disabled={currentPage === totalPages}>
                &#62;
            </button>
            <button onClick={handleLast} disabled={currentPage === totalPages}>
                &#62;&#62;
            </button>
        </div>
    );
}

export default Pagination;
