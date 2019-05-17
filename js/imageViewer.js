 function ImageViewer(ImageViewerID){
    var _this = this;
    var containerDiv = [
        '<div class="imageContainer">',
            '<div class="kPainterImgsDiv">',
                '<canvas class="kPainterCanvas" style="display:none;position:absolute;"></canvas>',
            '</div>',
        '</div>',
        '<div class="thumbnailContainer"></div>'
    ].join('');
    _this._imageViewer = document.getElementById(ImageViewerID);
    _this._imageViewer.innerHTML = containerDiv;
    _this._canvas = lib._querySelectorAll(_this._imageViewer,'canvas.kPainterCanvas')[0];
    _this._imgContainer = lib._querySelectorAll(_this._imageViewer,'div.imageContainer')[0];
    _this._imgsDiv = lib._querySelectorAll(_this._imageViewer,'div.kPainterImgsDiv')[0];
    _this._thumbnailContainer = lib._querySelectorAll(_this._imageViewer,'div.thumbnailContainer')[0];

    _this._defaultFileInput = document.createElement("input");
    _this._defaultFileInput.setAttribute("type","file");
    _this._defaultFileInput.setAttribute("accept","image/bmp,image/gif,image/jpeg,image/png,image/webp");
    _this._defaultFileInput.setAttribute("multiple","true");

    _this.curIndex = -1;

    // ImageViewer 当前所处的模式：view、edit
    _this.mode = 'view';

    _this.errorCode = 0;
    _this.errorString = '';

    // ImageControl 数组
    _this.aryImages = [];
    _this.BackgroundColor = "#FFFFFF";

    _this.aryThumbnailImages = [];
    // Thumbnails 中多个控件之间的距离
    _this.ThumbnailImageMargin = 10;
    // Thumbnails 中的小控件的宽度
    _this.ThumbnailControlW = 0;
    // Thumbnails 中的小控件的高度
    _this.ThumbnailBackgroundColor = "#FFFFFF";
    _this.ThumbnailControlH = 0;
    _this.divThumbnail = document.createElement('div');
    _this.divThumbnail.style.width = _this._thumbnailContainerW  + 'px';
    _this._thumbnailContainer.appendChild(_this.divThumbnail);

    lib.addEvent(_this._defaultFileInput,"change", function(event) {
        var ev = event || window.event;

        if(_this.beforeAddImgFromFileChooseWindow){
            lib.doCallbackNoBreak(_this.beforeAddImgFromFileChooseWindow, [ev, false]);
        }else{
            _this.LoadImage(ev.target.files);
        }

    });

    lib.addEvent(_this._imageViewer,"dragover", function(event) {
        var ev = event || window.event;
		lib.stopDefault(ev);
    });

    lib.addEvent(_this._imageViewer,"drop", function(event) {
        var ev = event || window.event;
		lib.stopDefault(ev);
        _this.LoadImage(ev.dataTransfer.files);
    });

    _this._startPos = {};
    lib.addEvent(_this._imgContainer,"touchstart", fuc_touchstart);
    lib.addEvent(_this._imgContainer,"touchmove", fuc_touchmove);
    lib.addEvent(_this._imgContainer,"touchend", fuc_touchend);

    lib.addEvent(_this._imgContainer,"mousedown", fuc_touchstart);
    lib.addEvent(_this._imgContainer,"mouseup", fuc_touchend);
    
    function fuc_touchstart(event){
        var ev = event || window.event;
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
		lib.stopDefault(ev);

        if(_this.getCount()<2){return false;}

        var touches = ev.changedTouches;

        if(touches){
            var _curOffsetX = touches[0].pageX - _this._startPos.startX,
                _curOffsetY = touches[0].pageY - _this._startPos.startY;
        }else{
            var _curOffsetX = ev.clientX - _this._startPos.startX,
                _curOffsetY = ev.clientY - _this._startPos.startY;
        }

        var _aryImages =  _this.aryImages,
            _curIndex = _this.curIndex,
            _pIndex = (_curIndex - 1)<0?(_aryImages.length-1):(_curIndex - 1),
            _nIndex = (_curIndex + 1)>(_aryImages.length-1)?0:(_curIndex + 1);

        _aryImages[_curIndex].SetLocation((_this._imgsDivW - _aryImages[_curIndex].controlWidth)/2 + _curOffsetX);
        _aryImages[_pIndex].SetLocation(-(_this._imgContainerW - _curOffsetX));
        _aryImages[_nIndex].SetLocation(_this._imgContainerW + _curOffsetX);

        //console.log('pageX: '+touches[0].pageX+" pageY: "+touches[0].pageY);   
    }

    function fuc_touchend(event){
        var ev = event || window.event;
		lib.stopDefault(ev);
        
        if(_this.getCount()<1){return false;}

        lib.removeEvent(_this._imgContainer,"mousemove", fuc_touchmove);
        lib.removeEvent(_this._imgContainer,"mouseleave", fuc_touchend);

        if(_this.getCount()<2){return false;}

        var touches = ev.changedTouches;

        if(touches){
            var _curOffsetX = touches[0].pageX - _this._startPos.startX,
                _curOffsetY = touches[0].pageY - _this._startPos.startY;
        }else{
            var _curOffsetX = ev.clientX - _this._startPos.startX,
                _curOffsetY = ev.clientY - _this._startPos.startY;
        }

        if(_curOffsetX>_this._imgsDivW/3){
            _this.changePage('p');
        }else if(_curOffsetX<-_this._imgsDivW/3){
            _this.changePage('n');
        }else{
            _this.__ReInitImageControlPosition();
        }
    }

    //https://developer.mozilla.org/zh-CN/docs/Web/Events
    
    _this.videoSettings = {video:{/*width:{ideal:2048},height:{ideal:2048},*/facingMode:{ideal:"environment"}}};

    // 操做数组：记录操作方法
    _this.stack = [];
    _this.curStep = -1;

    var cfg = {};
    cfg.viewer = _this;
    cfg.videoSettings = _this.videoSettings;
    cfg.container = _this._imgContainer;

    _this.VideoViewer = new VideoViewer(cfg);

    _this.ImageAreaSelector = new ImageAreaSelector(cfg);

    // 设置  ImageViewer 里的元素宽高
    _this.__Init();
}

