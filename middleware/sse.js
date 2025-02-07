module.exports = (data, clients) => {
    clients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
}
