 function ImageAreaSelector(cfg){
    var _this = this;
    var containerDiv = [
            '<div class="kPainterCroper" style="display:none;">',
                '<div class="kPainterCells">',
                    '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>',
                '</div',
                '><div class="kPainterBigMover" data-orient="0,0" style="display:none"></div',
                '><div class="kPainterEdges">',
                    '<div data-orient="1"></div',
                    '><div data-orient="2"></div',
                    '><div data-orient="3"></div',
                    '><div data-orient="4"></div>',
                '</div',
                '><div class="kPainterCorners">',
                    '<div data-orient="5"><i></i></div',
                    '><div data-orient="6"><i></i></div',
                    '><div data-orient="7"><i></i></div',
                    '><div data-orient="8"><i></i></div>',
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
            '><div class="kPainterGesturePanel"></div>'
    ].join('');
    
    _this.viewer = cfg.viewer;
    _this.container = cfg.container;

    _this.container.insertAdjacentHTML('beforeEnd', containerDiv);
    _this.kPainterCroper = lib._querySelectorAll(_this.container,'div.kPainterCroper')[0];

    // 控件的四个顶点
    _this.kPainterCorners = lib._querySelectorAll(_this.container,'div.kPainterCorners > div');
    // 控件的四条边框
    _this.kPainterEdges = lib._querySelectorAll(_this.container,'div.kPainterEdges > div');

    _this.bVisible = false;
    _this.isAutoShowCropUI = true;
    _this.isCropRectShowing = false;

    // 是否选中可拖拽的边或点
    _this.dragging = false;
    
    // 控件的最大宽高
    _this.maxWidth = 0;
    _this.maxHeight = 0;

    // 控件的最小宽高
    _this.minWidth = 50;
    _this.minHeight = 50;

    // 最小的边距
    _this.minTop = 0;
    _this.minLeft = 0;

    // 当前边距信息
    _this.top = 0;
    _this.left = 0;

    // 控件开始拖拽的位置信息
    _this._startPos = {
        targetNode: -1, // 控件当前拖拽的边/角：边 -（1：左，2：上，3：右，4：下），角 - （5：左上，6：右上，7：右下，8：左下）
        startX: 0, // 鼠标落点位置
		startY: 0,
		width: 0, // 开始拖拽是控件的高
        height: 0,
        left: 0, // 开始拖拽是控件的位置
        top: 0
    };

    // 裁切信息
    _this.cropArea = {
		width: 0,
		height: 0,
		x: 0,
		y: 0
    };

    _this.__Init();

}

