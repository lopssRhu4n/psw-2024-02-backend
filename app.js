import app from "express";
const server = app();

const port = 3004;

server.get('/', (req, res) => res.send('Hello World'));

server.listen(port, () => {
    console.log('App listening on port ' + port);
});