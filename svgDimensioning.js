function iniDimensioner(){
    getSvgTrueSize();    
    embedded = inIframe();
    console.log("SVG EMBEDDED : " + embedded);
    if(embedded){
        adjustSvgSizeToContainer();
    }else{
        fitWidth = getUrlPar('fitWidth');
        fitHeight = getUrlPar('fitHeight');
        if(!Number.isNaN(fitWidth) && !Number.isNaN(fitHeight) && parseInt(fitWidth) > 0 && parseInt(fitHeight) > 0){
            adjustSvgSizeToFitting(fitWidth, fitHeight);
        }
    }
}

function getSvgTrueSize(){
    for(var i in children){
        if(children[i].nodeType === 1 && (children[i].tagName === "a")){
            let child = children[i].children[0];
//            console.log(i + " :: " + child.nodeType + " - " + child.getBBox() + " - " + child.tagName + " - " + child);
            let bbox = child.getBBox();
            let hor = bbox.x + bbox.width;
            let ver = bbox.y + bbox.height;
            if(hor > realWidth){
                realWidth = hor;
            }
            if(ver > realHeight){
                realHeight = ver;
            }
//            let rect = draw.rect(bbox.width, bbox.height);
//            rect.attr({x : bbox.x, y : bbox.y, fill: '#ff0000', 'fill-opacity': 0.1, stroke: '#000', 'stroke-width': 1});
        }else if(children[i].nodeType === 1){
//            console.log(i + " : " + children[i].nodeType + " - " + children[i].getBBox() + " - " + children[i].tagName + " - " + children[i]);
            let bbox = children[i].getBBox();
            let hor = bbox.x + bbox.width;
            let ver = bbox.y + bbox.height;
            if(hor > realWidth){
                realWidth = hor;
            }
            if(ver > realHeight){
                realHeight = ver;
            }
//            let rect = draw.rect(bbox.width, bbox.height);
//            rect.attr({x : bbox.x, y : bbox.y, fill: '#ff0000', 'fill-opacity': 0.1, stroke: '#000', 'stroke-width': 1});
        }
    }    
    realWidth = Math.ceil(realWidth) + 15;
    realHeight = Math.ceil(realHeight) + 15;
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

function adjustSvgSizeToContainer(){
    console.log("SVG ADJUST TO CONTAINER");
    let scale = scaleToBounds(realWidth, realHeight, window.innerWidth, window.innerHeight);
    if(!expandToFitBounds && scale > 1.0){
        // DO NOTHING
    }else{
        let width = Math.ceil(realWidth * scale);
        let height = Math.ceil(realHeight * scale);
        grpEl.setAttribute("transform","scale(" + scale + ")");
    }
    draw.attr("width", 2000 + "px");
    draw.attr("height", 2000 + "px");
}

function adjustSvgSizeToFitting(fitWidth, fitHeight){
    console.log("SVG ADJUST TO FITTING");
    let scale = scaleToBounds(realWidth, realHeight, fitWidth, fitHeight);
    if(!expandToFitBounds && scale > 1.0){
        // DO NOTHING
    }else{
        let width = Math.ceil(realWidth * scale);
        let height = Math.ceil(realHeight * scale);
        grpEl.setAttribute("transform","scale(" + scale + ")");
    }    
    draw.attr("width", 2000 + "px");
    draw.attr("height", 2000 + "px");
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
            
function getUrlParameter(url, name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(url);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

var getUrlPar = function getUrlPar(sParam) {
    var sPageURL = window.location.search.substring(1), sURLVariables = sPageURL.split('&'), sParameterName, i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};



