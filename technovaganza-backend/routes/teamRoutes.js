const express = require('express');
const { createTeam, validateTeamMember } = require('../controllers/teamController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware, createTeam);
router.post('/validate-member', authMiddleware, validateTeamMember);

module.exports = router;