ImageViewer.prototype.beforeAddImgFromFileChooseWindow = null;
ImageViewer.prototype.afterAddImgFromFileChooseWindow = null;

ImageViewer.prototype.beforeAddImgFromDropFile = null;
ImageViewer.prototype.afterAddImgFromDropFile = null;

ImageViewer.prototype.__Init = function () {
    var _this = this;

    _this._imageViewerW = lib.getElDimensions(_this._imageViewer).clientWidth;
    _this._imageViewerH = lib.getElDimensions(_this._imageViewer).clientHeight;

    _this._imgContainerW = lib.getElDimensions(_this._imgContainer).clientWidth;
    _this._imgContainerH = lib.getElDimensions(_this._imgContainer).clientHeight;

    _this._imgsDivW = lib.getElDimensions(_this._imgsDiv).clientWidth;
    _this._imgsDivH = lib.getElDimensions(_this._imgsDiv).clientHeight;

    _this._thumbnailContainerW = lib.getElDimensions(_this._thumbnailContainer).clientWidth;
    _this._thumbnailContainerH = lib.getElDimensions(_this._thumbnailContainer).clientHeight;
    //_this._thumbnailContainerH = _this._imageViewerH*0.2;

    // Thumbnails 中每行的控件数
    _this.thumbnailImagesPerRow = Math.floor(_this._thumbnailContainerW / _this._thumbnailContainerH)>2?Math.floor(_this._thumbnailContainerW / _this._thumbnailContainerH):3;

    _this.divThumbnail.style.height = _this._thumbnailContainerH + 'px';
}

ImageViewer.prototype.adaptiveLayout = function () {
    var _this = this;

    _this.__Init();

    // 重置 ImageControl 控件的宽高和位置
    var _aryImgs = _this.aryImages;
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
    _this.__ReInitThumbnailControlPosition();

    // 重置 canvas 控件的宽高和位置
    _this.__attachImgToCanvas();

    return true;
}

