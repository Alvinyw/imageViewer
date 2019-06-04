(function (DL,MBC) {
    "use strict";
    var lib = DL;   
    function VideoViewer(cfg){
        var _this = this;
        _this.videoHtmlElement = [
            '<div class="kPainterVideoMdl">',
                '<video class="kPainterVideo" webkit-playsinline="true"></video>',
                '<select class="kPainterCameraSelect">',
                '</select>',
                '<select class="kPainterResolutionSelect">',
                    '<option class="kPainterGotResolutionOpt" value="got" selected></option>',
                    '<option data-width="3840" data-height="2160">ask 3840 x 2160</option>',
                    '<option data-width="1920" data-height="1080">ask 1920 x 1080</option>',
                    '<option data-width="1600" data-height="1200">ask 1600 x 1200</option>',
                    '<option data-width="1280" data-height="720">ask 1280 x 720</option>',
                    '<option data-width="800" data-height="600">ask 800 x 600</option>',
                    '<option data-width="640" data-height="480">ask 640 x 480</option>',
                    '<option data-width="640" data-height="360">ask 640 x 360</option>',
                '</select>',
                '<button class="kPainterBtnGrabVideo"><svg width="48" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1024 672q119 0 203.5 84.5t84.5 203.5-84.5 203.5-203.5 84.5-203.5-84.5-84.5-203.5 84.5-203.5 203.5-84.5zm704-416q106 0 181 75t75 181v896q0 106-75 181t-181 75h-1408q-106 0-181-75t-75-181v-896q0-106 75-181t181-75h224l51-136q19-49 69.5-84.5t103.5-35.5h512q53 0 103.5 35.5t69.5 84.5l51 136h224zm-704 1152q185 0 316.5-131.5t131.5-316.5-131.5-316.5-316.5-131.5-316.5 131.5-131.5 316.5 131.5 316.5 316.5 131.5z"/></svg></button>',
                '<button class="kPainterBtnCloseVideo"><svg width="48" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/></svg></button>',
            '</div>'
        ].join('');

        _this.videoSettings = cfg.videoSettings;
        _this.viewer = cfg.viewer;
        _this.beforeAddImgFromGrabVideoBtn = null;
        _this.afterAddImgFromGrabVideoBtn = null;

        // video 是否关闭
        _this.videoClosed = true;
    }

    VideoViewer.prototype.__Init = function(){
        var _this = this;

        _this.videoWrapper = document.getElementById("videoWrapper");
        _this.video = lib._querySelectorAll(_this.videoWrapper,'.kPainterVideo')[0];
        _this.cameraSel = lib._querySelectorAll(_this.videoWrapper,'.kPainterCameraSelect')[0];
        _this.resolutionSel = lib._querySelectorAll(_this.videoWrapper,'.kPainterResolutionSelect')[0];
        _this.optGotRsl = lib._querySelectorAll(_this.videoWrapper,'.kPainterGotResolutionOpt')[0];
        _this.btnGrab = lib._querySelectorAll(_this.videoWrapper,'.kPainterBtnGrabVideo')[0];
        _this.btnClose = lib._querySelectorAll(_this.videoWrapper,'.kPainterBtnCloseVideo')[0];

        function camSelChange(){
            _this.playVideo(_this.cameraSel.value).then(function(){
                if(!_this.videoClosed){
                    _this.stopVideo();
                }
            }).catch(function(ex){
                alert('Play video failed: ' + (ex.message || ex));
            });
        };
        if(_this.cameraSel) lib.addEvent(_this.cameraSel,"change", camSelChange);

        function relSelChange(){
            _this.playVideo().then(function(){
                if(!_this.videoClosed){
                    _this.stopVideo();
                }
            }).catch(function(ex){
                alert('Play video failed: ' + (ex.message || ex));
            });
            return true;
        };
        if(_this.resolutionSel) lib.addEvent(_this.resolutionSel,"change", relSelChange);
        
        function btnGrabClick(){
            _this.grabVideo(true);
            _this.hideVideo();
            return true;
        };
        if(_this.btnGrab) lib.addEvent(_this.btnGrab,"click", btnGrabClick);

        function closeWindow(){
            _this.stopVideo();
            _this.videoClosed = true;
            _this.optGotRsl.removeAttribute('data-width');
            
            if(_this.cameraSel) lib.removeEvent(_this.cameraSel,"change", camSelChange);
            if(_this.resolutionSel) lib.removeEvent(_this.resolutionSel,"change", relSelChange);
            if(_this.btnGrab) lib.removeEvent(_this.btnGrab,"click", btnGrabClick);
            if(_this.btnClose) lib.removeEvent(_this.btnClose,"click", closeWindow);

            document.body.removeChild(_this.videoWrapper);
        };

        _this.hideVideo = closeWindow;
        if(_this.btnClose) lib.addEvent(_this.btnClose,"click", closeWindow);
        
    }

    VideoViewer.prototype.updateDevice = function(){
        var _this = this;
        if(!_this.cameraSel){
            return Promise.reject('no camera select');
        }
        return navigator.mediaDevices.enumerateDevices().then(deviceInfos=>{
            var oldVal = _this.cameraSel.value;
            _this.cameraSel.innerHTML = "";
            var selOpt = undefined;
            for(var i = 0; i < deviceInfos.length; ++i){
                var info = deviceInfos[i];
                if(info.kind != 'videoinput'){
                    continue;
                }
                var opt = document.createElement('option');
                opt.value = info.deviceId;
                opt.innerText = info.label || 'camera '+ i;
                _this.cameraSel.appendChild(opt);
                if(oldVal == info.deviceId){
                    selOpt = opt;
                }
            }
            var optArr = _this.cameraSel.childNodes;
            if(!selOpt && optArr.length){
                try{
                    _this.video.srcObject.getTracks().forEach((track)=>{
                        if('video' == track.kind){
                            for(var i = 0; i < optArr.length; ++i){
                                var opt = optArr[i];
                                if(track.label == opt.innerText){
                                    selOpt = opt;
                                    throw 'found the using source';
                                }
                            }
                        }
                    });
                }catch(ex){
                    //if(self.kConsoleLog){self.kConsoleLog(ex);}
                    console.log(ex);
                }
            }
            if(selOpt){
                _this.cameraSel.value = selOpt.value;
            }
        });
    }

    VideoViewer.prototype.stopVideo = function(){
        var _this = this;
        if(_this.video.srcObject){
            //if(self.kConsoleLog)self.kConsoleLog('======stop video========');
            _this.video.srcObject.getTracks().forEach(function(track) {
                track.stop();
            });
        }

        return true;
    }

    VideoViewer.prototype.playVideo = function(deviceId){
        var _this = this;
        return new Promise((resolve,reject)=>{

            _this.stopVideo();

            //if(self.kConsoleLog)self.kConsoleLog('======before video========');
            var constraints = _this.videoSettings ? _this.videoSettings : _this.viewer.videoSettings;
            var selRslOpt = _this.resolutionSel ? _this.resolutionSel.children[_this.resolutionSel.selectedIndex] : null;
            if(selRslOpt && selRslOpt.hasAttribute('data-width')){
                var selW = selRslOpt.getAttribute('data-width');
                var selH = selRslOpt.getAttribute('data-height');
                _this.optGotRsl.setAttribute('data-width', selW);
                _this.optGotRsl.setAttribute('data-height', selH);
                var bMobileSafari = /Safari/.test(navigator.userAgent) && /iPhone/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
                if(bMobileSafari){
                    if(selW >= 1280){
                        constraints.video.width = 1280;
                    }else if(selW >= 640){
                        constraints.video.width = 640;
                    }else if(selW >= 320){
                        constraints.video.width = 320;
                    }
                }else{
                    constraints.video.width = { ideal: selW };
                    constraints.video.height = { ideal: selH };
                }
                if(!deviceId){
                    var selCamOpt = _this.cameraSel.children[_this.cameraSel.selectedIndex];
                    if(selCamOpt){
                        deviceId = selCamOpt.value;
                    }
                }
                if(deviceId){
                    constraints.video.facingMode = undefined;
                    constraints.video.deviceId = {exact: deviceId};
                }
            }
            
            var hasTryedNoWidthHeight = false;
            var getAndPlayVideo = ()=>{
                //if(self.kConsoleLog)self.kConsoleLog('======try getUserMedia========');
                //if(self.kConsoleLog)self.kConsoleLog('ask '+JSON.stringify(constraints.video.width)+'x'+JSON.stringify(constraints.video.height));
                navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
                    //if(self.kConsoleLog)self.kConsoleLog('======get video========');
                    return new Promise((resolve2, reject2)=>{
                        _this.video.srcObject = stream;
                        _this.video.onloadedmetadata = ()=>{
                            //if(self.kConsoleLog)self.kConsoleLog('======play video========');
                            _this.video.play().then(()=>{
                            // if(self.kConsoleLog)self.kConsoleLog('======played video========');
                                var gotRsl = _this.video.videoWidth+'x'+_this.video.videoHeight;
                                if(_this.optGotRsl)_this.optGotRsl.innerText = gotRsl;
                                if(_this.resolutionSel)_this.resolutionSel.value = 'got';
                                //if(self.kConsoleLog)self.kConsoleLog(gotRsl);
                                resolve2();
                            },(ex)=>{
                                reject2(ex);
                            });
                        };
                        _this.video.onerror = ()=>{reject2();};
                    });
                }).then(()=>{
                    resolve();
                }).catch((ex)=>{
                    //if(self.kConsoleLog)self.kConsoleLog(ex);
                    if(!hasTryedNoWidthHeight){
                        hasTryedNoWidthHeight = true;
                        constraints.video.width = undefined;
                        constraints.video.height = undefined;
                        getAndPlayVideo();
                    }else{
                        reject(ex);
                    }
                });
            };
            getAndPlayVideo();
        });
    }

    VideoViewer.prototype.grabVideo = function(isAutoAdd){
        var _this = this;
        if(_this.videoClosed) return;

        var canvas = document.createElement("canvas");
        canvas.width = _this.video.videoWidth;
        canvas.height = _this.video.videoHeight;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(_this.video,0,0);
        if(!isAutoAdd){
            return canvas;
        }
        return _this.viewer.LoadImageEx(canvas);
    }

    VideoViewer.prototype.showVideo = function(){
        var _this = this;

        if(!_this.videoClosed) return;

        _this.videoClosed = false;

        var videoWrp = document.createElement("div");
        videoWrp.setAttribute("id","videoWrapper");
        videoWrp.innerHTML = _this.videoHtmlElement;
        document.body.appendChild(videoWrp);

        _this.__Init();

        return _this.playVideo().then(function(){
            if(_this.videoClosed){
                _this.stopVideo();
                return Promise.reject('Video window has closed.');
            }else{
                _this.updateDevice().catch(function(ex){
                    //if(self.kConsoleLog)kConsoleLog(ex);
                    console.log(ex);
                });
                return Promise.resolve();
            }
        });
    }

    MBC.VideoViewer = VideoViewer;

})(Dynamsoft.MBC.Lib,Dynamsoft.MBC);