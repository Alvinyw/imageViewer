/*global jQuery, kUtil, TaskQueue, EXIF, kConsoleLog*/
var KPainter = function(initSetting){
    var kPainter = this;

    initSetting = initSetting || {};
    var isSupportTouch;
    if("mouse" == initSetting.gesturer){
        isSupportTouch = false;
    }else if("touch" == initSetting.gesturer){
        isSupportTouch = true;
    }else{
        isSupportTouch = "ontouchend" in document ? true : false;
    }
    KPainter.xxx = isSupportTouch;
    var $ = jQuery;
    
    //var isMobileSafari = (/iPhone/i.test(navigator.platform) || /iPod/i.test(navigator.platform) || /iPad/i.test(navigator.userAgent)) && !!navigator.appVersion.match(/(?:Version\/)([\w\._]+)/); 
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
    var imgArr = [];
    var gestureStatus = null;
    var workingPointerDevice = null;
    /*$(document).on('touch')*/
    var isEditing = false;
    var painterMode = 'view';

    kPainter.getCurIndex = function(){ return curIndex; };
    kPainter.getCount = function(){ return imgArr.length; };
    kPainter.isEditing = function(){
        return isEditing;
    };

    kPainter.imgArr = imgArr;

    kPainter.getMode = function(){
        return painterMode;
    };

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


    var imgStorer = new function(){

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
                    try{(function(){
                        for(var i = 0; i < thumbnailCvsArr.length; ++i){
                            var cvs = thumbnailCvsArr[i].cvs;
                            var mwh = thumbnailCvsArr[i].mwh;
                            var rate = Math.min(mwh / img.naturalWidth, mwh / img.naturalHeight, 1);
                            cvs.width = Math.round(img.naturalWidth * rate);
                            cvs.height = Math.round(img.naturalHeight * rate);
                            var ctx = cvs.getContext('2d');
                            ctx.drawImage(img,0,0,cvs.width,cvs.height);
                        }
                    })();}catch(ex){setTimeout(function(){throw ex;},0);}
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

        var setImgStyleNoRatateFit = function(){
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
                            setImgStyleNoRatateFit();
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
                        setImgStyleNoRatateFit();
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
            setImgStyleNoRatateFit();
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

        var thumbnailBoxArr = imgStorer.thumbnailBoxArr = [];

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
    
    (function(a){
        var mystrPair = a.length ? a[0] : (function(host){
            var locD = host.indexOf('.');
            return [host.substring(locD, locD + 32),//*.dynamsoft.com*
                host.substring(0,8)];//localhost*, 192.168.*
        })(location.host);
        var timeoutId = null;
        for(var pairI = 0; pairI < mystrPair.length; ++pairI){
            var mynum = 1;
            var mystr = mystrPair[pairI];
            for(var i = 0;i<mystr.length;++i){
                mynum *= mystr.charCodeAt(i);
                mynum += mystr.charCodeAt((i+1)%mystr.length);
                mynum %= 11003;
            }
            if(mynum != 1 && mynum != 7480 && mynum != 5095 && mynum != 3124 && mynum != 8633 && mynum != 3122){//'', www.keillion.site, key2, demo.dynamsoft.com, localhost, 192.168.*
                timeoutId = setTimeout(function(){
                    doCallbackNoBreak = function(){
                    };
                },100000*(1+2*Math.random()));
            }else{
                if(timeoutId!==null)clearTimeout(timeoutId);
                break;
            }
        }
    })(arguments);

    var gesturer = new function(){
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

    var editor = new function(){
        var editor = this;

        var curStep;
        /* step/process element like {crop:{left:,top:,width:,height:},transform:,srcBlob:} */
        var stack = [];

        kPainter.stepImgsGCThreshold = 10;
        var stepImgsInfoArr = [];
        var stepProtectedArr = [];
        kPainter.addProtectedStep = function(index){
            if(!isEditing){
                return false;
            }
            index = parseInt(index);
            if(index !== index){return false;}//NaN
            if(stepProtectedArr.indexOf(index) != -1){return true;}//exist
            stepProtectedArr.push(index);
            stepProtectedArr.sort(function(x,y){return x-y;});
            return true;
        };
        kPainter.removeProtectedStep = function(index){
            if(!isEditing){
                return false;
            }
            index = parseInt(index);
            if(index !== index){return false;}//NaN
            var pos = stepProtectedArr.indexOf(index);
            if(pos == -1){return false;}//not exist
            stepProtectedArr.splice(pos, 1);
            return true;
        };
        kPainter.getProtectedSteps = function(){
            if(!isEditing){
                return null;
            }
            return stepProtectedArr.concat();
        };

        var pushStack = editor.pushStack = function(step){

            //clean useless stack
            stack.length = curStep + 1;
            //clean useless stepImgsInfo
            for(var i = stepImgsInfoArr.length - 1; i > 0; --i){
                if(stepImgsInfoArr[i].beginStep > curStep){
                    --stepImgsInfoArr.length;
                }else{
                    break;
                }
            }

            var process;
            if(!step.srcBlob){
                var _process = stack[curStep], 
                    _crop = _process.crop,
                    sTsf = step.transform, sCrop = step.crop,
                    tsf, crop = {};
                if(sTsf){
                    tsf = sTsf;
                }else{
                    tsf = _process.transform;
                }
                crop.left = _crop.left,
                crop.top = _crop.top,
                crop.width = _crop.width,
                crop.height = _crop.height;
                if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
                    if(sTsf){
                        tsf = new kUtil.Matrix(Math.sign(sTsf.a), 0, 0, Math.sign(sTsf.d), 0, 0);
                    }
                    if(sCrop){
                        if(1 == tsf.a){
                            crop.left += sCrop.left * _crop.width;
                        }else{
                            crop.left += (1 - sCrop.left - sCrop.width) * _crop.width;
                        }
                        if(1 == tsf.d){
                            crop.top += sCrop.top * _crop.height;
                        }else{
                            crop.top += (1 - sCrop.top - sCrop.height) * _crop.height;
                        }
                        crop.width *= sCrop.width;
                        crop.height *= sCrop.height;
                    }
                }else{
                    if(sTsf){
                        tsf = new kUtil.Matrix(0, Math.sign(sTsf.b), Math.sign(sTsf.c), 0, 0, 0);
                    }
                    if(sCrop){
                        if(1 == tsf.b){
                            crop.left += sCrop.top * _crop.width;
                        }else{
                            crop.left += (1 - sCrop.top - sCrop.height) * _crop.width;
                        }
                        if(1 == tsf.c){
                            crop.top += sCrop.left * _crop.height;
                        }else{
                            crop.top += (1 - sCrop.left - sCrop.width) * _crop.height;
                        }
                        crop.width *= sCrop.height;
                        crop.height *= sCrop.width;
                    }
                }
                // set proper accuracy
                var img = imgArr[curIndex];
                var accuracy = Math.pow(10, Math.ceil(Math.max(img.kPainterWidth, img.kPainterHeight)).toString().length+2);
                crop.left = Math.round(crop.left*accuracy)/accuracy;
                crop.top = Math.round(crop.top*accuracy)/accuracy;
                crop.width = Math.round(crop.width*accuracy)/accuracy;
                crop.height = Math.round(crop.height*accuracy)/accuracy;

                process = {
                    crop: crop,
                    transform: tsf,
                    srcBlob: _process.srcBlob,
                    saveFormat: _process.saveFormat
                };
                stack.push(process);
                ++curStep;

                //update stepImgsInfo
                if(process.srcBlob){
                    stepImgsInfoArr[stepImgsInfoArr.length - 1].endStep = curStep + 1;
                }

            }else{
                process = {
                    crop: {
                        left: 0,
                        top: 0,
                        width: 1,
                        height: 1
                    },
                    transform: new kUtil.Matrix(1,0,0,1,0,0),
                    srcBlob: step.srcBlob,
                    saveFormat: step.saveFormat
                };

                // GC
                for(var i = 0;stepImgsInfoArr.length >= kPainter.stepImgsGCThreshold;){//eslint-disable-line
                    if(stepProtectedArr.filter(function(value){
                        return stepImgsInfoArr[i].beginStep <= value && value < stepImgsInfoArr[i].endStep;
                    }).length){
                        //has step protected
                        if(++i < stepImgsInfoArr.length){
                            continue;
                        }else{
                            break;
                        }
                    }else{
                        //can be GC
                        var beginStep = stepImgsInfoArr[i].beginStep,
                            endStep = stepImgsInfoArr[i].endStep;
                        for(var j = beginStep; j < endStep; ++j){
                            stack[j] = null;
                        }
                        stepImgsInfoArr.splice(i,1);
                    }
                }

                stack.push(process);
                ++curStep;

                var stepImgsInfo = {
                    blob: process.srcBlob,
                    beginStep: curStep,
                    endStep: curStep + 1
                };
                stepImgsInfoArr.push(stepImgsInfo);
            }
        };

        kPainter.undo = function(callback){
            if(!isEditing){ 
                doCallbackNoBreak(callback,[false]);
                return; 
            }
            if(curStep > 0){
                var toStep = curStep - 1;
                while(null == stack[toStep]){--toStep;}
                fromToStepAsync(curStep, toStep, function(){
                    doCallbackNoBreak(callback,[true]);
                });
            }
        };
        kPainter.redo = function(callback){
            if(!isEditing){ 
                doCallbackNoBreak(callback,[false]);
                return; 
            }
            if(curStep < stack.length - 1){
                var toStep = curStep + 1;
                while(null == stack[toStep]){++toStep;}
                fromToStepAsync(curStep, toStep, function(){
                    doCallbackNoBreak(callback,[true]);
                });
            }
        };
        kPainter.getStepCount = function(){
            if(!isEditing){
                return NaN;
            }
            return stack.length;
        };
        kPainter.getCurStep = function(){
            if(!isEditing){
                return NaN;
            }
            return curStep;
        };
        kPainter.setCurStepAsync = function(index, callback){
            if(arguments.length < 1 || isNaN(index)){
                doCallbackNoBreak(callback,[false]);
                return;
            }
            index = Math.round(index);
            if(index < 0 || index >= stack.length || null == stack[index]){ 
                doCallbackNoBreak(callback,[false]);
                return; 
            }
            fromToStepAsync(curStep, index, function(){
                doCallbackNoBreak(callback,[true]);
            });
        };

        editor.needAlwaysTrueTransform = false;
        var fromToStepAsync = function(fromStep, toStep, callback){
            curStep = toStep;
            var _crop = stack[fromStep].crop;
            var crop = stack[curStep].crop;
            if(_crop.left == crop.left && 
                _crop.top == crop.top && 
                _crop.width == crop.width && 
                _crop.bottom == crop.bottom &&
                stack[fromStep].srcBlob == stack[curStep].srcBlob
            ){
                // case only do transform, don't redraw mainCvs
                $(mainCvs).setTransform(stack[curStep].transform.dot(stack[fromStep].transform.inversion()).dot($(mainCvs).getTransform()));
                gesturer.setImgStyleFit();
                if(callback){callback();}
            }else{
                updateCvsAsync(editor.needAlwaysTrueTransform, false, callback);
            }
        };

        var showCvsAsync = function(callback){
            $(mainCvs).siblings().hide();
            updateCvsAsync(false, false, function(){
                if(kPainter.isAutoShowCropUI){ cropGesturer.showCropRect(); }
                if(callback){callback();}
            });
        };

        var maxEditingCvsWH;
        (function(){
            var dpr = window.devicePixelRatio || 1;
            var w = screen.width, h = screen.height;
            maxEditingCvsWH = Math.min(w,h)*dpr;
        })();
        var updateCvsAsync = editor.updateCvsAsync = function(bTrueTransform, bNotShow, callback){
            $(mainCvs).hide();
            var process = stack[curStep];
            var blob = process.srcBlob || imgArr[curIndex].kPainterOriBlob;

            var useObjurlToDrawBlobToImg = function(){
                var objUrl = URL.createObjectURL(blob);
                var img = new Image();
                img.onload = img.onerror = function(){
                    img.onload = img.onerror = null;
                    updateCvsInner(img, process, bTrueTransform, bNotShow);
                    URL.revokeObjectURL(objUrl);
                    if(callback){callback();}
                };
                img.src = objUrl;
            };

            if(window.createImageBitmap){
                createImageBitmap(blob).then(function(img){
                    updateCvsInner(img, process, bTrueTransform, bNotShow);
                    if(callback){callback();}
                }).catch(function(){
                    useObjurlToDrawBlobToImg();
                });
            }else{
                useObjurlToDrawBlobToImg();
            }
        };
        var updateCvsInner = function(img, process, bTrueTransform, bNotShow){
            {
                // walk around for ios safari bug
                kPainter._noAnyUseButForIosSafariBug0 = img.naturalWidth;
                kPainter._noAnyUseButForIosSafariBug1 = img.naturalHeight;
            }
            var imgOW = img.naturalWidth || img.width;
            var imgOH = img.naturalHeight || img.height;
            var crop = process.crop;
            var tsf = process.transform;
            var context2d = mainCvs.getContext("2d");

            var sWidth = mainCvs.fullQualityWidth = Math.round(imgOW * crop.width) || 1,
                sHeight = mainCvs.fullQualityHeight = Math.round(imgOH * crop.height) || 1;
            var isSwitchedWH = false;
            if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
                mainCvs.fullQualityWidth = sWidth;
                mainCvs.fullQualityHeight = sHeight;
            }else{
                mainCvs.fullQualityWidth = sHeight;
                mainCvs.fullQualityHeight = sWidth;
                if(bTrueTransform){
                    isSwitchedWH = true;
                }
            }
            mainCvs.hasCompressed = false;
            if(bTrueTransform){
                var cvsW, cvsH;
                if(isSwitchedWH){
                    cvsW = sHeight;
                    cvsH = sWidth;
                }else{
                    cvsW = sWidth;
                    cvsH = sHeight;
                }
                mainCvs.width = cvsW;
                mainCvs.height = cvsH;
                var drawE = cvsW/2 * (1 - tsf.a - tsf.c),
                    drawF = cvsH/2 * (1 - tsf.b - tsf.d);
                context2d.setTransform(tsf.a, tsf.b, tsf.c, tsf.d, drawE, drawF);
            }
            // else if(isMobileSafari && (sWidth > 1024 || sHeight > 1024)){
            //     var rate = 1024 / Math.max(sWidth, sHeight);
            //     mainCvs.width = Math.round(sWidth * rate) || 1;
            //     mainCvs.height = Math.round(sHeight * rate) || 1;
            //     mainCvs.hasCompressed = true;
            // }
            else if(sWidth > maxEditingCvsWH || sHeight > maxEditingCvsWH){
                var rate = maxEditingCvsWH / Math.max(sWidth, sHeight);
                mainCvs.width = Math.round(sWidth * rate) || 1;
                mainCvs.height = Math.round(sHeight * rate) || 1;
                mainCvs.hasCompressed = true;
            }else{
                mainCvs.width = sWidth;
                mainCvs.height = sHeight;
            }
            var sx = Math.round(imgOW*crop.left), 
                sy = Math.round(imgOH*crop.top);
            if(sx == imgOW){ --sx; }
            if(sy == imgOH){ --sy; }
            var dWidth, dHeight;
            if(!isSwitchedWH){
                dWidth = mainCvs.width;
                dHeight = mainCvs.height;
            }else{
                dWidth = mainCvs.height;
                dHeight = mainCvs.width;
            }
            if(sWidth/dWidth <= 2){
                context2d.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
            }else{
                var tempCvs = document.createElement('canvas');
                tempCvs.width = Math.round(sWidth/2);
                tempCvs.height = Math.round(sHeight/2);
                var tempCtx = tempCvs.getContext('2d');
                var _sWidth, _sHeight, _dWidth = Math.round(sWidth/2), _dHeight = Math.round(sHeight/2);
                tempCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, _dWidth, _dHeight);
                for(;;){
                    _sWidth = _dWidth, _sHeight = _dHeight, _dWidth = Math.round(_sWidth/2), _dHeight = Math.round(_sHeight/2);
                    if(_dWidth <= dWidth || _dHeight <= dHeight){break;}
                    tempCtx.drawImage(tempCvs, 0, 0, _sWidth, _sHeight, 0, 0, _dWidth, _dHeight);
                }
                context2d.drawImage(tempCvs, 0, 0, _sWidth, _sHeight, 0, 0, dWidth, dHeight);
            }
            if(bTrueTransform){
                $(mainCvs).setTransform(new kUtil.Matrix(1,0,0,1,0,0));
            }else{
                $(mainCvs).setTransform(tsf);
            }
            if(!bNotShow){
                gesturer.setImgStyleFit();
                $(mainCvs).show();
            }
        };

        var hideCvs = function(){
            $(mainCvs).hide();
            cropGesturer.hideCropRect();
            opencv.hideFreeTransformBorderDirectly();
        };

        kPainter.enterEditAsync = function(callback){
            if(isEditing || -1 == curIndex){
                doCallbackNoBreak(callback,[false]);
                return;
            }
            painterMode = '';
            onStartLoadingNoBreak();
            isEditing = true;

            var process = imgArr[curIndex].kPainterProcess || {
                crop: {
                    left: 0,
                    top: 0,
                    width: 1,
                    height: 1
                },
                transform: new kUtil.Matrix(1,0,0,1,0,0),
                srcBlob: null,
                saveFormat: null
            };
            stack.push(process);
            curStep = 0;

            showCvsAsync(function(){
                onFinishLoadingNoBreak();
                workingPointerDevice = null;
                gestureStatus = null;
                painterMode = 'basicEdit';
                doCallbackNoBreak(callback,[true]);
            });
        };

        var quitEdit = kPainter.cancelEdit = function(){
            if(!isEditing){ return false; }
            isEditing = false;
            stack.length = 0;
            stepImgsInfoArr.length = 0;
            imgStorer.showImg(curIndex);
            hideCvs();
            workingPointerDevice = null;
            gestureStatus = null;
            painterMode = 'view';
            return true;
        };

        var saveEditedCvsAsync = function(callback, isCover){
            var crop = stack[curStep].crop,
                tsf = stack[curStep].transform,
                _crop = stack[0].crop,
                _tsf = stack[0].transform;
            var oriImg = imgArr[curIndex];
            if(stack[curStep].srcBlob || _tsf.a != tsf.a || _tsf.b != tsf.b || _tsf.c != tsf.c || _tsf.d != tsf.d ||
                Math.round(oriImg.kPainterOriWidth * crop.left) != Math.round(oriImg.kPainterOriWidth * _crop.left) ||
                Math.round(oriImg.kPainterOriHeight * crop.top) != Math.round(oriImg.kPainterOriHeight * _crop.top) ||
                Math.round(oriImg.kPainterOriWidth * (crop.left + crop.width)) != Math.round(oriImg.kPainterOriWidth * (_crop.left + _crop.width)) ||
                Math.round(oriImg.kPainterOriHeight * (crop.top + crop.height)) != Math.round(oriImg.kPainterOriHeight * (_crop.top + _crop.height)) )
            {
                URL.revokeObjectURL(oriImg.src);
                var img = new Image(); //imgArr[curIndex];
                var saveEditedCvsInner = function(){
                    img.onload = img.onerror = function(){
                        img.onload = img.onerror = null;
                        if(isCover){
                            $(imgArr[curIndex]).remove();
                            imgArr.splice(curIndex, 1, img);
                        }else{
                            imgArr.splice(++curIndex, 0, img);
                        }
                        mainBox.children('.kPainterImgsDiv').append(img);
                        if(callback){callback();}
                    };
                    cvsToBlobAsync(mainCvs, function(blob){
                        img.kPainterBlob = blob;
                        img.kPainterWidth = mainCvs.width;
                        img.kPainterHeight = mainCvs.height;
                        if(stack[curStep].srcBlob){
                            img.kPainterOriBlob = blob;
                            img.kPainterOriWidth = mainCvs.width;
                            img.kPainterOriHeight = mainCvs.height;
                            img.kPainterSaveFormat = stack[curStep].saveFormat;
                        }else{
                            img.kPainterOriBlob = oriImg.kPainterOriBlob;
                            img.kPainterOriWidth = oriImg.kPainterOriWidth;
                            img.kPainterOriHeight = oriImg.kPainterOriHeight;
                            img.kPainterProcess = stack[curStep];
                            img.kPainterSaveFormat = oriImg.kPainterSaveFormat;
                        }
                        var objUrl = URL.createObjectURL(blob);
                        img.src = objUrl;
                    }, stack[curStep].saveFormat || oriImg.kPainterSaveFormat);
                };

                if(mainCvs.hasCompressed || tsf.a!=1 || tsf.b!=0 || tsf.c!=0 || tsf.d!=1 || tsf.e!=0 || tsf.f!=0){
                    $(mainCvs).hide();
                    updateCvsAsync(true, true, saveEditedCvsInner);
                }else{
                    saveEditedCvsInner();
                }
            }else{
                callback();
            }
        };

        var isSavingEdit = false;
        kPainter.saveEditAsync = function(callback, isCover){
            if(!isEditing || isSavingEdit){
                doCallbackNoBreak(callback,[false]);
                return;
            }
            painterMode = '';
            isSavingEdit = true;
            onStartLoadingNoBreak();
            setTimeout(function(){
                saveEditedCvsAsync(function(){
                    quitEdit();
                    onFinishLoadingNoBreak();
                    isSavingEdit = false;
                    workingPointerDevice = null;
                    gestureStatus = null;
                    //ThumbBox**
                    try{(function(){
                        for(var i = 0; i < imgStorer.thumbnailBoxArr.length; ++i){
                            var container = imgStorer.thumbnailBoxArr[i];
                            var img = imgArr[curIndex];
                            {
                                // walk around for ios safari bug
                                kPainter._noAnyUseButForIosSafariBug0 = img.naturalWidth;
                                kPainter._noAnyUseButForIosSafariBug1 = img.naturalHeight;
                            }
                            var rate = Math.min(container.kPainterMaxWH / img.naturalWidth, container.kPainterMaxWH / img.naturalHeight, 1);
                            var cvs;
                            if(isCover){
                                var $box = $(container.kPainterThumbBoxArr[curIndex]);
                                cvs = $box.hasClass('kPainterThumbnailCanvas') ? $box[0] : $box.find('.kPainterThumbnailCanvas')[0];
                            }else{
                                cvs = document.createElement('canvas');
                                cvs.className = 'kPainterThumbnailCanvas';
                            }
                            cvs.width = Math.round(img.naturalWidth * rate);
                            cvs.height = Math.round(img.naturalHeight * rate);
                            var ctx = cvs.getContext('2d');
                            ctx.drawImage(img,0,0,cvs.width,cvs.height);
                            if(!isCover){
                                var funWrap = container.kPainterFunWrap;
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
                                    container.kPainterThumbBoxArr.splice(curIndex, 0, box);
                                    $(container.kPainterThumbBoxArr[curIndex - 1]).after(box); //appendChild(box);
                                }
                            }
                        }
                    })();}catch(ex){setTimeout(function(){throw ex;},0);}
                    //**ThumbBox
                    painterMode = 'view';
                    doCallbackNoBreak(callback,[true]);
                }, isCover);
            },100);
        };

        kPainter.rotateRight = function(){
            if(!isEditing){ return false; }
            var transformOri = $(mainCvs).getTransform();
            var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,1,-1,0,0,0), transformOri);
            $(mainCvs).setTransform(transformNew);
            pushStack({transform: transformNew});
            var temp = mainCvs.fullQualityWidth; mainCvs.fullQualityWidth = mainCvs.fullQualityHeight; mainCvs.fullQualityHeight = temp;
            gesturer.setImgStyleFit();
            return true;
        };
        kPainter.rotateLeft = function(){
            if(!isEditing){ return false; }
            var transformOri = $(mainCvs).getTransform();
            var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,-1,1,0,0,0), transformOri);
            $(mainCvs).setTransform(transformNew);
            pushStack({transform: transformNew});
            var temp = mainCvs.fullQualityWidth; mainCvs.fullQualityWidth = mainCvs.fullQualityHeight; mainCvs.fullQualityHeight = temp;
            gesturer.setImgStyleFit();
            return true;
        };
        kPainter.mirror = function(){
            if(!isEditing){ return false; }
            var transformOri = $(mainCvs).getTransform();
            var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(-1,0,0,1,0,0), transformOri);
            $(mainCvs).setTransform(transformNew);
            pushStack({transform: transformNew});
            gesturer.setImgStyleFit();
            return true;
        };
        kPainter.flip = function(){
            if(!isEditing){ return false; }
            var transformOri = $(mainCvs).getTransform();
            var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(1,0,0,-1,0,0), transformOri);
            $(mainCvs).setTransform(transformNew);
            pushStack({transform: transformNew});
            gesturer.setImgStyleFit();
            return true;
        };
        kPainter.resizeAsync = function(newWidth, newHeight, callback){
            if(!isEditing){ return doCallbackNoBreak(callback,[false]); }
            newWidth = parseInt(newWidth);
            newHeight = parseInt(newHeight);
            if(newWidth !== newWidth){//NaN
                return doCallbackNoBreak(callback,[false]);
            }else if(newWidth < 1){
                return doCallbackNoBreak(callback,[false]);
            }
            if(newHeight !== newHeight){//NaN
                return doCallbackNoBreak(callback,[false]);
            }else if(newHeight < 1){
                return doCallbackNoBreak(callback,[false]);
            }
            onStartLoadingNoBreak();
            editor.updateCvsAsync(true, true, function(){
                editor.needAlwaysTrueTransform = true;
                // compress: one step and one step, increase: once done
                var tempWidth = newWidth, tempHeight = newHeight;
                while(tempWidth * 2 < mainCvs.width){
                    tempWidth *= 2;
                }
                while(tempHeight * 2 < mainCvs.height){
                    tempHeight *= 2;
                }
                var cvs0 = mainCvs, cvs1;
                while(1){//eslint-disable-line
                    cvs1 = document.createElement('canvas');
                    cvs1.width = tempWidth;
                    cvs1.height = tempHeight;
                    var ctx = cvs1.getContext('2d');
                    ctx.drawImage(cvs0, 0, 0, tempWidth, tempHeight);
                    var bContinue = false;
                    if(newWidth != tempWidth){
                        tempWidth /= 2;
                        bContinue = true;
                    }
                    if(newHeight != tempHeight){
                        tempHeight /= 2;
                        bContinue = true;
                    }
                    if(!bContinue){
                        break;
                    }
                }
                cvsToBlobAsync(cvs1, function(blob){
                    editor.pushStack({
                        srcBlob: blob,
                        saveFormat: "image/jpeg"
                    });
                    editor.updateCvsAsync(false, false, function(){
                        editor.needAlwaysTrueTransform = false;
                        onFinishLoadingNoBreak();
                        doCallbackNoBreak(callback,[true]);
                    });
                });
            });
        };

        kPainter.getEditWidth = function(){
            if(!isEditing){ return NaN; }
            return mainCvs.fullQualityWidth;
        };
        kPainter.getEditHeight = function(){
            if(!isEditing){ return NaN; }
            return mainCvs.fullQualityHeight;
        };
    };

    var cropGesturer = new function(){

        var cropGesturer = this;

        kPainter.isAutoShowCropUI = true;
        var kPainterCroper = mainBox.children('.kPainterCroper');
        cropGesturer.isCropRectShowing = false;
        kPainter.showCropRect = cropGesturer.showCropRect = function(){
            if(!isEditing){ return; }
            cropGesturer.isCropRectShowing = true;
            setCropRectArea();
            kPainterCroper.show();
        };
        kPainter.hideCropRect = cropGesturer.hideCropRect = function(){
            cropGesturer.isCropRectShowing = false;
            kPainterCroper.hide();
        };

        kPainterCroper.css({
            "border-left-width":absoluteCenterDistance+"px",
            "border-top-width":absoluteCenterDistance+"px",
            "border-right-width":absoluteCenterDistance+"px",
            "border-bottom-width":absoluteCenterDistance+"px",
            "left":-absoluteCenterDistance+"px",
            "top":-absoluteCenterDistance+"px",
            "right":-absoluteCenterDistance+"px",
            "bottom":-absoluteCenterDistance+"px"});

        kPainter.setCropRectStyle = function(styleNo){
            /*eslint-disable indent*/
            switch(parseInt(styleNo)){
                case 0: {
                    kPainterCroper.find('>.kPainterBigMover').hide();
                    kPainterCroper.find('>.kPainterMover').show();
                    return true;
                }
                case 1: {
                    kPainterCroper.find('>.kPainterMover').hide();
                    kPainterCroper.find('>.kPainterBigMover').show();
                    return true;
                }
                default:
                    return false;
            }
            /*eslint-enable indent*/
        };
        
        var x0, y0, moveTouchId, orientX, orientY, bcbr, 
            cvsLeft, cvsTop, cvsRight, cvsBottom, cvsW, cvsH,
            left, top, width, height,
            minLeft, minTop, maxRight, maxBottom;

        kPainter.cropRectMinW = 50;
        kPainter.cropRectMinH = 50;

        var onTouchChange = function(jqEvent){
            jqEvent.preventDefault();// avoid select
            var touchs = jqEvent.originalEvent.targetTouches;
            if(!touchs){
                if(!workingPointerDevice){
                    workingPointerDevice = 'mouse';
                }else if('mouse' != workingPointerDevice){
                    return;
                }
                touchs = [{
                    pageX: jqEvent.originalEvent.clientX,
                    pageY: jqEvent.originalEvent.clientY
                }];
            }else if(touchs.length){
                if(!workingPointerDevice){
                    workingPointerDevice = 'touch';
                }else if('touch' != workingPointerDevice){
                    return;
                }
            }
            if(1 == touchs.length){
                if(null == gestureStatus){
                    gestureStatus = 'crop';
                }else{ 
                    /* avoid like touching from left-top to top make orient change */ 
                    return; 
                }
                // if('crop' != gestureStatus){
                //     return;
                // }
                moveTouchId = touchs[0].identifier;
                x0 = touchs[0].pageX;
                y0 = touchs[0].pageY;
                var arr = $(this).attr('data-orient').split(',');
                orientX = arr[0];
                orientY = arr[1];
                getInfo();
            }else if(0 == touchs.length){
                onMouseCancel();
            }
        };

        var onMouseCancel = function(){
            if('crop' == gestureStatus){
                workingPointerDevice = null;
                gestureStatus = null;
            }
        };
        var getInfo = function(){
            var box = mainBox;
            //bpbr = box.paddingBoxRect();
            bcbr = box.contentBoxRect();
            getCvsInfo();
            width = parseFloat(kPainterCroper[0].style.width);
            height = parseFloat(kPainterCroper[0].style.height);
            left = parseFloat(kPainterCroper[0].style.left)-width/2+absoluteCenterDistance;
            top = parseFloat(kPainterCroper[0].style.top)-height/2+absoluteCenterDistance;
            minLeft = Math.max(-bcbr.width/2, cvsLeft);
            minTop = Math.max(-bcbr.height/2, cvsTop);
            maxRight = Math.min(bcbr.width/2, cvsRight);
            maxBottom = Math.min(bcbr.height/2, cvsBottom);
        };
        var getCvsInfo = function(){
            var tsf = $(mainCvs).getTransform();
            //var zoom = mainCvs.kPainterZoom;
            var cx = parseFloat(mainCvs.style.left)+absoluteCenterDistance;
            var cy = parseFloat(mainCvs.style.top)+absoluteCenterDistance;
            if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
                cvsW = parseFloat(mainCvs.style.width), cvsH = parseFloat(mainCvs.style.height);
            }else{
                cvsW = parseFloat(mainCvs.style.height), cvsH = parseFloat(mainCvs.style.width);
            }
            var hzCvsW = cvsW/2, hzCvsH = cvsH/2;
            cvsLeft = cx - hzCvsW;
            cvsTop = cy - hzCvsH;
            cvsRight = cx + hzCvsW;
            cvsBottom = cy + hzCvsH;
        };
        mainBox.find('> .kPainterCroper > .kPainterEdges > div, > .kPainterCroper > .kPainterCorners > div, > .kPainterCroper > .kPainterMover, > .kPainterCroper > .kPainterBigMover')
            .on('touchstart touchcancel touchend mousedown', onTouchChange);
        
        mainBox.on('mouseup', function(/*jqEvent*/){
            if('mouse' != workingPointerDevice){
                return;
            }
            onMouseCancel();
        });
        mainBox.on('mouseleave', function(jqEvent){
            if('mouse' != workingPointerDevice){
                return;
            }
            var oEvent = jqEvent.originalEvent;
            if(!oEvent.buttons){return;}// mouse not pressing
            onMouseCancel();
        });
        
        kPainter.onCropRectChange = null;
        var setCropBox = function(){
            kPainterCroper[0].style.left = (left+width/2-absoluteCenterDistance)+'px';
            kPainterCroper[0].style.right = (-left-width/2-absoluteCenterDistance)+'px';
            kPainterCroper[0].style.top = (top+height/2-absoluteCenterDistance)+'px';
            kPainterCroper[0].style.bottom = (-top-height/2-absoluteCenterDistance)+'px';
            kPainterCroper[0].style.width = width+'px';
            kPainterCroper[0].style.height = height+'px';
            doCallbackNoBreak(kPainter.onCropRectChange);
        };

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
                if('crop' != gestureStatus || moveTouchId != touchs[0].identifier){
                    // or touch is not same
                    return;
                }
                var _x0 = x0, _y0 = y0;
                x0 = touchs[0].pageX;
                y0 = touchs[0].pageY;
                var dx0 = x0-_x0, dy0 = y0-_y0;
                if(-1 == orientX){
                    if(width-dx0<kPainter.cropRectMinW){
                        dx0 = width - kPainter.cropRectMinW;
                    }
                    if(left+dx0<minLeft){
                        dx0 = minLeft-left;
                    }
                    width -= dx0;
                    left += dx0;
                }else if(1 == orientX){
                    if(width+dx0<kPainter.cropRectMinW){
                        dx0 = -width + kPainter.cropRectMinW;
                    }
                    if(left+width+dx0>maxRight){
                        dx0=maxRight-width-left;
                    }
                    width += dx0;
                }
                if(-1 == orientY){
                    if(height-dy0<kPainter.cropRectMinH){
                        dy0 = height - kPainter.cropRectMinH;
                    }
                    if(top+dy0<minTop){
                        dy0 = minTop-top;
                    }
                    height -= dy0;
                    top += dy0;
                }else if(1 == orientY){
                    if(height+dy0<kPainter.cropRectMinH){
                        dy0 = -height + kPainter.cropRectMinH;
                    }
                    if(top+height+dy0>maxBottom){
                        dy0 = maxBottom-height-top;
                    }
                    height += dy0;
                }
                if(0 == orientX && 0 == orientY){
                    if(left+dx0<minLeft){
                        dx0 = minLeft-left;
                    }else if(left+width+dx0>maxRight){
                        dx0=maxRight-width-left;
                    }
                    if(top+dy0<minTop){
                        dy0 = minTop-top;
                    }else if(top+height+dy0>maxBottom){
                        dy0 = maxBottom-height-top;
                    }
                    left += dx0;
                    top += dy0;
                }
                setCropBox();
            }
        });

        // all is -0.5, -0.5, 0.5, 0.5
        var setCropRectArea = kPainter.setCropRectArea = function(l,t,r,b){
            if(!cropGesturer.isCropRectShowing){ return false; }
            if(!(l >= -0.5)){
                l = -0.5;
            }
            if(!(t >= -0.5)){
                t = -0.5;
            }
            if(!(r <= 0.5)){
                r = 0.5;
            }
            if(!(b <= 0.5)){
                b = 0.5;
            }
            if(l > r){
                l = r = (l + r) / 2;
            }
            if(t > b){
                t = b = (t + b) / 2;
            }
            getInfo();
            left = cvsLeft + (l + 0.5) * cvsW;
            if(left < minLeft){left = minLeft;}
            top = cvsTop + (t + 0.5) * cvsH;
            if(top < minTop){top = minTop;}
            var right = cvsLeft + (r + 0.5) * cvsW;
            if(right > maxRight){right = maxRight;}
            width = right - left;
            var bottom = cvsTop + (b + 0.5) * cvsH;
            if(bottom > maxBottom){bottom = maxBottom;}
            height = bottom - top;
            setCropBox();
            return true;
        };

        var getCropRectArea = kPainter.getCropRectArea = function(isAbsolute){
            if(!cropGesturer.isCropRectShowing){ return null; }
            (function(){
                var tsf = $(mainCvs).getTransform();
                var curCvsW;
                if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
                    curCvsW = parseFloat(mainCvs.style.width);
                }else{
                    curCvsW = parseFloat(mainCvs.style.height);
                }
                if(curCvsW != cvsW){
                    // update info only when zoom change
                    getInfo();
                }
            })();
            var l = (left - cvsLeft) / cvsW - 0.5;
            var t = (top - cvsTop) / cvsH - 0.5;
            var w = width / cvsW;
            var h = height / cvsH;
            var r = l + w;
            var b = t + h;
            if(isAbsolute){
                l = Math.round(l * mainCvs.fullQualityWidth * 2) / 2;
                t = Math.round(t * mainCvs.fullQualityHeight * 2) / 2;
                r = Math.round(r * mainCvs.fullQualityWidth * 2) / 2;
                b = Math.round(b * mainCvs.fullQualityHeight * 2) / 2;
            }
            return [l,t,r,b];
        };

        cropGesturer.getNeededRect = function(){
            getInfo();
            var rect = {};
            rect.width = 2 * Math.max(-left, left + width);
            rect.height = 2 * Math.max(-top, top + height);
            return rect;
        };

        kPainter.cropAsync = function(callback, ltrb){
            if(!isEditing){ 
                doCallbackNoBreak(callback,[null]);
                return; 
            }
            getInfo();
            ltrb = ltrb || getCropRectArea();
            if(!ltrb){
                doCallbackNoBreak(callback,[null]);
                return;
            }
            var l = ltrb[0],
                t = ltrb[1],
                r = ltrb[2],
                b = ltrb[3];
            if((l+0.5)*mainCvs.fullQualityWidth < 0.5 && (0.5-r)*mainCvs.fullQualityWidth <= 0.5 && (t+0.5)*mainCvs.fullQualityHeight < 0.5 && (0.5-b)*mainCvs.fullQualityHeight <= 0.5){
                doCallbackNoBreak(callback,[l,t,r,b]);
            }else{
                editor.pushStack({
                    crop: {
                        left: l+0.5,
                        top: t+0.5,
                        width: r-l,
                        height: b-t
                    }
                });
                editor.updateCvsAsync(editor.needAlwaysTrueTransform, false, function(){
                    doCallbackNoBreak(callback,[l,t,r,b]);
                });
            }
        };
    };

    var opencv = new function(){
        var opencv = this;

        (function(){
            var PS = {
                blurSize:5,
                cannyThreshold1: 8,
                cannyThreshold2Rt: 0.5,
                houghLineRho: 1,
                houghLineTheta: Math.PI / 180,
                houghLineThreshold: 8,
                houghLinesMinLength: 8,
                houghLinesMaxGap: 3,//5
                linesMaxRadDifToHV: Math.PI / 6,
                fitlineMaxDRange: 2,
                fitlineMaxRadRange: Math.PI / 18,
                cornerMinRad: Math.PI / 3
            };

            var getThumbImgData = function(maxwh) {
                var width = mainCvs.width,
                    height = mainCvs.height,
                    resizeRt = 1;
                if(width > height){
                    if(width > maxwh){
                        resizeRt = maxwh / width;
                        width = maxwh;
                        height = Math.round(height * resizeRt) || 1;
                    }
                }else{
                    if(height > maxwh){
                        resizeRt = maxwh / height;
                        height = maxwh;
                        width = Math.round(width * resizeRt) || 1;
                    }
                }
                var tsf = $(mainCvs).getTransform();
                var tsfW, tsfH;
                if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
                    tsfW = width, tsfH = height;
                }else{
                    tsfW = height, tsfH = width;
                }
                var tempCvs = document.createElement("canvas");
                tempCvs.width = tsfW;
                tempCvs.height = tsfH;
                var ctx = tempCvs.getContext('2d');
                var drawE = tsfW/2 * (1 - tsf.a - tsf.c);
                var drawF = tsfH/2 * (1 - tsf.b - tsf.d);
                ctx.setTransform(tsf.a, tsf.b, tsf.c, tsf.d, drawE, drawF);
                ctx.drawImage(mainCvs, 0, 0, width, height);
                var imgData = ctx.getImageData(0,0,tsfW,tsfH);
                return imgData;
            };

            var handleImportSrc = function(importSrc, maxwh, callback){

                //tudo: handle blob,url
                if(typeof importSrc == "string" || importSrc instanceof String || importSrc instanceof Blob){
                    imgStorer.getBlobAndFormatFromAnyImgData(importSrc, function(blob){
                        if(blob){
                            blobToCvsAsync(blob, null, function(cvs){
                                handleImportSrc(cvs, maxwh, callback);
                            });
                        }else{
                            callback(null);
                            return;
                        }
                    });
                }else if(importSrc instanceof Image){
                    try{
                        kPainter._noUseButTestSrc = importSrc.src;
                    }catch(ex){
                        setTimeout(function(ex){throw ex;},0);
                        callback(null);
                        return;
                    }
                }else if(importSrc instanceof ImageData){
                    if(importSrc.width <= maxwh && importSrc.height <= maxwh){
                        setTimeout(function(){
                            callback(importSrc);
                        },0);
                        return;
                    }
                    var _importSrc = importSrc;
                    importSrc = document.createElement('canvas');
                    importSrc.width = _importSrc.width;
                    importSrc.height = _importSrc.height;
                    importSrc.getContext("2d").putImageData(_importSrc, importSrc.width, importSrc.height);
                }

                var cvs = document.createElement('canvas');
                var cvsW = importSrc.naturalWidth || importSrc.videoWidth || importSrc.width;
                var cvsH = importSrc.naturalHeight || importSrc.videoHeight || importSrc.height;
                var resizeRt = 1;
                if(cvsW > cvsH){
                    if(cvsW > maxwh){
                        resizeRt = maxwh / cvsW;
                        cvsW = maxwh;
                        cvsH = Math.round(cvsH * resizeRt) || 1;
                    }
                }else{
                    if(cvsH > maxwh){
                        resizeRt = maxwh / cvsH;
                        cvsH = maxwh;
                        cvsW = Math.round(cvsW * resizeRt) || 1;
                    }
                }
                cvs.width = cvsW;
                cvs.height = cvsH;
                var ctx = cvs.getContext("2d");
                ctx.drawImage(importSrc, 0, 0, cvs.width, cvs.height);

                setTimeout(function(){
                    callback(ctx.getImageData(0, 0, cvs.width, cvs.height));
                },0);
            };
            kPainter.documentDetectAsync = function(callback, importSrc){
                if(!importSrc){
                    if(gestureStatus != 'perspect'){ 
                        doCallbackNoBreak(callback,[null]);
                        return; 
                    }
                    onStartLoadingNoBreak();
                }

                var cv = KPainter._cv;
                handleImportSrc(importSrc || getThumbImgData(256), 256, function(imageData){

                    var src = new cv.matFromArray(imageData, cv.CV_8UC4);
                    var srcW = src.cols, srcH = src.rows,
                        whMin = Math.min(src.cols, src.rows);
                    cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);

                    var blurred = new cv.Mat();
                    var blurSize = PS.blurSize;
                    cv.GaussianBlur(src, blurred, [blurSize, blurSize], 0, 0, cv.BORDER_DEFAULT);
                    cv.delMat(src);

                    var cannyed = new cv.Mat();//cannyedTemp = new cv.Mat(),
                    cv.Canny(blurred, cannyed/*Temp*/, PS.cannyThreshold1, PS.cannyThreshold2Rt * whMin, 3/*canny_aperture_size*/, false);
                    cv.delMat(blurred);

                    var linesMat = new cv.Mat();//IntVectorVector();
                    cv.HoughLinesP(cannyed, linesMat, PS.houghLineRho, PS.houghLineTheta, PS.houghLineThreshold, PS.houghLinesMinLength, PS.houghLinesMaxGap);
                    cv.delMat(cannyed);
                    var lineOriPxys = linesMat.data32s();

                    var linePxys = [];
                    var srcWh = srcW/2;
                    var srcHh = srcH/2;
                    for(var i=0;i<lineOriPxys.length;i+=2){
                        linePxys.push(lineOriPxys[i]-srcWh);
                        linePxys.push(lineOriPxys[i+1]-srcHh);
                    }
                    cv.delMat(linesMat);

                    var linesAll = [];
                    for(var i=0;i<linePxys.length;i+=4){//eslint-disable-line
                        var x0 = linePxys[i+0],
                            y0 = linePxys[i+1],
                            x1 = linePxys[i+2],
                            y1 = linePxys[i+3];
                        var a = y0 - y1,
                            b = x1 - x0,
                            c = x0 * y1 - x1 * y0;
                        // when 0 == c, not calc the line
                        if(0 == c){ continue; }
                        var cOrisign = c < 0 ? -1 : 1 ;
                        var r = Math.sqrt(a * a + b * b);
                        a = a / r * cOrisign;
                        b = b / r * cOrisign;
                        c = c / r * cOrisign;
                        var rad = Math.atan(a / b);
                        // line should in horizontal or vertical
                        {
                            var ra = Math.abs(rad);
                            if(ra > PS.linesMaxRadDifToHV && ra < Math.PI / 2 - PS.linesMaxRadDifToHV){
                                continue;
                            }
                        }
                        // rad anticlockwise, (-PI, PI]
                        if(b < 0){
                            if(0 == a){
                                b = -1;
                                rad = 0;
                            }else{
                                rad = -rad;
                            }
                        }else if(b > 0){
                            if(a < 0){
                                rad = -Math.PI - rad;
                            }else if(a > 0){
                                rad = Math.PI - rad;
                            }else{// 0 == a
                                b = 1;
                                rad = Math.PI;
                            }
                        }else{// 0 == b
                            if(a > 0){
                                a = 1;
                                rad = Math.PI / 2;
                            }else{// a < 0
                                a = -1;
                                rad = -Math.PI / 2;
                            }
                        }
                        var l = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
                        linesAll.push([a, b, c, rad, l]);
                    }

                    var linePreFiteds = [];
                    var lineFiteds = [];
                    var fitlineMaxDRange = PS.fitlineMaxDRange;
                    var fitlineMaxRadRange = PS.fitlineMaxRadRange;
                    GetfitLine(linesAll, linePreFiteds, fitlineMaxDRange, fitlineMaxRadRange, whMin*0.7);
                    GetfitLine(linePreFiteds, lineFiteds, fitlineMaxDRange, fitlineMaxRadRange, whMin*0.7);

                    var lineFiltered = [null, null, null, null];
                    for(var i = 0; i < lineFiteds.length; ++i){//eslint-disable-line
                        var line = lineFiteds[i];
                        var rad = line[3];//eslint-disable-line
                        var pos = null;
                        if(rad < -Math.PI * 3 / 4){
                            pos = 0;
                        }else if(rad < -Math.PI / 4){
                            pos = 1;
                        }else if(rad < Math.PI / 4){
                            pos = 2;
                        }else if(rad < Math.PI * 3 / 4){
                            pos = 3;
                        }else{
                            pos = 0;
                        }
                        if(!lineFiltered[pos]){
                            lineFiltered[pos] = line;
                        }else{
                            var _line = lineFiltered[pos];
                            var _c = _line[2], _l = _line[4],
                                c =  line[2], l = line[4];//eslint-disable-line
                            if(c * l > _c * _l){
                                lineFiltered[pos] = line;
                            }
                        }
                    }

                    for(var i = 0; i < lineFiltered.length; ++i){//eslint-disable-line
                        var line = lineFiltered[i];//eslint-disable-line
                        if(null == line){
                            // line not found, use border
                            line = [];
                            lineFiltered[i] = line;
                            if(0 == i){
                                line[2] = srcHh;
                                line[3] = Math.PI;
                            }else if(1 == i){
                                line[2] = srcWh;
                                line[3] = -Math.PI / 2;
                            }else if(2 == i){
                                line[2] = srcHh;
                                line[3] = 0;
                            }else if(3 == i){
                                line[2] = srcWh;
                                line[3] = Math.PI / 2;
                            }
                        }
                        line[0] = Math.sin(line[3]);
                        line[1] = -Math.cos(line[3]);
                    }

                    var cornerPoints = [];
                    for(var i = 0; i < lineFiltered.length; ++i){//eslint-disable-line
                        var line1 = lineFiltered[i],
                            line2 = lineFiltered[(i - 1 + lineFiltered.length) % lineFiltered.length];
                        var a1 = line1[0],
                            b1 = line1[1],
                            c1 = line1[2],
                            rad1 = line1[3],//eslint-disable-line
                            a2 = line2[0],
                            b2 = line2[1],
                            c2 = line2[2],
                            rad2 = line2[3];//eslint-disable-line
                        var x0 = (b1 * c2 - b2 * c1) / (b2 * a1 - b1 * a2),//eslint-disable-line
                            y0 = (a1 * c2 - a2 * c1) / (a2 * b1 - a1 * b2);//eslint-disable-line
                        cornerPoints.push([x0 / srcW, y0 / srcH]);
                    }

                    if(!importSrc){
                        setCornerPos(cornerPoints);
                        onFinishLoadingNoBreak();
                    }
                    doCallbackNoBreak(callback,[cornerPoints]);

                });
            };
            var GetfitLine = function(inputlines, outputlines, fitlineMaxDRange, fitlineMaxRadRange, maxLength){
                for(var i = 0; i < inputlines.length; ++i){
                    var line = inputlines[i];
                    var hasFited = false;
                    for(var j = 0; j < outputlines.length; ++j){
                        var fited = outputlines[j];
                        var _rad = fited[3], rad = line[3];
                        var radDifRaw = _rad - rad;//rad
                        if(radDifRaw > Math.PI){
                            rad += Math.PI * 2;
                        }else if(radDifRaw < -Math.PI){
                            rad -= Math.PI * 2;
                        }
                        var radDif = Math.abs(_rad - rad);
                        var dDif = Math.abs(fited[2] - line[2]);//c
                        if(radDif < fitlineMaxRadRange && dDif < fitlineMaxDRange){
                            hasFited = true;
                            var _l = fited[4], l = line[4];
                            var sl = _l + l;
                            fited[2] = (fited[2] * _l + line[2] * l) / sl;
                            var nrad;
                            nrad = (_rad * _l + rad * l) / sl;
                            if(nrad > Math.PI){ nrad -= Math.PI * 2; }
                            else if(nrad <= -Math.PI){ nrad += Math.PI * 2; }
                            fited[3] = nrad;
                            fited[4] = Math.min(sl, maxLength);
                            break;
                        }
                    }
                    if(!hasFited){
                        outputlines.push([null,null,line[2],line[3], line[4]]);
                    }
                }
            };
            var psptBox = mainBox.children(".kPainterPerspect");
            opencv.hideFreeTransformBorderDirectly = function(){
                psptBox.hide();
            };
            var psptBorderCvs = mainBox.find("> .kPainterPerspect > .kPainterPerspectCvs")[0];
            kPainter.onFreeTransformCornerPosChange = null;
            var setCornerPos = kPainter.setFreeTransformCornerPos = function(cornerPoints){
                if(gestureStatus != 'perspect'){ return; }
                var cvsZoom = mainCvs.kPainterZoom,
                    tsf = $(mainCvs).getTransform();
                var cvsVW = mainCvs.width * cvsZoom,
                    cvsVH = mainCvs.height * cvsZoom;
                if(!(0 != tsf.a * tsf.d && 0 == tsf.b * tsf.c)){
                    var temp = cvsVW; cvsVW = cvsVH; cvsVH = temp;
                }
                var rect = mainBox.borderBoxRect();
                var ml = rect.width / 2 - 5,
                    mt = rect.height / 2 - 5;
                for(var i = 0; i < cornerMovers.length; ++i){
                    var cornerMover = cornerMovers[i];
                    var index = $(cornerMover).attr('data-index');
                    var p = cornerPoints[index];
                    var l = cvsVW * p[0], t = cvsVH * p[1];
                    if(l < -ml){
                        l = -ml;
                    }else if(l > ml){
                        l = ml;
                    }
                    if(t < -mt){
                        t = -mt;
                    }else if(t > mt){
                        t = mt;
                    }
                    cornerMover.style.left = l + 'px';
                    cornerMover.style.right = -l + 'px';
                    cornerMover.style.top = t + 'px';
                    cornerMover.style.bottom = -t + 'px';
                }
                drawBorderLine();
                psptBox.show();
            };
            var getCornerPos = kPainter.getFreeTransformCornerPos = function(){
                var cvsZoom = mainCvs.kPainterZoom,
                    tsf = $(mainCvs).getTransform();
                var cvsVW = mainCvs.width * cvsZoom,
                    cvsVH = mainCvs.height * cvsZoom;
                if(!(0 != tsf.a * tsf.d && 0 == tsf.b * tsf.c)){
                    var temp = cvsVW; cvsVW = cvsVH; cvsVH = temp;
                }
                var cornerPoints = [];
                for(var i = 0; i < cornerMovers.length; ++i){
                    var mover = cornerMovers[i];
                    cornerPoints.push([parseFloat(mover.style.left) / cvsVW, parseFloat(mover.style.top) / cvsVH]);
                }
                return cornerPoints;
            };

            var drawBorderLine = function(){
                var rect = mainBox.borderBoxRect();
                psptBorderCvs.width = Math.round(rect.width);
                psptBorderCvs.height = Math.round(rect.height);
                var cornerPointLTs = [];
                for(var i = 0; i < cornerMovers.length; ++i){
                    cornerPointLTs.push([
                        Math.round(parseFloat(cornerMovers[i].style.left) + rect.width / 2),
                        Math.round(parseFloat(cornerMovers[i].style.top) + rect.height / 2)
                    ]);
                }
                var ctx = psptBorderCvs.getContext('2d');
                // ctx.strokeStyle = "#0F0";
                // ctx.lineWidth = 3;
                // ctx.setLineDash([10, 5]);
                // ctx.beginPath();
                // ctx.moveTo(cornerPointLTs[0][0], cornerPointLTs[0][1]);
                // ctx.lineTo(cornerPointLTs[1][0], cornerPointLTs[1][1]);
                // ctx.lineTo(cornerPointLTs[2][0], cornerPointLTs[2][1]);
                // ctx.lineTo(cornerPointLTs[3][0], cornerPointLTs[3][1]);
                // ctx.closePath();
                // ctx.stroke();

                var minLenPow2 = Number.POSITIVE_INFINITY;
                var bgi;//beginPointIndex, point closest to (0,0)
                for(var i = 0; i < 4; ++i){//eslint-disable-line
                    var lenPow2 = cornerPointLTs[i][0] * cornerPointLTs[i][0] + cornerPointLTs[i][1] * cornerPointLTs[i][1];
                    if(lenPow2 < minLenPow2){
                        minLenPow2 = lenPow2;
                        bgi = i;
                    }
                }
                var rsPArr = [];//resortedPointArr
                for(var i = 0; i < 4; ++i){//eslint-disable-line
                    rsPArr.push([cornerPointLTs[(bgi + i) % 4][0], cornerPointLTs[(bgi + i) % 4][1]]);
                }

                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(rsPArr[0][0], rsPArr[0][1]);

                var getSignDirection = function(x1,y1,x2,y2,x3,y3,x4,y4){
                    return [Math.sign((y2 - y1)*x3 + (x1 - x2)*y3 + x2*y1 - x1*y2),
                        Math.sign((y2 - y1)*x4 + (x1 - x2)*y4 + x2*y1 - x1*y2)];
                };
                var signDirectionArr = [];
                for(var i = 0; i < 4; ++i){//eslint-disable-line
                    signDirectionArr.push(getSignDirection(
                        rsPArr[i][0], rsPArr[i][1], 
                        rsPArr[(i + 1) % 4][0], rsPArr[(i + 1) % 4][1], 
                        rsPArr[(i + 2) % 4][0], rsPArr[(i + 2) % 4][1], 
                        rsPArr[(i + 3) % 4][0], rsPArr[(i + 3) % 4][1]));
                }
                var calLinearEquationInTwoUnknowns = function(x1,y1,x2,y2,x3,y3,x4,y4){
                    var A1 = y2 - y1, B1 = x1 - x2, C1 = x2*y1 - x1*y2,
                        A2 = y4 - y3, B2 = x3 - x4, C2 = x4*y3 - x3*y4;
                    var bottom = B1*A2 - B2*A1;
                    return [(C1*B2 - C2*B1) / bottom, (C2*A1 - C1*A2) / bottom];
                };
                var p5 = undefined;
                var bExpectedOrder = (function(){
                    //-Pi/2 to Pi, expect: rad0 < rad3
                    //tudo: when k0 == k3, need more special
                    var k0, k3;
                    var a0 = rsPArr[1][0] - rsPArr[0][0];
                    if(a0){
                        k0 = (rsPArr[1][1] - rsPArr[0][1]) / a0;
                    }
                    var a3 = rsPArr[3][0] - rsPArr[0][0];
                    if(a3){
                        k3 = (rsPArr[3][1] - rsPArr[0][1]) / a3;
                    }
                    if(a0 > 0){
                        if(a3 > 0){
                            return k0 <= k3;
                        }else{
                            return true;
                        }
                    }else if(0 == a0){
                        if(a3 > 0){
                            return false;
                        }else if(0 == a3){
                            return true;
                        }else{
                            return true;
                        }
                    }else{//a0 < 0
                        if(a3 >= 0){
                            return false;
                        }else{
                            return k0 <= k3;
                        }
                    }
                })();//Math.atan2(rsPArr[1][1] - rsPArr[0][1], rsPArr[1][0] - rsPArr[0][0]) <= Math.atan2(rsPArr[3][1] - rsPArr[0][1], rsPArr[3][0] - rsPArr[0][0]);//-Pi/2 to Pi
                if(signDirectionArr[0][0]*signDirectionArr[0][1] < 0){
                    if(signDirectionArr[2][0]*signDirectionArr[2][1] < 0){
                        p5 = calLinearEquationInTwoUnknowns(
                            rsPArr[0][0], rsPArr[0][1], 
                            rsPArr[1][0], rsPArr[1][1], 
                            rsPArr[2][0], rsPArr[2][1], 
                            rsPArr[3][0], rsPArr[3][1]);
                        if(bExpectedOrder){
                            ctx.lineTo(p5[0], p5[1]);
                            ctx.lineTo(rsPArr[2][0], rsPArr[2][1]);
                            ctx.lineTo(rsPArr[1][0], rsPArr[1][1]);
                            ctx.lineTo(p5[0], p5[1]);
                            ctx.lineTo(rsPArr[3][0], rsPArr[3][1]);
                        }else{
                            ctx.lineTo(rsPArr[3][0], rsPArr[3][1]);
                            ctx.lineTo(p5[0], p5[1]);
                            ctx.lineTo(rsPArr[1][0], rsPArr[1][1]);
                            ctx.lineTo(rsPArr[2][0], rsPArr[2][1]);
                            ctx.lineTo(p5[0], p5[1]);
                        }
                    }
                }else if(signDirectionArr[1][0]*signDirectionArr[1][1] < 0){
                    if(signDirectionArr[3][0]*signDirectionArr[3][1] < 0){
                        p5 = calLinearEquationInTwoUnknowns(
                            rsPArr[1][0], rsPArr[1][1], 
                            rsPArr[2][0], rsPArr[2][1], 
                            rsPArr[3][0], rsPArr[3][1], 
                            rsPArr[0][0], rsPArr[0][1]);
                        if(bExpectedOrder){
                            ctx.lineTo(rsPArr[1][0], rsPArr[1][1]);
                            ctx.lineTo(p5[0], p5[1]);
                            ctx.lineTo(rsPArr[3][0], rsPArr[3][1]);
                            ctx.lineTo(rsPArr[2][0], rsPArr[2][1]);
                            ctx.lineTo(p5[0], p5[1]);
                        }else{
                            ctx.lineTo(p5[0], p5[1]);
                            ctx.lineTo(rsPArr[2][0], rsPArr[2][1]);
                            ctx.lineTo(rsPArr[3][0], rsPArr[3][1]);
                            ctx.lineTo(p5[0], p5[1]);
                            ctx.lineTo(rsPArr[1][0], rsPArr[1][1]);
                        }
                    }
                }
                if(!p5){
                    if(bExpectedOrder){
                        ctx.lineTo(rsPArr[1][0], rsPArr[1][1]);
                        ctx.lineTo(rsPArr[2][0], rsPArr[2][1]);
                        ctx.lineTo(rsPArr[3][0], rsPArr[3][1]);
                    }else{
                        ctx.lineTo(rsPArr[3][0], rsPArr[3][1]);
                        ctx.lineTo(rsPArr[2][0], rsPArr[2][1]);
                        ctx.lineTo(rsPArr[1][0], rsPArr[1][1]);
                    }
                }

                ctx.lineTo(rsPArr[0][0], rsPArr[0][1]);
                ctx.lineTo(0, 0);
                ctx.lineTo(0, psptBorderCvs.height);
                ctx.lineTo(psptBorderCvs.width, psptBorderCvs.height);
                ctx.lineTo(psptBorderCvs.width, 0);
                ctx.lineTo(0, 0);
                ctx.fill();
                
                doCallbackNoBreak(kPainter.onFreeTransformCornerPosChange);
            };

            var cornerMovers = mainBox.find("> .kPainterPerspect > .kPainterPerspectCorner");
            cornerMovers.css('left', '0');
            cornerMovers.css('top', '0');
            cornerMovers.css('right', '0');
            cornerMovers.css('bottom', '0');
            var moveTouchId = null, x0, y0, activedCorner;
            cornerMovers.on('touchstart touchcancel touchend mousedown', function(jqEvent){
                activedCorner = this;
                jqEvent.preventDefault();// avoid select
                var touchs = jqEvent.originalEvent.targetTouches;
                if(!touchs){
                    if(!workingPointerDevice){
                        workingPointerDevice = 'mouse';
                    }else if('mouse' != workingPointerDevice){
                        return;
                    }
                    touchs = [{
                        pageX: jqEvent.originalEvent.clientX,
                        pageY: jqEvent.originalEvent.clientY
                    }];
                }else if(touchs.length){
                    if(!workingPointerDevice){
                        workingPointerDevice = 'touch';
                    }else if('touch' != workingPointerDevice){
                        return;
                    }
                }

                var correctACornerPos = function(){
                    var ml = psptBox.width() / 2 - 5;
                    var mt = psptBox.height() / 2 - 5;
                    var left = parseFloat(activedCorner.style.left);
                    var top = parseFloat(activedCorner.style.top);
                    var bLeftChange = true;
                    var bTopChange = true;
                    if(left < -ml){
                        left = -ml;
                    }else if(left > ml){
                        left = ml;
                    }else{
                        bLeftChange = false;
                    }
                    if(top < -mt){
                        top = -mt;
                    }else if(top > mt){
                        top = mt;
                    }else{
                        bTopChange = false;
                    }
                    if(bLeftChange){
                        activedCorner.style.left = left + 'px';
                        activedCorner.style.right = -left + 'px';
                    }
                    if(bTopChange){
                        activedCorner.style.top = top + 'px';
                        activedCorner.style.bottom = -top + 'px';
                    }
                    if(bLeftChange || bTopChange){
                        drawBorderLine();
                    }
                };
                if(1 == touchs.length){
                    if('perspect' == gestureStatus){
                        gestureStatus = 'perspectCornerMoving';
                    }
                    correctACornerPos();
                    moveTouchId = touchs[0].identifier;
                    x0 = touchs[0].pageX;
                    y0 = touchs[0].pageY;
                }else if(0 == touchs.length){
                    if('perspectCornerMoving' == gestureStatus){
                        correctACornerPos();
                        workingPointerDevice = null;
                        gestureStatus = 'perspect';
                    }
                }
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
                    if('perspectCornerMoving' != gestureStatus || moveTouchId != touchs[0].identifier){
                        // or touch is not same
                        return;
                    }
                    var _x0 = x0, _y0 = y0;
                    x0 = touchs[0].pageX;
                    y0 = touchs[0].pageY;
                    var dx0 = x0-_x0, dy0 = y0-_y0;
                    var left = parseFloat(activedCorner.style.left) + dx0;
                    var top = parseFloat(activedCorner.style.top) + dy0;
                    activedCorner.style.left = left + 'px';
                    activedCorner.style.right = -left + 'px';
                    activedCorner.style.top = top + 'px';
                    activedCorner.style.bottom = -top + 'px';
                    drawBorderLine();
                }
            });
            
            mainBox.on('mouseup', function(/*jqEvent*/){
                if('mouse' != workingPointerDevice){
                    return;
                }
                if('perspectCornerMoving' == gestureStatus){
                    workingPointerDevice = null;
                    gestureStatus = 'perspect';
                }
            });
            mainBox.on('mouseleave', function(jqEvent){
                if('mouse' != workingPointerDevice){
                    return;
                }
                var oEvent = jqEvent.originalEvent;
                if(!oEvent.buttons){return;}// mouse not pressing
                if('perspectCornerMoving' == gestureStatus){
                    workingPointerDevice = null;
                    gestureStatus = 'perspect';
                }
            });
            kPainter.freeTransformMaxWH = 2048;
            kPainter.freeTransformAsync = function(callback, cornerPoints, importSrc){
                if(!importSrc && gestureStatus != 'perspect'){ 
                    doCallbackNoBreak(callback,[false]);
                    return; 
                }
                onStartLoadingNoBreak();

                var cv = KPainter._cv;

                cornerPoints = cornerPoints || getCornerPos();
                var cps = cornerPoints;
                //tudo: more acurate
                if(Math.abs(cps[0][0] - 0.5) < 0.005 &&
                    Math.abs(cps[0][1] - 0.5) < 0.005 &&
                    Math.abs(cps[1][0] + 0.5) < 0.005 &&
                    Math.abs(cps[1][1] - 0.5) < 0.005 &&
                    Math.abs(cps[2][0] + 0.5) < 0.005 &&
                    Math.abs(cps[2][1] + 0.5) < 0.005 &&
                    Math.abs(cps[3][0] - 0.5) < 0.005 &&
                    Math.abs(cps[3][1] + 0.5) < 0.005){
                    onFinishLoadingNoBreak();
                    if(importSrc){
                        doCallbackNoBreak(callback,[null]);
                    }else{
                        doCallbackNoBreak(callback,[true]);
                    }
                    return;
                }
                handleImportSrc(importSrc || getThumbImgData(kPainter.freeTransformMaxWH), kPainter.freeTransformMaxWH, function(imageData){

                    var src = new cv.matFromArray(imageData, cv.CV_8UC4);
                    cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

                    var fromCornerMat = new cv.Mat.zeros(4, 1, cv.CV_32FC2); //cv.Point2fVector();
                    var fcd = fromCornerMat.data32f();
                    for(var i = 0; i < cornerPoints.length; ++i){
                        var p = cornerPoints[i];
                        fcd[2 * i] = Math.round((p[0] + 0.5) * src.cols);
                        fcd[2 * i + 1] = Math.round((p[1] + 0.5) * src.rows);
                    }

                    var x0 = fcd[2] - fcd[0],
                        y0 = fcd[3] - fcd[1],
                        x1 = fcd[4] - fcd[2],
                        y1 = fcd[5] - fcd[3],
                        x2 = fcd[6] - fcd[4],
                        y2 = fcd[7] - fcd[5],
                        x3 = fcd[0] - fcd[6],
                        y3 = fcd[1] - fcd[7];
                    var psptWidth = Math.round(Math.max(Math.sqrt(x0 * x0 + y0 * y0), Math.sqrt(x2 * x2 + y2 * y2))), 
                        psptHeight = Math.round(Math.max(Math.sqrt(x1 * x1 + y1 * y1), Math.sqrt(x3 * x3 + y3 * y3)));
                    var toCornerMat = new cv.Mat.zeros(4, 1, cv.CV_32FC2);//cv.Point2fVector();
                    var toCornerData32f = toCornerMat.data32f();
                    toCornerData32f[2] = psptWidth;
                    toCornerData32f[4] = psptWidth;
                    toCornerData32f[5] = psptHeight;
                    toCornerData32f[7] = psptHeight;
                    var tsfMat = cv.getPerspectiveTransform(fromCornerMat, toCornerMat);
                    cv.delMat(fromCornerMat);
                    cv.delMat(toCornerMat);

                    var perspectTsfed = new cv.Mat.zeros(psptHeight, psptWidth, cv.CV_8UC3);
                    var color = new cv.Scalar(0, 255, 0);
                    cv.warpPerspective(src, perspectTsfed, tsfMat, [perspectTsfed.rows, perspectTsfed.cols], cv.InterpolationFlags.INTER_LINEAR.value, cv.BORDER_CONSTANT, color);
                    //putResultImgCvs(perspectTsfed);
                    cv.delMat(src);
                    cv.delMat(tsfMat);
                    cv.delMat(color);
                    var imgData = new ImageData(psptWidth, psptHeight);
                    var channels = perspectTsfed.channels();
                    var data = perspectTsfed.data();
                    for (var i = 0, j = 0; i < data.length; i += channels, j+=4) {//eslint-disable-line
                        imgData.data[j] = data[i];
                        imgData.data[j + 1] = data[i+1%channels];
                        imgData.data[j + 2] = data[i+2%channels];
                        imgData.data[j + 3] = 255;
                    }
                    cv.delMat(perspectTsfed);

                    mainCvs.width = psptWidth;
                    mainCvs.height = psptHeight;
                    var ctx = mainCvs.getContext('2d');
                    //gesturer.setImgStyleFit();
                    ctx.putImageData(imgData, 0, 0);
                    gesturer.setImgStyleFit();

                    cvsToBlobAsync(mainCvs, function(blob){
                        if(importSrc){
                            doCallbackNoBreak(callback,[blob]);
                        }else{
                            editor.pushStack({
                                srcBlob: blob,
                                saveFormat: "image/jpeg"
                            });
                            editor.updateCvsAsync(true,false,function(){
                                setCornerPos([[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[-0.5,0.5]]);
                                //if(kPainter.isAutoShowCropUI){ cropGesturer.showCropRect(); }
                                //gestureStatus = null;
                                gestureStatus = 'perspect';

                                onFinishLoadingNoBreak();
                                doCallbackNoBreak(callback,[true]);
                            });
                        }
                    }, "image/jpeg");

                });
            };
            kPainter.enterFreeTransformModeAsync = function(callback){
                if(!isEditing || !KPainter.cvHasLoaded){ 
                    doCallbackNoBreak(callback,[false]);
                    return; 
                }
                painterMode = '';
                workingPointerDevice = null;
                gestureStatus = 'perspect';
                onStartLoadingNoBreak();
                setTimeout(function(){
                    cropGesturer.hideCropRect();
                    editor.updateCvsAsync(true, false, function(){
                        setCornerPos([[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[-0.5,0.5]]);
                        psptBox.show();
                        onFinishLoadingNoBreak();
                        editor.needAlwaysTrueTransform = true;
                        doCallbackNoBreak(callback,[true]);
                        painterMode = 'freeTransform';
                    });
                }, 0);
            };
            kPainter.exitFreeTransformModeAsync = function(callback){
                if(gestureStatus != 'perspect'){ 
                    doCallbackNoBreak(callback,[false]);
                    return; 
                }
                painterMode = '';
                psptBox.hide();
                editor.updateCvsAsync(false, false, function(){
                    if(kPainter.isAutoShowCropUI){ cropGesturer.showCropRect(); }
                    workingPointerDevice = null;
                    gestureStatus = null;
                    editor.needAlwaysTrueTransform = false;
                    painterMode = 'basicEdit';
                    doCallbackNoBreak(callback,[true]);
                });
            };
        })();
    };

    var videoMdl = new function(){//eslint-disable-line
        var videoMdl = this;//eslint-disable-line

        /*eslint-disable indent*/
        kPainter.videoHtmlElement = $([
            '<div class="kPainterVideoMdl" style="display:none;">',
                '<video class="kPainterVideo" webkit-playsinline="true"></video>',
                '<select class="kPainterCameraSelect">',
                '</select>',
                '<select class="kPainterResolutionSelect">',
                    '<option class="kPainterGotResolutionOpt" value="got" selected></option>',
                    '<option data-width="3840" data-height="2160">ask 3840 x 2160</option>',
                    '<option data-width="1920" data-height="1080">ask 1920 x 1080</option>',
                    '<option data-width="1600" data-height="1200">ask 1600 x 1200</option>',
                    '<option data-width="1280" data-height="720">ask 1280 x 720</option>',
                    '<option data-width="800" data-height="600">ask 800 x 600</option>',
                    '<option data-width="640" data-height="480">ask 640 x 480</option>',
                    '<option data-width="640" data-height="360">ask 640 x 360</option>',
                '</select>',
                '<button class="kPainterBtnGrabVideo"><svg width="48" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1024 672q119 0 203.5 84.5t84.5 203.5-84.5 203.5-203.5 84.5-203.5-84.5-84.5-203.5 84.5-203.5 203.5-84.5zm704-416q106 0 181 75t75 181v896q0 106-75 181t-181 75h-1408q-106 0-181-75t-75-181v-896q0-106 75-181t181-75h224l51-136q19-49 69.5-84.5t103.5-35.5h512q53 0 103.5 35.5t69.5 84.5l51 136h224zm-704 1152q185 0 316.5-131.5t131.5-316.5-131.5-316.5-316.5-131.5-316.5 131.5-131.5 316.5 131.5 316.5 316.5 131.5z"/></svg></button>',
                '<button class="kPainterBtnCloseVideo"><svg width="48" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/></svg></button>',
            '</div>'].join(''))[0];
        /*eslint-enable indent*/
        kPainter.videoSettings = {video:{/*width:{ideal:2048},height:{ideal:2048},*/facingMode:{ideal:"environment"}}};
        
        kPainter.beforeAddImgFromGrabVideoBtn = null;
        kPainter.afterAddImgFromGrabVideoBtn = null;
        kPainter.grabVideo = null;
        kPainter.hideVideo = null;

        kPainter.showVideo = function(videoSettings){
            if(kPainter.hideVideo){kPainter.hideVideo();}
            var video = $(kPainter.videoHtmlElement).find('.kPainterVideo')[0];
            var cameraSel = $(kPainter.videoHtmlElement).find('.kPainterCameraSelect')[0];
            var resolutionSel = $(kPainter.videoHtmlElement).find('.kPainterResolutionSelect')[0];
            var optGotRsl = $(kPainter.videoHtmlElement).find('.kPainterGotResolutionOpt')[0];
            var btnGrab = $(kPainter.videoHtmlElement).find('.kPainterBtnGrabVideo')[0];
            var btnClose = $(kPainter.videoHtmlElement).find('.kPainterBtnCloseVideo')[0];
            
            var updateDevice = function(){
                if(!cameraSel){
                    return Promise.reject('no camera select');
                }
                return navigator.mediaDevices.enumerateDevices().then(deviceInfos=>{
                    var oldVal = cameraSel.value;
                    cameraSel.innerHTML = "";
                    var selOpt = undefined;
                    for(var i = 0; i < deviceInfos.length; ++i){
                        var info = deviceInfos[i];
                        if(info.kind != 'videoinput'){
                            continue;
                        }
                        var opt = document.createElement('option');
                        opt.value = info.deviceId;
                        opt.innerText = info.label || 'camera '+ i;
                        cameraSel.appendChild(opt);
                        if(oldVal == info.deviceId){
                            selOpt = opt;
                        }
                    }
                    var optArr = cameraSel.childNodes;
                    if(!selOpt && optArr.length){
                        try{
                            video.srcObject.getTracks().forEach((track)=>{
                                if('video' == track.kind){
                                    for(var i = 0; i < optArr.length; ++i){
                                        var opt = optArr[i];
                                        if(track.label == opt.innerText){
                                            selOpt = opt;
                                            throw 'found the using source';
                                        }
                                    }
                                }
                            });
                        }catch(ex){
                            if(self.kConsoleLog){self.kConsoleLog(ex);}
                        }
                    }
                    if(selOpt){
                        cameraSel.value = selOpt.value;
                    }
                });
            };
        
            var stopVideo = function(){
                if(video.srcObject){
                    if(self.kConsoleLog)self.kConsoleLog('======stop video========');
                    video.srcObject.getTracks().forEach(function(track) {
                        track.stop();
                    });
                }
            };
        
            var playvideo = (deviceId)=>{
                return new Promise((resolve,reject)=>{
        
                    stopVideo();
            
                    if(self.kConsoleLog)self.kConsoleLog('======before video========');
                    var constraints = videoSettings ? videoSettings : kPainter.videoSettings;
                    var selRslOpt = resolutionSel ? $(resolutionSel).children(':selected')[0] : null;
                    if(selRslOpt && selRslOpt.hasAttribute('data-width')){
                        var selW = selRslOpt.getAttribute('data-width');
                        var selH = selRslOpt.getAttribute('data-height');
                        optGotRsl.setAttribute('data-width', selW);
                        optGotRsl.setAttribute('data-height', selH);
                        var bMobileSafari = /Safari/.test(navigator.userAgent) && /iPhone/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
                        if(bMobileSafari){
                            if(selW >= 1280){
                                constraints.video.width = 1280;
                            }else if(selW >= 640){
                                constraints.video.width = 640;
                            }else if(selW >= 320){
                                constraints.video.width = 320;
                            }
                        }else{
                            constraints.video.width = { ideal: selW };
                            constraints.video.height = { ideal: selH };
                        }
                        if(!deviceId){
                            var selCamOpt = $(cameraSel).children(':selected')[0];
                            if(selCamOpt){
                                deviceId = selCamOpt.value;
                            }
                        }
                        if(deviceId){
                            constraints.video.facingMode = undefined;
                            constraints.video.deviceId = {exact: deviceId};
                        }
                    }
                    
                    var hasTryedNoWidthHeight = false;
                    var getAndPlayVideo = ()=>{
                        if(self.kConsoleLog)self.kConsoleLog('======try getUserMedia========');
                        if(self.kConsoleLog)self.kConsoleLog('ask '+JSON.stringify(constraints.video.width)+'x'+JSON.stringify(constraints.video.height));
                        navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
                            if(self.kConsoleLog)self.kConsoleLog('======get video========');
                            return new Promise((resolve2, reject2)=>{
                                video.srcObject = stream;
                                video.onloadedmetadata = ()=>{
                                    if(self.kConsoleLog)self.kConsoleLog('======play video========');
                                    video.play().then(()=>{
                                        if(self.kConsoleLog)self.kConsoleLog('======played video========');
                                        var gotRsl = video.videoWidth+'x'+video.videoHeight;
                                        if(optGotRsl)optGotRsl.innerText = gotRsl;
                                        if(resolutionSel)resolutionSel.value = 'got';
                                        if(self.kConsoleLog)self.kConsoleLog(gotRsl);
                                        resolve2();
                                    },(ex)=>{
                                        reject2(ex);
                                    });
                                };
                                video.onerror = ()=>{reject2();};
                            });
                        }).then(()=>{
                            resolve();
                        }).catch((ex)=>{
                            if(self.kConsoleLog)self.kConsoleLog(ex);
                            if(!hasTryedNoWidthHeight){
                                hasTryedNoWidthHeight = true;
                                constraints.video.width = undefined;
                                constraints.video.height = undefined;
                                getAndPlayVideo();
                            }else{
                                reject(ex);
                            }
                        });
                    };
                    getAndPlayVideo();
                });
            };
        
            var camSelChange = function (){
                playvideo(cameraSel.value).then(function(){
                    if(windowHasClosed){
                        stopVideo();
                    }
                }).catch(function(ex){
                    alert('Play video failed: ' + (ex.message || ex));
                });
            };
            if(cameraSel)cameraSel.addEventListener('change', camSelChange);
            
            var relSelChange = function (){
                playvideo().then(function(){
                    if(windowHasClosed){
                        stopVideo();
                    }
                }).catch(function(ex){
                    alert('Play video failed: ' + (ex.message || ex));
                });
            };
            if(resolutionSel)resolutionSel.addEventListener('change', relSelChange);
            
            kPainter.grabVideo = function(isAutoAdd, callback){
                var canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(video,0,0);
                if(!isAutoAdd){
                    return canvas;
                }
                kPainter.addImageAsync(canvas, callback);
            };

            var btnGrabClick = function(){
                if(kPainter.beforeAddImgFromGrabVideoBtn){
                    var canvas = kPainter.grabVideo();
                    doCallbackNoBreak(kPainter.beforeAddImgFromGrabVideoBtn, [canvas, function(newCanvas){
                        kPainter.addImageAsync(newCanvas, kPainter.afterAddImgFromGrabVideoBtn);
                    }]);
                }else{
                    kPainter.grabVideo(true, kPainter.afterAddImgFromGrabVideoBtn);
                    kPainter.hideVideo();
                }
            };
            if(btnGrab)$(btnGrab).on("click touchstart", btnGrabClick);
        
            var windowHasClosed = false;
            var closeWindow = function(){
                stopVideo();
                windowHasClosed = true;
                optGotRsl.removeAttribute('data-width');
                var parent = kPainter.videoHtmlElement.parentNode;
                if(parent){
                    parent.removeChild(kPainter.videoHtmlElement);
                }
                if(cameraSel)cameraSel.removeEventListener('change', camSelChange);
                if(resolutionSel)resolutionSel.removeEventListener('change', relSelChange);
                if(btnGrab)$(btnGrab).off("click touchstart", btnGrabClick);
                if(btnClose)$(btnClose).off("click touchstart", closeWindow);
                kPainter.grabVideo = null;
                kPainter.hideVideo = null;
            };
            kPainter.hideVideo = closeWindow;
            if(btnClose)$(btnClose).on("click touchstart", closeWindow);

            document.body.appendChild(kPainter.videoHtmlElement);
        
            return playvideo().then(function(){
                if(windowHasClosed){
                    stopVideo();
                    return Promise.reject('Video window has closed.');
                }else{
                    updateDevice().catch(function(ex){if(self.kConsoleLog)kConsoleLog(ex);});
                    $(kPainter.videoHtmlElement).show();
                    return Promise.resolve();
                }
            });
        };
    };
};