ImageViewer.prototype.LoadImage = function (imgData) {
    var _this = this;
    if(_this.mode != 'view'){ 
        _this.errorString = "LoadImage(): The function is only valid in 'view' mode.";
        return false;
    }

    if(imgData instanceof Blob || imgData instanceof HTMLCanvasElement || typeof imgData == "string" || imgData instanceof String || imgData instanceof HTMLImageElement){
        lib.getBlobFromAnyImgData(imgData, function(blob){
            _this.LoadImageInner(blob);
        });
    }else if(imgData instanceof Array || imgData instanceof FileList){
        for(var i = 0; i < imgData.length; ++i){
            _this.LoadImage(imgData[i]);
        }
        return;
    }else{
        _this.errorString = "addImage(imgData): Type of 'imgData' should be 'Blob', 'HTMLCanvasElement', 'HTMLImageElement', 'String(url)', 'Array(a array of source)', 'FileList'.";
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
    cfg.index = _this.curIndex = _this.aryImages.length;

    if(url instanceof Blob){
        cfg.imageUrl = URL.createObjectURL(url);
    }else{
        cfg.imageUrl = url;
    }   
    
    // 添加 ImageControl 
    var objImageControl = new ImageControl(cfg);
    _this.aryImages.push(objImageControl);
    _this._addImgToContainer(objImageControl.GetEL());

    // 添加 ThumbnailControl 
    var objThumbnailControl = new ThumbnailControl(cfg);
    _this.aryThumbnailImages.push(objThumbnailControl);
    _this._addImgToThumbnail(objThumbnailControl.GetEL());

    _this.__ResetSelection();

    return true;
}

ImageViewer.prototype.GetBackgroundColor = function (v) {
    return this.BackgroundColor;
};

ImageViewer.prototype.SetBackgroundColor = function (v) {
    var _this = this;
    _this.BackgroundColor = v;
    
    if (_this._imgContainer)
        _this._imgContainer.style.backgroundColor = v;

    return true;
};

ImageViewer.prototype.GetThumbnaiBackgroundColor = function (v) {
    return this.ThumbnailBackgroundColor;
};

ImageViewer.prototype.SetThumbnailBackgroundColor = function (v) {
    var _this = this;
    _this.ThumbnailBackgroundColor = v;
    
    if(_this._thumbnailContainer) 
        _this._thumbnailContainer.style.backgroundColor = v;
    
    for(var i=0;i<_this.aryThumbnailImages.length;i++){
        _this.aryThumbnailImages[i].SetBackgroundColor(_this.ThumbnailBackgroundColor);
    }

    return true;
};

ImageViewer.prototype.GetThumbnailImageMargin = function () {
    var _this = this;
    return _this.ThumbnailImageMargin;
};

ImageViewer.prototype.SetThumbnailImageMargin = function (v) {
    var _this = this;

    if (v <= 0 || (v > _this._thumbnailContainerW /  _this.thumbnailImagesPerRow) || (v > _this._thumbnailContainerH)) {
        return false;
    }else{
        _this.ThumbnailImageMargin = parseInt(v);

        _this.__ReInitThumbnailControlPosition();
        return true;
    }
};

ImageViewer.prototype.showImage = function (index) {
    var _this = this;

    if(index<0 || index>_this.aryImages.length-1){ return false; }
    _this.curIndex = index;

    _this.__ReInitImageControlPosition();
    _this.__ResetSelection();

    _this._updateNumUI();
    return true;
}

ImageViewer.prototype.changePage = function(cmd){
    var _index;
    switch(cmd){
        case "f": _index = 0; break;
        case "p": _index = this.curIndex - 1; break;
        case "n": _index = this.curIndex + 1; break;
        case "l": _index = this.aryImages.length - 1; break;
        default: 
            if(arguments.length < 1 || isNaN(cmd)){
                return false;
            }else{
                _index = Math.round(cmd);
            }
    }
    /*eslint-enable indent*/
    if(_index<0){
        _index = this.aryImages.length -1;
    }else if(_index>this.aryImages.length-1){
        _index = 0;
    }

    this.showImage(_index);
    return true;
};

ImageViewer.prototype.getCurentIndex = function () {
    return this.curIndex;
}

ImageViewer.prototype.getCount = function () {
    return this.aryImages.length;
}

ImageViewer.prototype.getImage = function (index,isOri) {
    var _curIndex = index || this.curIndex;
    if(isOri){
        return this.aryImages[_curIndex];
    }else{
        return this.aryImages[_curIndex].cloneNode(true);
    }
    
}

ImageViewer.prototype.deleteImage = function (index) {
    if(arguments.length!=1){
        index = this.curIndex;
    }else if(index < 0 || index >= this.aryImages.length){ 
        return false;
    }
    
    //update image container
    this._imgsDiv.removeChild(this.aryImages[index]);
    this.aryImages.splice(index, 1);

    //update thumbnail container
    this._thumbnailContainer.removeChild(this.aryThumbnailImages[index]);
    this.aryThumbnailImages.splice(index, 1);

    if(index < this.curIndex){
        this.curIndex--;
        this._updateNumUI();
    }else if(index > this.curIndex){
        this._updateNumUI();
    }else{
        this.curIndex--;
        this.showImage(this.curIndex<0?0:this.curIndex);
    }

    return true;
}

ImageViewer.prototype.download = function(filename, index){
    if(arguments.length < 2){
        index = this.curIndex;
    }
    if(isNaN(index)){ return false; }
    index = Math.round(index);
    if(index < 0 || index >= this.aryImages.length){ return false; }
    var a = document.createElement('a');
    a.target='_blank';
    var img = this.aryImages[index];
    var blob = img.oriBlob || img.src;
    if(!filename){
        var suffix = "";
        if(blob.type){
            suffix = blob.type.substring(blob.type.indexOf('/')+1);
        }else if(-1 != suffix.indexOf(".png")){
            suffix = "png";
        }else if(-1 != suffix.indexOf(".gif")){
            suffix = "gif";
        }else if(-1 != suffix.indexOf(".jpg") || -1 != suffix.indexOf(".jpeg")){
            suffix = "jpg";
        }else{
            suffix = "png";
        }
        filename = (new Date()).getTime() + '.' + suffix;
    }
    a.download = filename;
    var objUrl = img.oriBlob ? URL.createObjectURL(blob) : img.src;
    
    a.href = objUrl;
    // var ev = new MouseEvent('click',{
    //     "view": window,
    //     "bubbles": true,
    //     "cancelable": false
    // });
    // a.dispatchEvent(ev);

    if (document.createEvent) {
        var evObj = document.createEvent('MouseEvents');
        evObj.initMouseEvent('click',true,true,window,0,0,0,0,0,false,false,true,false,0,null);
        a.dispatchEvent(evObj);
    }else if(document.createEventObject){
        var evObj = document.createEventObject();
        a.fireEvent( 'onclick', evObj );
    }else{
        //a.click();
    }
    
    //lib.fireEvent('click',a);
    
    setTimeout(function(){
        img.oriBlob ? URL.revokeObjectURL(objUrl) : null;
    }, 10000);
    return filename;
};

ImageViewer.prototype.showFileChooseWindow = function(){
    var _this = this;
    if(_this.mode != 'view'){ 
        _this.errorString = "The function is only valid in 'view' mode.";
        console.log(_this.errorString);
        return false;
    }

    _this._defaultFileInput.click();
    return true;
};

ImageViewer.prototype.enterEdit = function(){
    var _this = this;
    if(_this.mode != 'view'){
        _this.errorString = "enterEdit(): The function is invalid in current mode.";
        console.log(_this.errorString);
        return false;
    }else if(_this.curIndex < 0){
        _this.errorString = "enterEdit(): There is no image in the instance.";
        console.log(_this.errorString);
        return false;
    }
    _this.mode = 'edit';
    _this.__attachImgToCanvas();
    _this.ImageAreaSelector.showCropRect();
    _this.__pushStack('enterEdit');
};

ImageViewer.prototype.__pushStack = function(funName){
    var _this = this;
    var _curStack = {
        fun: funName,
        crop: _this.ImageAreaSelector.cropArea,
        transform: $(_this._canvas).getTransform(),
        srcBlob: _this.aryImages[_this.curIndex].imageUrl
    };

    _this.stack.push(_curStack);
    _this.curStep++;
    return true;
}

ImageViewer.prototype.cancelEdit = function(){
    var _this = this;

    if(_this.mode == 'view'){ return false; }
    _this.mode = 'view';

    _this._canvas.style.display = 'none';
    _this.showImage(_this.curIndex);

    _this.ImageAreaSelector.hideCropRect();

    return true;
};

ImageViewer.prototype.rotateLeft = function(){
    var _this = this;
    if(_this.mode != 'edit'){ return false; }

    var transformOri = $(_this._canvas).getTransform();
    var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,-1,1,0,0,0), transformOri);
    $(_this._canvas).setTransform(transformNew);
    _this.__pushStack('rotateLeft');

    return true;
};

