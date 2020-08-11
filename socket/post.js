const Url = require('url');

module.exports = (io) => {
    io.on('connection', (socket) => {
        const url = Url.parse(socket.request.headers.referer);
        const post = url.path.replace('/post/', '');
        socket.join(post);
    });
}