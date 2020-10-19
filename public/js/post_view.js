window.addEventListener('load', loadPost);
window.onload = function() {
    loadPost();

    // 소켓 코드
    var socket = io.connect('/post', {
        path: '/socket'
    });
    socket.on('msg', function(data) {
        if(data.action == 'reload_post') {
            loadPost();
        }
        if(data.action == 'remove_post') {
            location.href = '/';
        }
    });
}

var script = document.createElement('script');
script.src = '/socket/socket.io.js';
document.head.appendChild(script);

function Request(method, url) {
    var xhr = new XMLHttpRequest();
    xhr.open( method , url , false );
    xhr.send( null );
    return xhr.responseText;
}

function loadPost() {
    var res = JSON.parse(Request('GET', `/raw/${post_name}`));
    var title = document.getElementById('post_title');
    var bodyArea = document.getElementById('body_area');
    if(res.error) {
        bodyArea.innerHTML = res.message;
        return;
    }

    new toastui.Editor({
        el: document.getElementById('body_area'),
        initialValue: res.text
    });

    document.title = `${res.title} - ${JSON.parse(Request('get', '/server')).name}`;
    title.innerHTML = res.title;

    var writer = JSON.parse(Request('GET', `/userinfo/${res.writer}`));
    if(writer == null) writer = '알 수 없음';
    else writer = writer.nickname;
    document.getElementById('post_writer').innerHTML = `작성자 : ${writer}`;

    if(isAdmin || userID == res.writer) document.getElementById('edit_this').hidden = false;
    if(isAdmin || userID == res.writer) document.getElementById('remove_this').hidden = false;

    document.getElementById('edit_this').onclick = function() {
        location.href = `/new?post_url=${post_name}`;
    }

    document.getElementById('remove_this').onclick = function() {
        location.href = `/removepost/${post_name}`;
    }

    document.getElementById('comment_show').innerHTML = '';
    var comments = JSON.parse(Request('get', `/comment/${res._id}`));
    comments.forEach(data => {
        var comment = document.createElement('div');
        comment.className = 'comment';

        if(isAdmin || userID == data.writer) {
            var delete_button = document.createElement('button');
            delete_button.innerHTML = '이 댓글 삭제';
            delete_button.onclick = function () {
                location.href = `/removecomment/${data._id}`;
            }
            comment.appendChild(delete_button);
        }

        var title = document.createElement('h4');
        const writer = JSON.parse(Request('get', `/userinfo/${data.writer}`));
        title.innerHTML = writer.nickname;
        comment.appendChild(title);
        document.getElementById('comment_show').appendChild(comment);

        var time = document.createElement('p');
        time.innerHTML = data.createdAt.toLocaleString();
        comment.appendChild(time);

        var text = document.createElement('p');
        text.innerHTML = data.text;
        comment.appendChild(text);
    });
}