ImageViewer.prototype.rotateRight = function(){
    var _this = this;
    if(_this.mode != 'edit'){ return false; }
    
    var transformOri = $(_this._canvas).getTransform();
    var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,1,-1,0,0,0), transformOri);
    $(_this._canvas).setTransform(transformNew);
    _this.__pushStack('rotateRight');

    return true;
};

ImageViewer.prototype.__attachImgToCanvas = function(){
    var _this = this;
    if(_this.mode != 'edit') return;

    var curImg = _this.aryImages[_this.curIndex];
    curImg.SetVisible(false);
    
    var canvasAspectRatio = _this._imgsDivW/_this._imgsDivH;
	var imageAspectRatio = curImg._origImageWidth/curImg._origImageHeight;
	if(canvasAspectRatio>imageAspectRatio){
		curImg.drawArea.height = _this._imgsDivH;
		curImg.drawArea.width = imageAspectRatio*_this._imgsDivH;

		curImg.drawArea.x = Math.floor((_this._imgsDivW-curImg.drawArea.width)/2);
		curImg.drawArea.y = 0;
	}else{
		curImg.drawArea.width = _this._imgsDivW;
		curImg.drawArea.height = curImg.drawArea.width/imageAspectRatio;

		curImg.drawArea.x = 0;
		curImg.drawArea.y = Math.floor((_this._imgsDivH-curImg.drawArea.height)/2);
	}

    _this._canvas.style.display = '';
    _this._canvas.style.left = curImg.drawArea.x + 'px';
    _this._canvas.style.top = curImg.drawArea.y + 'px';
    _this._canvas.setAttribute("width",curImg.drawArea.width);
    _this._canvas.setAttribute("height",curImg.drawArea.height);

    var ctx = _this._canvas.getContext("2d");
    ctx.clearRect(0, 0, curImg.drawArea.width, curImg.drawArea.height);
    ctx.drawImage(curImg.objImage, 0, 0, curImg.drawArea.width, curImg.drawArea.height);
}

