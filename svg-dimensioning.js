function onLoad(){
    var ns = "http://www.w3.org/2000/svg";
    let rW = 0;
    let rH = 0;
    const paths = document.getElementsByTagNameNS(ns,"path");
    for(var i in paths){
        if(paths[i].getBBox){
            let b = paths[i].getBBox();
            let w = b.x + b.width;
            let h = b.y + b.height;
            rW = w > rW ? w: rW;
            rH = w > rH ? h: rH;
        }
    }
    const texts = document.getElementsByTagNameNS(ns,"text");
    for(var i in texts){
        if(texts[i].getBBox){
            let b = texts[i].getBBox();
            let w = b.x + b.width;
            let h = b.y + b.height;
            rW = w > rW ? w: rW;
            rH = w > rH ? h: rH;
        }
    }
    rW += 30;
    rH += 30;
    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    let scale = scaleToBounds(rW, rH, w, h);
    const g = document.getElementsByTagName("g");
    g[0].setAttribute('transform', "scale(" + scale + ")");
}

function scaleToBounds(w, h, fW, fH){
    let wS = 0, hS = 0;
    if (w !== 0){
        wS = fW / w;
    }    
    if (h !== 0){
        hS = fH / h;                
    }
    return Math.min(wS, hS);
} 