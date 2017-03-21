/**
 * @file
 * @author BenzLeung(https://github.com/BenzLeung)
 * @date 2017/3/19
 * Created by JetBrains PhpStorm.
 *
 * 每位工程师都有保持代码优雅的义务
 * each engineer has a duty to keep the code elegant
 */

(function () {
    var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var ctx = new AudioContext();
    var compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);

    var playOne = function (hzList, oType) {
        var oNode;
        var i = 0, len = hzList.length, p;
        var play = function () {
            if (oNode) {
                oNode.stop(0);
            }
            if (i >= len) {
                i = 0;
                return;
            }
            p = hzList[i];
            if (p[0] > 0) {
                oNode = ctx.createOscillator();
                oNode.frequency.value = p[0];
                oNode.type = oType || 'square';
                oNode.connect(compressor);
                oNode.start(0);
            }
            i ++;
            setTimeout(play, p[1] * 1000);
        };
        play();
    };

    document.getElementById('play').onclick = function () {
        playOne(square2List);
        playOne(square1List);
        playOne(triangleList, 'triangle');
    };
})();