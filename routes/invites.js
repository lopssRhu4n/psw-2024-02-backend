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

router.post('/', auth.verifyUser, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        const isUserAlreadyInvited = await Invite.find({ user: req.body.user, event: req.body.event });
        if (isUserAlreadyInvited.length) {
            res.status(400).json({ error: 'O usuário já foi convidado para este evento.' });
            return;
        }

        const event = await Event.findById(req.body.event);
        const isUserAutoInvite = String(req.body.user) === String(req.user._id);
        const isEventOwnerInviteSender = String(req.user._id) === String(event.user);
        if (!isUserAutoInvite && !isEventOwnerInviteSender) {
            res.status(403).json({ error: 'Você não pode criar este convite!' });
            return;
        }

        if (new Date(event.date) <= new Date()) {
            res.status(400).json({ error: 'O evento já começou e não é possível mais criar convites.' });
            return
        }
        const invite = await Invite.create({
            sender: req.user._id,
            event: event._id,
            user: req.body.user,
            text: req.body.text,
            status: 'pending'
        });

        res.status(201).json(invite);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.statusCode = 400;
            res.json(error);
            return;
        }

        res.status(500).json({ message: 'Houve um erro interno.' });

    }

    // Só pode ser feito pelo usuário dono do evento  do convite ou pelo próprio usuário
    // Apenas pode ser feito caso o evento não tenha acontecido ainda

});

module.exports = router;

