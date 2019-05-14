 function ImageViewer(ImageViewerID){
    var _this = this;
    var containerDiv = [
        '<div class="imageContainer">',
            '<div class="kPainterBox">',
                '<div class="kPainterImgsDiv">',
                    '<canvas class="kPainterCanvas" style="display:none;left:0;top:0;"></canvas>',
                '</div',
                '><div class="kPainterCroper" style="width:50px;height:50px;display:none;">',
                    '<div class="kPainterCells">',
                        '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>',
                    '</div',
                    '><div class="kPainterBigMover" data-orient="0,0" style="display:none"></div',
                    '><div class="kPainterEdges">',
                        '<div data-orient="-1,0"></div',
                        '><div data-orient="0,-1"></div',
                        '><div data-orient="1,0"></div',
                        '><div data-orient="0,1"></div>',
                    '</div',
                    '><div class="kPainterCorners">',
                        '<div data-orient="-1,-1"><i></i></div',
                        '><div data-orient="1,-1"><i></i></div',
                        '><div data-orient="1,1"><i></i></div',
                        '><div data-orient="-1,1"><i></i></div>',
                    '</div',
                    '><div class="kPainterMover" data-orient="0,0">',
                        '<div></div>',
                        '<svg width="20" height="20" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 896q0 26-19 45l-256 256q-19 19-45 19t-45-19-19-45v-128h-384v384h128q26 0 45 19t19 45-19 45l-256 256q-19 19-45 19t-45-19l-256-256q-19-19-19-45t19-45 45-19h128v-384h-384v128q0 26-19 45t-45 19-45-19l-256-256q-19-19-19-45t19-45l256-256q19-19 45-19t45 19 19 45v128h384v-384h-128q-26 0-45-19t-19-45 19-45l256-256q19-19 45-19t45 19l256 256q19 19 19 45t-19 45-45 19h-128v384h384v-128q0-26 19-45t45-19 45 19l256 256q19 19 19 45z" fill="#fff"/></svg>',
                    '</div>',
                '</div',
                '><div class="kPainterPerspect" style="display:none;">',
                    '<canvas class="kPainterPerspectCvs"></canvas',
                    '><div class="kPainterPerspectCorner" data-index="0">lt</div',
                    '><div class="kPainterPerspectCorner" data-index="1">rt</div',
                    '><div class="kPainterPerspectCorner" data-index="2">rb</div',
                    '><div class="kPainterPerspectCorner" data-index="3">lb</div>',
                '</div',
                '><div class="kPainterGesturePanel"></div>',
            '</div>',
        '</div>',
        '<div class="thumbnailContainer"></div>'
    ].join('');
    _this._imageViewer = document.getElementById(ImageViewerID);
    _this._imageViewer.innerHTML = containerDiv;
    _this._Canvas = lib._querySelectorAll(_this._imageViewer,'canvas.kPainterCanvas')[0];
    _this._imgContainer = lib._querySelectorAll(_this._imageViewer,'div.imageContainer')[0];
    _this._imgsDiv = lib._querySelectorAll(_this._imageViewer,'div.kPainterImgsDiv')[0];
    _this._thumbnailContainer = lib._querySelectorAll(_this._imageViewer,'div.thumbnailContainer')[0];

    _this._defaultFileInput = document.createElement("input");
    _this._defaultFileInput.setAttribute("type","file");
    _this._defaultFileInput.setAttribute("accept","image/bmp,image/gif,image/jpeg,image/png,image/webp");
    _this._defaultFileInput.setAttribute("multiple","true");

    _this._imageViewerW = lib.getElDimensions(_this._imageViewer).clientWidth;
    _this._imageViewerH = lib.getElDimensions(_this._imageViewer).clientHeight;

    _this._imgContainerW = lib.getElDimensions(_this._imgContainer).clientWidth;
    _this._imgContainerH = lib.getElDimensions(_this._imgContainer).clientHeight;

    _this._imgsDivW = lib.getElDimensions(_this._imgsDiv).clientWidth;
    _this._imgsDivH = lib.getElDimensions(_this._imgsDiv).clientHeight;

    _this._thumbnailContainerW = lib.getElDimensions(_this._thumbnailContainer).clientWidth;
    _this._thumbnailContainerH = _this._imageViewerH*0.2;

    _this.curIndex = -1;
    _this.aryImages = [];

    _this.aryThumbnailImages = [];
    // Thumbnails 中每行的控件数
    _this.thumbnailImagesPerRow = Math.floor(_this._thumbnailContainerW / _this._thumbnailContainerH)>2?Math.floor(_this._thumbnailContainerW / _this._thumbnailContainerH):3;
    // Thumbnails 中多个控件之间的距离
    _this.ThumbnailImageMargin = 10;
    // Thumbnails 中的小控件的宽度
    _this.ThumbnailControlW = 0;
    // Thumbnails 中的小控件的高度
    _this.ThumbnailControlH = 0;
    _this.divThumbnail = document.createElement('div');
	_this.divThumbnail.style.width = _this._thumbnailContainerW  + 'px';
    _this.divThumbnail.style.height = _this._thumbnailContainerH + 'px';
    _this._thumbnailContainer.appendChild(_this.divThumbnail);

    lib.addEvent(_this._defaultFileInput,"change", function(event) {
        var ev = event || window.event;
        _this._addFilesFromLocal(ev.target.files);
    });

    lib.addEvent(_this._imageViewer,"dragover", function(event) {
        var ev = event || window.event;
		lib.stopDefault(ev);
    });

    lib.addEvent(_this._imageViewer,"drop", function(event) {
        var ev = event || window.event;
		lib.stopDefault(ev);
        _this._addFilesFromLocal(ev.dataTransfer.files);
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

        _aryImages[_curIndex].SetLocation((_this._imgsDivW - _aryImages[_curIndex]._width)/2 + _curOffsetX);
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

        var _aryImages =  _this.aryImages,
            _curIndex = _this.curIndex,
            _pIndex = (_curIndex - 1)<0?(_aryImages.length-1):(_curIndex - 1),
            _nIndex = (_curIndex + 1)>(_aryImages.length-1)?0:(_curIndex + 1);

        if(_curOffsetX>_this._imgsDivW/3){
            _this.changePage('p');
        }else if(_curOffsetX<-_this._imgsDivW/3){
            _this.changePage('n');
        }else{
            // _aryImages[_curIndex].style.left = (_this._imgsDivW - _aryImages[_curIndex].width)/2 + 'px';
            // _aryImages[_pIndex].style.right = _this._imgContainerW + 'px';
            // _aryImages[_nIndex].style.left = _this._imgContainerW + 'px';
            _this.__ReInitImageControlPosition();
        }
    }

    //https://developer.mozilla.org/zh-CN/docs/Web/Events
    
}

ImageViewer.prototype.adaptiveLayout = function () {
    var _this = this;
    this._imgsDivW = lib.getElDimensions(this._imgsDiv).clientWidth;
    this._imgsDivH = lib.getElDimensions(this._imgsDiv).clientHeight;

    this._thumbnailContainerW = lib.getElDimensions(this._thumbnailContainer).clientWidth;
    this._thumbnailContainerH = lib.getElDimensions(this._thumbnailContainer).clientHeight;
}

ImageViewer.prototype.LoadImage = function (url) {
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

ImageViewer.prototype.LoadImageWithBlob = function (url) {
    var _this = this;
    lib.getBlobFromAnyImgData(url, function(blob){
        _this.LoadImage(blob);
    });

    return true;
}

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
    this._defaultFileInput.click();
    return true;
};

ImageViewer.prototype._addFilesFromLocal = function (files) {
    var _this = this;
    if(files instanceof Array || files instanceof FileList){
        for(var i = 0; i < files.length; i++){
            _this._addFilesFromLocal(files[i]);
        }
    }else{
        var reader = new FileReader();
        reader.onload = function(){
            _this.LoadImageWithBlob(reader.result);
        };
        reader.readAsDataURL(files);
    }
}

ImageViewer.prototype._addImgToContainer = function (objImageControl) {
    var _this = this;

    _this._imgsDiv.appendChild(objImageControl);

    _this.__ReInitImageControlPosition();
    return true;
}

ImageViewer.prototype._addImgToThumbnail = function (objThumbnailControl) {
    var _this = this;

    _this.divThumbnail.appendChild(objThumbnailControl);

    _this.__ReInitThumbnailControlPosition();
    _this.__recalculateDivThumbnailSize();

    return true;
}

ImageViewer.prototype.__ResetSelection = function () {
    var _this = this, i = 0;

    // Update selected image in Thumbnail
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

    _this.ThumbnailControlW = parseInt(iTotalWidth / _this.thumbnailImagesPerRow - _this.ThumbnailImageMargin);
    _this.ThumbnailControlH = parseInt(iTotalHeight - _this.ThumbnailImageMargin);

};


ImageViewer.prototype.onNumChange = null;
ImageViewer.prototype._updateNumUI = function(){
    lib.doCallbackNoBreak(this.onNumChange,[this.curIndex, this.aryImages.length]);
}