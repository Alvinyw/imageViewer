
var imageViewer = new ImageViewer("imageViewer");

imageViewer.onNumChange = function(curIndex,imgCount){
    var _curIndex = parseInt(curIndex)+1;
    //console.log('curIndex '+_curIndex+' imgCount: '+imgCount);
}

window.onresize = function(){
    imageViewer.adaptiveLayout();
};