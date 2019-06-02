var cfg = {
	ContainerId:'imageViewer', 
	Width:'100%', 
	Height:'97%'
}

var imageViewer = new MBC.Lib.ImageViewer(cfg);

imageViewer.onNumChange = function(curIndex,imgCount){
    var _curIndex = parseInt(curIndex)+1;
    //console.log('curIndex '+_curIndex+' imgCount: '+imgCount);
}

window.onresize = function(){
    var imgCount = imageViewer.GetCount();
    if(imgCount>0){
        imageViewer.AdaptiveLayout();
    }
};

function fuc_LoadImage(){
    if(!imageViewer){return false;}
    if(uaInfo.strVersion <11.0 && uaInfo.bIE){
        imageViewer.LoadImageEx('http://localhost:82/dbrjs6.5/assets/images/cs-yc.png');
        imageViewer.LoadImageEx('http://localhost:82/dbrjs6.5/assets/images/cs-avanza.png');
        imageViewer.LoadImageEx('http://localhost:82/dbrjs6.5/assets/images/cs-lm.png');
        imageViewer.LoadImageEx('http://localhost:82/dbrjs6.5/assets/images/cs-ibm.png');
    }else{
        imageViewer.LoadImageEx();
    }
}

function fuc_getCount(){
    if(!imageViewer){return false;}
    var _imageCount = imageViewer.GetCount();
    alert(_imageCount);
    console.log(_imageCount);
}

function fuc_getCurentIndex(){
    if(!imageViewer){return false;}
    var _curIndex = imageViewer.GetCurentIndex();
    alert(_curIndex);
    console.log(_curIndex);
}

function fuc_getImage(){
    if(!imageViewer){return false;}
    var _curImage = imageViewer.GetImage();
    alert(_curImage);
    console.log(_curImage);
}

function fuc_RemoveCurrentImage(){
    if(!imageViewer){return false;}
    imageViewer.RemoveAllSelectedImages();
}

function fuc_RemoveAllImages(){
    if(!imageViewer){return false;}
    imageViewer.RemoveAllImages();
}

function fuc_changePage(cmd){
    if(!imageViewer){return false;}
    imageViewer.ChangePage(cmd);
}

function fuc_download(){
    if(!imageViewer){return false;}
    imageViewer.Download();
}

function fuc_showVideo(){
	if(!imageViewer){return false;}
    imageViewer.ShowVideo();
}

function fuc_enterEdit(){
	if(!imageViewer){return false;}
    imageViewer.EnterEdit();

    $(".visible_inEdit").show();
    $(".visible_inView").hide();
}

function fuc_cancelEdit(){
	if(!imageViewer){return false;}
    imageViewer.CancelEdit();

    $(".visible_inEdit").hide();
    $(".visible_inView").show();
}

function fuc_rotateLeft(){
	if(!imageViewer){return false;}
    imageViewer.RotateLeft();
}

function fuc_rotateRight(){
	if(!imageViewer){return false;}
    imageViewer.RotateRight();
}

function fuc_rotate180(){
    if(!imageViewer){return false;}
    imageViewer.Rotate('',180);
}

function fuc_rotateMirror(){
	if(!imageViewer){return false;}
    imageViewer.Mirror();
}

function fuc_rotateFlip(){
	if(!imageViewer){return false;}
    imageViewer.Flip();
}

function fuc_Crop(){
    if(!imageViewer){return false;}
    imageViewer.Crop();
}

function fuc_Save(){
    if(!imageViewer){return false;}
    imageViewer.Save();

    $(".visible_inEdit").hide();
    $(".visible_inView").show();
}

imageViewer._defaultFileInput.accept += ',image/tiff,application/pdf';