KPainter.cvFolder = (KPainter.cvFolder == undefined ? "js" : KPainter.cvFolder);
KPainter.cvHasLoaded = false;

KPainter._doCallbackNoBreak = function(callback, paras){
    if(callback){try{callback.apply(window, paras||[]);}catch(ex){setTimeout(function(){throw(ex);},0);}}
};
KPainter.loadCvScriptAsync = function(callback){
    KPainter._loadCvQueue = KPainter._loadCvQueue || new TaskQueue();
    var loadCvInner = function(){
        if(KPainter.cvHasLoaded){
            KPainter._doCallbackNoBreak(callback,[true]);
            KPainter._loadCvQueue.next();
            return;
        }
        // CVModule for cv-wasm.js or cv.js
        KPainter._CVModule = {
            cvFolder: KPainter.cvFolder,
            preRun: [],
            postRun: [],
            isRuntimeInitialized: false,
            onRuntimeInitialized: function() {
                KPainter.cvHasLoaded = true;
                if(self.kConsoleLog)kConsoleLog("Runtime is ready!");
                KPainter._doCallbackNoBreak(callback,[true]);
                callback = null;
                KPainter._loadCvQueue.next();
            },
            onExit: function(){
                KPainter._doCallbackNoBreak(callback,[false]);
                callback = null;
                KPainter._loadCvQueue.next();
            },
            onAbort: function(){
                KPainter._doCallbackNoBreak(callback,[false]);
                callback = null;
                KPainter._loadCvQueue.next();
            },
            print: function(text) {
                if(self.kConsoleLog)kConsoleLog(text);
            },
            printErr: function(text) {
                if(self.kConsoleLog)kConsoleLog(text);
            },
            setStatus: function(text) {
                if(self.kConsoleLog)kConsoleLog(text);
            },
            totalDependencies: 0
        };
        KPainter._CVModule.setStatus('Downloading...');
        var script = document.createElement('script');
        var path = KPainter.cvFolder;
        if(path.charAt(path.length - 1) != '/'){
            path += '/';
        }
        if(window.WebAssembly){
            //webassembly
            script.src = path+"cv-wasm.js?v=20180921";
        }else{
            //asm js
            script.src = path+"cv.js?v=201800921";
        }
        script.onerror = function(){
            KPainter._doCallbackNoBreak(callback,[false]);
            KPainter._loadCvQueue.next();
        };
        document.body.appendChild(script);
    };
    KPainter._loadCvQueue.push(loadCvInner);
};
var MBC = KPainter;//eslint-disable-line
//export default MBC;