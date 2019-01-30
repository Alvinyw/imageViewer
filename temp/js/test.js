/*global Vue, $, KPainter, kConsoleLog*/

var isMobileSafari = (/iPhone/i.test(navigator.platform) || /iPod/i.test(navigator.platform) || /iPad/i.test(navigator.userAgent)) && !!navigator.appVersion.match(/(?:Version\/)([\w\._]+)/); 
if(isMobileSafari){
    /* In safari at ios, 
     * when open this page by '_blank' mode,
     * and run the script in every pages which this page can link to, 
     * can disable ios safari swipe back and forward.
     */
    window.history.replaceState(null, null, "#");
}

$("#mdl-view").on("touchmove", function(ev){
    ev.preventDefault();
    ev.stopPropagation();
});

var painter = new KPainter();
var painterDom = painter.getHtmlElement();
painterDom.style.width = '100%';
painterDom.style.height = '80%';
painterDom.style.position = 'absolute';
painterDom.style.left = '0';
painterDom.style.bottom = '0';

var appTestMbc = new Vue({
    el: '#app-testMbc',
    data: {
        curIndex: painter.getCurIndex(),
        count: painter.getCount(),
        isEditing: painter.isEditing(),
        width: NaN,
        height: NaN,
        zoom: NaN,
        editWidth: NaN,
        editHeight: NaN,
        curStep: NaN,
        stepCount: NaN,
        protectedSteps: null,
        cropRectArea: null,
        freeTransformCornerPos: null,

        //Image Store
        defaultFileInputAccept: painter.defaultFileInput.accept,
        defaultFileInputMultiple: painter.defaultFileInput.multiple,
        addImageSrc: '',
        addedImageMaxWH: painter.addedImageMaxWH,
        isShowNewImgWhenAdd: painter.isShowNewImgWhenAdd,
        changePageCmd: '',
        downloadFileName: '',
        //Gesturer
        leftDoubleClickZoomRate: painter.leftDoubleClickZoomRate,
        rightDoubleClickZoomRate: painter.rightDoubleClickZoomRate,
        allowedTouchMoveSwitchImgOverBoundary: painter.allowedTouchMoveSwitchImgOverBoundary,
        zoomNum: 1,
        zoomIsRate: false,
        //Basic Edit
        saveIsCover: false,
        stepImgsGCThreshold: painter.stepImgsGCThreshold,
        numAddProtectedStep: 0,
        numRemoveProtectedStep: 0,
        numSetCurStep: 0,
        resizeWidth: 100,
        resizeHeight: 100,
        //Crop
        isAutoShowCropUI: painter.isAutoShowCropUI,
        cropRectStyle: 0,
        cropRectMinW: painter.cropRectMinW,
        cropRectMinH: painter.cropRectMinH,
        cropRectLeft: -0.5,
        cropRectTop: -0.5,
        cropRectRight: 0.5,
        cropRectBottom: 0.5,
        //Free Transform
        x0: -0.5,
        y0: -0.5,
        x1: 0.5,
        y1: -0.5,
        x2: 0.5,
        y2: 0.5,
        x3: -0.5,
        y3: 0.5,
        freeTransformMaxWH: painter.freeTransformMaxWH,

        style: {}
    },
    watch: {
        //Image Store
        defaultFileInputAccept: function(value){
            painter.defaultFileInput.accept = value;
        },
        defaultFileInputMultiple: function(value){
            painter.defaultFileInput.multiple = value;
        },
        addedImageMaxWH: function(value){
            painter.addedImageMaxWH = parseInt(value);
        },
        isShowNewImgWhenAdd: function(value){
            painter.isShowNewImgWhenAdd = value;
        },
        //Gesturer
        leftDoubleClickZoomRate: function(value){
            painter.leftDoubleClickZoomRate = parseInt(value);
        },
        rightDoubleClickZoomRate: function(value){
            painter.rightDoubleClickZoomRate = parseInt(value);
        },
        allowedTouchMoveSwitchImgOverBoundary: function(value){
            painter.allowedTouchMoveSwitchImgOverBoundary = value;
        },
        //Basic Edit
        stepImgsGCThreshold: function(value){
            painter.stepImgsGCThreshold = parseInt(value);
        },
        //Crop
        isAutoShowCropUI: function(value){
            painter.isAutoShowCropUI = value;
        },
        cropRectMinW: function(value){
            painter.cropRectMinW = parseInt(value);
        },
        cropRectMinH: function(value){
            painter.cropRectMinH = parseInt(value);
        },
        //Free Transform
        freeTransformMaxWH: function(value){
            painter.freeTransformMaxWH = parseInt(value);
        },
    },
    methods: {
        loadCvScriptAsync: function(){
            KPainter.loadCvScriptAsync(function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        //Image Store
        showFileChooseWindow: function(){
            painter.showFileChooseWindow();
        },
        addImageAsync: function(src){
            painter.addImageAsync(src, function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        changePage: function(cmd){
            kConsoleLog(painter.changePage(cmd));
        },
        del: function(){
            kConsoleLog(painter.del());
        },
        download: function(filename){
            kConsoleLog(painter.download(filename));
        },
        //Gesturer
        setZoom: function(num, isRate){
            kConsoleLog(painter.setZoom(parseFloat(num), isRate));
        },
        //Basic Edit
        enterEditAsync: function(){
            painter.enterEditAsync(function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        cancelEdit: function(){
            kConsoleLog(painter.cancelEdit());
        },
        saveEditAsync: function(isCover){
            painter.saveEditAsync(function(bSuccess){
                kConsoleLog(bSuccess);
            }, isCover);
        },
        addProtectedStep: function(num){
            kConsoleLog(painter.addProtectedStep(parseInt(num)));
        },
        removeProtectedStep: function(num){
            kConsoleLog(painter.removeProtectedStep(parseInt(num)));
        },
        undo: function(){
            painter.undo(function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        redo: function(){
            painter.redo(function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        setCurStepAsync: function(index){
            kConsoleLog(painter.setCurStepAsync(parseInt(index)));
        },
        rotateRight: function(){
            kConsoleLog(painter.rotateRight());
        },
        rotateLeft: function(){
            kConsoleLog(painter.rotateLeft());
        },
        mirror: function(){
            kConsoleLog(painter.mirror());
        },
        flip: function(){
            kConsoleLog(painter.flip());
        },
        resizeAsync: function(width, height){
            painter.resizeAsync(parseInt(width), parseInt(height), function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        showCropRect: function(){
            kConsoleLog(painter.showCropRect());
        },
        hideCropRect: function(){
            kConsoleLog(painter.hideCropRect());
        },
        setCropRectStyle: function(num){
            kConsoleLog(painter.setCropRectStyle(parseInt(num)));
        },
        setCropRectArea: function(left,top,right,bottom){
            kConsoleLog(painter.setCropRectArea(parseFloat(left),parseFloat(top),parseFloat(right),parseFloat(bottom)));
        },
        cropAsync: function(){
            painter.cropAsync(function(l,t,r,b){
                kConsoleLog([l,t,r,b]);
            });
        },
        //Free Transform
        enterFreeTransformModeAsync: function(){
            painter.enterFreeTransformModeAsync(function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        exitFreeTransformModeAsync: function(){
            painter.exitFreeTransformModeAsync(function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        setFreeTransformCornerPos: function(pos){
            painter.setFreeTransformCornerPos(pos);
        },
        documentDetectAsync: function(){
            painter.documentDetectAsync(function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        freeTransformAsync: function(){
            painter.freeTransformAsync(function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        //Video
        showVideo: function(){
            painter.showVideo().then(function(){
                kConsoleLog('Play video success');
            },function(ex){
                kConsoleLog(ex);
            });
        },
        grabVideo: function(){
            painter.grabVideo(true, function(bSuccess){
                kConsoleLog(bSuccess);
            });
        },
        hideVideo: function(){
            kConsoleLog(painter.hideVideo());
        }
    }
});

document.getElementById('mdl-view').appendChild(painterDom);

painter.bindThumbnailBox(document.getElementById('div-thumbnailBox')/*, function(cvs){
    var box = document.createElement('div');
    box.appendChild(cvs);
    return box;
}*/);
$('#div-thumbnailBox').on('click', 'canvas', function(){
    var idx = this.getKPainterIndex();
    painter.changePage(idx);
});

$(window).resize(function(){
    painter.updateUIOnResize(true);
});

painter.onNumChange = function(curIndex, length){
    appTestMbc.curIndex = curIndex;
    appTestMbc.count = length;
};

painter.onUpdateImgPosZoom = function(){
    appTestMbc.isEditing = painter.isEditing();
    appTestMbc.width = painter.getWidth();
    appTestMbc.height = painter.getHeight();
    appTestMbc.zoom = painter.getZoom();
    appTestMbc.editWidth = painter.getEditWidth();
    appTestMbc.editHeight = painter.getEditHeight();
    appTestMbc.curStep = painter.getCurStep();
    appTestMbc.stepCount = painter.getStepCount();
    appTestMbc.protectedSteps = painter.getProtectedSteps();
};

painter.onCropRectChange = function(){
    appTestMbc.cropRectArea = painter.getCropRectArea(true);
};

painter.onFreeTransformCornerPosChange = function(){
    appTestMbc.freeTransformCornerPos = painter.getFreeTransformCornerPos();
};

$('#btn-switch-fun').click(function(){
    if($('#mdl-fun').is(':visible')){
        $('#mdl-fun').hide();
    }else{
        $('#mdl-fun').show();
    }
});

var divKConsole = document.getElementById('kConsoleLogDiv').parentElement;
$(divKConsole).children().css('position', 'absolute');
document.getElementById('mdl-log').appendChild(divKConsole);
document.getElementById('kConsoleShowHideBtn').click();

