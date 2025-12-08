// Script to clear user's old authentication token
// Run this in browser console on your frontend

console.log('Current token:', localStorage.getItem('token'));
console.log('Current user:', localStorage.getItem('user'));

// Clear authentication
localStorage.removeItem('token');
localStorage.removeItem('user');

console.log('✅ Cleared authentication! Please login again.');
console.log('Redirecting to login page...');

// Redirect to login
window.location.href = '/login';
