// Reusable modal dialog component
import React, { useEffect } from "react";
import "./Modal.css";

/**
 * @param {boolean} isOpen 
 * @param {function} onClose 
 * @param {string} title
 * @param {string} size - 'normal' | 'wide'
 * @param {string} variant - 'primary' | 'warning' | 'danger'
 * @param {boolean} centerContent
 * @param {ReactNode} children 
 * @param {ReactNode} footer
 */
export default function Modal({ 
    isOpen, 
    onClose, 
    title, 
    size = "normal", 
    variant = "primary", 
    centerContent = false,
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
                className={`modal-card modal-card--${size}`} 
                onClick={handleCardClick}
                role="dialog" 
                aria-modal="true"
            >
                {/* Header */}
                <div className={`modal-header modal-header--${variant}`}>
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
                    </button>
                </div>

                {/* Body */}
                <div className={`modal-body ${centerContent ? "modal-body--center" : ""}`}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}