import { User } from '../types';

const USERS_KEY = 'townteam_users';

export function getUsers(): User[] {
    try {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function findUserByEmail(email: string): User | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    return getUsers().find(u => u.email.toLowerCase() === normalizedEmail);
}

export function registerUser(user: User): void {
    const users = getUsers();
    const normalizedEmail = user.email.toLowerCase().trim();
    const updatedUser = { ...user, email: normalizedEmail };

    const existingIndex = users.findIndex(u => u.email.toLowerCase().trim() === normalizedEmail);

    if (existingIndex > -1) {
        users[existingIndex] = updatedUser;
    } else {
        users.push(updatedUser);
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function validateLogin(email: string, password?: string): User | null {
    // Always allow the admin
    if (email.toLowerCase() === 'admin@xcraft.com' && password === 'Admin@2025!') {
        return {
            id: 'admin-user',
            name: 'Admin',
            email: email.toLowerCase(),
            role: 'admin'
        };
    }

    const user = findUserByEmail(email);
    // For this mock implementation, we'll assume any registered user can log in
    // In a real app, you'd verify the password hash here.
    return user || null;
}