ImageAreaSelector.prototype.__Init = function (){
    var _this = this;

    // 给控件四条边和四个角添加响应点击事件
    for(var i=0;i<4;i++){
        lib.addEvent(_this.kPainterCorners[i],"mousedown", fuc_touchstart);
        lib.addEvent(_this.kPainterEdges[i],"mousedown", fuc_touchstart);
    }

    function fuc_touchstart(event){
        var ev = event || window.event;
		lib.stopDefault(ev);

        _this.dragging = true;

        lib.addEvent(_this.container,"mousemove", fuc_touchmove);
        lib.addEvent(_this.container,"mouseleave", fuc_touchend);
        lib.addEvent(_this.container,"mouseup", fuc_touchend);
        for(var i=0;i<4;i++){
            //lib.addEvent(_this.kPainterCorners[i],"mousemove", fuc_touchmove);
            //lib.addEvent(_this.kPainterCorners[i],"mouseleave", fuc_touchend);
    
           // lib.addEvent(_this.kPainterEdges[i],"mousemove", fuc_touchmove);
            //lib.addEvent(_this.kPainterEdges[i],"mouseleave", fuc_touchend);
        }

        var touches = ev.changedTouches;

        if(touches){
            //Multi-contact is prohibited
            if(touches.length!=1){return false;}

            _this._startPos = {
                targetNode: parseInt(this.getAttribute("data-orient")),
                startX: touches[0].pageX,
                startY: touches[0].pageY,
                width: _this.cropArea.width,
                height: _this.cropArea.height,
                left: _this.cropArea.x,
                top: _this.cropArea.y
            }
        }else{
            _this._startPos = {
                targetNode: parseInt(this.getAttribute("data-orient")),
                startX: ev.clientX,
                startY: ev.clientY,
                width: _this.cropArea.width,
                height: _this.cropArea.height,
                left: _this.cropArea.x,
                top: _this.cropArea.y
            }
        }

    } 

    function fuc_touchmove(event){
        var ev = event || window.event;
		lib.stopDefault(ev);
        if(!_this.dragging) return;
        var touches = ev.changedTouches;
        var sp = _this._startPos;

        if(touches){
            var _curOffsetX = touches[0].pageX - sp.startX,
                _curOffsetY = touches[0].pageY - sp.startY;
        }else{
            var _curOffsetX = ev.clientX - sp.startX,
                _curOffsetY = ev.clientY - sp.startY;
        }

        switch(sp.targetNode)
        {
        case 1:
            // 拖拽 左侧边框
            _this.__setCropArea(sp.width-_curOffsetX, sp.height, sp.left+_curOffsetX, sp.top);
            break;
        case 2:
            // 拖拽 上侧边框
            _this.__setCropArea(sp.width, sp.height-_curOffsetY, sp.left, sp.top+_curOffsetY);
            break;
        case 3:
            // 拖拽 右侧边框
            _this.__setCropArea(sp.width+_curOffsetX, sp.height, sp.left, sp.top);
            break;
        case 4:
            // 拖拽 下侧边框
            _this.__setCropArea(sp.width, sp.height+_curOffsetY, sp.left, sp.top);
            break;
        case 5:
            // 拖拽 左上顶点
            _this.__setCropArea(sp.width-_curOffsetX, sp.height-_curOffsetY, sp.left+_curOffsetX, sp.top+_curOffsetY);
            break;
        case 6:
            // 拖拽 右上顶点
            _this.__setCropArea(sp.width+_curOffsetX, sp.height-_curOffsetY, sp.left, sp.top+_curOffsetY);
            break;
        case 7:
            // 拖拽 右下顶点
            _this.__setCropArea(sp.width+_curOffsetX, sp.height+_curOffsetY, sp.left, sp.top);
            break;
        case 8:
            // 拖拽 左下顶点
            _this.__setCropArea(sp.width-_curOffsetX, sp.height+_curOffsetY, sp.left+_curOffsetX, sp.top);
            break;
        default:
            return;
        }
        
    } 

    function fuc_touchend(event){
        var ev = event || window.event;
        lib.stopDefault(ev);
        if(!_this.dragging) return;
        _this.dragging = false;

        lib.removeEvent(_this.container,"mousemove", fuc_touchmove);
        lib.removeEvent(_this.container,"mouseleave", fuc_touchend);
        lib.removeEvent(_this.container,"mouseup", fuc_touchend);
    }
}

ImageAreaSelector.prototype.setVisible = function (bVisible) {
    var _this = this;
    if(bVisible){
        _this.bVisible = true;
        _this.kPainterCroper.style.display = '';
    }else{
        _this.bVisible = false;
        _this.kPainterCroper.style.display = 'none';
    }

    return true;
}

ImageAreaSelector.prototype.showCropRect = function () {
    var _this = this;
    if(_this.viewer.mode != 'edit') return;
    _this.isCropRectShowing = true;
    _this.setVisible(true);

    var curImg = _this.viewer.aryImages[_this.viewer.getCurentIndex()];
    _this.maxWidth = curImg.drawArea.width;
    _this.maxHeight = curImg.drawArea.height;
    _this.minLeft = curImg.drawArea.x;
    _this.minTop = curImg.drawArea.y;

    _this.__setCropArea(_this.maxWidth, _this.maxHeight, 0, 0);
    return true;
}

ImageAreaSelector.prototype.__setCropArea = function (w,h,x,y) {
    var _this = this;

    w = (w<_this.minWidth)?_this.minWidth:(w>(_this.maxWidth))?(_this.maxWidth):w;
    h = (h<_this.minHeight)?_this.minHeight:(h>(_this.maxHeight))?(_this.maxHeight):h;
    x = (x>(_this.maxWidth -_this.minWidth))?(_this.maxWidth -_this.minWidth):x<0?0:x;
    y = (y>(_this.maxHeight -_this.minHeight))?(_this.maxHeight -_this.minHeight):y<0?0:y;

    _this.cropArea.width = w;
    _this.cropArea.height = h;
    _this.cropArea.x = x;
    _this.cropArea.y = y;

    _this.__updatePositionAndCropArea(w,h,x+_this.minLeft,y+_this.minTop);
}

ImageAreaSelector.prototype.__updatePositionAndCropArea = function (w,h,l,t) {
    var _this = this;
    _this.left = l;
    _this.top = t;

    _this.kPainterCroper.style.width = w + 'px';
    _this.kPainterCroper.style.height = h + 'px';
    _this.kPainterCroper.style.left = _this.left + 'px';
    _this.kPainterCroper.style.top = _this.top + 'px';    
    return true;
}

ImageAreaSelector.prototype.hideCropRect = function () {
    var _this = this;
    _this.isCropRectShowing = false;
    _this.setVisible(false);

    return true;
}
