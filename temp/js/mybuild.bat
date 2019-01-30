set mbc-version=2.1.3

del mbc-%mbc-version%.temp.js
del mbc-%mbc-version%.min.js
del mbc-%mbc-version%.jq.min.js
del ..\css\mbc-%mbc-version%.css

copy kUtil.js mbc-%mbc-version%.temp.js
type task-queue.js >> mbc-%mbc-version%.temp.js
type exif.js >> mbc-%mbc-version%.temp.js
type kPainter.js >> mbc-%mbc-version%.temp.js

java -jar closure-compiler-v20170218.jar --js mbc-%mbc-version%.temp.js --js_output_file mbc-%mbc-version%.nohead.min.js
copy mbc-head.js mbc-%mbc-version%.min.js
type mbc-%mbc-version%.nohead.min.js >> mbc-%mbc-version%.min.js
del mbc-%mbc-version%.nohead.min.js

copy jquery-3.2.1.slim.min.js mbc-%mbc-version%.jq.temp.js
type mbc-%mbc-version%.temp.js >> mbc-%mbc-version%.jq.temp.js
java -jar closure-compiler-v20170218.jar --js mbc-%mbc-version%.jq.temp.js --js_output_file mbc-%mbc-version%.jq.nohead.min.js
copy mbc-head.js mbc-%mbc-version%.jq.min.js
type mbc-%mbc-version%.jq.nohead.min.js >> mbc-%mbc-version%.jq.min.js
del mbc-%mbc-version%.jq.nohead.min.js

copy mbc-head.js ..\css\mbc-%mbc-version%.css
type ..\css\kPainter.css >> ..\css\mbc-%mbc-version%.css

pause
