var express = require('express');
const Event = require('../models/events');
var router = express.Router();
const auth = require('../middleware/auth');

router.get('/', async (req, res, next) => {
    // res.send('respond with a resource');
    try {
        res.setHeader('Content-Type', 'application/json');
        const events = await Event.find({});
        res.json(events);
    } catch (error) {
        res.statusCode = 500;
        res.json({ message: 'Houve um erro interno.' })
    }
});

router.get('/:id', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            res.statusCode = 404;
            res.json({ message: 'Evento não encontrado.' });
            return;
        }
        res.json(event);
    } catch (error) {
        res.statusCode = 500;
        res.json(error);
    }
})

router.post('/', auth.verifyUser, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const event = await Event.create(req.body);
        res.statusCode = 201;
        res.json(event);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.statusCode = 400;
            res.json(error);
        } else {
            res.statusCode = 500;
            res.json({ message: 'Houve um erro interno' })
        }
    }



})

router.put('/:id', auth.verifyUser, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        // res.json(req.body)
        const updatedEvent = await Event.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true });
        if (!updatedEvent) {
            res.statusCode = 404;
            res.json({ message: 'Evento não encontrado.' });
            return;
        }

        res.statusCode = 202;
        res.json({ message: `Evento ${req.params.id} atualizado com sucesso!` });
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.statusCode = 400;
            res.json(error);
        } else {
            res.json(error);
            res.statusCode = 500;
            res.json({ message: 'Houve um erro interno' })
        }
    }
});

router.delete('/:id', auth.verifyUser, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.statusCode = 204;
        res.json({ message: `Evento ${req.params.id} excluído com sucesso.` });
    } catch (error) {
        res.statusCode = 500;
        res.json({ message: 'Houve um erro interno' })
    }
})


module.exports = router;
