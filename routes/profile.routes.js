const profile = require('../controllers/profile.controller.js');
const { isAuthenticated } = require('../middleware/auth.middleware');

module.exports = router => {
    // UI Route
    router.get('/profile', isAuthenticated, profile.getProfileUI);

    // API Routes
    router.get('/api/profile/:id', isAuthenticated, profile.getProfile);
    router.post('/api/profile/update', isAuthenticated, profile.updateProfile);
    
    router.get('/api/profile/:id/addresses', isAuthenticated, profile.getAddresses);
    router.post('/api/profile/:id/addresses', isAuthenticated, profile.addAddress);
    router.put('/api/profile/addresses/:id', isAuthenticated, profile.updateAddress);
    router.delete('/api/profile/addresses/:id', isAuthenticated, profile.deleteAddress);
};
