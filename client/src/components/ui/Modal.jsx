import React, { useEffect } from "react";
import "./Modal.css";

/**
 * @param {boolean} isOpen
 * @param {function} onClose 
 * @param {string} title
 * @param {string} size 
 * @param {string} variant 
 * @param {ReactNode} children
 * @param {ReactNode} footer 
 */
export default function Modal({ 
    isOpen, 
    onClose, 
    title, 
    size = "normal", 
    variant = "primary", 
    children, 
    footer 
}) {
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleCardClick = (e) => e.stopPropagation();

    return (
        <div className="modal-overlay" onClick={onClose} role="presentation">
            <div 
                className={`modal-card modal-card--${size} modal-card--${variant}`} 
                onClick={handleCardClick}
                role="dialog" 
                aria-modal="true"
            >
                <div className={`modal-header modal-header--${variant}`}>
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}