var script = document.createElement('script');
script.src = '/socket/socket.io.js';
document.head.appendChild(script);

window.onload = function() {
    var socket = io.connect('/main', {
        path: '/socket'
    });
    socket.on('msg', function(data) {
        if(data.action == 'reload_post') {
            var result = Request('get', '/main_render');
            document.getElementById('post').innerHTML = result;
        }
    });
}

function Request(method, url) {
    var xhr = new XMLHttpRequest();
    xhr.open( method , url , false );
    xhr.send( null );
    return xhr.responseText;
}