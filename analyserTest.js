/**
 * @file
 * @author BenzLeung(https://github.com/BenzLeung)
 * @date 2017/3/20
 * Created by JetBrains PhpStorm.
 *
 * 每位工程师都有保持代码优雅的义务
 * each engineer has a duty to keep the code elegant
 */

(function () {
    var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var ctx = new AudioContext();

    var loadBuffer = function (src, cb) {
        var request = new XMLHttpRequest();
        request.open('GET', src, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            ctx['decodeAudioData'](request.response, function (buffer) {
                cb(buffer);
            }, function(){
                alert('decode failed');
            });
        };
        request.send();
    };

    var fixFreq = function (freq) {
        if (freq < 20) return 0;
        var i = 0, len = TUNING.length;
        while (freq > TUNING[i][1] && i < len) {
            i ++;
        }
        return (TUNING[i][1] - freq < freq - TUNING[i-1][1]) ? TUNING[i][1] : TUNING[i-1][1];
    };

    var buffer;
    var bufferArray;
    var sampleRate;

    var analyser = ctx.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0;
    var freqByteData = new Uint8Array(analyser.frequencyBinCount / 8);

    var hzList = [];
    var curHz = [0, 0];
    var curSample = 0;
    var scriptProcesser = ctx.createScriptProcessor(256, 1, 1);
    scriptProcesser.onaudioprocess = function() {
        var i;
        var maxF = 0;
        var maxI = 0;
        var maxItoF;
        var freq;
        analyser.getByteFrequencyData(freqByteData);
        for (i = 0; i < analyser.frequencyBinCount; i ++) {
            if (freqByteData[i] > maxF) {
                maxF = freqByteData[i];
                maxI = i;
            }
        }
        maxItoF = maxI * (sampleRate / 2 / analyser.frequencyBinCount);
        if (maxF > 100) {
            freq = fixFreq(maxItoF);
        } else {
            freq = 0;
        }

        if (curHz[0] == freq) {
            curHz[1] += 256;
        } else {
            hzList.push(curHz);
            console.log(curHz[0] + ', ' + curHz[1] + ', ');
            curHz = [freq, 256];
        }
        curSample += 256;
    };

    var source;
    var play = function () {
        source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        source.onended = ended;
        bufferArray = buffer.getChannelData(0);
        source.start(0);
    };

    loadBuffer('res/rectangle2.mp3', function (buf) {
        sampleRate = buf.sampleRate;
        buffer = buf;
        document.getElementById('run').removeAttribute('disabled');
    });
    var ended = function () {
        var i, len = hzList.length;
        for (i = 0; i < len; i ++) {
            if (hzList[i][1] <= 256) {
                hzList[i][0] = 0;
            }
            hzList[i][1] = hzList[i][1] * 1.0 / sampleRate;
        }
        var json = JSON.stringify(hzList);
        document.getElementById('json').innerHTML = json;

        console.log('curSample: ', curSample);
        console.log('sampleLength: ', buffer.length);

        analyser.disconnect(scriptProcesser);
        scriptProcesser.disconnect(ctx.destination);
    };

    var analytic = function () {
        analyser.connect(scriptProcesser);
        scriptProcesser.connect(ctx.destination);
        play();
    };

    var testSound = function () {
        analyser.connect(ctx.destination);
        play();
        setInterval(function () {
            analyser.getByteFrequencyData(freqByteData);
        }, 5);
    };

    document.getElementById('run').onclick = function () {
        document.getElementById('run').setAttribute('disabled', 'disabled');
        analytic();
        // testSound();
    };
})();