var express = require('express');
const Event = require('../models/events');
const Invite = require('../models/invites');
var router = express.Router();
const auth = require('../middleware/auth');

router.get('/', async (req, res, next) => {

    try {
        const invites = await Invite.find({});
        res.json(invites)

    } catch (error) {
        res.statusCode = 500;
        res.json({ message: 'Houve um erro interno.' })
    }
});

module.exports = router;

