import React from "react";

interface CloseButtonProps {
    onClick: () => void;
    className?: string;
    ariaLabel?: string;
}

export default function CloseButton({
    onClick,
    className = "text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg w-9 h-9  transition-all",
    ariaLabel = "Luk",
}: CloseButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            aria-label={ariaLabel}
        >
            <span className="text-2xl">×</span>
        </button>
    );
}