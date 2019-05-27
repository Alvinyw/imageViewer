(function (ML) {

	"use strict";

	var lib = ML;
	
	function ThumbnailControl(cfg) {
		var _this = this;

		// ThumbnailControl 实际占用的宽/高 包括滚动条
		_this._width = 0;
		_this._height = 0;

		// ThumbnailControl 位置信息
		_this.Left = 0;
		_this.Top = 0;

		// ThumbnailControl 的原始宽高
		_this._origImageWidth = 0;
		_this._origImageHeight = 0;

		// canvas宽/高 
		_this.canvasWidth = 0;
		_this.canvasHeight = 0;

		_this.borderWidth = 1;	// 暂时为1, 不要改
		_this.borderColor = '#DDDDDD';
		_this.selectionBorderColor = '#7DA2CE';
		_this.backgroundColor = '#FFFFFF';

		_this.bSelect = false;

		// thumbnail 里 image 在 client 端的索引
		_this.cIndex = -1;

		_this.drawArea = {
			width: _this.canvasWidth,
			height: _this.canvasHeight,
			x: 0,
			y: 0
		};

		_this.canvasBackgroundGradientColorPairs = {
			NotSelectedHovering: ['rgb(250,252,253)', 'rgb(239,246,253)'],
			Selected: ['rgb(221,234,252)', 'rgb(199,222,252)']
		};

		_this.bVisible = true;
		_this.thumbOut = false;
		_this.thumbCanvas = false;

		_this.viewer = null;

		_this.thumbnailImagesPerRow = 3;

		_this.attachImage = false;
		
		// init
		_this.__init(cfg);
	}

	// Method
	// 初始化
	ThumbnailControl.prototype.__init = function (cfg) {
		var _this = this, doc = window.document;

		_this.viewer = cfg.viewer;
		_this.Top = _this.viewer.ThumbnailImageMargin;
		_this.Left = _this.viewer.ThumbnailImageMargin;

		_this.thumbnailImagesPerRow = (_this.viewer.thumbnailImagesPerRow > 2)?(_this.viewer.thumbnailImagesPerRow):3;;
		_this._width = _this.viewer.ThumbnailControlW;
		_this._height = _this.viewer.ThumbnailControlH;
		_this.canvasWidth = _this._width;
		_this.canvasHeight = _this._height;

		_this.imageUrl = cfg.imageUrl;
		_this.cIndex = cfg.index;
		
		_this.thumbOut = doc.createElement('div');
		_this.thumbOut.style.display = 'inline-block';
		_this.thumbOut.style.width = _this._width + 2 + 'px';
		_this.thumbOut.style.height = _this._height + 2 + 'px';
		_this.thumbOut.style.position = 'absolute';
		_this.thumbOut.style.top = _this.Top + 'px';
		_this.thumbOut.style.left = _this.Left + 'px';
		_this.thumbOut.style.border = _this.borderWidth + 'px solid ' + _this.borderColor;
		_this.thumbOut.style.cursor = 'pointer';

		_this.thumbCanvas = doc.createElement('canvas');
		_this.thumbCanvas.style.position = 'relative';
		_this.thumbCanvas.style.top = '0px';
		_this.thumbCanvas.width = _this.canvasWidth;
		_this.thumbCanvas.height = _this.canvasHeight;

		_this.thumbOut.appendChild(_this.thumbCanvas);

		lib.addEvent(_this.thumbOut,"click", function(){
			_this.viewer.ShowImage(_this.cIndex);
		});

		lib.addEvent(_this.thumbOut,"mouseenter", function(){
			_this.bMouseHovering = true;
			if (_this.bSelect) return;
			_this.Show();
		});

		lib.addEvent(_this.thumbOut,"mouseout", function(){
			_this.bMouseHovering = false;
			if (_this.bSelect) return;
			_this.Show();
		});

		_this.__getImageByUrl();
	};

	ThumbnailControl.prototype.SetVisible = function (bShow) {
		var _this = this;

		_this.bVisible = bShow;
		if (bShow) {
			_this.thumbOut.style.display = '';
			_this.Show();
		} else {
			_this.thumbOut.style.display = 'none';
		}
		return true;
	};

	ThumbnailControl.prototype.ChangeControlSize = function (width, height) {
		var _this = this;

		_this._width = width;
		_this._height = height;

		_this.canvasWidth = width;
		_this.canvasHeight = height;

		_this.thumbOut.style.width = _this._width + 2 + 'px';
		_this.thumbOut.style.height = _this._height + 2 + 'px';

		_this.Show();
		return true;
	};

	// 设置背景色
	ThumbnailControl.prototype.SetBackgroundColor = function (bkcolor) {
		var _this = this;
		_this.backgroundColor = bkcolor;

		_this.Show();
		return true;
	};

	// 设置控件位置
	ThumbnailControl.prototype.SetLocation = function (x, y) {
		var _this = this;
		_this.Left = x;
		_this.Top = y;
		
		if (_this.thumbOut) {
			if (_this.thumbOut.parentNode)
				_this.thumbOut.parentNode.style.position = "relative";
			_this.thumbOut.style.left = x + 'px';
			_this.thumbOut.style.top = y + 'px';
		}

		return true;
	};

	// 设置border颜色
	ThumbnailControl.prototype.SetSelectionImageBorderColor = function (selectionBorderColor) {
		var _this = this;

		_this.selectionBorderColor = selectionBorderColor;
		_this.__refreshBorder();
		return true;
	};

	ThumbnailControl.prototype.GetEL = function () {

		return this.thumbOut;
	};

	ThumbnailControl.prototype.GetControlWidth = function () {
		return this._width;
	};

	ThumbnailControl.prototype.SetIndex = function (index) {
		var _this = this;
		if(lib.isNumber(index) && index>=0)
			_this.cIndex = index;
		else
			_this.cIndex = -1;
		return true;
	};

	// 清空图片，显示Loading...
	ThumbnailControl.prototype.ClearImage = function () {
		var _this = this;	

		_this.objImage = false;

		_this._origImageWidth = -1;
		_this._origImageHeight = -1;
		return true;
	};

	// 重新显示图片
	ThumbnailControl.prototype.Show = function (bShowFromScrollEvent) {
		var _this = this, ctx;

		if (_this.bVisible) {
			_this.thumbOut.style.display = 'inline-block';
		} else {
			_this.thumbOut.style.display = 'none';
			return;
		}

		ctx = _this.thumbCanvas.getContext("2d");
		_this.__restoreCanvas(ctx, _this.canvasWidth, _this.canvasHeight);

		ctx.clearRect(0, 0, _this.canvasWidth, _this.canvasHeight);

		if (!_this.objImage ||
			_this.objImage.src == 'data:,' ||
			_this.objImage.width == 0 || _this.objImage.height == 0 ||
			_this.objImage.src == '') {

			// fill background color
			ctx.fillStyle = _this.backgroundColor;

			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			// if width>53px show "Loading..."

			if (_this._width > 53) {
				ctx.font = "12px Times New Roman";
				ctx.textAlign = "center";
				ctx.strokeText("Loading...", ctx.canvas.width * 0.5, ctx.canvas.height * 0.5);
			}

			//Actually draw the image on canvas

			return false;
		}

		if (_this.cIndex == -1) {
			return;
		}

		_this.__fitImage();

		if (_this.drawArea.width < _this.canvasWidth || _this.drawArea.height < _this.canvasHeight) {
			// 如果宽、高比当前画布小，说明有留白，需要画背景色
			var gradient = ctx.createLinearGradient(0, 0, _this.canvasWidth, _this.canvasHeight);

			if (_this.bSelect) {
				gradient.addColorStop(0, _this.canvasBackgroundGradientColorPairs.Selected[0]);
				gradient.addColorStop(1, _this.canvasBackgroundGradientColorPairs.Selected[1]);
				ctx.fillStyle = gradient;
			} else if (_this.bMouseHovering) {
				gradient.addColorStop(0, _this.canvasBackgroundGradientColorPairs.NotSelectedHovering[0]);
				gradient.addColorStop(1, _this.canvasBackgroundGradientColorPairs.NotSelectedHovering[1]);
				ctx.fillStyle = gradient;
			} else {
				ctx.fillStyle = _this.backgroundColor;
			}

			ctx.fillRect(0, 0, _this.canvasWidth, _this.canvasHeight);
		}

		if (_this.objImage) {

			if(_this.attachImage){
				_this.thumbOut.style.position = 'relative';
				_this.objImage.style.position = 'absolute';
				_this.objImage.style.top = Math.floor(_this.drawArea.y) + 'px';
				_this.objImage.style.left = Math.floor(_this.drawArea.x) + 'px';

				_this.thumbOut.appendChild(_this.objImage);
			}else{
				ctx.drawImage(_this.objImage, Math.floor(_this.drawArea.x), Math.floor(_this.drawArea.y), _this.drawArea.width, _this.drawArea.height);
			}

		}

		return true;
	};

	// 图片被选中
	ThumbnailControl.prototype.SetSelect = function (bSelect) {
		var _this = this;
		_this.bSelect = bSelect;
		_this.__refreshBorder();
		_this.Show();
		return true;
	};


	ThumbnailControl.prototype.Destroy = function () {
		var _this = this;

		if (_this.thumbCanvas) {
			var ctx = _this.thumbCanvas.getContext("2d");
			if (_this.canvasWidth > 0 && _this.canvasHeight > 0)
				ctx.clearRect(0, 0, _this.canvasWidth, _this.canvasHeight);
		}

		_this.ClearImage();

		return true;
	};

	ThumbnailControl.prototype.Refresh= function () {
		var _this = this;

		_this.__getImageByUrl();

		return true;
	};

	// 清空图片，显示Loading...
	ThumbnailControl.prototype.ClearControl = function () {
		var _this = this;

		_this.ClearImage();
		_this.Show();
		return true;
	};

	// 计算 ThumbnailControl 里实际显示 image 的宽高
	ThumbnailControl.prototype.__fitImage = function () {
		var _this = this;
		var canvasAspectRatio = _this.canvasWidth/_this.canvasHeight;
		var imageAspectRatio = _this._origImageWidth/_this._origImageHeight;
		if(canvasAspectRatio>imageAspectRatio){
			_this.drawArea.height = _this.canvasHeight;
			_this.drawArea.width = imageAspectRatio*_this.canvasHeight;

			_this.drawArea.x = Math.floor((_this.canvasWidth-_this.drawArea.width)/2);
			_this.drawArea.y = 0;
		}else{
			_this.drawArea.width = _this.canvasWidth;
			_this.drawArea.height = _this.drawArea.width/imageAspectRatio;

			_this.drawArea.x = 0;
			_this.drawArea.y = Math.floor((_this.canvasHeight-_this.drawArea.height)/2);
		}
	}

	//把图片加载到控件上
	ThumbnailControl.prototype.__getImageByUrl = function () {
		var _this = this;

		var newImage = new Image();
		newImage.className = 'aryThumbnailControls-item';
		newImage.setAttribute('alt', 'image');
		newImage.src = _this.imageUrl;
		newImage.onload = function () {
			_this.objImage = newImage;
			_this._origImageWidth = newImage.width;
			_this._origImageHeight = newImage.height;

			_this.Show();
		};

		newImage.onerror = function (e) {
			//newImage.src = url;
		};

		return true;
	};

	ThumbnailControl.prototype.__restoreCanvas = function (ctx, w, h) {
		var _this = this;
		ctx.canvas.width = w;
		ctx.canvas.height = h;

		return true;
	};

	ThumbnailControl.prototype.__refreshBorder = function () {
		var _this = this;
		if (_this.bSelect) {
			// set border
			_this.thumbOut.style.border = _this.borderWidth + 'px solid ' + _this.selectionBorderColor;
			_this.thumbOut.style.cursor = 'default';
		} else {
			_this.thumbOut.style.border = _this.borderWidth + 'px solid ' + _this.borderColor;
			_this.thumbOut.style.cursor = 'pointer';
		}

		return true;
	};

	ML.ThumbnailControl = ThumbnailControl;

})(MBC.Lib);