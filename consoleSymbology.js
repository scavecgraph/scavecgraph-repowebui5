var PUBLICKEY = "";
var VISITORIP = "";
var CDNROOTDIR = "";
var FORDEMO = false;
var LIBID;
var CURRENTSYMBOLOGY = "";
var HTML = null;

var styleScroll = "*{scrollbar-width:thin;scrollbar-height:thin;scrollbar-color: #ffffff;} *::-webkit-scrollbar {height:4px;width:4px;} *::-webkit-scrollbar-track {background-color: #C0DBEE;} *::-webkit-scrollbar-thumb {background-color:#ffffff;border-radius:2px;border: 1px solid #ffffff;}";

$(document).ready(function () {

    var body = $("#body");
    var path = document.getElementById("cdnOrigin").src;
    var CDNROOTDIR = getPath(path);
    PUBLICKEY = document.getElementById("cdnOrigin").getAttribute("data-publicKey");
    VISITORIP = document.getElementById("cdnOrigin").getAttribute("data-visitorIp");
    console.log('cdnOrigin : ' + CDNROOTDIR);
    console.log('PUBLICKEY : ' + PUBLICKEY);
    console.log('VISITORIP : ' + VISITORIP);

    $.get(CDNROOTDIR + 'consoleSymbologyUI.html', function(contents) {
        HTML = $.parseHTML(contents.replaceAll("@",CDNROOTDIR));
        body.append(HTML);
        buildUI();
    },'text');
});

function getPath(path){
    path = path.match(/(^.*[\\\/]|^[^\\\/].*)/i);
    if(path != null){
        return path[0];
    }else{
        return false;
    }
}

function buildUI(){

    console.log('host : ' + window.location.hostname);
    
    $(document).tooltip();

    if (symbologyId) {
        getSymbologysForSymbology(symbologyId);
    }

    $("#symbologyChoose").checkboxradio();

    $("#symbologyChoose").click(function () {
        $("#symbologysChooseL").empty();
        if (FORDEMO) {
            FORDEMO = false;
            $("#symbologysChooseL").append("Actual");
        } else {
            FORDEMO = true;
            $("#symbologysChooseL").append("Demo");
        }
        getSymbologyLibs(FORDEMO);
    });

    getSymbologyLibs(FORDEMO);
    $('#libSymbologys').dataTable({
        "paging": false,
        "searching": false,
        "ordering": false,
        "scrollCollapse": true,
        "scrollY": 520,
        "info": false,
        "lengthChange": true,
        "autoWidth": false,
        "header": false,
        fixedHeader: {
            "header": false,
            "footer": false
        }
    });
    
    $('#symbologyFrm').on('load', function() {
        const iframe = this;
        let realWidth = 0;
        let realHeight = 0;
        const paths = iframe.contentWindow.document.getElementsByTagNameNS("http://www.w3.org/2000/svg","path");
        for(var i in paths){
            if(paths[i].getBBox){
                let bbox = paths[i].getBBox();
                let w = Math.ceil(bbox.x) + Math.ceil(bbox.width);
                let h = Math.ceil(bbox.y) + Math.ceil(bbox.height);            
                if(w > realWidth){
                    realWidth = w;
                }
                if(w > realHeight){
                    realHeight = h;
                }
            }
        }
        const texts = iframe.contentWindow.document.getElementsByTagNameNS("http://www.w3.org/2000/svg","text");
        for(var i in texts){
            if(texts[i].getBBox){
                let bbox = texts[i].getBBox();
                let w = Math.ceil(bbox.x) + Math.ceil(bbox.width);
                let h = Math.ceil(bbox.y) + Math.ceil(bbox.height);
                if(w > realWidth){
                    realWidth = w;
                }
                if(w > realHeight){
                    realHeight = h;
                }
            }
        }
        realWidth += 20;
        realHeight += 20;
        let frmWidth = iframe.style.width;
        frmWidth = frmWidth.replace(/[^0-9]/g, '');
        let frmHeight = iframe.style.height;
        frmHeight = frmHeight.replace(/[^0-9]/g, '');
        let scale = scaleToBounds(realWidth, realHeight, frmHeight, frmHeight);
//        const g = iframe.contentWindow.document.getElementsByTagNameNS("http://www.w3.org/2000/svg","g");
//        g[0].setAttributeNS("http://www.w3.org/2000/svg","transform","scale(" + scale + ")");
        const gg = iframe.contentWindow.document.getElementsByTagName("g");
        gg[0].setAttribute('transform', "scale(" + scale + ")");
    });
    
    if(/chrome/.test(navigator.userAgent.toLowerCase())){
    }else{
        injectCSS(styleScroll);
    }
}

function scaleToBounds(width, height, fitWidth, fitHeight){
    let widthScale = 0, heightScale = 0;
    if (width !== 0){
        widthScale = fitWidth / width;
    }    
    if (height !== 0){
        heightScale = fitHeight / height;                
    }
    return Math.min(widthScale, heightScale);
} 

