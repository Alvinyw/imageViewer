(function (ML) {

    "use strict";
    
    var lib = ML;

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

        _this.kPainterCells = lib._querySelectorAll(_this.container,'div.kPainterCells > div');

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

        // 控件的 UI 属性
        _this.borderColor = 'red';
        _this.backgroundColor = 'rgba(255,0,0,0.2)';

        // 鼠标按下时控件的初始信息
        _this._startPos = {
            targetNode: -1, // 控件当前拖拽的边/角：边 -（1：左，2：上，3：右，4：下），角 - （5：左上，6：右上，7：右下，8：左下）
            startX: 0, // 鼠标落点位置
            startY: 0,
            width: 0, // 开始拖拽是控件的高
            height: 0,
            left: 0, // 开始拖拽是控件的位置
            top: 0
        };

        // 画布实时的裁切信息：相对于伸缩后的图片
        _this.drawArea = {
            width: 0,
            height: 0,
            x: 0,
            y: 0
        };

        // 实际的裁切信息：相对于原图
        _this.cropArea = null;

        _this.__Init();

    }

    ImageAreaSelector.prototype.__Init = function(){
        var _this = this;

        // 给控件四条边和四个角添加响应点击事件
        for(var i=0;i<4;i++){
            lib.addEvent(_this.kPainterCorners[i],"mousedown", fuc_touchstart);
            lib.addEvent(_this.kPainterCorners[i],"touchstart", fuc_touchstart);

            lib.addEvent(_this.kPainterEdges[i],"mousedown", fuc_touchstart);
            lib.addEvent(_this.kPainterEdges[i],"touchstart", fuc_touchstart);
        }

        function fuc_touchstart(event){
            var ev = event || window.event;
            lib.stopDefault(ev);

            _this.dragging = true;

            lib.addEvent(_this.container,"mousemove", fuc_touchmove);
            lib.addEvent(_this.container,"mouseleave", fuc_touchend);
            lib.addEvent(_this.container,"mouseup", fuc_touchend);

            lib.addEvent(_this.container,"touchmove", fuc_touchmove);
            lib.addEvent(_this.container,"touchend", fuc_touchend);


            var touches = ev.changedTouches;

            var curX,curY;
            if(touches){
                //Multi-contact is prohibited
                if(touches.length!=1){return false;}
                curX = touches[0].pageX;
                curY = touches[0].pageY;
            }else{
                curX = ev.clientX;
                curY = ev.clientY;
            }
            _this._startPos = {
                targetNode: parseInt(this.getAttribute("data-orient")),
                startX: curX,
                startY: curY,
                width: _this.drawArea.width,
                height: _this.drawArea.height,
                left: _this.drawArea.x,
                top: _this.drawArea.y
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

            // 控件的实时位置和大小信息
            var curW,curH,curL,curT;

            switch(sp.targetNode)
            {
            case 1:
                // 拖拽 左侧边框
                curW = (sp.width-_curOffsetX)>(sp.left + sp.width)?(sp.left + sp.width):(sp.width-_curOffsetX)<_this.minWidth?_this.minWidth:(sp.width-_curOffsetX);
                curH = sp.height;
                curL = sp.left + sp.width - curW;
                curT = sp.top;
                break;
            case 2:
                // 拖拽 上侧边框
                curW = sp.width;
                curH = (sp.height-_curOffsetY)>(sp.top + sp.height)?(sp.top + sp.height):(sp.height-_curOffsetY)<_this.minHeight?_this.minHeight:(sp.height-_curOffsetY);
                curL = sp.left;
                curT = sp.top + sp.height - curH;
                break;
            case 3:
                // 拖拽 右侧边框
                curW = (sp.width+_curOffsetX)>(_this.maxWidth-sp.left)?(_this.maxWidth-sp.left):(sp.width+_curOffsetX)<_this.minWidth?_this.minWidth:(sp.width+_curOffsetX);
                curH = sp.height;
                curL = sp.left;
                curT = sp.top;
                break;
            case 4:
                // 拖拽 下侧边框
                curW = sp.width;
                curH = (sp.height+_curOffsetY)>(_this.maxHeight-sp.top)?(_this.maxHeight-sp.top):(sp.height+_curOffsetY)<_this.minHeight?_this.minHeight:(sp.height+_curOffsetY);
                curL = sp.left;
                curT = sp.top;
                break;
            case 5:
                // 拖拽 左上顶点
                curW = (sp.width-_curOffsetX)>(sp.left + sp.width)?(sp.left + sp.width):(sp.width-_curOffsetX)<_this.minWidth?_this.minWidth:(sp.width-_curOffsetX);
                curH = (sp.height-_curOffsetY)>(sp.top + sp.height)?(sp.top + sp.height):(sp.height-_curOffsetY)<_this.minHeight?_this.minHeight:(sp.height-_curOffsetY);
                curL = sp.left + sp.width - curW;
                curT = sp.top + sp.height - curH;
                break;
            case 6:
                // 拖拽 右上顶点
                curW = (sp.width+_curOffsetX)>(_this.maxWidth-sp.left)?(_this.maxWidth-sp.left):(sp.width+_curOffsetX)<_this.minWidth?_this.minWidth:(sp.width+_curOffsetX);
                curH = (sp.height-_curOffsetY)>(sp.top + sp.height)?(sp.top + sp.height):(sp.height-_curOffsetY)<_this.minHeight?_this.minHeight:(sp.height-_curOffsetY);
                curL = sp.left;
                curT = sp.top + sp.height - curH;
                break;
            case 7:
                // 拖拽 右下顶点
                curW = (sp.width+_curOffsetX)>(_this.maxWidth-sp.left)?(_this.maxWidth-sp.left):(sp.width+_curOffsetX)<_this.minWidth?_this.minWidth:(sp.width+_curOffsetX);
                curH = (sp.height+_curOffsetY)>(_this.maxHeight-sp.top)?(_this.maxHeight-sp.top):(sp.height+_curOffsetY)<_this.minHeight?_this.minHeight:(sp.height+_curOffsetY);
                curL = sp.left;
                curT = sp.top;
                break;
            case 8:
                // 拖拽 左下顶点
                curW = (sp.width-_curOffsetX)>(sp.left + sp.width)?(sp.left + sp.width):(sp.width-_curOffsetX)<_this.minWidth?_this.minWidth:(sp.width-_curOffsetX);
                curH = (sp.height+_curOffsetY)>(_this.maxHeight-sp.top)?(_this.maxHeight-sp.top):(sp.height+_curOffsetY)<_this.minHeight?_this.minHeight:(sp.height+_curOffsetY);
                curL = sp.left + sp.width - curW;
                curT = sp.top;
                break;
            default:
                return;
            }

            _this.__updateDrawArea(curW, curH, curL, curT);
            
        } 

        function fuc_touchend(event){
            var ev = event || window.event;
            lib.stopDefault(ev);
            if(!_this.dragging) return;
            _this.dragging = false;

            lib.removeEvent(_this.container,"mousemove", fuc_touchmove);
            lib.removeEvent(_this.container,"mouseleave", fuc_touchend);
            lib.removeEvent(_this.container,"mouseup", fuc_touchend);

            lib.removeEvent(_this.container,"touchmove", fuc_touchmove);
            lib.removeEvent(_this.container,"touchend", fuc_touchend);
        }
    }

    ImageAreaSelector.prototype.SetVisible = function(bVisible){
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

    ImageAreaSelector.prototype.ShowCropRect = function(rotateTime){
        var _this = this;
        if(_this.viewer.mode != 'edit') return;
        _this.isCropRectShowing = true;
        _this.SetVisible(true);

        if(rotateTime == 1){
            // rotate 次数为偶数
            _this.maxWidth = _this.viewer._canvasArea.width;
            _this.maxHeight = _this.viewer._canvasArea.height;
        }else{
            // rotate 次数为奇数
            _this.maxWidth = _this.viewer._canvasArea.height;
            _this.maxHeight = _this.viewer._canvasArea.width;
        }
        _this.minLeft = (_this.viewer._imgContainerW -_this.maxWidth)/2;
        _this.minTop = (_this.viewer._imgContainerH -_this.maxHeight)/2;

        _this.__updateDrawArea(_this.maxWidth, _this.maxHeight, 0, 0);
        return true;
    }

    ImageAreaSelector.prototype.__getDrawArea = function(){
        var _this = this;
        var curDrawRect = {
            width: _this.drawArea.width,
            height: _this.drawArea.height,
            x: _this.drawArea.x,
            y: _this.drawArea.y
        };
        return curDrawRect;
    }

    ImageAreaSelector.prototype.__getCropArea = function(){
        var _this = this;
    }

    ImageAreaSelector.prototype.__updateDrawArea = function(w,h,x,y) {
        var _this = this;

        _this.drawArea.width = w;
        _this.drawArea.height = h;
        _this.drawArea.x = x;
        _this.drawArea.y = y;

        _this.__updatePosition(w,h,x+_this.minLeft,y+_this.minTop);
    }

    ImageAreaSelector.prototype.__updatePosition = function(w,h,l,t) {
        var _this = this;
        _this.left = l;
        _this.top = t;

        _this.kPainterCroper.style.width = w + 'px';
        _this.kPainterCroper.style.height = h + 'px';
        _this.kPainterCroper.style.left = _this.left + 'px';
        _this.kPainterCroper.style.top = _this.top + 'px';    
        return true;
    }

    ImageAreaSelector.prototype.HideCropRect = function(){
        var _this = this;
        _this.isCropRectShowing = false;
        _this.SetVisible(false);

        return true;
    }

    ML.ImageAreaSelector = ImageAreaSelector;

})(MBC.Lib);