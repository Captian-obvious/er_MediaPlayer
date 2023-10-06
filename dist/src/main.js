const tr = window.jsmediatags
window.MediaPlayer = {
    Initialize: function() {
        var elements = document.getElementsByTagName('audio-player');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element.getAttribute('controls') != null && element.getAttribute('controls') != false) {
                var t = document.createElement("div");
                t.setAttribute('id', 'playpause');
                t.setAttribute('data-index', i);
                t.style.zIndex = 6;
                element.appendChild(t);
                var t2 = document.createElement("input");
                t2.setAttribute('id', 'seekbar');
                t2.setAttribute('type', 'range');
                t2.setAttribute('data-index', i);
                t2.style.zIndex = 6;
                t2.value = 0;
                t2.max = 100;
                t2.min = 0;
                element.appendChild(t2);
            };
            if (element.getAttribute('show-album') != null && element.getAttribute('show-album') != false) {
                var t = document.createElement("div");
                t.setAttribute('id', 'album');
                t.setAttribute('data-index', i);
                t.style.zIndex = 1;
                element.appendChild(t);
            };
            if (element.getAttribute('track-info') != null && element.getAttribute('track-info') != false) {
                var t = document.createElement("div");
                t.innerText = "No File(s) Chosen";
                t.setAttribute('id', 'title');
                t.setAttribute('data-index', i);
                t.style.zIndex = 5;
                element.appendChild(t);
            };
            if (element.getAttribute('visual') != null && element.getAttribute('visual') != false) {
                var t = document.createElement("canvas");
                t.setAttribute('id', 'visualizer');
                t.setAttribute('data-index', i);
                t.style.zIndex = 2;
                element.appendChild(t);
            };
        };
    },
    Play: function(element, files) {
        function elementById(id) {
            var result = null
            for (const child of element.children) {
                if (child.getAttribute('id') == id) {
                    result = child
                    break
                };
            };
        };
        var audio = new Audio();
        console.log(audio);
        var button = elementById('playpause');
        var album = elementById('album');
        var filetitle = elementById('title');
        var dur = elementById('seekbar');
        var canvas = elementById('visualizer');
        var tp = elementById('time-position')

        function formatTime(val) {
            var min = Math.floor(val / 60);
            var sec = Math.floor(val - min * 60);
            if (sec < 10) {
                sec = "0" + sec;
            };
            return min + ":" + sec
        };
        var index = 0;
        var colorValue = "#ff0000";

        function playNext(audio, i) {
            if (debounce === true) {
                debounce = false;
                var input = files[i].name;
                var s = URL.createObjectURL(files[i]);
                button.setAttribute("data-mediathumb-url", s);
                var SRC = s;
                audio.src = SRC;
                audio.load();
                var input = files[i].name;
                if (filetitle != null && filetitle.textContent != "Unknown Artist - " + files[i].name) {
                    filetitle.textContent = "Unknown Artist - " + files[i].name;
                };
                if (album != null && album.style.backgroundImage != "url(../../images/default/default-album-icon.png)") {
                    album.style.backgroundImage = "url(../../images/default/default-album-icon.png)";
                };
                tr.read(files[i], {
                    onSuccess: function(tag) {
                        console.log(tag);
                        const data = tag.tags.picture.data;
                        const format = tag.tags.picture.format;
                        const title = tag.tags.title;
                        const artist = tag.tags.artist;
                        if (data.length != 0 && format != null) {
                            let str = "";
                            for (var o = 0; o < data.length; o++) {
                                str += String.fromCharCode(data[o]);
                            };
                            var url = "data:" + format + ";base64," + window.btoa(str);
                            if (album) {
                                album.style.backgroundImage = "url(" + url + ")";
                            };
                        };
                        if (title != "" && artist != "") {
                            if (filetitle != null) {
                                filetitle.textContent = artist + " - " + title;
                            };
                        };
                    },
                    onError: function(error) {
                        console.log(error);
                    },
                });
                audio.play();
                setTimeout(function() {
                    debounce = true;
                }, 100);
            };
        };
        playNext(audio, index)
        if (canvas != null) {
            var context = new AudioContext();
            console.log(context);
            var src = context.createMediaElementSource(audio);
            var analyser = context.createAnalyser();
            var loud = 0;
            var scale = window.devicePixelRatio;
            var size = element.style.width
            canvas.width = Math.floor(size * scale);
            canvas.height = Math.floor(size * scale);
            //CSS pixels for coordinate systems 
            var ctx = canvas.getContext("2d");
            ctx.scale(scale, scale);
            src.connect(analyser);
            var gn = context.createGain();
            analyser.connect(gn);
            gn.connect(context.destination);
            var fft_Size = 512;
            analyser.fftSize = fft_Size;
            analyser.maxDecibels = -3;
            analyser.minDecibels = -150;
            var bufferLength = analyser.frequencyBinCount;
            console.log(bufferLength);
            console.log(analyser);
            var dataArray = new Uint8Array(bufferLength);
            var dataArray1 = new Uint8Array(fft_Size);
        };
        dur.addEventListener("change", function() {
            audio.currentTime = dur.value;
        });
        audio.addEventListener("timeupdate", function() {
            dur.value = audio.currentTime;
            dur.max = audio.duration;
        });
        button.addEventListener("click", function() {
            if (this.className == "MediaPlayerIcon icon-pause") {
                this.className = "MediaPlayerIcon icon-play";
                audio.pause()
            } else {
                this.className = "MediaPlayerIcon icon-pause";
                audio.play();
            };
        });
        audio.addEventListener("ended", function() {
            button.className = "MediaPlayerIcon icon-play";
            dur.value = dur.max;
            index += 1;
            if (files.length > 1) {
                playNext(audio, index);
            };
        });
        audio.addEventListener("pause", function() {
            button.className = "MediaPlayerIcon icon-play"
        });
        audio.addEventListener("play", function() {
            button.className = "MediaPlayerIcon icon-pause";
        });
    },
};
