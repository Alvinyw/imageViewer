/*global $, KPainter, TaskQueue, Tiff, pdfjsLib, kUtil*/
/*eslint-disable no-console*/
var isMobileSafari = (/iPhone/i.test(navigator.platform) || /iPod/i.test(navigator.platform) || /iPad/i.test(navigator.userAgent)) && !!navigator.appVersion.match(/(?:Version\/)([\w\._]+)/); 
if(isMobileSafari){
    /* In safari at ios, 
     * when open this page by '_blank' mode,
     * and run the script in every pages which this page can link to, 
     * can disable ios safari swipe back and forward.
     */
    window.history.replaceState(null, null, "#");
}

$("#imageViewer").on("touchmove", function(ev){
    ev.preventDefault();
    ev.stopPropagation();
});

var painter = new imageViewer();

painter.onStartLoading = function(){ $("#grayFog").show(); };
painter.onFinishLoading = function(){ $("#grayFog").hide(); };

var painterDOM = painter.getHtmlElement();
painterDOM.style.width = '100%';
painterDOM.style.height = '100%';
painterDOM.style.backgroundColor = 'rgba(0,0,0,0.3)';
$("#imageViewer").append(painterDOM);

$(window).resize(function(){
    painter.updateUIOnResize(true);
});

painter.defaultFileInput.accept += ',image/tiff,application/pdf';

painter.bindThumbnailBox(document.getElementById('thumbnailContainer'), function(cvs){
    var box = document.createElement('div');
    box.className = 'div-thumbnailBox';
    box.appendChild(cvs);
    var svgTrash = $('<svg width="32" height="32" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path file="#fff" d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>');
    var fog = document.createElement('div');
    fog.className = 'div-trashFog';
    fog.appendChild(svgTrash[0]);
    box.appendChild(fog);
    return box;
});

$('#thumbnailContainer').on('click', '.div-thumbnailBox', function(){
    var idx = this.getKPainterIndex();
    if($('#ipt-deleteMode').prop('checked')){
        painter.del(idx);
    }else{
        painter.changePage(idx);
    }
});

$("#grayFog").hide();
