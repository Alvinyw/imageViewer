# imageViewer
一款基于 Html5、Canvas 的图片编辑器

## 一、通过 script 脚本引入

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" type="text/css" href="css/cssResetH5.css" />
    <link rel="stylesheet" type="text/css" href="css/mbc.css" />
    <script type="text/javascript">
        var Alvin = Alvin || {};
    </script>
</head>

<body>
    <div id="imageViewer"></div>
</body>
<script type="text/javascript" src="js/jquery-3.2.1.min.js"></script>
<script type="text/javascript" src="mbc.js?v=20200227"></script>
<script type="text/javascript" src="js/opration.js?v=20190522"></script>
</html>
```

## 二、通过 Node 引用

```js
npm i alvin-imageviewer
```

在 VUE 的 SPA 中的使用示例：
```html
<template>
  <div id="main">
    <a href="javascript:void(0)" @click="fuc_LoadImage">LoadImage</a>
    <div id="imageViewer"></div>
  </div>
</template>
<script>
import createImageViewer from "alvin-imageviewer";
export default {
  name: "ImageViewer",
  data() {
    return {
      imageViewer: "",
    };
  },
  mounted() {
    var cfg = {
      ContainerId: "imageViewer",
      Width: "1000px",
      Height: "1000px",
    };
    this.imageViewer = createImageViewer(cfg);
  },
  methods: {
    fuc_LoadImage() {
      if (!this.imageViewer) {
        return false;
      }
      this.imageViewer.LoadImageEx();
    },
  },
};
</script>
```

## 三、ImageViewer 的 APIs

### 基本功能
1. `LoadImageEx(imgData)`：从本地 load 图片；
2. `ShowVideo()`：打开摄像头，从摄像头截取图片并 load 到编辑器；
3. `RemoveAllImages()`：删除所有图片；
4. `RemoveAllSelectedImages()`：删除当前选中的图片；
5. `ShowImage(index)`：显示索引为 index 的图片；
6. `ChangePage(cmd)`：
    ```js
    switch(cmd){
        case "f": 显示第一张图片;
        case "p": 显示上一张图片;
        case "n": 显示下一张图片;
        case "l": 显示最后一张图片;
        default: 不变
    }
    ```
7. `GetCurentIndex()`：获取当前图片的索引；
8. `GetCount()`：获取 ImageViewer 中的图片总数；
9. `GetImage(index,isOri)`：获取索引为 index 的图片，当 isOri 为 true 时获取原图，isOri 为 false 时获取缩略图；
10. `SaveAsBMP(filename,index)`：将索引为 index 的图片保存为 BMP 格式；
11. `SaveAsJPEG(filename,index)`：将索引为 index 的图片保存为 JPEG 格式；
12. `SaveAsTIFF(filename,index)`：将索引为 index 的图片保存为 TIFF 格式；
13. `SaveAsPNG(filename,index)`：将索引为 index 的图片保存为 PNG 格式；
14. `SaveAsPDF(filename,index)`：将索引为 index 的图片保存为 PDF 格式；
15. `GetBackgroundColor()/SetBackgroundColor()`：获取/设置 ImageViewer 的背景色；

### 编辑功能
1. `ShowImageEditor()`：进入图片编辑模式；
2. `CloseImageEditor()`：退出图片编辑模式；
3. `RotateLeft()`：向左旋转 90°；
4. `RotateRight()`：向右旋转 90°；
5. `Rotate(index,angle)`：将索引等于 index 的图片旋转 angle 度，目前 angle 只能传入 90 的倍数；
6. `Mirror()`：水平镜像翻转；
7. `Flip()`：垂直镜像翻转；
8. `Crop()`：裁切当前框选的图片区域；
9. `Undo()`：回退到上一步；
10. `Redo()`：前进到下一步（执行过 Undo 之后，Redo 才有效）；
11. `Save()`：保存当前图片，并更新原图片；
12. `SetCropBackgroundColor()`：设置裁切框的背景色；
13. `SetCropBorderColor()`：设置裁切框的边框色；

### 其他功能
1. `AdaptiveLayout()`：自适应屏幕大小；
2. `onNumChange()`：响应当前显示图片 index 改变的钩子函数；

### Thumbnail 的 Apis
1. `GetThumbnaiBackgroundColor()/SetThumbnailBackgroundColor()`：获取/设置 thumbnail 的背景色；
2. `GetThumbnailImageMargin()/SetThumbnailImageMargin(val)`：获取/设置 thumbnail 中图片的外边距，默认为 10px;

### 附加功能
1. 在进入编辑模式之前，imageViewer 支持手势滑动切换，也支持鼠标滑动切换；

## 四、示例
[Demo](https://alvinyw.github.io/Blog/ImageViewer/index.html)