function getSymbologyLibs(isForDemo) {
    $.ajax({
        url: BASEURL + "jquery/symbologyLibraries/?demo=" + isForDemo
    }).then(function (data) {
        var select = "<select id=\"symbologyLibs\" name=\"symbologyLibs\">\n<option value=\"0\">Scavecgraph Libs</option>\n";
        for (var i = 0; i < data.length; i++) {
            if (LIBID) {
                if (data[i].id === LIBID) {
                    select += "<option selected=\"selected\" value=" + data[i].id + ">" + data[i].name + "</option>";
                } else {
                    select += "<option value=" + data[i].id + ">" + data[i].name + "</option>";
                }
            } else {
                select += "<option value=" + data[i].id + ">" + data[i].name + "</option>";
            }
        }
        select += "</select>";
        $("#selectMenu").empty();
        $("#selectMenu").append(select);
        var symbologyLibs = $("#symbologyLibs").selectmenu({width: 180});
        symbologyLibs.selectmenu("menuWidget").addClass("option_class");
        symbologyLibs.selectmenu("widget").addClass("option_class");
        $("#symbologyLibs").on("selectmenuchange", function () {
            getLibSymbologys(this.value);
        });
    });
}

function getLibSymbologys(lib) {
    $.ajax({
        url: BASEURL + "jquery/symbologies/" + lib + "/"
    }).then(function (data) {
        $("#navigatorContent").find("tr").remove().end();
        for (var i = 0; i < data.length; i++) {
            $("#navigatorContent").append("<tr><td><img onclick=\"viewSymbologySvg('" + data[i].uuid + "');\" src=\"" + data[i].base64image + "\" title=\"Symbology : " + data[i].name + " - " + data[i].uuid + "\" style=\"cursor:pointer;\"/></td><td onclick=\"viewSymbologySvg('" + data[i].uuid + "',true,true);\" title=\"Symbology : " + data[i].name + " - " + data[i].uuid + "\" style=\"cursor:pointer;\" class=\"symbologyText\">" + data[i].name + "</td></tr>");
        }
    });
}

function viewSymbologySvg(symbologyId) {
    CURRENTSYMBOLOGY = symbologyId;
    var url = BASEURL + "symbology/" + symbologyId + "/1.0/symbology.svg?fitWidth=480&fitHeight=500";
    $("#symbologyFrm").attr("src", url);
}

function getSymbologysForSymbology(symbologyId) {
    viewSymbologySvg(symbologyId);
    $.ajax({
        url: BASEURL + "jquery/symbology/" + symbologyId + "/"
    }).then(function (data) {
        LIBID = data.libraryId;
        if (LIBID < 8) {
            //demo context
            FORDEMO = true;
            getSymbologyLibs(FORDEMO);
        }
    });
    $.ajax({
        url: BASEURL + "jquery/siblingsymbologies/" + symbologyId + "/"
    }).then(function (data) {
        $("#navigatorContent").find("tr").remove().end();
        for (var i = 0; i < data.length; i++) {
            $("#navigatorContent").append("<tr><td><img onclick=\"viewSymbologySvg('" + data[i].uuid + "');\" src=\"" + data[i].base64image + "\" title=\"Symbology : " + data[i].name + " - " + data[i].uuid + "\" style=\"cursor:pointer;\"/></td><td onclick=\"viewSymbologySvg('" + data[i].uuid + "',true,true);\" title=\"Symbology : " + data[i].name + " - " + data[i].uuid + "\" style=\"cursor:pointer;\" class=\"symbologyText\">" + data[i].name + "</td></tr>");
        }
    });
}

const injectCSS = css => {
    let el = document.createElement('style');
    el.type = 'text/css';
    el.innerText = css;
    document.head.appendChild(el);
    return el;
};

function getQueryParam(param, defaultValue = undefined) {
    location.search.substr(1)
            .split("&")
            .some(function (item) { // returns first occurence and stops
                return item.split("=")[0] == param && (defaultValue = item.split("=")[1], true);
            });
    return defaultValue;
}

function navigateConsole(page) {
    switch (page) {
        case 'deviceViewportConsole.html':
            if (CURRENTSYMBOLOGY) {
                var url = BASEURL + page + '?symbologyId=' + CURRENTSYMBOLOGY;
                location.href = url;
            }
            break;
        case 'contextConsole.html':
            var url = BASEURL + page;
            location.href = url;
            break;
        case 'symbolConsole.html':
            var url = BASEURL + page;
            location.href = url;
            break;
        case 'channel.html':
            var WIDTH = $(document).width();
            var HEIGHT = $(document).height();
            if (!window.matchMedia("(pointer: coarse)").matches) {
                WIDTH = Math.ceil(WIDTH / 3);
                HEIGHT = Math.ceil(HEIGHT / 2);
            }
            var url = BASEURL + page + '?showTracker=true&trackerScale=0.8&glass=false&color=0178af&navColor=b5d7e8&fitWidth=' + WIDTH + '&fitHeight=' + HEIGHT;
            window.open(url, "_blank");
            break;
        default:
        // code block
    }
}