var express = require('express');
const Invite = require('../models/invites');
const Feedback = require('../models/feedbacks');
var router = express.Router();
const auth = require('../middleware/auth');
const { default: mongoose } = require('mongoose');

router.get('/', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const feedbacks = await Feedback.find({});
        return res.status(200).json(feedbacks);
    } catch (error) {
        res.statusCode = 500;
        res.json({ message: 'Houve um erro interno.' })
    }
});

router.get('/:id', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            res.statusCode = 404;
            res.json({ message: 'Feedback não encontrado.' });
            return;
        }
        res.json(feedback)

    } catch (error) {
        res.statusCode = 500;
        res.json(error);
    }
})

router.post('/', auth.verifyUser, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const [invite] = await Invite.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.body.invite) } },
            {
                $lookup: {
                    from: "events",
                    localField: "event",
                    foreignField: "_id",
                    as: "event"
                }
            }
        ]);

        if (String(invite.user) !== String(req.user._id)) {
            res.status(403).json({ error: "Você não pode criar este feedback" });
            return;
        }

        if (invite.status !== 'confirmed' || new Date(invite.event[0].date) >= new Date()) {
            res.status(403).json({ error: "Você ainda não foi a este evento e, portanto, não pode deixar seu feedback." });
            return;
        }

        const feedback = await Feedback.create({
            ...req.body,
            user: req.user._id,
            event: invite.event[0]._id
        });

        res.status(201).json({ message: "Feedback criado com sucesso!", feedback });

    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            res.statusCode = 400;
            res.json(error);
        } else {
            res.statusCode = 500;
            res.json({ message: 'Houve um erro interno' })
        }
    }
});

router.put('/:id', auth.verifyUser, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const [feedback] = await Feedback.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ]);

        if (!feedback) {
            res.statusCode = 404;
            res.json({ message: 'Feedback não encontrado.' });
            return;
        }

        if (String(feedback.user[0]._id) !== String(req.user._id)) {
            res.status(403).json({ error: "Você não pode realizar esta atualização." });
        }

        const updatedFeedback = await Feedback.findOneAndUpdate({ _id: req.params.id }, { ...req.body }, { new: true, runValidators: true });
        if (!updatedFeedback) {
            return res.status(500).json({ message: 'Houve um erro interno.' });
        }

        res.status(202).json({ message: "Feedback atualizado", updatedFeedback });

    } catch (error) {
        if (error.name === 'ValidationError') {
            res.statusCode = 400;
            res.json(error);
            return;
        } else {
            res.statusCode = 500;
            res.json({ message: 'Houve um erro interno' })
            return;
        }
    }
});

router.delete('/:id', auth.verifyUser, async (req, res, next) => {
    try {

        const [feedback] = await Feedback.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ]);

        if (!feedback) {
            res.statusCode = 404;
            res.json({ message: 'Feedback não encontrado.' });
            return;
        }

        if (String(feedback.user[0]._id) !== String(req.user._id)) {
            res.status(403).json({ error: "Você não pode excluir este feedback." });
            return;
        }

        await Feedback.findByIdAndDelete(req.params.id);

        res.status(204).json({});
        return;

    } catch (error) {
        res.statusCode = 500;
        res.json({ message: 'Houve um erro interno' })
    }
});


module.exports = router;
