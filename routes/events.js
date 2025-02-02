var express = require('express');
const Event = require('../models/events');
var router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../multer/multer');
const fs = require('fs');
const path = require('path');

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

router.post('/', auth.verifyUser, upload.single("img"), async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

        const img = `/uploads/${req.file.filename}`;

        const event = await Event.create({ ...req.body, user: req.user._id, img });
        res.statusCode = 201;
        res.json(event);
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        if (error.name === 'ValidationError') {
            res.statusCode = 400;
            res.json(error);
        } else {
            res.statusCode = 500;
            res.json({ message: 'Houve um erro interno' })
        }
    }
});

router.put('/:id', auth.verifyUser, upload.single("img"), async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            res.statusCode = 404;
            res.json({ message: 'Evento não encontrado.' });
            return;
        }

        if (String(event.user) !== String(req.user._id)) {
            res.status(403).json({ error: 'Você não pode realizar esta atualização!' });
            return
        }

        const updateData = { ...req.body }
        if (req.file) {
            fs.unlinkSync(path.join(__dirname, "..", event.img));
            updateData.img = `/uploads/${req.file.filename}`;
        }

        const updatedEvent = await Event.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        res.statusCode = 202;
        res.json({ message: `Evento atualizado com sucesso`, event: updatedEvent });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        if (error.name === 'ValidationError') {
            res.statusCode = 400;
            res.json(error);
            return;
        } else {
            res.statusCode = 500;
            console.log(error);
            res.json(error);
            // res.json({ message: 'Houve um erro interno' })
            return;
        }
    }
});

router.delete('/:id', auth.verifyUser, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        // await Event.findByIdAndDelete(req..id);
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Evento não encontrado." });
        }
        if (event.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Não autorizado: este não é seu evento." });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.statusCode = 204;
        res.json({ message: `Evento ${req.params.id} excluído com sucesso.` });
    } catch (error) {
        res.statusCode = 500;
        res.json({ message: 'Houve um erro interno' })
    }
});


module.exports = router;