ImageViewer.prototype._addImgToContainer = function (objImg) {
    var _this = this;

    _this._imgsDiv.appendChild(objImg);

    _this.__ReInitImageControlPosition();
    return true;
}

ImageViewer.prototype._addImgToThumbnail = function (objThumb) {
    var _this = this;

    _this.divThumbnail.appendChild(objThumb);

    _this.__ReInitThumbnailControlPosition();
    _this.__recalculateDivThumbnailSize();

    return true;
}

ImageViewer.prototype.__ResetSelection = function () {
    var _this = this, i = 0;

    // 更新 imagControl 的的选择状态
    for (i = 0; i < _this.aryImages.length; i++) {
        var imgControl = _this.aryImages[i];
        if (imgControl.cIndex != _this.curIndex)
        imgControl.SetVisible(false);
        else if (imgControl.cIndex == _this.curIndex)
        imgControl.SetVisible(true);
    }

    // 更新 thumbnail 的选择状态
    for (i = 0; i < _this.aryThumbnailImages.length; i++) {
        var thumbControl = _this.aryThumbnailImages[i];
        if (thumbControl.bVisible) {
            if (thumbControl.cIndex != _this.curIndex)
                thumbControl.SetSelect(false);
            else if (thumbControl.cIndex == _this.curIndex)
                thumbControl.SetSelect(true);
        }
    }
};

