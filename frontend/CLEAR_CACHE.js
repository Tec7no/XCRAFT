// CLEAR CACHE AND RELOAD - Run this in browser console
// This will remove old product data and load fresh data from constants.ts

localStorage.removeItem('products');
console.log('✅ Product cache cleared!');
console.log('🔄 Reloading page...');
setTimeout(() => location.reload(), 500);
