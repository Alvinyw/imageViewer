
set JAVA_HOME=C:\Java\jdk-11.0.2

attrib -r -s -h *.*
del /q /f *.js

copy ..\common.js mbc.js
type ..\exif.js >> mbc.js
type ..\global-dom.js >> mbc.js
type ..\promise.js >> mbc.js
type ..\kUtil.js >> mbc.js
type ..\VideoViewer.js >> mbc.js
type ..\ImageAreaSelector.js >> mbc.js
type ..\ImageControl.js >> mbc.js
type ..\ThumbnailControl.js >> mbc.js
type ..\ImageViewer.js >> mbc.js