var getCvsFromTif = function(blob, handlePromise){
    return new Promise(function(resolve, reject){
        if(self.Tiff){
            resolve();
        }else{
            console.log('loading tiff component...');
            var script = document.createElement('script');
            script.src = 'js/tiff.min.js';
            self.onTiffJsLoadSuccess = function(){
                //initialize with 100MB for large files
                Tiff.initialize({
                    TOTAL_MEMORY: 100000000
                });
                resolve();
            };
            script.onerror = function(ex){
                //tudo test it
                reject(script.error || ex || 'load tiff js fail');
            };
            document.body.appendChild(script);
        }
    }).then(function(){
        console.log('parsing the tiff...');
        return new Promise(function(resolve, reject){
            var fr = new FileReader();
            fr.onload = function(){
                resolve(fr.result);
            };
            fr.onerror = function(){
                reject(fr.error);
            };
            fr.readAsArrayBuffer(blob);
        });
    }).then(function(arrayBuffer){
        var tiff = new Tiff({
            buffer: arrayBuffer
        });
        var taskQueue = new TaskQueue();
        for (var j = 0, len = tiff.countDirectory(); j < len; ++j) {
            //taskQueue.push(function(j){
                tiff.setDirectory(j);
                handlePromise(tiff.toCanvas()).then(function(){
                    taskQueue.next();
                });
            //},null,[j]);
        }
        // return new Promise(function(resolve){
        //     taskQueue.push(function(){
        //         resolve();
        //     });
        // });
    });
};

var getCvsFromPdf = function(blob, handlePromise){
    return new Promise(function(resolve, reject){
        if(self.pdfjsLib){
            resolve();
        }else{
            console.log('loading pdf component...');
            var script = document.createElement('script');
            script.src = 'js/pdf.js';
            self.onPdfJsLoadSuccess = function(){
                self.pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.js';
                resolve();
            };
            script.onerror = function(ex){
                //tudo test it
                reject(script.error || ex || 'load pdf js fail');
            };
            document.body.appendChild(script);
        }
    }).then(function(){
        console.log('parsing the pdf...');
        return new Promise(function(resolve, reject){
            var fr = new FileReader();
            fr.onload = function(){
                resolve(fr.result);
            };
            fr.onerror = function(){
                reject(fr.error);
            };
            fr.readAsArrayBuffer(blob);
        });
    }).then(function(arrayBuffer){
        return pdfjsLib.getDocument(arrayBuffer);
    }).then(function(pdf){
        return new Promise(function(resolve, reject){
            var cvsAry = new Array();
            for(var i = 1; i<= pdf.numPages; i++){
                var cvs = null;
                pdf.getPage(i).then(function(page){
                    var viewport = page.getViewport(1);
                    cvs = document.createElement('canvas');
                    cvs.width = viewport.width;
                    cvs.height = viewport.height;

                    // for test
                    cvs.setAttribute('id', 'page-' + (page.pageIndex + 1));


                    cvsAry.push(cvs);
                    var ctx = cvs.getContext('2d');
                    return page.render({
                        canvasContext: ctx,
                        viewport: viewport
                    });
                }).then(function(){
                    resolve(cvsAry);
                })['catch'](function(ex){
                    reject(ex);
                });
            }
        }).then(function(cvsAry){
            console.log(cvsAry);
            imageViewer.LoadImageEx(cvsAry);

            // for(var i=0;i<cvsAry.length;i++){
            //     //document.body.appendChild(cvsAry[i]);
            //     cvsAry[i].toBlob(function(blob) {
            //         var newImg = document.createElement("img"),
            //             url = URL.createObjectURL(blob);
                  
            //         newImg.onload = function() {
            //           // no longer need to read the blob so it's revoked
            //           URL.revokeObjectURL(url);
            //         };
                  
            //         newImg.src = url;
            //         document.body.appendChild(newImg);
            //       });
            // }

            // document.body.appendChild(cvsAry[0]);
        });
    })
};

self.addImageFromUrlWithPdfTiffAsync = imageViewer.beforeAddImgFromFileChooseWindow = imageViewer.beforeAddImgFromDropFile = function(src, callback){
    var files = null;
    if(typeof src == "string" || src instanceof String){
        // url
        files = ['placeholder'];
        lib.convertURLToBlob(src, function(blob){
            files = [blob];
        });

    }else{
        // input || drop 
        files = src.target.files || src.dataTransfer.files;
    }
    for(var i = 0; i < files.length; ++i){
        //taskQueue.push(function(i){
            var file = files[i];
            if('image/tiff' == file.type){
                getCvsFromTif(file, imageViewer.LoadImageEx);
            }else if('application/pdf' == file.type){
                getCvsFromPdf(file, imageViewer.LoadImageEx);
            }else{
                imageViewer.LoadImageEx(file);
            }
        //}, null, [i]);
    }
    // callback
    if(callback){
        callback();
    }
};