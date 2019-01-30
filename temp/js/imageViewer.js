/*global jQuery, kUtil, TaskQueue, EXIF, kConsoleLog*/
var KPainter = function(initSetting){
    var kPainter = this;

    var absoluteCenterDistance = 100000;

    var cvsToBlobAsync = function(cvs, callback, mimeType, quality){
        if(cvs.toBlob){
            cvs.toBlob(callback, mimeType, quality);
        }else{
            var b64str = cvs.toDataURL(mimeType, quality);
            var blob = kUtil.convertBase64ToBlob(b64str.substring(b64str.indexOf(",")+1), mimeType);
            callback(blob);
        }
    };

    var imgToCvs = function(img, tsf, maxWH){
        tsf = tsf || new kUtil.Matrix(1,0,0,1,0,0);
        var tCvs = document.createElement("canvas");

        var bSwitchWH = false;
        if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
            tCvs.width = img.naturalWidth || img.width;
            tCvs.height = img.naturalHeight || img.height;
        }else{
            bSwitchWH = true;
            tCvs.width = img.naturalHeight || img.height;
            tCvs.height = img.naturalWidth || img.width;
        }

        var zoom = 1;
        if(tCvs.width > maxWH || tCvs.height > maxWH){
            zoom = maxWH / Math.max(tCvs.width, tCvs.height);
            tCvs.width = Math.min(tCvs.width * zoom);
            tCvs.height = Math.min(tCvs.height * zoom);
        }

        var ctx = tCvs.getContext('2d');
        ctx.setTransform(tsf.a, tsf.b, tsf.c, tsf.d, tsf.e*tCvs.width, tsf.f*tCvs.height);
        if(!bSwitchWH){
            ctx.drawImage(img, 0, 0, tCvs.width, tCvs.height);
        }else{
            ctx.drawImage(img, 0, 0, tCvs.height, tCvs.width);
        }
        return tCvs;
    };
    var blobToCvsAsync = function(blob, tsf, callback, maxWH){
        var useObjurlToDrawBlobToCvs = function(){
            var objUrl = URL.createObjectURL(blob);
            var img = new Image();
            img.onload = img.onerror = function(){
                img.onload = img.onerror = null;
                var tCvs = imgToCvs(img, tsf, maxWH);
                URL.revokeObjectURL(objUrl);
                callback(tCvs);
            };
            img.src = objUrl;
        };
        if(window.createImageBitmap){
            createImageBitmap(blob).then(function(img){
                callback(imgToCvs(img, tsf, maxWH));
            }).catch(function(){
                useObjurlToDrawBlobToCvs();
            });
        }else{
            useObjurlToDrawBlobToCvs();
        }
    };

    var doCallbackNoBreak = KPainter._doCallbackNoBreak;

    /*eslint-disable indent*/
    var containerDiv = $([
        '<div style="width:800px;height:600px;border:1px solid #ccc;">',
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
        '</div>'
    ].join(''))[0];
    /*eslint-enable indent*/
    var mainBox = $(containerDiv).children();
    var mainCvs = mainBox.find('> .kPainterImgsDiv > .kPainterCanvas')[0];

    kPainter.getHtmlElement = function(){
        return containerDiv;
    };

    var curIndex = -1;
    var imgArr = kPainter.imgArr = [];
    var gestureStatus = null;
    var workingPointerDevice = null;
    /*$(document).on('touch')*/
    var isEditing = false;
    var painterMode = 'view'; // [view, edit]

    kPainter.getCurIndex = function(){ return curIndex; };
    kPainter.getCount = function(){ return imgArr.length; };
    kPainter.isEditing = function(){
        return isEditing;
    };

    kPainter.getMode = function(){
        return painterMode;
    };

    //isOri: 是否原始图
    kPainter.getImage = function(isOri, index){
        if(undefined == index){
            index = curIndex;
        }
        if(isNaN(index)){ return; }
        index = Math.round(index);
        if(index < 0 || index >= imgArr.length){ return; }
        var img;
        if(isOri){
            img = imgArr[index];
        }else{
            img = $(imgArr[index]).clone()[0];
            img.setAttribute('style','');
        }
        return img;
    };

    kPainter.onStartLoading = null;
    kPainter.onFinishLoading = null;
    var onStartLoadingNoBreak = function(){
        doCallbackNoBreak(kPainter.onStartLoading);
    };
    var onFinishLoadingNoBreak = function(){
        doCallbackNoBreak(kPainter.onFinishLoading);
    };

    var imgStorer = KPainter.imgStorer = new function(){

        var imgStorer = this;

        kPainter.defaultFileInput = $('<input type="file" accept="image/bmp,image/gif,image/jpeg,image/png,image/webp" multiple style="display:none">')[0];
        kPainter.beforeAddImgFromFileChooseWindow = null;
        kPainter.afterAddImgFromFileChooseWindow = null;
        $(kPainter.defaultFileInput).change(function(jqEvent){
            var ipt = this;
            var oEvent = jqEvent.originalEvent;
            if(kPainter.beforeAddImgFromFileChooseWindow){
                doCallbackNoBreak(kPainter.beforeAddImgFromFileChooseWindow, [oEvent, function(file){
                    addImageAsync(file, function(bSuccess){
                        doCallbackNoBreak(kPainter.afterAddImgFromFileChooseWindow,[bSuccess]);
                        ipt.value = '';
                    });
                }]);
            }else{
                addImageAsync(ipt.files, function(bSuccess){
                    doCallbackNoBreak(kPainter.afterAddImgFromFileChooseWindow,[bSuccess]);
                    ipt.value = '';
                });
            }
        });
        kPainter.showFileChooseWindow = function(){
            if(isEditing){ return false; }
            kPainter.defaultFileInput.click();
            return true;
        };
        
        kPainter.beforeAddImgFromDropFile = null;
        kPainter.afterAddImgFromDropFile = null;
        mainBox.on('dragover', function(jqEvent){
            var oEvent = jqEvent.originalEvent;
            oEvent.stopPropagation();
            oEvent.preventDefault();
        });
        mainBox.on('drop', function(jqEvent){
            var oEvent = jqEvent.originalEvent;
            oEvent.stopPropagation();
            oEvent.preventDefault();
            if(kPainter.beforeAddImgFromDropFile){
                doCallbackNoBreak(kPainter.beforeAddImgFromDropFile, [oEvent, function(file){
                    addImageAsync(file, kPainter.afterAddImgFromDropFile);
                }]);
            }else{
                var files = oEvent.dataTransfer.files;
                addImageAsync(files, kPainter.afterAddImgFromDropFile);
            }
        });

        var loadImgTaskQueue = new TaskQueue();
        var addImageAsync = kPainter.addImageAsync = function(imgData, callback){
            if(isEditing){ 
                doCallbackNoBreak(callback,[false]);
                return;
            }
            if(!imgData){
                doCallbackNoBreak(callback,[false]);
                return;
            }
            if(imgData instanceof Blob){//
            }else if(imgData instanceof HTMLCanvasElement){//
            }else if(typeof imgData == "string" || imgData instanceof String){//
            }else if(imgData instanceof HTMLImageElement){//
            }else if(imgData instanceof Array || imgData instanceof FileList){
                var bSuccessArr = [];
                var hasOneSuccess = false;
                for(var i = 0; i < imgData.length; ++i){
                    addImageAsync(imgData[i], function(bSuccess){
                        bSuccessArr.push(bSuccess);
                        hasOneSuccess = hasOneSuccess || bSuccess;
                        if(bSuccessArr.length == imgData.length){
                            doCallbackNoBreak(callback, [hasOneSuccess, bSuccessArr]);
                        }
                    }); // have queued inner, so not recur
                }
                return;
            }else{
                doCallbackNoBreak(callback,[false]);
                return;
            }
            onStartLoadingNoBreak();
            loadImgTaskQueue.push(
                addImageTask, 
                null, 
                [imgData, function(isSuccess){ 
                    doCallbackNoBreak(callback,[isSuccess]);
                    loadImgTaskQueue.next();
                    if(!loadImgTaskQueue.isWorking){
                        onFinishLoadingNoBreak();
                    }
                }]
            );
        };

        var getTransform = function(blob, callback){
            // only jpeg has exif
            if("image/jpeg" != blob.type){
                callback(null);
                return;
            }
            EXIF.getData(blob, function(){
                // img from ios may have orientation
                /*eslint-disable indent*/
                var orient = EXIF.getTag(this, 'Orientation');//,
                    // pxX = EXIF.getTag(this, 'PixelXDimension'),
                    // pxY = EXIF.getTag(this, 'PixelYDimension');
                var tsf = null;
                switch(orient){
                    case 6: tsf = new kUtil.Matrix(0,1,-1,0,1,0); break;
                    case 3: tsf = new kUtil.Matrix(-1,0,0,-1,1,1); break;
                    case 8: tsf = new kUtil.Matrix(0,-1,1,0,0,1); break;
                    default: break;
                }
                /*eslint-enable indent*/
                callback(tsf);
            });
        };

        var isPNGTransparent = function(blob, callback){
            var hBlob = blob.slice(25,26);
            var fileReader = new FileReader();
            fileReader.onload = function(){
                var hInt8Arr = new Int8Array(fileReader.result);
                var sign = hInt8Arr[0];
                callback(4 == (sign & 4));
            };
            fileReader.readAsArrayBuffer(hBlob);
        };
        var getSaveFormat = function(blob, callback){
            var type = blob.type;
            if(type.indexOf("webp")!=-1){
                if(callback){callback("image/webp");}
            }else if(type.indexOf("gif")!=-1 || type.indexOf("svg")!=-1){
                if(callback){callback("image/png");}
            }else if(type.indexOf("png")!=-1){
                isPNGTransparent(blob, function(isTransparent){
                    if(callback){callback(isTransparent ? "image/png" : "image/jpeg");}
                });
            }else{ // like jpeg
                if(callback){callback("image/jpeg");}
            }
        };
        var addImageTask = function(imgData, callback){
            getBlobAndFormatFromAnyImgData(imgData, function(blob, format){
                if(blob){
                    doCallbackNoBreak(function(){//wrap only for check
                        addFinalImageAsync(blob, format, callback);
                    });
                }else{
                   callback(false);
               }
            });

            // var blob = getBlobFromAnyImgData(imgData);
            // console.log(blob);
            // addFinalImageAsync(blob, getSaveFormat(blob), callback);
        };

        var getBlobFromAnyImgData = imgStorer.getBlobFromAnyImgData = function(imgData, callback){
            
            var afterGetBlob = function(blob){
                console.log(blob);
                return blob;
            };

            if(imgData instanceof Blob){
                return imgData;
            }else if(imgData instanceof HTMLCanvasElement){
                return cvsToBlobAsync(imgData, function(blob){
                    //afterGetBlob(blob);
                });
            }else if(typeof imgData == "string" || imgData instanceof String){
                var url = imgData;
                if("data:" == url.substring(0, 5)){ // url is base64
                    var mimeType = "";
                    if("image/" == url.substring(5, 11)){
                        mimeType = url.substring(5, url.indexOf(";", 11));
                    }
                    var blob = kUtil.convertBase64ToBlob(url.substring(url.indexOf("base64,")+7), mimeType);
                    return blob;
                }else{ // url is link, such as 'https://....'
                    kUtil.convertURLToBlob(url, function(blob){
                        if(blob){
                            afterGetBlob(blob);
                        }else{
                            callback(null, '');
                        }
                    });
                }
            }else if(imgData instanceof HTMLImageElement){
                var src;
                //src maybe access denied
                try{
                    src = imgData.src;
                }catch(ex){
                    setTimeout(function(){
                        throw(ex);
                    },0);
                    callback(null, '');
                    return;
                }

                // url not available, maybe network problem
                // use imgData -> canvas -> blob instand 

                var tCvs = document.createElement('canvas');
                tCvs.width = imgData.naturalWidth;
                tCvs.height = imgData.naturalHeight;
                var ctx = tCvs.getContext('2d');
                ctx.drawImage(imgData, 0, 0);

                // use suffix guess image mime type
                var suffix = "";
                var questionPos = src.lastIndexOf("?");
                var dotPos = -1;
                if(-1 != questionPos){
                    dotPos = src.lastIndexOf(".", questionPos);
                    if(-1 != dotPos && questionPos - dotPos <= 5){ //max supported type suffix is 4
                        suffix = src.substring(dotPos + 1, questionPos);
                    }
                }else{
                    dotPos = src.lastIndexOf(".");
                    if(-1 != dotPos){
                        if(src.length - dotPos <= 5){ //max supported type suffix is 4
                            suffix = src.substring(dotPos + 1);
                        }else{
                            suffix = src.substring(dotPos + 1, dotPos + 5);
                        }
                    }
                }
                var saveFormat;
                if(-1 != suffix.indexOf("webp")){
                    saveFormat = "image/webp";
                }else if(-1 != suffix.indexOf("png") || -1 != suffix.indexOf("gif") || -1 != suffix.indexOf("svg")){
                    saveFormat = "image/png";
                }else{ // like jpeg
                    saveFormat = "image/jpeg";
                }

                cvsToBlobAsync(tCvs, null, saveFormat);    

            }else{
                //not support
                //callback(null, '');
            }
        };

        var getBlobAndFormatFromAnyImgData = imgStorer.getBlobAndFormatFromAnyImgData = function(imgData, callback){

            var afterGetBlob = function(blob){
                getSaveFormat(blob, function(format){
                    getTransform(blob, function(tsf){
                        fixImgOrient(blob, tsf, format, function(blob){
                            callback(blob, format);
                        });
                    });
                });
            };

            if(imgData instanceof Blob){
                afterGetBlob(imgData);
            }else if(imgData instanceof HTMLCanvasElement){
                cvsToBlobAsync(imgData, function(blob){
                    afterGetBlob(blob);
                });
            }else if(typeof imgData == "string" || imgData instanceof String){
                var url = imgData;
                if("data:" == url.substring(0, 5)){ // url is base64
                    var mimeType = "";
                    if("image/" == url.substring(5, 11)){
                        mimeType = url.substring(5, url.indexOf(";", 11));
                    }
                    var blob = kUtil.convertBase64ToBlob(url.substring(url.indexOf("base64,")+7), mimeType);
                    afterGetBlob(blob);
                }else{ // url is link, such as 'https://....'
                    kUtil.convertURLToBlob(url, function(blob){
                        if(blob){
                            afterGetBlob(blob);
                        }else{
                            callback(null, '');
                        }
                    });
                }
            }else if(imgData instanceof HTMLImageElement){
                var src;
                //src maybe access denied
                try{
                    src = imgData.src;
                }catch(ex){
                    setTimeout(function(){
                        throw(ex);
                    },0);
                    callback(null, '');
                    return;
                }
                getBlobAndFormatFromAnyImgData(src, function(blob, format){
                    if(blob){
                        callback(blob, format);
                    }else{
                        // url not available, maybe network problem
                        // use imgData -> canvas -> blob instand 

                        var tCvs = document.createElement('canvas');
                        tCvs.width = imgData.naturalWidth;
                        tCvs.height = imgData.naturalHeight;
                        var ctx = tCvs.getContext('2d');
                        ctx.drawImage(imgData, 0, 0);

                        // use suffix guess image mime type
                        var suffix = "";
                        var questionPos = src.lastIndexOf("?");
                        var dotPos = -1;
                        if(-1 != questionPos){
                            dotPos = src.lastIndexOf(".", questionPos);
                            if(-1 != dotPos && questionPos - dotPos <= 5){ //max supported type suffix is 4
                                suffix = src.substring(dotPos + 1, questionPos);
                            }
                        }else{
                            dotPos = src.lastIndexOf(".");
                            if(-1 != dotPos){
                                if(src.length - dotPos <= 5){ //max supported type suffix is 4
                                    suffix = src.substring(dotPos + 1);
                                }else{
                                    suffix = src.substring(dotPos + 1, dotPos + 5);
                                }
                            }
                        }
                        var saveFormat;
                        if(-1 != suffix.indexOf("webp")){
                            saveFormat = "image/webp";
                        }else if(-1 != suffix.indexOf("png") || -1 != suffix.indexOf("gif") || -1 != suffix.indexOf("svg")){
                            saveFormat = "image/png";
                        }else{ // like jpeg
                            saveFormat = "image/jpeg";
                        }

                        cvsToBlobAsync(tCvs, function(blob){
                            afterGetBlob(blob);
                        }, saveFormat);
                    }
                });
            }else{
                //not support
                callback(null, '');
            }
        };

        kPainter.addedImageMaxWH = 4096;

        var fixImgOrient = function(blob, tsf, format, callback){
            if(tsf){
                // fix img from ios
                blobToCvsAsync(blob, tsf, function(tCvs){
                    cvsToBlobAsync(tCvs, function(blob){
                        if(callback){ callback(blob); }
                    }, format);
                });
            }else{
                if(callback){ callback(blob); }
            }
        };

        kPainter.isShowNewImgWhenAdd = true;
        
        var addFinalImageAsync = function(blob, format, callback){
            var img = new Image();
            img.kPainterOriBlob = img.kPainterBlob = blob;
            img.kPainterSaveFormat = format;
            var objUrl = URL.createObjectURL(img.kPainterBlob);
            img.onload = img.onerror = function(){
                {
                    // walk around for ios safari bug
                    kPainter._noAnyUseButForIosSafariBug0 = img.naturalWidth;
                    kPainter._noAnyUseButForIosSafariBug1 = img.naturalHeight;
                }
                img.kPainterWidth = img.naturalWidth;
                img.kPainterHeight = img.naturalHeight;
                img.kPainterOriWidth = img.kPainterWidth;
                img.kPainterOriHeight = img.kPainterHeight;

                if(img.kPainterWidth > kPainter.addedImageMaxWH || img.kPainterHeight > kPainter.addedImageMaxWH){
                    cvsToBlobAsync(imgToCvs(img, null, kPainter.addedImageMaxWH), function(blob){
                        URL.revokeObjectURL(objUrl);
                        img.kPainterOriBlob = img.kPainterBlob = blob;
                        objUrl = URL.createObjectURL(img.kPainterBlob);
                        img.src = objUrl;//would recall img.onload
                    }, format);
                }else{
                    img.onload = img.onerror = null;
                    if(kPainter.isShowNewImgWhenAdd || -1 == curIndex){
                        showImg(imgArr.length - 1);
                    }

                    //ThumbBox**
                    try{
                        (function(){
                            for(var i = 0; i < thumbnailCvsArr.length; ++i){
                                var cvs = thumbnailCvsArr[i].cvs;
                                var mwh = thumbnailCvsArr[i].mwh;
                                var rate = Math.min(mwh / img.naturalWidth, mwh / img.naturalHeight, 1);
                                cvs.width = Math.round(img.naturalWidth * rate);
                                cvs.height = Math.round(img.naturalHeight * rate);
                                var ctx = cvs.getContext('2d');
                                ctx.drawImage(img,0,0,cvs.width,cvs.height);
                            }
                        })();
                    }
                    catch(ex){
                        setTimeout(function(){throw ex;},0);
                    }
                    //**ThumbBox

                    if(callback){ callback(true); }
                }
            };
            img.src = objUrl;
            $(img).hide();
            mainBox.children('.kPainterImgsDiv').append(img);
            imgArr.push(img);
            
            //ThumbBox**
            var thumbnailCvsArr = [];
            try{(function(){
                for(var i = 0; i < thumbnailBoxArr.length; ++i){
                    var container = thumbnailBoxArr[i];
                    var funWrap = container.kPainterFunWrap;
                    var cvs = document.createElement('canvas');
                    cvs.className = 'kPainterThumbnailCanvas';
                    thumbnailCvsArr.push({cvs:cvs,mwh:container.kPainterMaxWH});
                    var box = null;
                    try{ box = funWrap ? funWrap(cvs) : cvs;
                    }catch(ex){
                        setTimeout(function(){throw ex;},0);
                        break;
                    }
                    if(box){
                        box.getKPainterIndex = function(){
                            return container.kPainterThumbBoxArr.indexOf(this);
                        };
                        container.kPainterThumbBoxArr.push(box);
                        container.appendChild(box);
                    }
                }
            })();}catch(ex){setTimeout(function(){throw ex;},0);}
            //**ThumbBox
        };

        var setImgStyleNoRotateFit = function(){
            var img = imgArr[curIndex];
            var box = mainBox;
            var pbr = box.paddingBoxRect();//eslint-disable-line
            var cbr = box.contentBoxRect();
            var zoom = img.kPainterZoom = Math.min(cbr.width/img.kPainterWidth,cbr.height/img.kPainterHeight);
            //img.style.transform = "";
            img.style.width = (Math.round(img.kPainterWidth * zoom) || 1) + "px"; 
            img.style.height = (Math.round(img.kPainterHeight * zoom) || 1) + "px"; 
            img.style.left = img.style.right = img.style.top = img.style.bottom = -absoluteCenterDistance+"px";

            if(imgArr.length >= 2){
                var pImg = imgArr[(imgArr.length + curIndex - 1) % imgArr.length];
                zoom = Math.min(cbr.width/pImg.kPainterWidth,cbr.height/pImg.kPainterHeight);
                pImg.style.width = (Math.round(pImg.kPainterWidth * zoom) || 1) + "px"; 
                pImg.style.height = (Math.round(pImg.kPainterHeight * zoom) || 1) + "px"; 
                pImg.style.right = absoluteCenterDistance+"px";
                pImg.style.left = pImg.style.top = pImg.style.bottom = -absoluteCenterDistance+"px";
            }
            if(imgArr.length >= 3){
                var nImg = imgArr[(imgArr.length + curIndex + 1) % imgArr.length];
                zoom = Math.min(cbr.width/nImg.kPainterWidth,cbr.height/nImg.kPainterHeight);
                nImg.style.width = (Math.round(nImg.kPainterWidth * zoom) || 1) + "px"; 
                nImg.style.height = (Math.round(nImg.kPainterHeight * zoom) || 1) + "px"; 
                nImg.style.left = absoluteCenterDistance+"px";
                nImg.style.right = nImg.style.top = pImg.style.bottom = -absoluteCenterDistance+"px";
            }
            doCallbackNoBreak(kPainter.onUpdateImgPosZoom);
        };

        var resizeTaskId = null;
        var resizeTimeout = 500;
        var isWaitingResize = false;//eslint-disable-line
        var beforeTimeoutIsEditing;
        kPainter.updateUIOnResize = function(isLazy, callback){
            if(null != resizeTaskId){
                clearTimeout(resizeTaskId);
                resizeTaskId = null;
            }
            if(isLazy){
                beforeTimeoutIsEditing = isEditing;
                resizeTaskId = setTimeout(function(){
                    if(curIndex != -1 && beforeTimeoutIsEditing == isEditing){
                        if(isEditing){
                            var ftPos = kPainter.getFreeTransformCornerPos();
                            gesturer.setImgStyleFit();
                            kPainter.setFreeTransformCornerPos(ftPos);
                        }else{
                            setImgStyleNoRotateFit();
                        }
                        doCallbackNoBreak(callback);
                    }
                    resizeTaskId = null;
                }, resizeTimeout);
            }else{
                if(curIndex != -1){
                    if(isEditing){
                        var ftPos = kPainter.getFreeTransformCornerPos();
                        gesturer.setImgStyleFit();
                        kPainter.setFreeTransformCornerPos(ftPos);
                    }else{
                        setImgStyleNoRotateFit();
                    }
                    doCallbackNoBreak(callback);
                }
            }
        };

        var showImg = imgStorer.showImg = function(index){
            var img = imgArr[index];
            $(img).siblings().hide();
            curIndex = index;
            $(img).show();
            if(imgArr.length >= 2){
                if(index > 0 || kPainter.allowedTouchMoveSwitchImgOverBoundary){
                    var pImg = imgArr[(imgArr.length + index - 1) % imgArr.length];
                    $(pImg).show();
                }
            }
            if(imgArr.length >= 3){
                if(index < imgArr.length - 1 || kPainter.allowedTouchMoveSwitchImgOverBoundary){
                    var nImg = imgArr[(imgArr.length + index + 1) % imgArr.length];
                    $(nImg).show();
                }
            }
            setImgStyleNoRotateFit();
            updateNumUI();
        };

        kPainter.onNumChange = null;
        var updateNumUI = (function(){
            var _index = undefined, _length = undefined;
            return function(){
                if(_index != curIndex || _length != imgArr.length){
                    _index = curIndex;
                    _length = imgArr.length;
                    doCallbackNoBreak(kPainter.onNumChange,[curIndex, imgArr.length]);
                }
            }; 
        })();

        kPainter.updateImage = function(url, index, callback){
            if(isEditing){ return false; }
            if(arguments.length < 2 || !index){
                index = curIndex;
            }
            if(index){
                if(isNaN(index)){ return false; }
                index = Math.round(index);
                if(index < 0 || index >= imgArr.length){ return false; }
            }

            function newImage(blob){

                var img = new Image();
                img.kPainterOriBlob = img.kPainterBlob = blob;
                img.kPainterSaveFormat = blob.type;
                var objUrl = URL.createObjectURL(img.kPainterBlob);
                
                img.onload = img.onerror = function(){
                    img.kPainterWidth = img.naturalWidth;
                    img.kPainterHeight = img.naturalHeight;
                    img.kPainterOriWidth = img.kPainterWidth;
                    img.kPainterOriHeight = img.kPainterHeight;

                    if(img.kPainterWidth > kPainter.addedImageMaxWH || img.kPainterHeight > kPainter.addedImageMaxWH){
                        cvsToBlobAsync(imgToCvs(img, null, kPainter.addedImageMaxWH), function(blob){
                            URL.revokeObjectURL(objUrl);
                            img.kPainterOriBlob = img.kPainterBlob = blob;
                            objUrl = URL.createObjectURL(img.kPainterBlob);
                            img.src = objUrl;//would recall img.onload
                        }, format);
                    }else{
                        img.onload = img.onerror = null;
                        if(kPainter.isShowNewImgWhenAdd || -1 == curIndex){
                            showImg(imgArr.length - 1);
                        }
    
                        if(callback){ callback(true); }
                    }

                }
                img.src = objUrl;

                $(imgArr[index]).remove();
                imgArr.splice(index, 1);

                imgArr[index] = img;

                showImg(index);
            }          

            kUtil.convertURLToBlob(url, function(blob){
                if(blob){
                    newImage(blob);
                }else{
                    callback(null, '');
                }
            });
                        
            return true;
        };


        /* cmd possible value "f", "p", "n", "l", or a number. 
         * means first, pre, next, last...
         */
        kPainter.changePage = function(cmd){
            if(isEditing){ return false; }
            var index;
            /*eslint-disable indent*/
            switch(cmd){
                case "f": index = 0; break;
                case "p": index = curIndex - 1; break;
                case "n": index = curIndex + 1; break;
                case "l": index = imgArr.length - 1; break;
                default: 
                    if(arguments.length < 1 || isNaN(cmd)){
                        return false;
                    }else{
                        index = Math.round(cmd);
                    }
            }
            /*eslint-enable indent*/
            if(index < 0 || index >= imgArr.length || index == curIndex){ return false; }
            showImg(index);
            return true;
        };

        kPainter.del = function(index){
            if(isEditing){ return false; }
            if(arguments.length < 1){
                index = curIndex;
            }
            if(isNaN(index)){ return false; }
            index = Math.round(index);
            if(index < 0 || index >= imgArr.length){ return false; }
            URL.revokeObjectURL(imgArr[index].src);
            $(imgArr[index]).remove();
            imgArr.splice(index, 1);

            //ThumbBox**
            try{
                for(var i = 0; i < thumbnailBoxArr.length; ++i){
                    var container = thumbnailBoxArr[i];
                    $(container.kPainterThumbBoxArr[index]).remove();
                    container.kPainterThumbBoxArr.splice(index, 1);
                }
            }catch(ex){setTimeout(function(){throw ex;},0);}
            //**ThumbBox
            
            if(index < curIndex){
                --curIndex;
                updateNumUI();
            }else if(index == curIndex){
                if(curIndex == imgArr.length){
                    --curIndex;
                }
                if(curIndex >= 0){
                    showImg(curIndex);
                }else{
                    updateNumUI();
                }
            }else{ //index > curIndex
                updateNumUI();
            }
            return true;
        };

        kPainter.getWidth = function(index){
            if(arguments.length < 1){
                index = curIndex;
            }
            if(isNaN(index)){ return NaN; }
            index = Math.round(index);
            if(index < 0 || index >= imgArr.length){ return NaN; }
            return imgArr[index].kPainterWidth;
        };

        kPainter.getHeight = function(index){
            if(arguments.length < 1){
                index = curIndex;
            }
            if(isNaN(index)){ return NaN; }
            index = Math.round(index);
            if(index < 0 || index >= imgArr.length){ return NaN; }
            return imgArr[index].kPainterHeight;
        };

        kPainter.getBlob = function(index){
            //if(isEditing){ return null; }
            if(arguments.length < 1){
                index = curIndex;
            }
            if(isNaN(index)){ return null; }
            index = Math.round(index);
            if(index < 0 || index >= imgArr.length){ return null; }
            return imgArr[index].kPainterBlob;
        };

        kPainter.download = function(filename, index){
            //if(isEditing){ return null; }
            if(arguments.length < 2){
                index = curIndex;
            }
            if(isNaN(index)){ return null; }
            index = Math.round(index);
            if(index < 0 || index >= imgArr.length){ return null; }
            var a = document.createElement('a');
            a.target='_blank';
            var img = imgArr[index];
            var blob = img.kPainterBlob;
            if(!filename){
                var suffix = "";
                if(blob.type){
                    suffix = blob.type.substring(blob.type.indexOf('/')+1);
                }
                if(suffix == "jpeg"){
                    suffix = ".jpg";
                }else{
                    suffix = '.' + suffix;
                }
                filename = (new Date()).getTime() + suffix;
            }
            a.download = filename;
            var objUrl = URL.createObjectURL(blob);
            a.href = objUrl;
            var ev = new MouseEvent('click',{
                "view": window,
                "bubbles": true,
                "cancelable": false
            });
            a.dispatchEvent(ev);
            //a.click();
            setTimeout(function(){
                URL.revokeObjectURL(objUrl);
            }, 10000);
            return filename;
        };

        var thumbnailBoxArr = imgStorer.thumbnailBoxArr = kPainter.thumbnailBoxArr = [];

        kPainter.bindThumbnailBox = function(container, funWrap, maxWH){
            if(isEditing){ return false; }
            if(!(container instanceof HTMLElement)){
                return false;
            }
            kPainter.unbindThumbnailBox(container);
            container.innerHTML = "";
            container.kPainterFunWrap = funWrap;
            container.kPainterMaxWH = maxWH || 256;
            container.kPainterThumbBoxArr = [];
            for(var j = 0; j < imgArr.length; ++j){
                var img = imgArr[j];
                {
                    // walk around for ios safari bug
                    kPainter._noAnyUseButForIosSafariBug0 = img.naturalWidth;
                    kPainter._noAnyUseButForIosSafariBug1 = img.naturalHeight;
                }
                var rate = Math.min(container.kPainterMaxWH / img.naturalWidth, container.kPainterMaxWH / img.naturalHeight, 1);
                var cvs = document.createElement('canvas');
                cvs.width = Math.round(img.naturalWidth * rate);
                cvs.height = Math.round(img.naturalHeight * rate);
                var ctx = cvs.getContext('2d');
                ctx.drawImage(img,0,0,cvs.width,cvs.height);
                cvs.className = 'kPainterThumbnailCanvas';
                var box = null;
                try{ box = funWrap ? funWrap(cvs) : cvs;
                }catch(ex){
                    setTimeout(function(){throw ex;},0);
                    return false;
                }
                if(box){
                    box.getKPainterIndex = function(){
                        return container.kPainterThumbBoxArr.indexOf(this);
                    };
                    container.kPainterThumbBoxArr.push(box);
                    container.appendChild(box);
                }
            }
            thumbnailBoxArr.push(container);
            return true;
        };
        kPainter.unbindThumbnailBox = function(container){
            if(isEditing){ return false; }
            if(container){
                for(var i = 0; i < thumbnailBoxArr.length; ++i){
                    if(thumbnailBoxArr[i] == container){
                        container.innerHTML = "";
                        container.kPainterFunWrap = undefined;
                        container.kPainterThumbBoxArr = undefined;
                        thumbnailBoxArr.splice(i, 1);
                        return true;
                    }
                }
                return false;
            }else{
                for(var i = 0; i < thumbnailBoxArr.length; ++i){//eslint-disable-line
                    container = thumbnailBoxArr[i];
                    container.innerHTML = "";
                    container.kPainterFunWrap = undefined;
                    container.kPainterThumbBoxArr = undefined;
                }
                thumbnailBoxArr.length = 0;
                return true;
            }
        };
    };

    var gesturer = KPainter.gesturer = new function(){
        var gesturer = this;

        var clickTime = Number.NEGATIVE_INFINITY;
        var dblClickInterval = 1000;
        var maxMoveRegardAsDblClick = 8;
        var clickButtons;
        kPainter.leftDoubleClickZoomRate = 2;
        kPainter.rightDoubleClickZoomRate = 0.5;
        var clickDownX, clickDownY, clickUpX, clickUpY;

        var x0, y0, cx, cy, x1, y1, length,
            bpbr, bcbr,
            gesImg, imgTsf, imgW, imgH, 
            left, top, zoom, minZoom, maxZoom = 4;

        var moveTouchId;
        var onTouchNumChange = function(jqEvent){
            jqEvent.preventDefault();// avoid select
            if(-1==curIndex){return;}
            var oEvent = jqEvent.originalEvent;
            var touchs = oEvent.targetTouches;
            var curButtons;
            if(!touchs){
                if(!workingPointerDevice){
                    workingPointerDevice = 'mouse';
                }else if('mouse' != workingPointerDevice){
                    return;
                }
                touchs = [{
                    pageX: oEvent.clientX,
                    pageY: oEvent.clientY
                }];
                curButtons = oEvent.buttons;
            }else if(touchs.length){
                if(!workingPointerDevice){
                    workingPointerDevice = 'touch';
                }else if('touch' != workingPointerDevice){
                    return;
                }
            }
            if(1 == touchs.length){
                x0 = clickDownX = touchs[0].pageX;
                y0 = clickDownY = touchs[0].pageY;
                getImgInfo();

                // if dbl click zoom
                var _clickTime = clickTime;
                clickTime = (new Date()).getTime();
                var _clickButtons = clickButtons;
                clickButtons = curButtons || ((Math.abs(zoom - minZoom) / minZoom < 1e-2) ? 1 : 2);
                if(clickTime - _clickTime < dblClickInterval && 
                    clickButtons == _clickButtons && 
                    (1 == clickButtons || 2 == clickButtons) &&
                    Math.abs(touchs[0].pageX - clickUpX) < maxMoveRegardAsDblClick && 
                    Math.abs(touchs[0].pageY - clickUpY) < maxMoveRegardAsDblClick)
                {
                    clickTime = Number.NEGATIVE_INFINITY;
                    // zoom
                    var _cx = x0, _cy = y0, _zoom = zoom;
                    var rate = ((1 == clickButtons) ? kPainter.leftDoubleClickZoomRate : kPainter.rightDoubleClickZoomRate);
                    zoom *= rate;
                    if(zoom>maxZoom){
                        zoom = maxZoom;
                        rate = maxZoom / _zoom;
                    }
                    if(zoom<minZoom){
                        zoom = minZoom;
                        rate = minZoom / _zoom;
                    }
                    var imgCx = left + bpbr.pageX0 + bpbr.width / 2,
                        imgCy = top + bpbr.pageY0 + bpbr.height / 2;
                    left -= (rate-1)*(_cx-imgCx);
                    top -= (rate-1)*(_cy-imgCy);
                    correctPosZoom();
                }
                
                // move start
                if(null == gestureStatus){
                    gestureStatus = 'posZoom';
                }else{ 
                    /* avoid touching from cropRect to touchPanel invoke dlclick */
                    return; 
                }
                mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index','unset');
                mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index','unset');
                mainBox.find('> .kPainterCroper > .kPainterMover').css('z-index','unset');
                mainBox.find('> .kPainterCroper > .kPainterBigMover').css('z-index','unset');
                moveTouchId = touchs[0].identifier;
            }else if(2 == touchs.length){
                // zoom start
                x0 = clickDownX = touchs[0].pageX;
                y0 = clickDownY = touchs[0].pageY;
                if(null == gestureStatus){
                    gestureStatus = 'posZoom';
                }
                if('posZoom' != gestureStatus){
                    return;
                }
                getImgInfo();
                mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index','unset');
                mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index','unset');
                mainBox.find('> .kPainterCroper > .kPainterMover').css('z-index','unset');
                mainBox.find('> .kPainterCroper > .kPainterBigMover').css('z-index','unset');
                x1 = touchs[1].pageX;
                y1 = touchs[1].pageY;
                cx = (x0+x1)/2;
                cy = (y0+y1)/2;
                length = Math.sqrt(Math.pow(x0-x1, 2) + Math.pow(y0-y1, 2));
            }else if(0 == touchs.length){
                clickUpX = x0, clickUpY = y0;
                onMouseUpOrTouchToZero();
            }
        };
        var maxSpdSwitchRate = 1.2, minSwitchMovLen = 50, minSwitchMovSpd = 200;
        kPainter.allowedTouchMoveSwitchImgOverBoundary = true;
        var onMouseUpOrTouchToZero = function(){
            if(-1==curIndex){return;}
            if('posZoom' == gestureStatus){
                workingPointerDevice = null;
                gestureStatus = null;
                mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index', 1);
                mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index', 1);
                mainBox.find('> .kPainterCroper > .kPainterMover').css('z-index', 1);
                mainBox.find('> .kPainterCroper > .kPainterBigMover').css('z-index', 1);
                if(!isEditing && 1!=imgArr.length){
                    var rate = zoom / minZoom, spdSwitchAble = false,
                        horMovLen, horMovSpd;
                    if(rate < maxSpdSwitchRate){
                        spdSwitchAble = true;
                        horMovLen = Math.sqrt(Math.pow(x0 - clickDownX, 2) + Math.pow(y0 - clickDownY, 2));
                        horMovSpd = horMovLen / (((new Date()).getTime() - clickTime) / 1000);
                    }
                    if(left < -(Math.round(imgW*zoom) || 1)/2 || (spdSwitchAble && horMovLen < -minSwitchMovLen && horMovSpd < -minSwitchMovSpd)){
                        if(curIndex + 1 < imgArr.length || kPainter.allowedTouchMoveSwitchImgOverBoundary){
                            imgStorer.showImg((imgArr.length + curIndex + 1) % imgArr.length);
                            return;
                        }
                    }else if(left > (Math.round(imgW*zoom) || 1)/2 || (spdSwitchAble && horMovLen > minSwitchMovLen && horMovSpd > minSwitchMovSpd)){
                        if(curIndex - 1 >= 0 || kPainter.allowedTouchMoveSwitchImgOverBoundary){
                            imgStorer.showImg((imgArr.length + curIndex - 1) % imgArr.length);
                            return;
                        }
                    }
                }
                correctPosZoom();
                updateImgPosZoom();
            }
        };

        var getImgInfo = function(isIgnoreCrop){
            var box = mainBox;
            if(isEditing){
                gesImg = mainCvs;
                imgW = gesImg.width;
                imgH = gesImg.height;
            }else{
                gesImg = imgArr[curIndex];
                imgW = gesImg.kPainterWidth;
                imgH = gesImg.kPainterHeight;
            }
            left = parseFloat(gesImg.style.left) + absoluteCenterDistance;
            top = parseFloat(gesImg.style.top) + absoluteCenterDistance;
            imgTsf = $(gesImg).getTransform();
            if(0 != imgTsf.a*imgTsf.d && 0 == imgTsf.b*imgTsf.c){//
            }else{
                var temp = imgW;
                imgW = imgH, imgH = temp;
            }
            zoom = gesImg.kPainterZoom || 1;
            bpbr = box.paddingBoxRect();
            bcbr = box.contentBoxRect();
            minZoom = Math.min(bcbr.width / imgW, bcbr.height / imgH);
            if(isEditing && cropGesturer.isCropRectShowing && !isIgnoreCrop){
                var nRect = cropGesturer.getNeededRect();
                minZoom = Math.max(
                    Math.max(nRect.width, imgW * minZoom) / imgW,
                    Math.max(nRect.height, imgH * minZoom) / imgH
                );
            }
        };

        kPainter.onUpdateImgPosZoom = null;
        var updateImgPosZoom = function(){
            //correctPosZoom();
            gesImg.style.left = left-absoluteCenterDistance+'px', gesImg.style.right = -left-absoluteCenterDistance+'px';
            gesImg.style.top = top-absoluteCenterDistance+'px', gesImg.style.bottom = -top-absoluteCenterDistance+'px';
            gesImg.kPainterZoom = zoom;
            if(0 != imgTsf.a*imgTsf.d && 0 == imgTsf.b*imgTsf.c){
                gesImg.style.width = (Math.round(imgW * zoom) || 1) + "px"; 
                gesImg.style.height = (Math.round(imgH * zoom) || 1) + "px"; 
            }else{
                gesImg.style.height = (Math.round(imgW * zoom) || 1) + "px"; 
                gesImg.style.width = (Math.round(imgH * zoom) || 1) + "px"; 
            }
            if(!isEditing && 1!=imgArr.length){
                var boundaryPaddingD = Math.max(0, ((Math.round(imgW*zoom) || 1) - bpbr.width) / 2);
                if(imgArr.length > 2 || left > boundaryPaddingD){
                    var pImg = imgArr[(imgArr.length + curIndex - 1) % imgArr.length];
                    pImg.style.left = left - boundaryPaddingD - bpbr.width + 'px';
                    pImg.style.right = -left + boundaryPaddingD + bpbr.width + 'px';
                }
                if(imgArr.length > 2 || left <= -boundaryPaddingD){
                    var nImg = imgArr[(imgArr.length + curIndex + 1) % imgArr.length];
                    nImg.style.left = left + boundaryPaddingD + bpbr.width + 'px';
                    nImg.style.right = -left - boundaryPaddingD - bpbr.width + 'px';
                }
            }
            doCallbackNoBreak(kPainter.onUpdateImgPosZoom);
        };

        var correctPosZoom = function(bIgnoreHor, bIgnoreVer){
            if(zoom>maxZoom){
                zoom = maxZoom;
            }
            if(zoom<minZoom){
                zoom = minZoom;
            }
            if(!bIgnoreHor){
                var imgVW = (Math.round(imgW*zoom) || 1);
                if(bcbr.width>imgVW){
                    left = 0;
                }else{
                    var addW = (imgVW - bcbr.width) / 2;
                    if(left < - addW){
                        left = -addW;
                    }else if(left > addW){
                        left = addW;
                    }
                }
            }
            if(!bIgnoreVer){
                var imgVH = (Math.round(imgH*zoom) || 1);
                if(bcbr.height>imgVH){
                    top = 0;
                }else{
                    var addH = (imgVH - bcbr.height) / 2;
                    if(top < - addH){
                        top = -addH;
                    }else if(top > addH){
                        top = addH;
                    }
                }
            }
        };

        kPainter.getZoom = function(){
            if(0 == imgArr.length){
                return undefined;
            }
            getImgInfo();
            return zoom;
        };
        kPainter.setZoom = function(num, isRate){
            if(0 == imgArr.length){
                return null;
            }
            num = parseFloat(num);
            if(num !== num){
                return null;
            }
            getImgInfo();
            if(isRate){
                zoom *= num;
            }else{
                zoom = num;
            }
            correctPosZoom();
            updateImgPosZoom();
            return zoom;
        };

        gesturer.setImgStyleFit = function(){
            getImgInfo(true);
            zoom = minZoom;
            correctPosZoom();
            updateImgPosZoom();
            kPainter.setCropRectArea();
        };

        mainBox.on('touchstart touchcancel touchend mousedown', onTouchNumChange);
        
        mainBox.on('mouseup', function(jqEvent){
            if('mouse' != workingPointerDevice){
                return;
            }
            var oEvent = jqEvent.originalEvent;
            clickUpX = oEvent.clientX, clickUpY = oEvent.clientY;
            onMouseUpOrTouchToZero();
        });
        mainBox.on('mouseleave', function(jqEvent){
            if('mouse' != workingPointerDevice){
                return;
            }
            var oEvent = jqEvent.originalEvent;
            if(!oEvent.buttons){return;}// mouse not pressing
            clickUpX = x0, clickUpY = y0;
            onMouseUpOrTouchToZero();
        });
        
        mainBox.on('contextmenu', function(jqEvent){
            jqEvent.preventDefault();
            //jqEvent.stopPropagation();
        });
        mainBox.on('touchmove mousemove', function(jqEvent){
            jqEvent.preventDefault();// avoid select
            var touchs = jqEvent.originalEvent.targetTouches;
            if(!touchs){
                if('mouse' != workingPointerDevice){
                    return;
                }
                touchs = [{
                    pageX: jqEvent.originalEvent.clientX,
                    pageY: jqEvent.originalEvent.clientY
                }];
            }else{// touch event
                if('touch' != workingPointerDevice){
                    return;
                }
            }
            if(1 == touchs.length){
                // move
                if('posZoom' != gestureStatus || moveTouchId != touchs[0].identifier){
                    // or touch is not same
                    return;
                }
                var _x0 = x0, _y0 = y0;
                x0 = touchs[0].pageX;
                y0 = touchs[0].pageY;
                left += x0-_x0;
                top += y0-_y0;
                correctPosZoom(!isEditing);
                updateImgPosZoom();
            }else if(2 == touchs.length){
                // zoom
                if('posZoom' != gestureStatus){
                    return;
                }
                var _cx = cx, _cy = cy, _length = length, _zoom = zoom;
                x0 = touchs[0].pageX;
                y0 = touchs[0].pageY;
                x1 = touchs[1].pageX;
                y1 = touchs[1].pageY;
                cx = (x0+x1)/2;
                cy = (y0+y1)/2;
                length = Math.sqrt(Math.pow(x0-x1, 2) + Math.pow(y0-y1, 2));
                //var ibbr = $(gesImg).borderBoxRect();
                var rate = length/_length;
                zoom *= rate;
                if(zoom>maxZoom){
                    zoom = maxZoom;
                    rate = maxZoom / _zoom;
                }
                if(zoom<minZoom){
                    zoom = minZoom;
                    rate = minZoom / _zoom;
                }
                var imgCx = left + bpbr.pageX0 + bpbr.width / 2,
                    imgCy = top + bpbr.pageY0 + bpbr.height / 2;
                left -= (rate-1)*(_cx-imgCx);
                top -= (rate-1)*(_cy-imgCy);
                correctPosZoom();
                updateImgPosZoom();
            }
        });

    };

};

KPainter._doCallbackNoBreak = function(callback, paras){
    if(callback){try{callback.apply(window, paras||[]);}catch(ex){setTimeout(function(){throw(ex);},0);}}
};

var imageViewer = KPainter;//eslint-disable-line
//imageViewer.imgStorer = KPainter.imgStorer;
//imageViewer.gesturer = KPainter.gesturer;
//export default MBC;