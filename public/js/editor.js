window.onload = function() {
    document.getElementById('InputTitle').focus();

    var Editor = toastui.Editor;
    var editor = new Editor({
        el: document.getElementById('write_area'),
        height: '500px',
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        initialValue: document.getElementById('write_area').dataset.postText
    });

    document.getElementById('form').onsubmit = function() {
        document.getElementById('hidden_form').value = editor.getMarkdown();
    }

    document.getElementById('InputUrl').oninput = function() {
        this.value = this.value.replace(' ', '-');

        if(this.value != '') {
            var ExistPostWarning = document.getElementById('ExistPostWarning');

            var result = JSON.parse(Request('get', `/raw/${this.value}`));
            if(result.error) ExistPostWarning.hidden = true;
            else ExistPostWarning.hidden = false;
        }
    }

    if(document.getElementById('InputUrl').value != '') {
        var ExistPostWarning = document.getElementById('ExistPostWarning');

        var result = JSON.parse(Request('get', `/raw/${document.getElementById('InputUrl').value}`));
        if(result.error) ExistPostWarning.hidden = true;
        else ExistPostWarning.hidden = false;
    }
}

function Request(method, url) {
    var xhr = new XMLHttpRequest();
    xhr.open( method , url , false );
    xhr.send( null );
    return xhr.responseText;
}