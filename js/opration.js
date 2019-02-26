
function fuc_captureImage(){
    if(!imageViewer){return false;}
    imageViewer.showFileChooseWindow();
}

function fuc_getCount(){
    if(!imageViewer){return false;}
    var _imageCount = imageViewer.getCount();
    alert(_imageCount);
    console.log(_imageCount);
}

function fuc_getCurentIndex(){
    if(!imageViewer){return false;}
    var _curIndex = imageViewer.getCurentIndex();
    alert(_curIndex);
    console.log(_curIndex);
}

function fuc_getImage(){
    if(!imageViewer){return false;}
    var _curImage = imageViewer.getImage();
    alert(_curImage);
    console.log(_curImage);
}

function fuc_deleteImage(){
    if(!imageViewer){return false;}
    imageViewer.deleteImage();
}

function fuc_changePage(cmd){
    if(!imageViewer){return false;}
    imageViewer.changePage(cmd);
}

function fuc_download(){
    if(!imageViewer){return false;}
    imageViewer.download();
}