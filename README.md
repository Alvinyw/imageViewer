# imageViewer
一款基于 Html5 的图片编辑器

## Api 展示
1. `LoadImageEx(imgData)`：从本地 load 图片；
2. `ShowVideo()`：打开摄像头，从摄像头截取图片并 load 到编辑器；
3. `RemoveAllImages()`：删除所有图片；
4. `RemoveAllSelectedImages()`：删除当前选中的图片；
5. `ShowImageEditor()`：进入图片编辑模式；
6. `CloseImageEditor()`：退出图片编辑模式；
7. `RotateLeft()`：向左旋转 90°；
8. `RotateRight()`：向右旋转 90°；
9. `Rotate(index,angle)`：将索引等于 index 的图片旋转 angle 度，目前 angle 只能传入 90 的倍数；
10. `Mirror()`：水平镜像翻转；
11. `Flip()`：垂直镜像翻转；
12. `Crop()`：裁切当前框选的图片区域；
13. `Undo()`：回退到上一步；
14. `Redo()`：前进到下一步（执行过 Undo 之后，Redo 才有效）；
15. `Save()`：保存当前图片，并更新原图片；
16. `AdaptiveLayout()`：自适应屏幕大小；

## 其他功能
1. 在进入编辑模式之前，imageViewer 支持手势滑动切换，也支持鼠标滑动切换；

## 示例
[Demo](https://alvinyw.github.io/Blog/ImageViewer/index.html)
