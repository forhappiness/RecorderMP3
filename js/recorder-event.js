//录音按钮
var bt_recoding = document.getElementById("bt_recoding");

//中间黑色边框和里面的内容（录音状态）
var blackBoxSpeak = document.querySelector(".blackBoxSpeak");
blackBoxSpeak.style.background = "url('./img/ic_record@2x.png')no-repeat 28 16px/65px 104px, url('./img/ic_record_ripple@2x-9.png')no-repeat 111.2px 32px/28.8px 88px";
blackBoxSpeak.style.backgroundColor = "rgba(0,0,0,.7)";

//中间黑色边框和里面的内容（暂停状态）
var blackBoxPause = document.querySelector(".blackBoxPause");
blackBoxPause.style.background = "rgba(0,0,0,.7) url('./img/ic_release_to_cancel@2x.png')no-repeat center 8px/67.2px 104px";
blackBoxPause.style.backgroundColor = "rgba(0,0,0,.7)";

//手指移动相关
var posStart = 0;//初始化起点坐标
var posEnd = 0;//初始化终点坐标
var posMove = 0;//初始化滑动坐标

//轮播相关
var index = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9];
var num = index.length;
var timer = null; //用于清除计时器
var recordertime=0;

//直接开启轮播模式
setTimer();


var recorder = new MP3Recorder({
    debug:true,
    funOk: function () {

    },
    funCancel: function (msg) {

        recorder = null;
    }
});
var mp3Blob;


function initEvent() {
    bt_recoding.addEventListener("touchstart", function (event) {
        event.preventDefault();//阻止浏览器默认行为
        $('.cd-dropdown').removeClass('.cd-active');
        // 开始录音
        recorder.start();

        posStart = 0;
        posStart = event.touches[0].pageY;//获取起点坐标

        //显示录音 隐藏暂停
        showBlackBoxSpeak();
    });
    bt_recoding.addEventListener("touchmove", function (event) {
        event.preventDefault();//阻止浏览器默认行为

        posMove = event.targetTouches[0].pageY;//获取滑动实时坐标
        if (posStart - posMove < 200) {
            //隐藏录音 显示暂停
            showBlackBoxSpeak();
        } else {
            //显示录音 隐藏暂停
            showBlackBoxPause();
        }
    });
    bt_recoding.addEventListener("touchend", function (event) {
        event.preventDefault(); //阻止浏览器默认行为

        // 结束录音
        recorder.stop();
        recorder.getMp3Blob(function (blob) {


            mp3Blob = blob;
            var url = URL.createObjectURL(mp3Blob);
            var div = document.createElement('div');
            var au = document.createElement('audio');
            var hf = document.createElement('a');

            au.controls = true;
            au.src = url;
            hf.href = url;
            hf.download = new Date().toISOString() + '.mp3';
            hf.style.display = 'inline-block';
            // mp3文件base64
            recdown64(mp3Blob);

            hf.innerHTML = hf.download;
            div.appendChild(au);
            div.appendChild(hf);
            recordingslist.appendChild(div);
        });

        posEnd = 0;
        posEnd = event.changedTouches[0].pageY;//获取终点坐标

        //初始化状态
        initStatus();

        if (posStart - posEnd < 200) {
            alert("发送成功");
            showBlackBoxNone();
        } else {
            alert("取消发送");
            showBlackBoxNone();
        }
    });
}

initEvent();


function recdown64(blob){
    var reader = new FileReader();
    reader.onloadend = function() {

        // 录音文件base64
        console.log(reader.result);


        var fzc = $("*[name='cd-dropdown']").val();

        // 用户选择的单词
        var select_val = $('.cd-dropdown ul li span').eq(fzc).text();
        console.log(fzc);
        console.log(select_val);

        $.ajax({
            // 提交录音
            type:'post',
            url:'https://t02.io.speechx.cn:8443/MDD_Server/mdd_v18',
            beforeSend:function(jqXHR,options){
                jqXHR.setRequestHeader("Authorization", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzcGVlY2h4X21kZCIsIlNpZ25lZEJ5IjoianN6aG9uZyIsImlzRmxleGlibGUiOmZhbHNlLCJFbmdsaXNoTGV2ZWwiOjMsImlzcyI6ImF1dGgwIiwibkdCX1VTIjoxLCJuRmlyc3RWYWxpZE1vbnRocyI6MTIsImF1ZCI6Imd1ZXN0IiwibkNsaWVudElEIjoxNTYzNTAwMjA1LCJuTWF4Q29uY3VycmVudFVzZXIiOjAsIlB1Ymxpc2hlck5hbWUiOiJndWFuZ3pob3VtZW5ncWl3ZW5odWFjaHVhbmJveW91eGlhbmdvbmdzaV8yMDE5MDcxOTA5MjgyOTk5NyIsIkZlZWRCYWNrVHlwZSI6MSwiZXhwIjoxNTk3NjgwMDQ1LCJpYXQiOjE1NjM1MDAyMDV9.bBZDIDF9fxVFuQ-chfGmdklzNSGb5-8X6H4OWK59M0o") ;  // 增加一个自定义请求头
            },
            data:{
                'myWavfile':reader.result,
                'word_name ':'pig'
            },
            success:function (res) {
                console.log(res);
            },
            error:function (err) {
                console.log(err)
            }
        })

    };
    reader.readAsDataURL(blob);
};

//轮播
function setTimer() {
    timer = setInterval(function () {
        setTimeout(function () {
            num++;
            blackBoxSpeak.style.background = "url('./img/ic_record@2x.png')no-repeat 28px 16px/64px 104px, url('./img/ic_record_ripple@2x-" + index[num] + ".png')no-repeat 111.2px 32px/28.8px 88px";
            blackBoxSpeak.style.backgroundColor = " rgba(0,0,0,.7)";
        }, 70);
        if (num >= index.length - 1) {
            num = 0;
        }
    }, 70);
}

//初始化状态
var initStatus = function () {
    bt_recoding.value = '按住 说话';

    //全部隐藏
    showBlackBoxNone();
}

//显示录音 隐藏暂停
var showBlackBoxSpeak = function () {
    bt_recoding.value = '松开 结束';
    blackBoxSpeak.style.display = "block";
    blackBoxPause.style.display = "none";
}

//隐藏录音 显示暂停
var showBlackBoxPause = function () {
    bt_recoding.value = '松开手指，取消发送';
    blackBoxSpeak.style.display = "none";
    blackBoxPause.style.display = "block";
}

//隐藏录音
var showBlackBoxNone = function () {
    blackBoxSpeak.style.display = "none";
    blackBoxPause.style.display = "none";
}