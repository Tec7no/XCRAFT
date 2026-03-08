/**
 * isEditorPreview - Strict editor mode detection
 * 
 * Returns true ONLY if:
 * 1. Current route is /editor-preview
 * 2. User role is admin OR editor
 * 
 * NO editor overlay should render unless this returns true.
 */

import { getStorageItem } from "@/utils/storage";

export function isEditorPreview(): boolean {
    if (typeof window === 'undefined') return false;

    // Check route
    const isEditorRoute = window.location.pathname === '/editor-preview';
    if (!isEditorRoute) return false;

    // Check user role
    const user = getStorageItem<{ role?: string } | null>('user', null);
    const allowedRoles = ['admin', 'editor', 'manager'];
    const hasPermission = Boolean(user && user.role && allowedRoles.includes(user.role));

    return hasPermission;
}

export function canPublish(): boolean {
    if (typeof window === 'undefined') return false;

    const user = getStorageItem<{ role?: string } | null>('user', null);
    return Boolean(user && user.role === 'admin');
}
