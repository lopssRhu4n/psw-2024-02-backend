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

router.put('/:id', auth.verifyUser, async (req, res, next) => {
    try {
        let invite = await Invite.findById(req.params.id);

        if (!invite) {
            return res.status(404).json({ error: "Convite não encontrado." });
        }


        const event = await Event.findById(invite.event);
        // se o usuário não é nem o criador do convite nem o destinatario do convite, não pode atualizar 
        if (String(req.user._id) !== String(event.user) && String(req.user._id) !== String(invite.user)) {
            res.status(403).json({ error: "Você não pode realizar atualização neste convite." });
            return;
        }

        if (new Date(event.date) <= new Date()) {
            res.status(400).json({ error: 'O evento já começou e não é possível mais atualizar convites.' });
            return
        }


        const updatedInvite = await Invite.findOneAndUpdate(
            { _id: req.params.id },
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!updatedInvite) {
            return res.status(500).json({ message: 'Houve um erro interno.' });
        }
        res.status(202).json({
            message: 'Convite atualizado com sucesso', invite: updatedInvite
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            res.statusCode = 400;
            res.json(error);
            return;
        }
        res.status(500).json({ error: "Houve um erro interno." })
    }

    // Só pode ser feito pelo usuário que criou o convite ou pelo convidado

});

router.delete('/:id', auth.verifyUser, async (req, res, next) => {
    try {
        const invite = await Invite.findById(req.params.id);
        if (!invite) {
            return res.status(404).json({ error: "Convite não encontrado." });
        }
        const event = await Event.findById(invite.event);
        // se o usuário não é nem o criador do convite nem o destinatario do convite, não pode atualizar 
        if (String(req.user._id) !== String(event.user) && String(req.user._id) !== String(invite.user)) {
            res.status(403).json({ error: "Você não pode realizar a exclusão deste convite." });
            return;
        }

        if (new Date(event.date) <= new Date()) {
            res.status(400).json({ error: 'O evento já começou e não é possível mais excluir convites.' });
            return
        }

        await Invite.findByIdAndDelete(req.params.id);
        res.status(202).json({ message: 'Deletado com sucesso!', _id: invite._id });
        return;

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Houve um erro interno." })
    }

    // Só pode ser feito pelo usuário que criou o convite ou pelo convidado
});

module.exports = router;

