const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for contact messages (in production, use a database)
let contactMessages = [];

// POST /api/contact - Submit contact form
router.post('/', (req, res) => {
    try {
        const { name, email, phone, message, subject } = req.body;
        
        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email, message'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
        
        // Phone validation (optional)
        if (phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid phone number format'
                });
            }
        }
        
        const contactMessage = {
            id: uuidv4(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            subject: subject ? subject.trim() : 'General Inquiry',
            message: message.trim(),
            status: 'new', // new, read, replied, resolved
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };
        
        // Store the message
        contactMessages.push(contactMessage);
        
        // In a real application, you would:
        // 1. Save to database
        // 2. Send email notification to admin
        // 3. Send confirmation email to user
        // 4. Add to CRM system
        
        console.log('New contact message received:', {
            id: contactMessage.id,
            name: contactMessage.name,
            email: contactMessage.email,
            subject: contactMessage.subject
        });
        
        // Return success without sensitive data
        res.status(201).json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            data: {
                id: contactMessage.id,
                name: contactMessage.name,
                subject: contactMessage.subject,
                submittedAt: contactMessage.createdAt
            }
        });
        
    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit contact form',
            message: 'Something went wrong. Please try again later.'
        });
    }
});

// GET /api/contact - Get all contact messages (admin only)
router.get('/', (req, res) => {
    try {
        // In a real app, this would require admin authentication
        let filteredMessages = [...contactMessages];
        
        // Filter by status
        if (req.query.status) {
            filteredMessages = filteredMessages.filter(msg => 
                msg.status === req.query.status
            );
        }
        
        // Search functionality
        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            filteredMessages = filteredMessages.filter(msg =>
                msg.name.toLowerCase().includes(searchTerm) ||
                msg.email.toLowerCase().includes(searchTerm) ||
                msg.subject.toLowerCase().includes(searchTerm) ||
                msg.message.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort messages
        const sortBy = req.query.sortBy || 'newest';
        switch (sortBy) {
            case 'oldest':
                filteredMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name':
                filteredMessages.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'status':
                filteredMessages.sort((a, b) => a.status.localeCompare(b.status));
                break;
            default: // newest
                filteredMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const paginatedMessages = filteredMessages.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: paginatedMessages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(filteredMessages.length / limit),
                totalMessages: filteredMessages.length,
                hasNext: endIndex < filteredMessages.length,
                hasPrev: startIndex > 0
            },
            summary: {
                total: contactMessages.length,
                new: contactMessages.filter(msg => msg.status === 'new').length,
                read: contactMessages.filter(msg => msg.status === 'read').length,
                replied: contactMessages.filter(msg => msg.status === 'replied').length,
                resolved: contactMessages.filter(msg => msg.status === 'resolved').length
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contact messages',
            message: error.message
        });
    }
});

// GET /api/contact/info - Get business contact information
router.get('/info', (req, res) => {
    try {
        const contactInfo = {
            business: {
                name: 'Chandan Sarees',
                tagline: 'Exquisite Indian Attire',
                description: 'Your trusted destination for authentic Indian attire. Quality, tradition, and elegance in every piece.'
            },
            address: {
                street: '123 Textile Market, Commercial Street',
                city: 'Bangalore',
                state: 'Karnataka',
                postalCode: '560001',
                country: 'India',
                full: '123 Textile Market, Commercial Street, Bangalore, Karnataka 560001'
            },
            contact: {
                phones: [
                    { type: 'primary', number: '+91 98765 43210' },
                    { type: 'landline', number: '+91 80 2234 5678' }
                ],
                emails: [
                    { type: 'general', email: 'info@chandansarees.com' },
                    { type: 'orders', email: 'orders@chandansarees.com' },
                    { type: 'support', email: 'support@chandansarees.com' }
                ],
                website: 'https://chandansarees.com'
            },
            hours: {
                monday: '10:00 AM - 8:00 PM',
                tuesday: '10:00 AM - 8:00 PM',
                wednesday: '10:00 AM - 8:00 PM',
                thursday: '10:00 AM - 8:00 PM',
                friday: '10:00 AM - 8:00 PM',
                saturday: '10:00 AM - 8:00 PM',
                sunday: '11:00 AM - 7:00 PM'
            },
            social: {
                facebook: 'https://facebook.com/chandansarees',
                instagram: 'https://instagram.com/chandansarees',
                whatsapp: 'https://wa.me/919876543210',
                youtube: 'https://youtube.com/chandansarees'
            }
        };
        
        res.json({
            success: true,
            data: contactInfo
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contact information',
            message: error.message
        });
    }
});

// GET /api/contact/:id - Get specific contact message (admin only)
router.get('/:id', (req, res) => {
    try {
        const message = contactMessages.find(msg => msg.id === req.params.id);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Contact message not found'
            });
        }
        
        // Mark as read if it was new
        if (message.status === 'new') {
            message.status = 'read';
            message.updatedAt = new Date().toISOString();
        }
        
        res.json({
            success: true,
            data: message
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contact message',
            message: error.message
        });
    }
});

// PUT /api/contact/:id - Update contact message status (admin only)
router.put('/:id', (req, res) => {
    try {
        const messageIndex = contactMessages.findIndex(msg => msg.id === req.params.id);
        
        if (messageIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Contact message not found'
            });
        }
        
        const { status, adminNotes } = req.body;
        
        // Validate status
        const validStatuses = ['new', 'read', 'replied', 'resolved'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }
        
        const message = contactMessages[messageIndex];
        const updatedMessage = {
            ...message,
            ...(status && { status }),
            ...(adminNotes && { adminNotes }),
            updatedAt: new Date().toISOString()
        };
        
        contactMessages[messageIndex] = updatedMessage;
        
        res.json({
            success: true,
            data: updatedMessage,
            message: 'Contact message updated successfully'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update contact message',
            message: error.message
        });
    }
});

// DELETE /api/contact/:id - Delete contact message (admin only)
router.delete('/:id', (req, res) => {
    try {
        const messageIndex = contactMessages.findIndex(msg => msg.id === req.params.id);
        
        if (messageIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Contact message not found'
            });
        }
        
        const deletedMessage = contactMessages.splice(messageIndex, 1)[0];
        
        res.json({
            success: true,
            data: deletedMessage,
            message: 'Contact message deleted successfully'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete contact message',
            message: error.message
        });
    }
});

// POST /api/contact/newsletter - Newsletter subscription
router.post('/newsletter', (req, res) => {
    try {
        const { email, name } = req.body;
        
        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
        
        // In a real app, you would:
        // 1. Save to newsletter database
        // 2. Send welcome email
        // 3. Add to email marketing platform
        
        console.log('Newsletter subscription:', { email, name });
        
        res.json({
            success: true,
            message: 'Thank you for subscribing to our newsletter!'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to subscribe to newsletter',
            message: error.message
        });
    }
});

module.exports = router;