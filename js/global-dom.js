(function (Alvin) {
	if (!Alvin.MBC)
		Alvin.MBC = {};

	var lib = Alvin.MBC.Lib = {};

	lib.getElDimensions = function (el) {
		var displayFormat, elDimensions;

		if (!el) return false;

		displayFormat = el.style.display;

		el.style.display = '';

		elDimensions = 
		{
			clientTop: el.clientTop, 
			clientLeft: el.clientLeft,
			clientWidth: el.clientWidth ? el.clientWidth : (parseInt(el.style.width) ? parseInt(el.style.width) : 0),
			clientHeight: el.clientHeight ? el.clientHeight : (parseInt(el.style.height) ? parseInt(el.style.height) : 0)
		};

		el.style.display = displayFormat;

		return elDimensions;
	}

	lib.hasClass = function(obj,cls) {  
		return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));  
	};  

	lib.addClass = function(obj,cls) {  
		if (!this.hasClass(obj,cls)) obj.className += cls;  
	}  

	lib.removeClass = function(obj,cls) {  
		if (this.hasClass(obj,cls)) {  
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');  
			obj.className = obj.className.replace(reg, ' ');  
		}  
	}; 

	lib.toggleClass = function(obj,cls){  
	    if(this.hasClass(obj,cls)){  
	        this.removeClass(obj,cls);  
	    }else{  
	        this.addClass(obj,cls);  
	    }  
	};

	lib.isNumber = function (val) {
		if(val === "" || val ==null){
			return false;
		}
		if(!isNaN(val)){
			return true;
		}else{
			return false;
		}
	}

	lib.each = function (object, fn, context) {
        if (object) {
            var key,
                val,
                keys,
                i = 0,
                length = object.length,
                // do not use typeof obj == 'function': bug in phantomjs
                isObj = lib.isUndefined(length) || lib.isFunction(object);

            context = context || null;

            if (isObj) {
                keys = lib.keys(object);
                for (; i < keys.length; i++) {
                    key = keys[i];
                    // can not use hasOwnProperty
                    if (fn.call(context, object[key], key, object) === false) {
                        break;
                    }
                }
            } else {
                for (val = object[0];
                    i < length; val = object[++i]) {
                    if (fn.call(context, val, i, object) === false) {
                        break;
                    }
                }
            }
        }

        return object;
	};

	lib.isUndefined = function (exp) {
		if (typeof(exp) == "undefined")
		{
			return true;
		}
		return false;
	};
	
	lib.isFunction = function (_fun) {
		return _fun && typeof (_fun) === 'function';
	};

	var hasEnumBug = !({ toString: 1 }.propertyIsEnumerable('toString')),
        enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];
		
    function hasOwnProperty(o, p) {
        return ({}).hasOwnProperty.call(o, p);
	}
	
	lib.keys = Object.keys || function(o) {
        var result = [], p, i;

        for (p in o) {
            // lib.keys(new XX())
            if (hasOwnProperty(o, p)) {
                result.push(p);
            }
        }

        if (hasEnumBug) {
            for (i = enumProperties.length - 1; i >= 0; i--) {
                p = enumProperties[i];
                if (hasOwnProperty(o, p)) {
                    result.push(p);
                }
            }
        }

        return result;
	};

	lib.doCallbackNoBreak = function(callback, paras){
		if(callback){
			try{
				callback.apply(window, paras||[]);
			}
			catch(ex){
				setTimeout(function(){throw(ex);},0);
			}
		}
	};

	lib.convertBase64ToBlob = function(base64Str, mimeType){
	var byteCharacters = window.atob(base64Str);
	var byteNumArr = new Array(byteCharacters.length);
	for(var i=0; i < byteCharacters.length; ++i){
		byteNumArr[i] = byteCharacters.charCodeAt(i);
	}
	var uint8Arr = new Uint8Array(byteNumArr);
	return new Blob([uint8Arr], {type: mimeType});
	};

	lib.convertURLToBlob = function(url, callback) {
	var http = new XMLHttpRequest();
	http.open("GET", url, true);
	http.responseType = "blob";
	http.onloadend = function() {
		callback(this.response);
	};
	http.send();
	};

	lib.canvasToBlob = function(cvs, callback, mimeType, quality){
	if(cvs.toBlob){
		cvs.toBlob(callback, mimeType, quality);
	}else{
		var b64str = cvs.toDataURL(mimeType, quality);
		var blob = lib.convertBase64ToBlob(b64str.substring(b64str.indexOf(",")+1), mimeType);
		callback(blob);
	}
	};

	lib.getBlobFromAnyImgData = function(imgData, callback){
	if(imgData instanceof Blob){
		callback(imgData);
	}else if(imgData instanceof HTMLCanvasElement){
		lib.canvasToBlob(imgData, function(blob){
			callback(blob);
		});
	}else if(typeof imgData == "string" || imgData instanceof String){
		var url = imgData;
		if("data:" == url.substring(0, 5)){ // url is base64
			var mimeType = "";
			if("image/" == url.substring(5, 11)){
				mimeType = url.substring(5, url.indexOf(";", 11));
			}
			var blob = lib.convertBase64ToBlob(url.substring(url.indexOf("base64,")+7), mimeType);
			callback(blob);
		}else{ // url is link, such as 'https://....'
			lib.convertURLToBlob(url, function(blob){
				callback(blob);
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

		lib.canvasToBlob(tCvs, function(blob){
			callback(blob);
		}, saveFormat);    

	}else{
		//not support
		callback(null);
	}

	};

	lib.addEvent = function(obj,type,handle){
		var typeAry = type.split(' ');
		if(!obj.length){
			for(var j=0;j<typeAry.length;j++){
				obj.addEventListener ? obj.addEventListener(typeAry[j],handle,false) : obj.attachEvent("on"+typeAry[j],handle);
			}
		}else{
			for(var i=0;i<obj.length;i++){
				for(var j=0;j<typeAry.length;j++){
					obj[i].addEventListener ? obj[i].addEventListener(typeAry[j],handle,false) : obj[i].attachEvent("on"+typeAry[j],handle);
				}
			}
		}
	};

	lib.removeEvent = function(obj,type,handle){
		var typeAry = type.split(' ');
		if(!obj.length){
			for(var j=0;j<typeAry.length;j++){
				obj.removeEventListener ? obj.removeEventListener(typeAry[j],handle,false) : obj.detachEvent("on"+typeAry[j],handle);
			}
		}else{
			for(var i=0;i<obj.length;i++){
				for(var j=0;j<typeAry.length;j++){
					obj[i].removeEventListener ? obj[i].removeEventListener(typeAry[j],handle,false) : obj[i].detachEvent("on"+typeAry[j],handle);
				}
			}
		}
	};

	lib.stopDefault = function(e){
		if ( e && e.preventDefault ){ 
			e.preventDefault();
		} else { 
			window.event.returnValue = false;
		}
	};

	lib._querySelectorAll = function(element, selector){
		var idAllocator = 10000;
		if (element.querySelectorAll){
			return element.querySelectorAll(selector);
		}else {
			var needsID = element.id === "";
			if (needsID) {
				++idAllocator;
				element.id = "__qsa" + idAllocator;
			}
			try {
				return document.querySelectorAll("#" + element.id + " " + selector);
			}
			finally {
				if (needsID) {
					element.id = "";
				}
			}
		}
	};

	lib.fireEvent = function (name, el) {
		var event;
		if (document.createEvent) {
			event = document.createEvent('HTMLEvents');
			event.initEvent(name, true, true);

			if (el.dispatchEvent)
				el.dispatchEvent(event);
		}
		else if (document.createEventObject) {
			event = document.createEventObject();
			event.bubbles = true;
			event.cancelable = true;
			el.fireEvent(name, event);
		}
		else {
			event = new Event(name);
			if (el.dispatchEvent)
				el.dispatchEvent(event);
		}
	}

	//indexOf() do not compatible with IE6-8
	if(!Array.prototype.indexOf){  
		Array.prototype.indexOf = function(val){  
			var value = this;  
			for(var i =0; i < value.length; i++){  
				if(value[i] == val) return i;  
			}  
			return -1;  
		};  
	}

	// querySelector & querySelectorAll do not compatible with IE6-7
	if (!document.querySelectorAll) {
		document.querySelectorAll = function (selectors) {
			var style = document.createElement('style'), elements = [], element;
			document.documentElement.firstChild.appendChild(style);
			document._qsa = [];

			style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
			window.scrollBy(0, 0);
			style.parentNode.removeChild(style);

			while (document._qsa.length) {
				element = document._qsa.shift();
				element.style.removeAttribute('x-qsa');
				elements.push(element);
			}
			document._qsa = null;
			return elements;
		};
	}

	if (!document.querySelector) {
		document.querySelector = function (selectors) {
			var elements = document.querySelectorAll(selectors);
			return (elements.length) ? elements[0] : null;
		};
	}

	lib.mix = function (dest, source) {
		for (var i in source) {
			if (source.hasOwnProperty(i)) {
				dest[i] = source[i];
			}
		}
		return dest;
	}

	// global errors
	lib.Errors = {
		Sucess: function (obj) {
			obj._errorCode = 0;
			obj._errorString = 'Successful.';
		},
		IndexOutOfRange: function (obj) {
			obj._errorCode = -1000;
			obj._errorString = 'The index is out of range.';
		},
		FucNotValidInThisMode: function (obj,fuc,mode) {
			obj._errorCode = -1001;
			obj._errorString = ''+fuc+'(): This function is not valid in '+mode+' mode.';
		},
		InvalidValue: function (obj) {
			obj._errorCode = -1002;
			obj._errorString = 'Invalid value.';
		},
		InvalidParameterType: function (obj) {
			obj._errorCode = -1003;
			obj._errorString = 'Parameter type is not supported.';
		},

		__last: false
	}

	lib.DEF = function (self, name, obj){
		Object.defineProperty(self, name, obj);
	}

	lib.attachProperty = function (st) {
		var _this = st;
		var DEF = lib.DEF;

		DEF(_this, 'ErrorCode', {
			get: function () {// read-only
				return _this._errorCode;
			}
		});
		DEF(_this, 'ErrorString', {
			get: function () {// read-only
				if (_this._errorCode != 0) {
					return _this._errorString;
				}

				return 'Successful.';
			}
		});
		DEF(_this, 'HowManyImagesInBuffer', {
			get: function () {
				return _this.GetCount();
			}
		});
		DEF(_this, 'CurrentImageIndexInBuffer', {
			get: function () {
				return _this.GetCurentIndex();
			},
			set: function (v) {
				var _v = v * 1;

				if (_v >= 0 && _v < _this.GetCount()) {
					_this.ShowImage(_v);
				}
				return true;
			}
		});
	}

})(Alvin);