var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    // res.send('respond with a resource');
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Oier' })

});

router.get('/:id', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(req.params.id);
})

router.post('/', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'creating' });

})

router.put('/:id', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'updating ' + req.params.id });
})

router.delete('/:id', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'deleting ' + req.params.id });
})


module.exports = router;
