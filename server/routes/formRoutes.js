import express from 'express';
import {
    submitContactForm,
    submitChatMessage,
    moveContactToChat,
    getConversations,
    getConversationById,
    sendAdminMessage,
    deleteConversation,
    getUserConversations,
    assignConversation,
    closeConversation,
    deleteMessage,
    // Backward compatibility
    getContactSubmissions,
    respondToContact,
    addUserReply,
    getUserMessages,
    getContactSubmissionById,
    deleteContactSubmission
} from '../controllers/formController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== PUBLIC ROUTES (No authentication required) =====

// Contact Form submission
router.post('/contact', submitContactForm);

// Chat Button submission (separate from contact form)
router.post('/chat', submitChatMessage);

// User side
router.get('/contact/user', getUserConversations);

// ===== ADMIN ROUTES (Admin authentication required) =====

// Chat - Admin side
router.get('/contact', protect, admin, getConversations);
router.get('/contact/:conversationId', protect, admin, getConversationById);
router.post('/contact/admin/send', protect, admin, sendAdminMessage);
router.patch('/contact/:id/moveToChat', protect, admin, moveContactToChat);
router.patch('/contact/:conversationId/assign', protect, admin, assignConversation);
router.patch('/contact/:conversationId/close', protect, admin, closeConversation);
router.delete('/contact/:conversationId', protect, admin, deleteConversation);
router.delete('/contact/:conversationId/message/:messageId', protect, admin, deleteMessage);

// ===== BACKWARD COMPATIBILITY ROUTES =====
router.get('/contact/:id', protect, admin, getContactSubmissionById);
router.patch('/contact/:id/respond', protect, admin, respondToContact);
router.post('/contact/:id/user-reply', addUserReply);
router.delete('/contact/:id', protect, admin, deleteContactSubmission);

export default router;