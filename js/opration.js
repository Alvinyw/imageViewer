
var imageViewer = new ImageViewer("imageViewer");

imageViewer.onNumChange = function(curIndex,imgCount){
    var _curIndex = parseInt(curIndex)+1;
    //console.log('curIndex '+_curIndex+' imgCount: '+imgCount);
}

window.onresize = function(){
    var imgCount = imageViewer.getCount();
    if(imgCount>1){
        imageViewer.adaptiveLayout();
    }
};