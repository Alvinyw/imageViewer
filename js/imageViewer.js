(function (ML) {

    "use strict";
    
    var lib = ML;

    function ImageViewer(cfg){
        var _this = this;
        var containerDiv = [
            '<div class="imageContainer">',
                '<div class="kPainterImgsDiv">',
                    '<canvas class="kPainterCanvas" style="display:none;position:absolute;"></canvas>',
                '</div>',
            '</div>',
            '<div class="thumbnailContainer"></div>'
        ].join('');
        _this._imageViewer = document.getElementById(cfg.ContainerId);
        _this._imageViewer.innerHTML = containerDiv;
        _this._canvas = lib._querySelectorAll(_this._imageViewer,'canvas.kPainterCanvas')[0];
        _this.ctx = _this._canvas.getContext('2d');
        _this._imgContainer = lib._querySelectorAll(_this._imageViewer,'div.imageContainer')[0];
        _this._imgsDiv = lib._querySelectorAll(_this._imageViewer,'div.kPainterImgsDiv')[0];
        _this._thumbnailContainer = lib._querySelectorAll(_this._imageViewer,'div.thumbnailContainer')[0];

        if(cfg.Width)
            _this._imageViewerW = cfg.Width;
        
        if(cfg.Height)
            _this._imageViewerH = cfg.Height;
        
        _this._imageViewer.style.width = _this._imageViewerW;
        _this._imageViewer.style.height = _this._imageViewerH;

        _this._defaultFileInput = document.createElement("input");
        _this._defaultFileInput.setAttribute("type","file");
        _this._defaultFileInput.setAttribute("accept","image/bmp,image/gif,image/jpeg,image/png,image/webp");
        _this._defaultFileInput.setAttribute("multiple","true");

        _this.curIndex = -1;

        // ImageViewer 当前所处的模式：view、edit
        _this.mode = 'view';

        _this._errorCode = 0;
        _this._errorString = '';

        // ImageControl 数组
        _this.aryImageControls = [];
        _this.BackgroundColor = "#FFFFFF";

        // ThumbnailControl 数组
        _this.aryThumbnailControls = [];
        // Thumbnails 中多个控件之间的距离
        _this.ThumbnailImageMargin = 10;
        // Thumbnails 中的小控件的宽度
        _this.ThumbnailControlW = 0;
        // Thumbnails 中的小控件的高度
        _this.ThumbnailBackgroundColor = "#FFFFFF";
        _this.ThumbnailControlH = 0;
        _this._thumbnailsDiv = document.createElement('div');
        _this._thumbnailsDiv.style.width = _this._thumbnailContainerW  + 'px';
        _this._thumbnailContainer.appendChild(_this._thumbnailsDiv);

        lib.addEvent(_this._defaultFileInput,"change", function(event) {
            var ev = event || window.event;

            if(_this.beforeAddImgFromFileChooseWindow){
                lib.doCallbackNoBreak(_this.beforeAddImgFromFileChooseWindow, [ev, false]);
            }else{
                _this.LoadImageEx(ev.target.files);
            }

        });

        lib.addEvent(_this._imageViewer,"dragover", function(event) {
            var ev = event || window.event;
            lib.stopDefault(ev);
        });

        lib.addEvent(_this._imageViewer,"drop", function(event) {
            var ev = event || window.event;
            if(_this.mode != 'view') return;
            lib.stopDefault(ev);
            _this.LoadImageEx(ev.dataTransfer.files);
        });

        _this._startPos = {};
        lib.addEvent(_this._imgContainer,"touchstart", fuc_touchstart);
        lib.addEvent(_this._imgContainer,"touchmove", fuc_touchmove);
        lib.addEvent(_this._imgContainer,"touchend", fuc_touchend);

        lib.addEvent(_this._imgContainer,"mousedown", fuc_touchstart);
        lib.addEvent(_this._imgContainer,"mouseup", fuc_touchend);
        
        function fuc_touchstart(event){
            var ev = event || window.event;
            if(_this.mode != 'view') return;
            lib.stopDefault(ev);

            lib.addEvent(_this._imgContainer,"mousemove", fuc_touchmove);
            lib.addEvent(_this._imgContainer,"mouseleave", fuc_touchend);

            var touches = ev.changedTouches;

            if(touches){
                //Multi-contact is prohibited
                if(touches.length!=1){return false;}

                _this._startPos = {
                    startX: touches[0].pageX,
                    startY: touches[0].pageY
                }
            }else{
                _this._startPos = {
                    startX: ev.clientX,
                    startY: ev.clientY
                }
            }

        } 

        function fuc_touchmove(event){
            var ev = event || window.event;
            if(_this.mode != 'view') return;
            lib.stopDefault(ev);

            if(_this.GetCount()<2){return false;}

            var touches = ev.changedTouches;

            if(touches){
                var _curOffsetX = touches[0].pageX - _this._startPos.startX,
                    _curOffsetY = touches[0].pageY - _this._startPos.startY;
            }else{
                var _curOffsetX = ev.clientX - _this._startPos.startX,
                    _curOffsetY = ev.clientY - _this._startPos.startY;
            }

            var _aryImgs =  _this.aryImageControls,
                _curIndex = _this.curIndex,
                _pIndex = (_curIndex - 1)<0?(_aryImgs.length-1):(_curIndex - 1),
                _nIndex = (_curIndex + 1)>(_aryImgs.length-1)?0:(_curIndex + 1);

            _aryImgs[_curIndex].SetLocation((_this._imgsDivW - _aryImgs[_curIndex].controlWidth)/2 + _curOffsetX);
            _aryImgs[_pIndex].SetLocation(-(_this._imgContainerW - _curOffsetX));
            _aryImgs[_nIndex].SetLocation(_this._imgContainerW + _curOffsetX);

            //console.log('pageX: '+touches[0].pageX+" pageY: "+touches[0].pageY);   
        }

        function fuc_touchend(event){
            var ev = event || window.event;
            if(_this.mode != 'view') return;
            lib.stopDefault(ev);
            
            if(_this.GetCount()<1){return false;}

            lib.removeEvent(_this._imgContainer,"mousemove", fuc_touchmove);
            lib.removeEvent(_this._imgContainer,"mouseleave", fuc_touchend);

            if(_this.GetCount()<2){return false;}

            var touches = ev.changedTouches;

            if(touches){
                var _curOffsetX = touches[0].pageX - _this._startPos.startX,
                    _curOffsetY = touches[0].pageY - _this._startPos.startY;
            }else{
                var _curOffsetX = ev.clientX - _this._startPos.startX,
                    _curOffsetY = ev.clientY - _this._startPos.startY;
            }

            if(_curOffsetX>_this._imgsDivW/3){
                _this.ChangePage('p');
            }else if(_curOffsetX<-_this._imgsDivW/3){
                _this.ChangePage('n');
            }else{
                _this.__reInitImageControlPosition();
            }
        }

        //https://developer.mozilla.org/zh-CN/docs/Web/Events
        
        _this.videoSettings = {video:{/*width:{ideal:2048},height:{ideal:2048},*/facingMode:{ideal:"environment"}}};

        // 操做数组：记录操作方法
        _this.stack = [];
        _this.curStep = -1;

        // 点击 save 时的旋转角度总数
        _this.rotateAngle = 0;
        // 点击 save 时的 filp 总次数
        _this.flipNum = 0;
        // 点击 save 时的 mirror 总次数
        _this.mirrorNum = 0;

        // 是否替换原图
        _this.replaceOriginalImage = true;

        // Canvas 的宽高和位置信息
        _this._canvasArea = {
            width: 0,
            height: 0,
            left: 0,
            top: 0
        };

        var cfg = {};
        cfg.viewer = _this;
        cfg.videoSettings = _this.videoSettings;
        cfg.container = _this._imgContainer;

        _this.VideoViewer = new ML.VideoViewer(cfg);
        _this.ImageAreaSelector = new ML.ImageAreaSelector(cfg);

        lib.attachProperty(_this);
        // 设置  ImageViewer 里的元素宽高
        _this.__init(cfg);
    }

    ImageViewer.prototype.beforeAddImgFromFileChooseWindow = null;
    ImageViewer.prototype.afterAddImgFromFileChooseWindow = null;

    ImageViewer.prototype.beforeAddImgFromDropFile = null;
    ImageViewer.prototype.afterAddImgFromDropFile = null;

    ImageViewer.prototype.__init = function () {
        var _this = this;

        _this._imageViewerW = lib.getElDimensions(_this._imageViewer).clientWidth;
        _this._imageViewerH = lib.getElDimensions(_this._imageViewer).clientHeight;     

        _this._imgContainerW = lib.getElDimensions(_this._imgContainer).clientWidth;
        _this._imgContainerH = lib.getElDimensions(_this._imgContainer).clientHeight;

        _this._imgsDivW = lib.getElDimensions(_this._imgsDiv).clientWidth;
        _this._imgsDivH = lib.getElDimensions(_this._imgsDiv).clientHeight;

        _this._thumbnailContainerW = lib.getElDimensions(_this._thumbnailContainer).clientWidth;
        //_this._thumbnailContainerH = lib.getElDimensions(_this._thumbnailContainer).clientHeight;
        _this._thumbnailContainerH = _this._imageViewerH*0.2;

        // Thumbnails 中每行的控件数
        _this.thumbnailImagesPerRow = Math.floor(_this._thumbnailContainerW / _this._thumbnailContainerH)>2?Math.floor(_this._thumbnailContainerW / _this._thumbnailContainerH):3;

        _this._thumbnailsDiv.style.height = _this._thumbnailContainerH + 'px';

        var maxEditingCvsWH;
        (function(){
            var dpr = window.devicePixelRatio || 1;
            var w = screen.width, h = screen.height;
            maxEditingCvsWH = Math.min(w,h)*dpr;
        })();
    }

    ImageViewer.prototype.AdaptiveLayout = function () {
        var _this = this;

        _this.__init();

        // 重置 ImageControl 控件的宽高和位置
        var _aryImgs = _this.aryImageControls;
        for(var i=0;i<_aryImgs.length;i++){
            var tempW = _aryImgs[i].controlWidth,
                tempH = _aryImgs[i].controlHeight;
            if(tempW < _this._imgsDivW && tempH < _this._imgsDivH){
                _aryImgs[i].ChangeControlSize(tempW,tempH);
            }else{
                _aryImgs[i].ChangeControlSize(_this._imgsDivW,_this._imgsDivH);
            }
        }

        // 重置 ThumbnailControl 控件的宽高和位置
        _this.__reInitThumbnailControlPosition();

        // 重置 canvas 控件的宽高和位置
        _this.__updateCanvasUI();

        return true;
    }

    ImageViewer.prototype.LoadImageEx = function (imgData) {
        var _this = this;
        if(_this.mode == 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'LoadImageEx','edit'); return false;}

        if(arguments.length == 0){
            _this.ShowFileChooseWindow();
            return;
        }

        if(imgData instanceof Blob || imgData instanceof HTMLCanvasElement || typeof imgData == "string" || imgData instanceof String || imgData instanceof HTMLImageElement){
            lib.getBlobFromAnyImgData(imgData, function(blob){
                _this.LoadImageInner(blob);
            });
        }else if(imgData instanceof Array || imgData instanceof FileList){
            for(var i = 0; i < imgData.length; ++i){
                _this.LoadImageEx(imgData[i]);
            }
            return;
        }else{
            //_this._errorString = "addImage(imgData): Type of 'imgData' should be 'Blob', 'HTMLCanvasElement', 'HTMLImageElement', 'String(url)', 'Array(a array of source)', 'FileList'.";
            lib.Errors.InvalidParameterType(_this);
            return false;
        }
    }

    ImageViewer.prototype.LoadImageInner = function (url) {
        var _this = this, cfg = {};
        cfg.viewer = _this;
        cfg.imageViewerW = _this._imageViewerW;
        cfg.imageViewerH = _this._imageViewerH;
        cfg.imgContainerW = _this._imgsDivW;
        cfg.imgContainerH = _this._imgsDivH;
        cfg.index = _this.curIndex = _this.aryImageControls.length;

        if(url instanceof Blob){
            cfg.imageUrl = URL.createObjectURL(url);
        }else{
            cfg.imageUrl = url;
        }   
        
        // 添加 ImageControl 
        var objImageControl = new ML.ImageControl(cfg);
        _this.aryImageControls.push(objImageControl);
        _this._addImgToContainer(objImageControl.GetEL());

        // 添加 ThumbnailControl 
        var objThumbnailControl = new ML.ThumbnailControl(cfg);
        _this.aryThumbnailControls.push(objThumbnailControl);
        _this._addImgToThumbnail(objThumbnailControl.GetEL());

        _this.__resetSelection();

        lib.Errors.Sucess(_this);
        return true;
    }

    ImageViewer.prototype.ShowVideo = function(){
        this.VideoViewer.showVideo();
        return true;
    };

    ImageViewer.prototype.ShowImage = function (index) {
        var _this = this;

        if(index<0 || index>_this.aryImageControls.length-1){ lib.Errors.InvalidValue(_this); return false; }
        _this.curIndex = index;

        _this.__reInitImageControlPosition();
        _this.__resetSelection();

        _this._updateNumUI();

        lib.Errors.Sucess(_this);
        return true;
    }

    ImageViewer.prototype.ChangePage = function(cmd){
        var _this = this;
        var _index;
        switch(cmd){
            case "f": _index = 0; break;
            case "p": _index = _this.curIndex - 1; break;
            case "n": _index = _this.curIndex + 1; break;
            case "l": _index = _this.aryImageControls.length - 1; break;
            default: 
                if(arguments.length < 1 || isNaN(cmd)){
                    return false;
                }else{
                    _index = Math.round(cmd);
                }
        }
        /*eslint-enable indent*/
        if(_index<0){
            _index = _this.aryImageControls.length -1;
        }else if(_index>_this.aryImageControls.length-1){
            _index = 0;
        }

        _this.ShowImage(_index);
        return true;
    };

    ImageViewer.prototype.GetCurentIndex = function () {
        return this.curIndex;
    }

    ImageViewer.prototype.GetCount = function () {
        return this.aryImageControls.length;
    }

    ImageViewer.prototype.GetImage = function (index,isOri) {
        var _curIndex = index || this.curIndex;
        if(isOri){
            return this.aryImageControls[_curIndex];
        }else{
            return this.aryImageControls[_curIndex].cloneNode(true);
        }
        
    }

    lib.each(['SaveAsBMP', 'SaveAsJPEG', 'SaveAsTIFF', 'SaveAsPNG', 'SaveAsPDF'], function (method) {
        ImageViewer.prototype[method] = function(filename,index) {
            var _this = this;
            if(_this.mode == 'edit'){ lib.Errors.FucNotValidInThisMode(_this,method,'edit'); return false; }
            if(arguments.length < 2){
                index = _this.curIndex;
            }
            if(!lib.isNumber(index)){ return false; }
            index = Math.round(index);
            if(index < 0 || index >= _this.aryImageControls.length){ return false; }

            var a = document.createElement('a');
            a.target='_blank';
            var img = _this.aryImageControls[index].objImage;
            var blob = img.src;
            
            if(!filename){
                filename = (new Date()).getTime() + '.png';
            }
            a.download = filename;
            //var objUrl = URL.createObjectURL(blob);
            var objUrl = blob;
            a.href = objUrl;
            var ev = new MouseEvent('click',{
                "view": window,
                "bubbles": true,
                "cancelable": false
            });
            a.dispatchEvent(ev);
            //a.click();
            setTimeout(function(){
                URL.revokeObjectURL(objUrl);
            }, 10000);
            return filename;
        };
    });

    ImageViewer.prototype.ShowFileChooseWindow = function(){
        var _this = this;
        if(_this.mode == 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'ShowFileChooseWindow','edit'); return false; }

        _this._defaultFileInput.click();
        return true;
    };

    // 获取 imageviewer 的背景色
    ImageViewer.prototype.GetBackgroundColor = function (v) {
        return this.BackgroundColor;
    };

    // 设置 imageviewer 的背景色
    ImageViewer.prototype.SetBackgroundColor = function (v) {
        var _this = this;
        _this.BackgroundColor = v;
        
        if (_this._imgContainer)
            _this._imgContainer.style.backgroundColor = v;

        lib.Errors.Sucess(_this);
        return true;
    };

    // 设置裁切框的背景色
    ImageViewer.prototype.SetCropBackgroundColor = function (v) {
        var _this = this;
        var cells = _this.ImageAreaSelector.kPainterCells;
        _this.ImageAreaSelector.backgroundColor = v;
        for(var i=0;i<cells.length;i++){
            cells[i].style.backgroundColor = v;
        }
        lib.Errors.Sucess(_this);
        return true;
    }

    // 设置裁切框的边框色
    ImageViewer.prototype.SetCropBorderColor = function (v) {
        var _this = this;
        var cells = _this.ImageAreaSelector.kPainterCells;
        var corners = _this.ImageAreaSelector.kPainterCorners;
        _this.ImageAreaSelector.borderColor = v;
        for(var i=0;i<cells.length;i++){
            cells[i].style.borderColor = v;
        }
        for(var i=0;i<corners.length;i++){
            corners[i].style.borderColor = v;
        }
        lib.Errors.Sucess(_this);
        return true;
    }

    ImageViewer.prototype.GetThumbnaiBackgroundColor = function (v) {
        return this.ThumbnailBackgroundColor;
    };

    ImageViewer.prototype.SetThumbnailBackgroundColor = function (v) {
        var _this = this;
        _this.ThumbnailBackgroundColor = v;
        
        if(_this._thumbnailContainer) 
            _this._thumbnailContainer.style.backgroundColor = v;
        
        for(var i=0;i<_this.aryThumbnailControls.length;i++){
            _this.aryThumbnailControls[i].SetBackgroundColor(_this.ThumbnailBackgroundColor);
        }

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.GetThumbnailImageMargin = function () {
        var _this = this;
        return _this.ThumbnailImageMargin;
    };

    ImageViewer.prototype.SetThumbnailImageMargin = function (v) {
        var _this = this;

        if (v <= 0 || (v > _this._thumbnailContainerW /  _this.thumbnailImagesPerRow) || (v > _this._thumbnailContainerH)) {
            lib.Errors.InvalidValue(_this);
            return false;
        }else{
            _this.ThumbnailImageMargin = parseInt(v);

            _this.__reInitThumbnailControlPosition();
            lib.Errors.Sucess(_this);
            return true;
        }
    };

    ImageViewer.prototype.EnterEdit = function(){
        var _this = this;
        if(_this.mode == 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'EnterEdit','edit'); return false;
        }else if(_this.curIndex < 0){ lib.Errors.IndexOutOfRange(_this); return false; }
        _this.mode = 'edit';

        _this.aryImageControls[_this.curIndex].SetVisible(false);
        _this.__pushStack('enterEdit');
        _this.__updateCanvasUI();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.CancelEdit = function(){
        var _this = this;

        if(_this.mode == 'view'){ lib.Errors.FucNotValidInThisMode(_this,'CancelEdit','view'); return false; }
        _this.mode = 'view';

        _this.aryImageControls[_this.curIndex].SetVisible(true);

        _this.__updateCanvasUI();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.RotateLeft = function(){
        var _this = this;
        if(_this.mode != 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'RotateLeft','view'); return false;}

        var transformOri = $(_this._canvas).getTransform();
        var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,-1,1,0,0,0), transformOri);
        $(_this._canvas).setTransform(transformNew);

        _this.rotateAngle -=90;
        
        _this.__pushStack('rotateLeft');
        _this.__updateCanvasUI();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.RotateRight = function(){
        var _this = this;
        if(_this.mode != 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'RotateRight','view'); return false; }
        
        var transformOri = $(_this._canvas).getTransform();
        var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,1,-1,0,0,0), transformOri);
        $(_this._canvas).setTransform(transformNew);

        _this.rotateAngle +=90;

        _this.__pushStack('rotateRight');
        _this.__updateCanvasUI();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.Rotate = function(index, angle){
        var _this = this;
        if(_this.mode != 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'Rotate','view'); return false; }

        var rotateRightTime = parseInt(angle/90);
        var transformNew = $(_this._canvas).getTransform();
        for(var i=0;i<rotateRightTime;i++){
            transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,1,-1,0,0,0), transformNew);
        }
        $(_this._canvas).setTransform(transformNew);

        _this.rotateAngle +=90;

        _this.__pushStack('rotateRight');
        _this.__updateCanvasUI();

        lib.Errors.Sucess(_this);
        return true;
    }

    ImageViewer.prototype.Mirror = function(){
        var _this = this;
        if(_this.mode != 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'Mirror','view'); return false; }
        
        var transformOri = $(_this._canvas).getTransform();
        var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(-1,0,0,1,0,0), transformOri);
        $(_this._canvas).setTransform(transformNew);

        _this.mirrorNum++;

        _this.__pushStack('mirror');
        _this.__updateCanvasUI();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.Flip = function(){
        var _this = this;
        if(_this.mode != 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'Flip','view'); return false; }
        
        var transformOri = $(_this._canvas).getTransform();
        var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(1,0,0,-1,0,0), transformOri);
        $(_this._canvas).setTransform(transformNew);

        _this.flipNum++;

        _this.__pushStack('flip');
        _this.__updateCanvasUI();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.Crop = function(){
        var _this = this;
        if(_this.mode != 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'Crop','view'); return false; }

    }

    ImageViewer.prototype.Save = function(){
        var _this = this;
        if(_this.mode != 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'Save','view'); return false; }

        var img = _this.aryImageControls[_this.curIndex].objImage;
        var process = _this.stack[_this.curStep];

        var imgOW = img.naturalWidth || img.width;
        var imgOH = img.naturalHeight || img.height;
        var crop = process.crop;
        var tsf = process.transform;
        var context2d = _this.ctx;
        var mainCvs = _this._canvas;
        var bTrueTransform = true;

        var sWidth = mainCvs.fullQualityWidth = Math.round(imgOW) || 1,
            sHeight = mainCvs.fullQualityHeight = Math.round(imgOH) || 1;
        var isSwitchedWH = false;
        if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
            mainCvs.fullQualityWidth = sWidth;
            mainCvs.fullQualityHeight = sHeight;
        }else{
            mainCvs.fullQualityWidth = sHeight;
            mainCvs.fullQualityHeight = sWidth;
            if(bTrueTransform){
                isSwitchedWH = true;
            }
        }
        mainCvs.hasCompressed = false;
        if(bTrueTransform){
            var cvsW, cvsH;
            if(isSwitchedWH){
                cvsW = sHeight;
                cvsH = sWidth;
            }else{
                cvsW = sWidth;
                cvsH = sHeight;
            }
            mainCvs.width = cvsW;
            mainCvs.height = cvsH;
            var drawE = cvsW/2 * (1 - tsf.a - tsf.c),
                drawF = cvsH/2 * (1 - tsf.b - tsf.d);
            context2d.setTransform(tsf.a, tsf.b, tsf.c, tsf.d, drawE, drawF);
        }
        else if(sWidth > maxEditingCvsWH || sHeight > maxEditingCvsWH){
            var rate = maxEditingCvsWH / Math.max(sWidth, sHeight);
            mainCvs.width = Math.round(sWidth * rate) || 1;
            mainCvs.height = Math.round(sHeight * rate) || 1;
            mainCvs.hasCompressed = true;
        }else{
            mainCvs.width = sWidth;
            mainCvs.height = sHeight;
        }
        var sx = Math.round(imgOW*crop.x), 
            sy = Math.round(imgOH*crop.y);
        if(sx == imgOW){ --sx; }
        if(sy == imgOH){ --sy; }
        var dWidth, dHeight;
        if(!isSwitchedWH){
            dWidth = mainCvs.width;
            dHeight = mainCvs.height;
        }else{
            dWidth = mainCvs.height;
            dHeight = mainCvs.width;
        }
        if(sWidth/dWidth <= 2){
            context2d.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
        }else{
            var tempCvs = document.createElement('canvas');
            tempCvs.width = Math.round(sWidth/2);
            tempCvs.height = Math.round(sHeight/2);
            var tempCtx = tempCvs.getContext('2d');
            var _sWidth, _sHeight, _dWidth = Math.round(sWidth/2), _dHeight = Math.round(sHeight/2);
            tempCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, _dWidth, _dHeight);
            for(;;){
                _sWidth = _dWidth, _sHeight = _dHeight, _dWidth = Math.round(_sWidth/2), _dHeight = Math.round(_sHeight/2);
                if(_dWidth <= dWidth || _dHeight <= dHeight){break;}
                tempCtx.drawImage(tempCvs, 0, 0, _sWidth, _sHeight, 0, 0, _dWidth, _dHeight);
            }
            context2d.drawImage(tempCvs, 0, 0, _sWidth, _sHeight, 0, 0, dWidth, dHeight);
        }
        if(bTrueTransform){
            $(mainCvs).setTransform(new kUtil.Matrix(1,0,0,1,0,0));
        }else{
            $(mainCvs).setTransform(tsf);
        }
        
        if(!_this.replaceOriginalImage){
            _this.LoadImageEx(mainCvs);
        }else{
            lib.canvasToBlob(mainCvs, function(blob){
                var url = URL.createObjectURL(blob);
                var curImg = _this.aryImageControls[_this.curIndex];
                var curThumbImg = _this.aryThumbnailControls[_this.curIndex];

                curImg.imageUrl = url;
                curImg.Refresh();

                curThumbImg.imageUrl = url;
                curThumbImg.Refresh();               
            });
        }

        _this.CancelEdit();
        return true;
    }

    ImageViewer.prototype.RemoveAllSelectedImages = function(){
        var _this = this, index = _this.curIndex;
        if(_this.mode == 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'RemoveAllSelectedImages','edit'); return false; }

        // 删除 ImageControl 控件
        _this.__RemoveImageControl(index);
        
        // 删除 ThumbnailControl 控件
        _this.__RemoveThumbnailControl(index);
        
        var _index = _this.curIndex>(_this.aryImageControls.length-1)?(_this.aryImageControls.length-1):_this.curIndex;
        _this.ShowImage(_index);
        
        return true;
    }

    ImageViewer.prototype.RemoveAllImages = function(){
        var _this = this, i;
        if(_this.mode == 'edit'){ lib.Errors.FucNotValidInThisMode(_this,'RemoveAllImages','edit'); return false; }

        // 删除 ImageControl 控件
        var iCount = _this.aryImageControls.length;
        for (i = iCount - 1; i >= 0; i--) {
            _this.__RemoveImageControl(i);
        }
        
        // 删除 ThumbnailControl 控件
        var iThumbCount = _this.aryThumbnailControls.length;
        for (i = iThumbCount - 1; i >= 0; i--) {
            _this.__RemoveThumbnailControl(i);
        }
    
        return true;
    }

    ImageViewer.prototype.__RemoveImageControl = function(index){
        var _this = this;
		if (index < _this.aryImageControls.length && index >= 0) {
            var objImgControl = _this.aryImageControls[index];
			objImgControl.Destroy();
			_this.aryImageControls.splice(index, 1);
			_this._imgsDiv.removeChild(objImgControl.GetEL());
        }
        for(var i=index;i<_this.aryImageControls.length;i++){
            var objImgControl = _this.aryImageControls[i];
            objImgControl.SetIndex(i);
        }
    }

    ImageViewer.prototype.__RemoveThumbnailControl = function(index){
        var _this = this;
        if (index < _this.aryThumbnailControls.length && index >= 0) {
            var objThumbControl = _this.aryThumbnailControls[index];
			objThumbControl.Destroy();
			_this.aryThumbnailControls.splice(index, 1);
            _this._thumbnailsDiv.removeChild(objThumbControl.GetEL());
        }
        for(var i=index;i<_this.aryThumbnailControls.length;i++){
            var objThumbControl = _this.aryThumbnailControls[i];
            objThumbControl.SetIndex(i);
        }
        _this.__reInitThumbnailControlPosition();
    }

    ImageViewer.prototype.__updateCanvasUI = function(){
        var _this = this;

        if(_this.mode == 'edit'){
            _this._canvas.style.display = '';
            var _curStack = _this.stack[_this.curStep];
            // 判断旋转了几次：0(奇数次) / 1(偶数次)
            var rotateTime = Math.abs(_curStack.transform.a);

            _this.__attachImgToCanvas(rotateTime);
            _this.ImageAreaSelector.ShowCropRect(rotateTime);
            _curStack.crop = _this.ImageAreaSelector.__getDrawArea();
        }else if(_this.mode == 'view'){
            _this._canvas.style.display = 'none';
            _this.stack = [];
            _this.curStep = -1;
            //_this.ctx.clearRect(0,0,_this._canvasArea.width,_this._canvasArea.height);
            _this._canvasArea = {
                width: 0,
                height: 0,
                left: 0,
                top: 0
            };
            var transformNew = new kUtil.Matrix(1,0,0,1,0,0);
            $(_this._canvas).setTransform(transformNew);
            _this.ImageAreaSelector.HideCropRect();
        }
        
    }

    ImageViewer.prototype.__attachImgToCanvas = function(rotateTime){
        var _this = this;
        if(_this.mode != 'edit') return;

        var curImg = _this.aryImageControls[_this.curIndex];

        var canvasAspectRatio = _this._imgsDivW/_this._imgsDivH;
        
        if(rotateTime == 1){
            // 旋转偶数次
            var imageAspectRatio = curImg._origImageWidth/curImg._origImageHeight;
        }else{
            // 旋转奇数次
            var imageAspectRatio = curImg._origImageHeight/curImg._origImageWidth;
        }
        
        if(canvasAspectRatio>imageAspectRatio){
            _this._canvasArea.height = _this._imgsDivH;
            _this._canvasArea.width = imageAspectRatio*_this._imgsDivH;
        }else{
            _this._canvasArea.width = _this._imgsDivW;
            _this._canvasArea.height = _this._canvasArea.width/imageAspectRatio;
        }

        if(rotateTime == 0){
            var tempW = _this._canvasArea.width;
            _this._canvasArea.width = _this._canvasArea.height;
            _this._canvasArea.height = tempW;
        }

        _this._canvasArea.left = Math.floor((_this._imgsDivW-_this._canvasArea.width)/2);
        _this._canvasArea.top = Math.floor((_this._imgsDivH-_this._canvasArea.height)/2);

        _this._canvas.style.left = _this._canvasArea.left + 'px';
        _this._canvas.style.top = _this._canvasArea.top + 'px';
        _this._canvas.setAttribute("width",_this._canvasArea.width);
        _this._canvas.setAttribute("height",_this._canvasArea.height);

        var ctx = _this._canvas.getContext("2d");
        ctx.clearRect(0, 0, _this._canvasArea.width, _this._canvasArea.height);
        ctx.drawImage(_this.aryImageControls[_this.curIndex].objImage, 0, 0, _this._canvasArea.width, _this._canvasArea.height);
    }

    ImageViewer.prototype._addImgToContainer = function (objImg) {
        var _this = this;

        _this._imgsDiv.appendChild(objImg);

        _this.__reInitImageControlPosition();
        return true;
    }

    ImageViewer.prototype._addImgToThumbnail = function (objThumb) {
        var _this = this;

        _this._thumbnailsDiv.appendChild(objThumb);

        _this.__reInitThumbnailControlPosition();

        return true;
    }

    ImageViewer.prototype.__resetSelection = function () {
        var _this = this, i = 0;

        // 更新 thumbnail 的选择状态
        for (i = 0; i < _this.aryThumbnailControls.length; i++) {
            var thumbControl = _this.aryThumbnailControls[i];
            if (thumbControl.bVisible) {
                if (thumbControl.cIndex != _this.curIndex)
                    thumbControl.SetSelect(false);
                else if (thumbControl.cIndex == _this.curIndex)
                    thumbControl.SetSelect(true);
            }
        }
    };

    // ImageViewer.prototype.__recalculateDivThumbnailSize = function () {
    //     var _this = this;
    //     var aryThumbnailControls = _this.aryThumbnailControls;
    //     var _newWidth = _this.ThumbnailImageMargin;
    //     for(var i=0;i<aryThumbnailControls.length;i++){
    //         _newWidth += aryThumbnailControls[i].GetControlWidth() + _this.ThumbnailImageMargin;
    //     }
    //     _this._thumbnailsDiv.style.width = (_newWidth>_this._thumbnailContainerW?_newWidth:_this.imageViewWidth) + 'px';

    //     _this._thumbnailContainer.scrollLeft = _this._thumbnailContainer.scrollWidth;

    //     return true;
    // }

    ImageViewer.prototype.__reInitImageControlPosition = function () {
        var _this = this;
        
        var _aryImgs =  _this.aryImageControls,
            _curIndex = _this.curIndex,
            _pIndex = (_curIndex - 1)<0?(_aryImgs.length-1):(_curIndex - 1),
            _nIndex = (_curIndex + 1)>(_aryImgs.length-1)?0:(_curIndex + 1);

        for(var i=0;i<_aryImgs.length;i++){
            if(i == _curIndex){
                _aryImgs[_curIndex].SetLocation();
            }else if(i==_pIndex){
                _aryImgs[_pIndex].SetLocation(-_this._imgContainerW);
            }else if(i==_nIndex){
                _aryImgs[_nIndex].SetLocation(_this._imgContainerW);
            }else{
                _aryImgs[i].SetLocation(_this._imgContainerW);
            }
        }

        return true;
    }

    ImageViewer.prototype.__reInitThumbnailControlPosition = function () {
        var _this = this, x, y, i;

        _this.__initThumbnailControlsSize();

        x = _this.ThumbnailImageMargin;
        y = _this.ThumbnailImageMargin;

        for (i = 0; i < _this.aryThumbnailControls.length; i++) {
            var thumbnailControl = _this.aryThumbnailControls[i], bindIndex = thumbnailControl.cIndex;
            
            // 避免不必要的操作
            if (thumbnailControl._width != _this.ThumbnailControlW || thumbnailControl._height != _this.ThumbnailControlH){
                thumbnailControl.ChangeControlSize(_this.ThumbnailControlW, _this.ThumbnailControlH);
            }

            thumbnailControl.SetLocation(x, y);

            // 重新计算 thumbnailContainer 的宽度
            _this._thumbnailsDiv.style.width = (x + thumbnailControl.GetControlWidth()) + 'px';
            _this._thumbnailContainer.scrollLeft = _this._thumbnailContainer.scrollWidth;

            x = thumbnailControl.Left + _this.ThumbnailControlW + _this.ThumbnailImageMargin;
            y = _this.ThumbnailImageMargin;
            
            // 检查 index 是否有效
            if(bindIndex<0 || bindIndex>=_this.aryThumbnailControls.length) {
                thumbnailControl.ClearControl();
                continue;
            }
        }
    };

    ImageViewer.prototype.__initThumbnailControlsSize = function () {
        //计算 Thumbnail 控件的 _this.ThumbnailControlW;  _this.ThumbnailControlH; 
        var _this = this;

        var iTotalWidth = _this._thumbnailContainerW - _this.ThumbnailImageMargin,
            iTotalHeight = _this._thumbnailContainerH - _this.ThumbnailImageMargin;

        _this.ThumbnailControlW = iTotalWidth / _this.thumbnailImagesPerRow - _this.ThumbnailImageMargin;
        _this.ThumbnailControlH = iTotalHeight - _this.ThumbnailImageMargin;

    };

    ImageViewer.prototype.__pushStack = function(funName){
        var _this = this;
        var _curStack = {
            fun: funName,
            crop: _this.ImageAreaSelector.__getDrawArea(),
            transform: $(_this._canvas).getTransform(),
            srcBlob: _this.aryImageControls[_this.curIndex].imageUrl
        };

        _this.stack.push(_curStack);
        _this.curStep++;
        return true;
    }

    ImageViewer.prototype.onNumChange = null;
    ImageViewer.prototype._updateNumUI = function(){
        lib.doCallbackNoBreak(this.onNumChange,[this.curIndex, this.aryImageControls.length]);
    }

    ML.ImageViewer = ImageViewer;

})(MBC.Lib);