
function fuc_LoadImage(){
    if(!imageViewer){return false;}
    if(uaInfo.strVersion <11.0 && uaInfo.bIE){
        imageViewer.LoadImage('https://www.dynamsoft.com/assets/images/dbr-sdk-android-support-illus.png');
        imageViewer.LoadImage('https://www.dynamsoft.com/assets/images/dbr-sdk-ios-support-illus.png');
        imageViewer.LoadImage('https://www.dynamsoft.com/assets/images/dnt-annotation-sdk-feature-illus.png');
        imageViewer.LoadImage('https://www.dynamsoft.com/assets/images/dbr-sdk-ios-work-illus.png');
		
    }else{
        imageViewer.showFileChooseWindow();
    }
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