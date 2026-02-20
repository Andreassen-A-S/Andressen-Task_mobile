"use client";

import { useState } from "react";
import type { TaskAssignment } from "@/types/assignment";
import { getInitials, getAvatarColor } from "@/helpers/helpers";

interface TaskAssignedUsersProps {
    assignments: TaskAssignment[];
    loading?: boolean;
    className?: string;
}

export default function TaskAssignedUsers({ assignments, loading = false, className = "" }: TaskAssignedUsersProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    if (loading) {
        return (
            <div className={`flex items-center ${className}`}>
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    if (assignments.length === 0) {
        return (
            <span className={`body-xs text-[#9DA1B4] ${className}`}>
                Ikke tildelt
            </span>
        );
    }

    const maxVisible = 3;
    const visibleAssignments = assignments.slice(0, maxVisible);
    const remainingCount = assignments.length - maxVisible;

    return (
        <div
            className={`flex items-center relative cursor-pointer ${className}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* User avatars */}
            <div className="flex -space-x-1.75">
                {visibleAssignments.map((assignment, index) => (
                    <div
                        key={assignment.assignment_id}
                        className={`
                            w-8 h-8 rounded-lg flex items-center justify-center initials-md
                            border-2 border-white relative
                            ${getAvatarColor(assignment.user.name)}
                        `}
                        style={{ zIndex: visibleAssignments.length - index }}
                    >
                        {getInitials(assignment.user.name)}
                    </div>
                ))}

                {/* Show remaining count if more than maxVisible */}
                {remainingCount > 0 && (
                    <div
                        className="w-8 h-8 rounded-lg bg-[#A8AABB] flex items-center justify-center initials-lg border-2 border-white relative"
                        style={{ zIndex: 0 }}
                    >
                        +{remainingCount}
                    </div>
                )}
            </div>

            {/* Tooltip */}
            {showTooltip && assignments.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 z-50 bg-white text-[#1B1D22] rounded-lg p-3 min-w-max border border-[#E8E6E1] animate-fade-in">
                    <div className="space-y-1">
                        {assignments.map((assignment) => (
                            <div key={assignment.assignment_id} className="flex items-center space-x-2">
                                <div
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center initials-md ${getAvatarColor(assignment.user.name)}`}
                                >
                                    {getInitials(assignment.user.name)}
                                </div>
                                <div>
                                    <div className="font-medium h5">{assignment.user.name}</div>
                                    <div className="body-xs text-[#6B7084]">{assignment.user.position}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}