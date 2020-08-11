const SocketIO = require('socket.io');
const fs = require('fs');

module.exports = (server, app) => {
    const io = SocketIO(server, { path: '/socket' });
    app.set('io', io);

    const deny_filelist = [ 'index.js' ];
    fs.readdirSync('./socket').forEach(file => {
        if(deny_filelist.indexOf(file) == -1) {
            const ns = io.of(`/${file.replace('.js', '')}`);
            app.set(`socket_${file.replace('.js', '')}`, ns);
            require(`./${file}`)(ns);
        }
    });

    const only_send_ns = [ 'main' ];
    only_send_ns.forEach(ns => {
        const newns = io.of(`/${ns}`);
        app.set(`socket_${ns}`, newns);
    });
}