ImageViewer.prototype.__recalculateDivThumbnailSize = function () {
    var _this = this;
    var aryThumbImages = _this.aryThumbnailImages;
    var _newWidth = _this.ThumbnailImageMargin;
    for(var i=0;i<aryThumbImages.length;i++){
        _newWidth += aryThumbImages[i].GetControlWidth() + _this.ThumbnailImageMargin;
    }
    _this.divThumbnail.style.width = (_newWidth>_this._thumbnailContainerW?_newWidth:_this.imageViewWidth) + 'px';

    _this._thumbnailContainer.scrollLeft = _this._thumbnailContainer.scrollWidth;

    return true;
}

ImageViewer.prototype.__ReInitImageControlPosition = function () {
    var _this = this;
    
    var _aryImages =  _this.aryImages,
        _curIndex = _this.curIndex,
        _pIndex = (_curIndex - 1)<0?(_aryImages.length-1):(_curIndex - 1),
        _nIndex = (_curIndex + 1)>(_aryImages.length-1)?0:(_curIndex + 1);

    for(var i=0;i<_aryImages.length;i++){
        if(i == _curIndex){
            _aryImages[_curIndex].SetLocation();
        }else if(i==_pIndex){
            _aryImages[_pIndex].SetLocation(-_this._imgContainerW);
        }else if(i==_nIndex){
            _aryImages[_nIndex].SetLocation(_this._imgContainerW);
        }else{
            _aryImages[i].SetLocation(_this._imgContainerW);
        }
    }

    return true;
}

ImageViewer.prototype.__ReInitThumbnailControlPosition = function () {
    var _this = this, x, y, i;

    _this.__InitThumbnailControlsSize();

    x = _this.ThumbnailImageMargin;
    y = _this.ThumbnailImageMargin;

    for (i = 0; i < _this.aryThumbnailImages.length; i++) {
        var thumbnailControl = _this.aryThumbnailImages[i], bindIndex = thumbnailControl.cIndex;
        
        // avoid unnecessary action
        if (thumbnailControl._width != _this.ThumbnailControlW || thumbnailControl._height != _this.ThumbnailControlH){
            thumbnailControl.ChangeControlSize(_this.ThumbnailControlW, _this.ThumbnailControlH);
        }				

        thumbnailControl.SetLocation(x, y);

        x = thumbnailControl.Left + _this.ThumbnailControlW + _this.ThumbnailImageMargin;
        y = _this.ThumbnailImageMargin;
        
        // check bind index
        if(bindIndex<0 || bindIndex>=_this.aryThumbnailImages.length) {
            thumbnailControl.ClearControl();
            continue;
        }
        
    }
};

ImageViewer.prototype.__InitThumbnailControlsSize = function () {
    //计算 Thumbnail 控件的 _this.ThumbnailControlW;  _this.ThumbnailControlH; 
    var _this = this;

    var iTotalWidth = _this._thumbnailContainerW - _this.ThumbnailImageMargin,
        iTotalHeight = _this._thumbnailContainerH - _this.ThumbnailImageMargin;

    _this.ThumbnailControlW = iTotalWidth / _this.thumbnailImagesPerRow - _this.ThumbnailImageMargin;
    _this.ThumbnailControlH = iTotalHeight - _this.ThumbnailImageMargin;

};

ImageViewer.prototype.showVideo = function(){
    this.VideoViewer.showVideo();
    return true;
};

ImageViewer.prototype.onNumChange = null;
ImageViewer.prototype._updateNumUI = function(){
    lib.doCallbackNoBreak(this.onNumChange,[this.curIndex, this.aryImages.length]);
}