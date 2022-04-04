"use strict";
class HTML{static setup(){const metaTags={"viewport":"width=device-width,initial-scale=1,maximum-scale=1.0,user-scalable=0","apple-mobile-web-app-capable":"yes"};for(const mt in metaTags){const meta=document.createElement("meta");meta.name=mt;meta.content=metaTags[mt];document.head.appendChild(meta)}document.body.style.margin=document.body.style.padding="0";document.body.innerHTML="<h1 id='play'style='font-family:monospace;position:fixed;z-index:0;transform:translate(-50%,-50%);top:50%;left:50%;transition:opacity .5s'>[Play]</h1>";window.addEventListener("click",()=>{Surface.ready=!0});Surface.ready=!0;let el;if(Surface.texture instanceof TextureWebGL&&Surface.texture.secondStepBlur){el=document.body.appendChild(Surface.texture.secondStepCanvas)}else{el=document.body.appendChild(Surface.texture.el)}el.style.width="100vw";el.style.height="100vh"}static fullScreen(el){el.requestFullscreen()}static exitFullscreen(){document.exitFullscreen()}static isFullscreen(){return !!document.fullscreenElement}}const IMAGE_LOAD_TIMEOUT=10;let _ImageLoadTimeoutCount=IMAGE_LOAD_TIMEOUT+1;class ImageHolder{static imageElements=[];static imageIndexes={};static holdURL(url){const i=document.createElement("img");const dict={img:i,width:1,height:1,complete:!1,glTex:null};if(Surface.texture instanceof TextureWebGL){const gl=Surface.texture.gl;const tex=gl.createTexture();if(tex)(dict.glTex=tex);else Log.w("WebGL texture didn't initialize properly (library-side).");i.onload=(()=>{gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,i);dict.width=i.width;dict.height=i.height;dict.complete=!0})}else{i.onload=(()=>{dict.width=i.width;dict.height=i.height;dict.complete=!0})}i.onerror=(e=>{Log.w(`Image '${url}`);dict.complete=!0});setTimeout(()=>{i.src=url},_ImageLoadTimeoutCount+=IMAGE_LOAD_TIMEOUT);return(this.imageIndexes[url]=this.imageElements.push(dict)-1)}static allLoaded(){for(let i=0;i<this.imageElements.length;i++){if(!this.imageElements[i].complete)return !1;}return !0}}class Surface{static desiredSize=-1;static ready=!1;static bgColor=[0,0,0];static frameRate=60;static frameLastMoment=window.performance.now();static frameCount=0;static texture=null;static width=0;static height=0;static setup(){this.texture=Texture.new(this.desiredSize,this.desiredSize,!0);const resizeFn=()=>{this.width=Math.ceil((window.innerWidth/window.innerHeight)*this.desiredSize);this.height=this.desiredSize;this.texture.resize(this.width,this.height)};window.addEventListener("resize",resizeFn);window.addEventListener("orientationchange",resizeFn);window.addEventListener("deviceorientation",resizeFn);resizeFn();this.texture.el.style.width="100vw";this.texture.el.style.height="100vh";HTML.setup()}static frameSetup(){this.texture.colorf(...this.bgColor,255);this.texture.background()}static frameEnd(){this.frameCount++}static calculateFramerate(){const currTime=window.performance.now();const deltaTime=currTime-this.frameLastMoment;if(deltaTime!=0)(this.frameRate=(this.frameRate+deltaTime)/2);this.frameLastMoment=currTime}static backgroundColor(color){this.bgColor=color}static viewport(x,y,w,h){if(this.texture instanceof TextureCanvas){this.texture.ctx.save();this.texture.ctx.beginPath();this.texture.ctx.rect(x,y,w,h);this.texture.ctx.clip()}}static resetViewport(){if(this.texture instanceof TextureCanvas){this.texture.ctx.restore()}}}class Control{static touch=("ontouchend" in document);static keyboard=!0;static mouseX=0;static mouseY=0;static currentTouches={};static cEvents={};static cEvent(name,fn){this.cEvents[name]=[fn,!1]}static onKeyDown(keys,eventName){if(!(eventName in this.cEvents))Log.w("Event",eventName,"doesn't exist.");window.addEventListener("keydown",e=>{if(keys.includes(e.key)&&!e.repeat){this.cEvents[eventName][0]();this.cEvents[eventName][1]=!0}});window.addEventListener("keyup",e=>{if(keys.includes(e.key))(this.cEvents[eventName][1]=!1);})}static isOngoing(cEv){return this.cEvents[cEv][1]}static touchArea(columns,rows,eventNames){window.addEventListener("touchstart",e=>{for(let ct=0;ct<e.changedTouches.length;ct++){const i=Math.floor(Math.round(e.changedTouches[ct].clientX)*columns/(window.innerWidth+1))+columns*Math.floor(Math.round(e.changedTouches[ct].clientY)*rows/(window.innerHeight+1));Control.currentTouches[e.changedTouches[ct].identifier]=i;try{Control.cEvents[eventNames[i]][1]=!0;Control.cEvents[eventNames[i]][0]()}catch(e){console.error("Event `"+eventNames[i]+"` doesn't exist.")}}});window.addEventListener("touchmove",e=>{for(let ct=0;ct<e.changedTouches.length;ct++){const i=Math.floor(Math.round(e.changedTouches[ct].clientX)*columns/(window.innerWidth+1))+columns*Math.floor(Math.round(e.changedTouches[ct].clientY)*rows/(window.innerHeight+1));if(i!=Control.currentTouches[e.changedTouches[ct].identifier]){Control.cEvents[eventNames[Control.currentTouches[e.changedTouches[ct].identifier]]][1]=!1;Control.currentTouches[e.changedTouches[ct].identifier]=i;Control.cEvents[eventNames[i]][1]=!0;Control.cEvents[eventNames[i]][0]()}}});window.addEventListener("touchend",e=>{for(let ct=0;ct<e.changedTouches.length;ct++){Control.cEvents[eventNames[Control.currentTouches[e.changedTouches[ct].identifier]]][1]=!1;delete Control.currentTouches[e.changedTouches[ct].identifier]}})}}window.addEventListener("mousemove",e=>{Control.mouseX=(e.clientX/window.innerWidth)*Surface.width;Control.mouseY=(e.clientY/window.innerHeight)*Surface.height});class Texture{el=null;width=null;height=null;translation=[0,0];currentColor=[0,0,0,0];static BLEND_NORMAL=0;static BLEND_ADD=1;static canGL(){return !1}static new(width,height,webGL=!1){return((this.canGL()&&webGL)?new TextureWebGL(width,height):new TextureCanvas(width,height))}onLoad(fn){}async load(){return this}constructor(width,height){this.el=document.createElement("canvas");this.el.width=width;this.el.height=height;this.width=width;this.height=height}translate(x,y){}resetTranslation(){}colorf(r,g,b,a){}background(){}resize(width,height){this.width=width;this.height=height;this.el.width=this.width;this.el.height=this.height}drawImage(sourceImg,pos,width,height,scale=1,flipped=!1){}rect(x,y,w,h){}}class TextureCanvas extends Texture{ctx=null;constructor(width,height,glContext=!1){super(width,height);if(!glContext){const context=this.el.getContext("2d");if(!context)return;this.ctx=context}}background(){this.ctx.fillRect(0,0,this.width,this.height)}translate(x,y){this.translation[0]+=x;this.translation[1]+=y}resetTranslation(){this.translation[0]=0;this.translation[1]=0}colorf(r,g,b,a){this.ctx.fillStyle="rgba("+[r,g,b,a/255]+")";this.ctx.strokeStyle="rgba("+[r,g,b,a/255]+")"}drawImage(sourceImg,pos,width,height,scale=1,flipped=!1){if(flipped){this.ctx.scale(-1,1);this.ctx.drawImage(sourceImg.el,Math.round(-pos.x+this.translation[0]),Math.round(pos.y+this.translation[1]),-width,height);this.ctx.scale(-1,1)}else{this.ctx.drawImage(sourceImg.el,Math.round(pos.x-this.translation[0]),Math.round(pos.y+this.translation[1]),width,height)}}rect(x,y,w,h){this.ctx.beginPath();this.ctx.rect(Math.round(x)+0.5,Math.round(y)+0.5,w-1,h-1);this.ctx.stroke()}getPixels(){return[...this.ctx.getImageData(0,0,this.el.width,this.el.height).data]}}class TextureWebGL extends TextureCanvas{gl=null;secondStepBlur=!1;secondStepCanvas=null;secondStepCtx=null;glParams=null;shader=null;constructor(width,height){super(width,height,!0);const gl=this.el.getContext("webgl2",{antialias:!1,alpha:!0});if(!gl)return;this.gl=gl;const shader=this.buildShader("attribute vec2 vPos;"+"uniform vec2 vOffs;"+"uniform vec2 screenScale;"+"varying vec2 tPos;"+"uniform vec2 tOffs;"+"void main() {"+"tPos = vPos.xy + tOffs;"+"gl_Position = vec4((vPos + vOffs) * screenScale - vec2(1.0, -1.0), 0.0, 1.0);"+"}","varying vec2 tPos;"+"uniform vec2 tSize;"+"uniform vec4 colorParam;"+"uniform sampler2D sTexture;"+"void main() {"+"if (colorParam.w < 0.0) {"+"vec4 t = texture2D(sTexture, (floor(tPos) + 0.5) / tSize) * vec4(colorParam.x, colorParam.y, colorParam.z, -colorParam.w);"+"if (t.w <= 0.0) discard;"+"gl_FragColor = t;"+"} else {"+"gl_FragColor = colorParam;"+"}"+"}");if(!shader)return;this.shader=shader;this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.gl.createBuffer());const vPos=this.gl.getAttribLocation(this.shader,"vPos");this.gl.enableVertexAttribArray(vPos);this.gl.vertexAttribPointer(vPos,2,this.gl.FLOAT,!1,0,0);this.gl.useProgram(this.shader);this.gl.disable(this.gl.DEPTH_TEST);this.gl.enable(this.gl.BLEND);this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);this.glParams={vOffs:(this.gl.getUniformLocation(this.shader,"vOffs")||-1),tSize:(this.gl.getUniformLocation(this.shader,"tSize")||-1),tOffs:(this.gl.getUniformLocation(this.shader,"tOffs")||-1),colorParam:(this.gl.getUniformLocation(this.shader,"colorParam")||-1)};this.translation=[0,0];this.secondStepBlur=!1;if("WebKitNamespace" in window){this.secondStepBlur=!0;this.secondStepCanvas=document.createElement("canvas");this.secondStepCanvas.width=this.width;this.secondStepCanvas.height=this.height;const nctx=this.secondStepCanvas.getContext("2d");if(!nctx)return;this.secondStepCtx=nctx}}buildShader(vertex,fragment){const program=this.gl.createProgram();if(!program)return;const vShader=this.gl.createShader(this.gl.VERTEX_SHADER);if(!vShader)return;this.gl.shaderSource(vShader,vertex);this.gl.compileShader(vShader);if(!this.gl.getShaderParameter(vShader,this.gl.COMPILE_STATUS))Log.w("Error compiling vertex shader:\n"+(this.gl.getShaderInfoLog(vShader)||"").replace(/ERROR:/g,"\nERROR:"));this.gl.attachShader(program,vShader);const fShader=this.gl.createShader(this.gl.FRAGMENT_SHADER);if(!fShader)return;this.gl.shaderSource(fShader,"#ifdef GL_ES\nprecision highp float;\n#endif"+fragment);this.gl.compileShader(fShader);if(!this.gl.getShaderParameter(fShader,this.gl.COMPILE_STATUS))Log.w("Error compiling fragment shader:\n"+(this.gl.getShaderInfoLog(fShader)||"").replace(/ERROR:/g,"\nERROR:"));this.gl.attachShader(program,fShader);this.gl.linkProgram(program);if(!this.gl.getProgramParameter(program,this.gl.LINK_STATUS)){Log.w("Error linking shader program:",this.gl.getProgramInfoLog(program)||"")}return program}background(){this.gl.clearColor(this.currentColor[0]/255,this.currentColor[1]/255,this.currentColor[2]/255,this.currentColor[3]/255);this.gl.clear(this.gl.COLOR_BUFFER_BIT)}translate(x,y){this.translation[0]+=x;this.translation[1]+=y;this.gl.uniform2fv(this.glParams.vOffs,this.translation)}resetTranslation(){this.translation[0]=0;this.translation[1]=0;this.gl.uniform2fv(this.glParams.vOffs,this.translation)}resize(width,height){super.resize(width,height);if(this.secondStepBlur){this.secondStepCanvas.width=this.width;this.secondStepCanvas.height=this.height}if(this.shader){this.gl.viewport(0,0,this.el.width,this.el.height);this.gl.uniform2fv(this.gl.getUniformLocation(this.shader,"screenScale"),[2/this.el.width,-2/this.el.height])}}point(x,y){this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([Math.floor(x+1),Math.floor(y)]),this.gl.DYNAMIC_DRAW);this.gl.uniform4fv(this.glParams.colorParam,this.currentColor);this.gl.drawArrays(this.gl.POINTS,0,1)}line(x1,y1,x2,y2){this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([Math.floor(x1),Math.floor(y1),Math.floor(x2+1),Math.floor(y2+1)]),this.gl.DYNAMIC_DRAW);this.gl.uniform4fv(this.glParams.colorParam,this.currentColor);this.gl.drawArrays(this.gl.LINES,0,2)}rect(x,y,w,h){x=Math.floor(x+1);y=Math.floor(y);w=Math.floor(w-1);h=Math.floor(h-1);this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([x,y,x+w-1,y,x,y,x,y+h+1,x+w,y,x+w,y+h,x,y+h,x+w,y+h]),this.gl.DYNAMIC_DRAW);this.gl.uniform4fv(this.glParams.colorParam,this.currentColor);this.gl.drawArrays(this.gl.LINES,0,8)}fillRect(x,y,w,h){this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([x,y,x+w,y,x,y+h,x+w,y+h]),this.gl.DYNAMIC_DRAW);this.gl.uniform4fv(this.glParams.colorParam,this.currentColor);this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4)}blend(t){this.gl.blendFuncSeparate(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA,this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA);switch(t){case 0:this.gl.blendEquation(this.gl.FUNC_ADD);break;case 1:this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE);break}}}class Img extends TextureCanvas{isLoaded=!1;onLoadFn=()=>{};onLoad(fn){if(this.isLoaded)fn(this);else(this.onLoadFn=fn);}async load(){return new Promise(resolve=>{this.onLoad(()=>{resolve(this)})})}}class ImgURL extends Img{constructor(url){super(-1,-1);const img=new Image();img.onload=(()=>{this.resize(img.width,img.height);this.el.getContext("2d").drawImage(img,0,0);this.isLoaded=!0;this.onLoadFn(this)});img.src=url}}class Rect{x=0;y=0;x2=0;y2=0;width=0;height=0;bottomRight=!1;constructor(x,y,width,height,bottomRight=!1){this.x=x;this.y=y;this.width=width;this.height=height;this.bottomRight=bottomRight;if(bottomRight)this.reload();}reload(){this.x2=this.x+this.width;this.y2=this.y+this.height}coordInside(ix,iy){return(ix>=this.x&&ix<=this.x2&&iy>=this.y&&iy<=this.y2)}intersects(rect){if(this.x>rect.x2||this.x2<rect.x||this.y>rect.y2||this.y2<rect.y)return !1;return !0}}class Vec2{x=0;y=0;constructor(x,y){this.x=x;this.y=y}rounded(){return new Vec2(Math.round(this.x),Math.round(this.y))}lerp(x,y,v){this.x=this.x*(1-v)+x*v;this.y=this.y*(1-v)+y*v}set(x,y){this.x=x;this.y=y}multiply(v){this.x*=v;this.y*=v}multiplyVec(v){this.x*=v.x;this.y*=v.y}multiplyRet(v){this.x*=v;this.y*=v;return this}multiplied(v){return new Vec2(this.x*v,this.y*v)}multiplied2(mx,my){return new Vec2(this.x*mx,this.y*my)}divided(v){this.x/=v;this.y/=v;return this}add2(ax,ay){this.x+=ax;this.y+=ay}addVec(v){this.x+=v.x;this.y+=v.y}addedVec(v){return new Vec2(this.x+v.x,this.y+v.y)}added2(ax,ay){return new Vec2(this.x+ax,this.y+ay)}normalize(){const d=Math.sqrt(this.x*this.x+this.y*this.y);if(d==0)return;this.x/=d;this.y/=d}normalized(){const d=Math.sqrt(this.x*this.x+this.y*this.y);if(d==0)return new Vec2(0,0);return new Vec2(this.x/d,this.y/d)}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}angle(){return Math.atan2(this.x,this.y)}toString(){return `(${this.x}, ${this.y}`}pointInRect(x1,y1,x2,y2,x,y){return(x>x1&&x<x2&&y>y1&&y<y2)}distSquared(v){return((this.x-v.x)**2+(this.y-v.y)**2)}dist(v){return Math.sqrt((this.x-v.x)**2+(this.y-v.y)**2)}cartesianDist(v){return(Math.abs(this.x-v.x)+Math.abs(this.y-v.y))}}class Sprite extends TextureCanvas{parent=null;pos=new Vec2(0,0);width=1;height=1;scale=1;flipped=!1;centered=!1;_layer=0;hbOffsets={top:0,bottom:0,left:0,right:0};showHb=!1;hb=[new Rect(0,0,0,0,!0)];constructor(src,x,y,width=1,height=1){super(width,height);this.pos.x=x;this.pos.y=y;this.width=width;this.height=height;this.loadSource(src)}async loadSource(src){src.onLoad(img=>{this.resize(img.width,img.height);this.ctx.drawImage(img.el,0,0,this.width,this.height)})}layer(l){this._layer=l}draw(){Surface.texture.drawImage(this,this.pos,this.width,this.height,1,this.flipped);if(this.showHb)this.drawHb();}getHb(id){if(this.flipped){this.hb[0].x=this.pos.x-(this.centered?this.width*0.5:0)+this.hbOffsets.right*this.scale;this.hb[0].y=this.pos.y-(this.centered?this.height*0.5:0)+this.hbOffsets.top*this.scale;this.hb[0].width=this.width*this.scale-(this.hbOffsets.right*this.scale+this.hbOffsets.left*this.scale);this.hb[0].height=this.height*this.scale-(this.hbOffsets.top*this.scale+this.hbOffsets.bottom*this.scale)}else{this.hb[0].x=this.pos.x-(this.centered?this.width*0.5:0)+this.hbOffsets.left*this.scale;this.hb[0].y=this.pos.y-(this.centered?this.height*0.5:0)+this.hbOffsets.top*this.scale;this.hb[0].width=this.width*this.scale-(this.hbOffsets.left*this.scale+this.hbOffsets.right*this.scale);this.hb[0].height=this.height*this.scale-(this.hbOffsets.top*this.scale+this.hbOffsets.bottom*this.scale)}this.hb[0].reload();return this.hb[id]}drawHb(){Surface.texture.colorf(255,0,0,100);for(let h=0;h<this.hb.length;h++){const hb=this.getHb(h);Surface.texture.rect(hb.x,hb.y,hb.width,hb.height)}}}class Camera{pos=new Vec2(0,0);_constrains=new Rect(-1e9,-1e9,2e9,2e9,!0);following=null;followSpeed=0;followSpeedVec=new Vec2(0,0);constrains(v){v.bottomRight=!0;v.reload();this._constrains=v}constrains(){return this._constrains}follow(el,interval,speedPos){if(!(el instanceof Sprite))Log.e("Can't follow given element.");if(!interval)Log.e("No interval supplied!");if(!speedPos)Log.e("No speed position supplied!");this.following=el;this.followSpeed=interval;this.followSpeedVec=speedPos}}class Scene{parent=null;objects=[];maxSortPerFrame=1;sortIdx=0;pos=new Vec2(0,0);width=-1;height=-1;physicsEnable=PhysicsBody.PHYSICS_HARD;physicsProperties={gravity:new Vec2(0,0.015),friction:new Vec2(0.9,0.997),groundFriction:new Vec2(0.9,0.997),bounce:0};constructor(parent){this.parent=parent}draw(){Surface.viewport(this.pos.x,this.pos.y,this.width,this.height);if(this.objects.length>1){if(this.maxSortPerFrame<0){this.objects.sort((a,b)=>(a._layer-b._layer))}else{for(let cso=0;cso<this.maxSortPerFrame;cso++){if(++this.sortIdx==this.objects.length-1)(this.sortIdx=0);if(this.objects[this.sortIdx]._layer>this.objects[(this.sortIdx+1)]._layer){const tmp=this.objects[this.sortIdx];this.objects[this.sortIdx]=this.objects[(this.sortIdx+1)];this.objects[(this.sortIdx+1)]=tmp}}}}for(let o=0;o<this.objects.length;o++)this.objects[o].draw();Surface.resetViewport()}doPhysics(){for(let o=0;o<this.objects.length;o++){if(this.objects[o] instanceof PhysicsActor){this.objects[o].physics()}}}physicsType(type){if(type=="top-down"){this.physicsProperties.gravity.set(0,0);this.physicsProperties.friction.set(0.95,0.95);this.physicsProperties.groundFriction=this.physicsProperties.friction}}nObj(obj){obj.parent=this;if(obj instanceof PhysicsActor){obj.properties=this.physicsProperties}return this.objects[(this.objects.push(obj)-1)]}rObj(obj){return this.rObjIdx(this.objects.indexOf(obj))}rObjIdx(idx){return this.objects.splice(idx,1)[0]}shiftObjects(x,y){for(let o=0;o<this.objects.length;o++){this.objects[o].pos.x+=x;this.objects[o].pos.y+=y}}}class EventHolder{}let width=-1;let height=-1;let frameCount=-1;class Glass{scene=null;initFn=()=>void 0;preFrameFn=()=>void 0;frameFn=()=>void 0;physicsFn=()=>void 0;constructor(desiredSize,backgroundColor){Surface.desiredSize=desiredSize;Surface.backgroundColor(backgroundColor);this.scene=new Scene(this);Surface.setup()}init(fn){this.initFn=fn;this._init()}_init(){if(!Surface.ready||!ImageHolder.allLoaded()){setTimeout(()=>{this._init.call(this)},10);return}const ph=document.getElementById("play");if(ph)(ph.style.opacity="0");this.initFn();const graphicsFn=()=>{for(let p=0;p<4;p++)this.doPhysics.call(this);this.doGraphics.call(this);window.requestAnimationFrame(graphicsFn)};window.requestAnimationFrame(graphicsFn)}preFrame(fn){this.preFrameFn=fn}frame(fn){this.frameFn=fn}physics(fn){this.physicsFn=fn}doGraphics(){this.scene.width=Surface.texture.width;this.scene.height=Surface.texture.height;Surface.frameSetup();Surface.calculateFramerate();width=Surface.texture.width;height=Surface.texture.height;frameCount=Surface.frameCount;this.preFrameFn();Surface.resetViewport();this.scene.draw();Surface.texture.resetTranslation();Surface.resetViewport();this.frameFn();Surface.frameEnd()}doPhysics(){this.scene.doPhysics();this.physicsFn()}}class ImgGen extends Img{texture=null;color=null;rs=0;constructor(width,height){super(width,height);this.rs=Math.random()*100;this.texture=Texture.new(width,height)}done(){if(this.texture)(this.img=this.texture.el);this.texture=undefined;return this}c(r,g=-1,b=-1,a=-1){if(g==-1)(this.color=[r,r,r,1]);else if(b==-1)(this.color=[r,r,r,g]);else if(a==-1)(this.color=[r,g,b,1]);else(this.color=[r,g,b,a]);;;this.texture.colorf(...this.color);return this}bg(){this.texture.background();return this}rect(x,y,w,h){this.texture.rect(x,y,w,h);return this}rpt(x,y,rs=0){return((Math.pow(x/11+3+rs,3)*Math.pow(y/7+7,3)*100+Math.sin(x*31.3+y*61.7)*(20+rs))%1)}static(){for(let x=0;x<(this.texture.width||0);x++){for(let y=0;y<(this.texture.height||0);y++){const v=this.rpt(x,y,this.rs)*255;this.c(v,v,v,1);this.rect(x,y,1,1)}}return this}lerpVal(a,b,i){const v=(1-Math.cos(Math.PI*(i%1)))/2;return(a*(1-v)+b*v)}noise(detail,threshold=0,size=16){threshold/=255;let d=0;for(let dt=1;dt<detail+1;dt++)(d+=1/dt);for(let x=0;x<(this.texture.width||0);x++){for(let y=0;y<(this.texture.height||0);y++){let v=0;for(let o=1;o<detail+1;o++){v+=this.lerpVal(this.lerpVal(this.rpt(Math.floor((x/size)*o)+o*o,Math.floor((y/size)*o),this.rs),this.rpt(Math.floor((x/size)*o)+o*o+1,Math.floor((y/size)*o),this.rs),(x/size)*o%1),this.lerpVal(this.rpt(Math.floor((x/size)*o)+o*o,Math.floor((y/size)*o)+1,this.rs),this.rpt(Math.floor((x/size)*o)+o*o+1,Math.floor((y/size)*o)+1,this.rs),(x/size)*o%1),(y/size)*o%1)/o}v/=d;if(threshold>=0&&v<threshold||threshold<0&&v>-threshold)continue;this.texture.colorf(this.color[0]*v,this.color[1]*v,this.color[2]*v,this.color[3]);this.rect(x,y,1,1)}}return this}}class Log{static p(...args){console.log(...args)}static e(...things){throw ("error: "+things.join(" ")+"\n"+(()=>{return("("+(new Error().stack||"").split("\n")[3].trim().split("/").reverse()[0])})())}static w(...things){console.warn(...things)}static classTree(c){const prt=[];if(c.name)prt.push(c.name);while(c.__proto__.name!=""){prt.unshift(c.__proto__.name);c=c.__proto__}console.log(prt.map((e,i)=>(((i==0)?"  ":"   ".repeat(i))+((i==0)?"":String.fromCharCode(9492)+String.fromCharCode(9588))+e)).join("\n"))}}class PhysicsBody extends Sprite{static PHYSICS_LOOP=1;static PHYSICS_HARD=2;static PHYSICS_SOFT=4;physicsEnable=0;constructor(src,x,y,width=1,height=1){super(src,x,y,width,height)}intersects(sprite,colliderNum=-1){const b1=this.getHb();const b2=sprite.getHb();return !1}}class PhysicsActor extends PhysicsBody{properties=null;speed=new Vec2(0,0);onGround=!1;physics(){this.pos.x+=this.speed.x=(this.speed.x+this.properties.gravity.x)*(this.onGround?this.properties.groundFriction.x:this.properties.friction.x);this.pos.y+=this.speed.y=(this.speed.y+this.properties.gravity.y)*(this.onGround?this.properties.groundFriction.y:this.properties.friction.y);this.onGround=!1;for(let o=0;o<this.parent.objects.length;o++){if(this.parent.objects[o] instanceof PhysicsBody){if(this.parent.objects[o]==this||this.parent.objects[o].pos.cartesianDist(this.pos)>(this.width+this.height+this.parent.objects[o].width+this.parent.objects[o].height)*(this.scale+this.parent.objects[o].scale))continue;for(let c=0;c<this.parent.objects[o].hb.length;c++)this.avoidCollision(this.parent.objects[o],c);}}}avoidCollision(spr,idx){const b1=this.getHb(0);const b2=spr.getHb(idx);if(!b1.intersects(b2))return;const tOffs=b1.y2-b2.y;const bOffs=b2.y2-b1.y;const lOffs=b2.x2-b1.x;const rOffs=b1.x2-b2.x;if(tOffs<rOffs&&tOffs<lOffs&&tOffs<bOffs){this.onGround=!0;this.pos.y-=tOffs;if(this.properties.bounce!=0){if(this.speed.y<0.1&&this.speed.y!=0){this.pos.y+=tOffs/2;this.speed.y=0}else{this.speed.y=Math.min(-this.speed.y*this.properties.bounce,0)}}else{this.speed.y=Math.min(this.speed.y,0)}}else if(bOffs<rOffs&&bOffs<lOffs){this.pos.y+=bOffs;if(this.properties.bounce!=0)(this.speed.y=Math.max(-this.speed.y*this.properties.bounce,0));else(this.speed.y=Math.max(this.speed.y,0));}else if(lOffs<=rOffs){this.pos.x+=lOffs;this.speed.x=-this.speed.x*this.properties.bounce}else{this.pos.x-=rOffs;this.speed.x=-this.speed.x*this.properties.bounce}}}class TileSet extends ImgURL{tileWidth=8;tileHeight=8;constructor(url,tileWidth=8,tileHeight=8){super(url);this.tileWidth=tileWidth;this.tileHeight=tileHeight}}class TileMap extends PhysicsBody{data=null;tileSet=null;hbLen=0;normalHb=[];static buildColorMap(colorMap){return Object.assign({},...colorMap.map(e=>{return{[e[0][0]|e[0][1]<<8|e[0][2]<<16|e[0][3]<<24]:e[1]}}))}static async fromImage(src,colorMap,tileSet){await src.load();const builtColorMap=this.buildColorMap(colorMap);return new TileMap(src.getPixels().map((e,i,a)=>((i%4==0)?e|a[(i+1)]<<8|a[(i+2)]<<16|a[(i+3)]<<24:-0.5)).filter(e=>(e!=-0.5)).map(e=>(builtColorMap[e]|0)),await tileSet.load(),src.width,src.height)}constructor(data,tileSet,width,height){super(new TextureCanvas(width*tileSet.tileWidth,height*tileSet.tileHeight),0,0,width*tileSet.tileWidth,height*tileSet.tileHeight);this.data=data;this.tileSet=tileSet;const cols=[];for(let i=0;i<data.length;i++){const x=i%width;const y=Math.floor(i/width);this.ctx.drawImage(tileSet.el,tileSet.tileWidth*data[i],0,tileSet.tileWidth,tileSet.tileHeight,x*tileSet.tileWidth,y*tileSet.tileHeight,tileSet.tileWidth,tileSet.tileHeight);if(data[i]!=0){if(cols.length!=0&&cols[(cols.length-1)][1]==y&&cols[(cols.length-1)][0]==x-cols[(cols.length-1)][2])cols[(cols.length-1)][2]++;else cols.push([x,y,1,1]);}}for(let c=1;c<cols.length;c++){if(cols[(c-1)][0]==cols[c][0]&&cols[(c-1)][2]==cols[c][2]){cols[c][3]+=cols[(c-1)][3];cols[c][1]=cols[(c-1)][1];cols.splice(c-1,1);c--}}this.hb=[];cols.map(e=>{this.normalHb.push(new Rect(...e,!0));this.hb.push(new Rect(1,1,1,1,!0))});console.log(this.normalHb);console.log(this.hb)}getHb(id){this.hb[id].x=this.normalHb[id].x*this.tileSet.tileWidth+this.pos.x;this.hb[id].y=this.normalHb[id].y*this.tileSet.tileHeight+this.pos.y;this.hb[id].width=this.normalHb[id].width*this.tileSet.tileWidth;this.hb[id].height=this.normalHb[id].height*this.tileSet.tileHeight;this.hb[id].reload();return this.hb[id]}}const g = new Glass(200, [100, 100, 100]);
// g.scene.physicsType("top-down")
// g.scene.physicsEnable = 0
const spr1 = g.scene.nObj(new PhysicsActor(new ImgURL("test.png"), 0, 0));
spr1.hbOffsets = {
    top: 3, bottom: 0,
    left: 3, right: 4
};
// const gen = g.scene.nObj(new ImgGen(100, 100).c(255, 0, 0, 255).done())
const tilemap = g.scene.nObj(await TileMap.fromImage(new ImgURL("map.png"), [
    [[148, 52, 115, 255], 4],
    [[197, 129, 123, 255], 2],
    [[123, 44, 123, 255], 3],
    [[230, 178, 74, 255], 1]
], new TileSet("floor.png")));
tilemap.pos.add2(-tilemap.width / 2, -tilemap.height / 2);
// console.log(tilemap.normalHb)
g.init(() => { });
Control.cEvent("left", () => { });
Control.cEvent("right", () => { });
Control.cEvent("up", () => { });
Control.cEvent("down", () => { });
Control.cEvent("jump", () => { spr1.speed.y = -1; });
Control.onKeyDown([" ", "w"], "jump");
Control.onKeyDown(["w"], "up");
Control.onKeyDown(["s"], "down");
Control.onKeyDown(["a"], "left");
Control.onKeyDown(["d"], "right");
Control.touchArea(3, 3, [
    " ", "up", " ",
    "left", "jump", "right",
    " ", "down", " "
]);
g.frame(() => {
    // for (let o = 0; o < g.scene.objects.length; o++) {
    // 	// if (g.scene.objects[o] != spr1)
    // 	g.scene.objects[o].pos.x -= spr1.pos.x
    // }
    Surface.texture.translate(spr1.pos.x - Surface.width / 2 + spr1.width / 2, -spr1.pos.y + Surface.height / 2 - spr1.height / 2);
    // spr.pos.x = (Math.sin(frameCount / 73) + 1) * 0.5 * (width - spr.width)
    // spr.pos.y = (Math.sin(frameCount / 41) + 1) * 0.5 * (height - spr.height)
    // Surface.texture.colorf(255, 0, 0, 255)
    // Surface.texture.rect(0, 0, 32, 32)
    spr1.speed.addVec(new Vec2(((Control.isOngoing("right") ? 1 : 0) - (Control.isOngoing("left") ? 1 : 0)), ((Control.isOngoing("down") ? 1 : 0) - (Control.isOngoing("up") ? 1 : 0))).multiplied(0.3)); // .multiplied(spr1.onGround ? 0.2 : 0.02)
    spr1.flipped = spr1.speed.x > 0;
    Surface.texture.colorf(255, 0, 0, 255);
    Surface.texture.rect(Control.mouseX - 4, Control.mouseY - 4, 8, 8);
});