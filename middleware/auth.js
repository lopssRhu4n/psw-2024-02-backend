module.exports = function (req, res, next) {
    const isLogged = false;
    if (!isLogged) {
        res.statusCode = 403;
        res.json({ message: 'Você precisa estar logado!' });
        return;
    }

    next();
}