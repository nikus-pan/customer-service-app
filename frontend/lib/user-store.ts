// Simple in-memory user store for Vercel serverless
const users: Map<string, { id: string; email: string; password: string; name: string; role: string }> = new Map();

// Initialize admin user
users.set('admin@system.com', {
  id: 'admin-001',
  email: 'admin@system.com',
  password: '$2a$10$5K7G9Y8X3Z1W2V4U5T6R7S8A9B0C1D2E3F4G5H6I7J8K9L0M1', // ADMIN
  name: '系統管理員',
  role: 'admin'
});

export function getUserByEmail(email: string) {
  return users.get(email);
}

export function createUser(user: { id: string; email: string; password: string; name: string; role: string }) {
  users.set(user.email, user);
  return user;
}

export function getAllUsers() {
  return Array.from(users.values());
}
