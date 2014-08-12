Polymer("core-xhr",{request:function(options){var xhr=new XMLHttpRequest;var url=options.url;var method=options.method||"GET";var async=!options.sync;var params=this.toQueryString(options.params);if(params&&method=="GET"){url+=(url.indexOf("?")>0?"&":"?")+params}var xhrParams=this.isBodyMethod(method)?options.body||params:null;xhr.open(method,url,async);if(options.responseType){xhr.responseType=options.responseType}if(options.withCredentials){xhr.withCredentials=true}this.makeReadyStateHandler(xhr,options.callback);this.setRequestHeaders(xhr,options.headers);xhr.send(xhrParams);if(!async){xhr.onreadystatechange(xhr)}return xhr},toQueryString:function(params){var r=[];for(var n in params){var v=params[n];n=encodeURIComponent(n);r.push(v==null?n:n+"="+encodeURIComponent(v))}return r.join("&")},isBodyMethod:function(method){return this.bodyMethods[(method||"").toUpperCase()]},bodyMethods:{POST:1,PUT:1,DELETE:1},makeReadyStateHandler:function(xhr,callback){xhr.onreadystatechange=function(){if(xhr.readyState==4){callback&&callback.call(null,xhr.response,xhr)}}},setRequestHeaders:function(xhr,headers){if(headers){for(var name in headers){xhr.setRequestHeader(name,headers[name])}}}});Polymer("core-ajax",{url:"",handleAs:"",auto:false,params:"",response:null,method:"",headers:null,body:null,contentType:"application/x-www-form-urlencoded",withCredentials:false,xhrArgs:null,ready:function(){this.xhr=document.createElement("core-xhr")},receive:function(response,xhr){if(this.isSuccess(xhr)){this.processResponse(xhr)}else{this.error(xhr)}this.complete(xhr)},isSuccess:function(xhr){var status=xhr.status||0;return!status||status>=200&&status<300},processResponse:function(xhr){var response=this.evalResponse(xhr);this.response=response;this.fire("core-response",{response:response,xhr:xhr})},error:function(xhr){var response=xhr.status+": "+xhr.responseText;this.fire("core-error",{response:response,xhr:xhr})},complete:function(xhr){this.fire("core-complete",{response:xhr.status,xhr:xhr})},evalResponse:function(xhr){return this[(this.handleAs||"text")+"Handler"](xhr)},xmlHandler:function(xhr){return xhr.responseXML},textHandler:function(xhr){return xhr.responseText},jsonHandler:function(xhr){var r=xhr.responseText;try{return JSON.parse(r)}catch(x){console.warn("core-ajax caught an exception trying to parse reponse as JSON:");console.warn("url:",this.url);console.warn(x);return r}},documentHandler:function(xhr){return xhr.response},blobHandler:function(xhr){return xhr.response},arraybufferHandler:function(xhr){return xhr.response},urlChanged:function(){if(!this.handleAs){var ext=String(this.url).split(".").pop();switch(ext){case"json":this.handleAs="json";break}}this.autoGo()},paramsChanged:function(){this.autoGo()},autoChanged:function(){this.autoGo()},autoGo:function(){if(this.auto){this.goJob=this.job(this.goJob,this.go,0)}},go:function(){var args=this.xhrArgs||{};args.body=this.body||args.body;args.params=this.params||args.params;if(args.params&&typeof args.params=="string"){args.params=JSON.parse(args.params)}args.headers=this.headers||args.headers||{};if(args.headers&&typeof args.headers=="string"){args.headers=JSON.parse(args.headers)}if(this.contentType){args.headers["content-type"]=this.contentType}if(this.handleAs==="arraybuffer"||this.handleAs==="blob"||this.handleAs==="document"){args.responseType=this.handleAs}args.withCredentials=this.withCredentials;args.callback=this.receive.bind(this);args.url=this.url;args.method=this.method;return args.url&&this.xhr.request(args)}});Polymer("core-selection",{multi:false,ready:function(){this.clear()},clear:function(){this.selection=[]},getSelection:function(){return this.multi?this.selection:this.selection[0]},isSelected:function(item){return this.selection.indexOf(item)>=0},setItemSelected:function(item,isSelected){if(item!==undefined&&item!==null){if(isSelected){this.selection.push(item)}else{var i=this.selection.indexOf(item);if(i>=0){this.selection.splice(i,1)}}this.fire("core-select",{isSelected:isSelected,item:item})}},select:function(item){if(this.multi){this.toggle(item)}else if(this.getSelection()!==item){this.setItemSelected(this.getSelection(),false);this.setItemSelected(item,true)}},toggle:function(item){this.setItemSelected(item,!this.isSelected(item))}});Polymer("core-selector",{selected:null,multi:false,valueattr:"name",selectedClass:"core-selected",selectedProperty:"",selectedAttribute:"active",selectedItem:null,selectedModel:null,selectedIndex:-1,target:null,itemsSelector:"",activateEvent:"tap",notap:false,ready:function(){this.activateListener=this.activateHandler.bind(this);this.observer=new MutationObserver(this.updateSelected.bind(this));if(!this.target){this.target=this}},get items(){if(!this.target){return[]}var nodes=this.target!==this?this.itemsSelector?this.target.querySelectorAll(this.itemsSelector):this.target.children:this.$.items.getDistributedNodes();return Array.prototype.filter.call(nodes||[],function(n){return n&&n.localName!=="template"})},targetChanged:function(old){if(old){this.removeListener(old);this.observer.disconnect();this.clearSelection()}if(this.target){this.addListener(this.target);this.observer.observe(this.target,{childList:true});this.updateSelected()}},addListener:function(node){Polymer.addEventListener(node,this.activateEvent,this.activateListener)},removeListener:function(node){Polymer.removeEventListener(node,this.activateEvent,this.activateListener)},get selection(){return this.$.selection.getSelection()},selectedChanged:function(){this.updateSelected()},updateSelected:function(){this.validateSelected();if(this.multi){this.clearSelection();this.selected&&this.selected.forEach(function(s){this.valueToSelection(s)},this)}else{this.valueToSelection(this.selected)}},validateSelected:function(){if(this.multi&&!Array.isArray(this.selected)&&this.selected!==null&&this.selected!==undefined){this.selected=[this.selected]}},clearSelection:function(){if(this.multi){this.selection.slice().forEach(function(s){this.$.selection.setItemSelected(s,false)},this)}else{this.$.selection.setItemSelected(this.selection,false)}this.selectedItem=null;this.$.selection.clear()},valueToSelection:function(value){var item=value===null||value===undefined?null:this.items[this.valueToIndex(value)];this.$.selection.select(item)},updateSelectedItem:function(){this.selectedItem=this.selection},selectedItemChanged:function(){if(this.selectedItem){var t=this.selectedItem.templateInstance;this.selectedModel=t?t.model:undefined}else{this.selectedModel=null}this.selectedIndex=this.selectedItem?parseInt(this.valueToIndex(this.selected)):-1},valueToIndex:function(value){for(var i=0,items=this.items,c;c=items[i];i++){if(this.valueForNode(c)==value){return i}}return value},valueForNode:function(node){return node[this.valueattr]||node.getAttribute(this.valueattr)},selectionSelect:function(e,detail){this.updateSelectedItem();if(detail.item){this.applySelection(detail.item,detail.isSelected)}},applySelection:function(item,isSelected){if(this.selectedClass){item.classList.toggle(this.selectedClass,isSelected)}if(this.selectedProperty){item[this.selectedProperty]=isSelected}if(this.selectedAttribute&&item.setAttribute){if(isSelected){item.setAttribute(this.selectedAttribute,"")}else{item.removeAttribute(this.selectedAttribute)}}},activateHandler:function(e){if(!this.notap){var i=this.findDistributedTarget(e.target,this.items);if(i>=0){var item=this.items[i];var s=this.valueForNode(item)||i;if(this.multi){if(this.selected){this.addRemoveSelected(s)}else{this.selected=[s]}}else{this.selected=s}this.asyncFire("core-activate",{item:item})}}},addRemoveSelected:function(value){var i=this.selected.indexOf(value);if(i>=0){this.selected.splice(i,1)}else{this.selected.push(value)}this.valueToSelection(value)},findDistributedTarget:function(target,nodes){while(target&&target!=this){var i=Array.prototype.indexOf.call(nodes,target);if(i>=0){return i}target=target.parentNode}}});(function(){window.CoreStyle=window.CoreStyle||{g:{},list:{},refMap:{}};Polymer("core-style",{publish:{ref:""},g:CoreStyle.g,refMap:CoreStyle.refMap,list:CoreStyle.list,ready:function(){if(this.id){this.provide()}else{this.registerRef(this.ref);if(!window.ShadowDOMPolyfill){this.require()}}},attached:function(){if(!this.id&&window.ShadowDOMPolyfill){this.require()}},provide:function(){this.register();if(this.textContent){this._completeProvide()}else{this.async(this._completeProvide)}},register:function(){var i=this.list[this.id];if(i){if(!Array.isArray(i)){this.list[this.id]=[i]}this.list[this.id].push(this)}else{this.list[this.id]=this}},_completeProvide:function(){this.createShadowRoot();this.domObserver=new MutationObserver(this.domModified.bind(this)).observe(this.shadowRoot,{subtree:true,characterData:true,childList:true});this.provideContent()},provideContent:function(){this.ensureTemplate();this.shadowRoot.textContent="";this.shadowRoot.appendChild(this.instanceTemplate(this.template));this.cssText=this.shadowRoot.textContent},ensureTemplate:function(){if(!this.template){this.template=this.querySelector("template:not([repeat]):not([bind])");if(!this.template){this.template=document.createElement("template");var n=this.firstChild;while(n){this.template.content.appendChild(n.cloneNode(true));n=n.nextSibling}}}},domModified:function(){this.cssText=this.shadowRoot.textContent;this.notify()},notify:function(){var s$=this.refMap[this.id];if(s$){for(var i=0,s;s=s$[i];i++){s.require()}}},registerRef:function(ref){this.refMap[this.ref]=this.refMap[this.ref]||[];this.refMap[this.ref].push(this)},applyRef:function(ref){this.ref=ref;this.registerRef(this.ref);this.require()},require:function(){var cssText=this.cssTextForRef(this.ref);if(cssText){this.ensureStyleElement();if(this.styleElement._cssText===cssText){return}this.styleElement._cssText=cssText;if(window.ShadowDOMPolyfill){this.styleElement.textContent=cssText;cssText=Platform.ShadowCSS.shimStyle(this.styleElement,this.getScopeSelector())}this.styleElement.textContent=cssText}},cssTextForRef:function(ref){var s$=this.byId(ref);var cssText="";if(s$){if(Array.isArray(s$)){var p=[];for(var i=0,l=s$.length,s;i<l&&(s=s$[i]);i++){p.push(s.cssText)}cssText=p.join("\n\n")}else{cssText=s$.cssText}}if(s$&&!cssText){console.warn("No styles provided for ref:",ref)}return cssText},byId:function(id){return this.list[id]},ensureStyleElement:function(){if(!this.styleElement){this.styleElement=window.ShadowDOMPolyfill?this.makeShimStyle():this.makeRootStyle()}if(!this.styleElement){console.warn(this.localName,"could not setup style.")}},makeRootStyle:function(){var style=document.createElement("style");this.appendChild(style);return style},makeShimStyle:function(){var host=this.findHost(this);if(host){var name=host.localName;var style=document.querySelector("style["+name+"="+this.ref+"]");if(!style){style=document.createElement("style");style.setAttribute(name,this.ref);document.head.appendChild(style)}return style}},getScopeSelector:function(){if(!this._scopeSelector){var selector="",host=this.findHost(this);if(host){var typeExtension=host.hasAttribute("is");var name=typeExtension?host.getAttribute("is"):host.localName;selector=Platform.ShadowCSS.makeScopeSelector(name,typeExtension)}this._scopeSelector=selector}return this._scopeSelector},findHost:function(node){while(node.parentNode){node=node.parentNode}return node.host||wrap(document.documentElement)},cycle:function(rgb,amount){if(rgb.match("#")){var o=this.hexToRgb(rgb);if(!o){return rgb}rgb="rgb("+o.r+","+o.b+","+o.g+")"}function cycleChannel(v){return Math.abs((Number(v)-amount)%255)}return rgb.replace(/rgb\(([^,]*),([^,]*),([^,]*)\)/,function(m,a,b,c){return"rgb("+cycleChannel(a)+","+cycleChannel(b)+", "+cycleChannel(c)+")"})},hexToRgb:function(hex){var result=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return result?{r:parseInt(result[1],16),g:parseInt(result[2],16),b:parseInt(result[3],16)}:null}})})();(function(){var SKIP_ID="meta";var metaData={},metaArray={};Polymer("core-meta",{type:"default",alwaysPrepare:true,ready:function(){this.register(this.id)},get metaArray(){var t=this.type;if(!metaArray[t]){metaArray[t]=[]}return metaArray[t]},get metaData(){var t=this.type;if(!metaData[t]){metaData[t]={}}return metaData[t]},register:function(id,old){if(id&&id!==SKIP_ID){this.unregister(this,old);this.metaData[id]=this;this.metaArray.push(this)}},unregister:function(meta,id){delete this.metaData[id||meta.id];var i=this.metaArray.indexOf(meta);if(i>=0){this.metaArray.splice(i,1)}},get list(){return this.metaArray},byId:function(id){return this.metaData[id]}})})();Polymer("core-transition",{type:"transition",go:function(node,state){this.complete(node)},setup:function(node){},teardown:function(node){},complete:function(node){this.fire("core-transitionend",null,node)},listenOnce:function(node,event,fn,args){var self=this;var listener=function(){fn.apply(self,args);node.removeEventListener(event,listener,false)};node.addEventListener(event,listener,false)}});(function(){var transitions=CoreStyle.g.transitions=CoreStyle.g.transitions||{};transitions.duration="500ms";transitions.heroDelay="50ms";transitions.scaleDelay="500ms";transitions.cascadeFadeDuration="250ms";Polymer("core-transition-pages",{publish:{scopeClass:"",activeClass:"",transitionProperty:""},completed:false,prepare:function(scope,options){this.boundCompleteFn=this.complete.bind(this,scope);if(this.scopeClass){scope.classList.add(this.scopeClass)}},go:function(scope,options){this.completed=false;if(this.activeClass){scope.classList.add(this.activeClass)}scope.addEventListener("transitionend",this.boundCompleteFn,false)},setup:function(scope){if(!scope._pageTransitionStyles){scope._pageTransitionStyles={}}var name=this.calcStyleName();if(!scope._pageTransitionStyles[name]){this.installStyleInScope(scope,name);scope._pageTransitionStyles[name]=true}},calcStyleName:function(){return this.id||this.localName},installStyleInScope:function(scope,id){if(!scope.shadowRoot){scope.createShadowRoot().innerHTML="<content></content>"}var root=scope.shadowRoot;var scopeStyle=document.createElement("core-style");root.insertBefore(scopeStyle,root.firstChild);scopeStyle.applyRef(id)},complete:function(scope,e){if(e.propertyName!=="box-shadow"&&(!this.transitionProperty||e.propertyName.indexOf(this.transitionProperty)!==-1)){this.completed=true;this.fire("core-transitionend",this,scope)}},ensureComplete:function(scope){scope.removeEventListener("transitionend",this.boundCompleteFn,false);if(this.scopeClass){scope.classList.remove(this.scopeClass)}if(this.activeClass){scope.classList.remove(this.activeClass)}}})})();(function(){var webkitStyles="-webkit-transition"in document.documentElement.style;var TRANSITION_CSSNAME=webkitStyles?"-webkit-transition":"transition";var TRANSFORM_CSSNAME=webkitStyles?"-webkit-transform":"transform";var TRANSITION_NAME=webkitStyles?"webkitTransition":"transition";var TRANSFORM_NAME=webkitStyles?"webkitTransform":"transform";var hasShadowDOMPolyfill=window.ShadowDOMPolyfill;Polymer("hero-transition",{go:function(scope,options){var props=["border-radius","width","height",TRANSFORM_CSSNAME];var duration=options&&options.duration||(CoreStyle.g.transitions.heroDuration||CoreStyle.g.transitions.duration);scope._heroes.forEach(function(h){var d=h.h0.hasAttribute("hero-delayed")?CoreStyle.g.transitions.heroDelay:"";var wt=[];props.forEach(function(p){wt.push(p+" "+duration+" "+options.easing+" "+d)});h.h1.style[TRANSITION_NAME]=wt.join(", ");h.h1.style.borderRadius=h.r1;h.h1.style[TRANSFORM_NAME]="none"});this.super(arguments);if(!scope._heroes.length){this.completed=true}},prepare:function(scope,options){this.super(arguments);var src=options.src,dst=options.dst;if(scope._heroes&&scope._heroes.length){this.ensureComplete(scope)}else{scope._heroes=[]}var ss="[hero]";var h$=this.findAllInShadows(src,ss);if(src.selectedItem){hs$=this.findAllInShadows(src.selectedItem,ss);hsa$=[];Array.prototype.forEach.call(hs$,function(hs){if(h$.indexOf(hs)===-1){hsa$.push(hs)}});h$=h$.concat(hsa$)}for(var i=0,h0;h0=h$[i];i++){var v=h0.getAttribute("hero-id");var ds='[hero][hero-id="'+v+'"]';var h1=this.findInShadows(dst,ds);if(!h1&&dst.selectedItem){h1=this.findInShadows(dst.selectedItem,ds)}if(v&&h1){var c0=getComputedStyle(h0);var c1=getComputedStyle(h1);var h={h0:h0,b0:h0.getBoundingClientRect(),r0:c0.borderRadius,h1:h1,b1:h1.getBoundingClientRect(),r1:c1.borderRadius};var dl=h.b0.left-h.b1.left;var dt=h.b0.top-h.b1.top;var sw=h.b0.width/h.b1.width;var sh=h.b0.height/h.b1.height;if(h.r0!==h.r1){h.h1.style.borderRadius=h.r0}h.h1.style[TRANSFORM_NAME]="translate("+dl+"px,"+dt+"px)"+" scale("+sw+","+sh+")";h.h1.style[TRANSFORM_NAME+"Origin"]="0 0";scope._heroes.push(h)}}},findInShadows:function(node,selector){return node.querySelector(selector)||(hasShadowDOMPolyfill?Platform.queryAllShadows(node,selector):node.querySelector("::shadow "+selector))},findAllInShadows:function(node,selector){if(hasShadowDOMPolyfill){var nodes=node.querySelectorAll(selector).array();var shadowNodes=Platform.queryAllShadows(node,selector,true);return nodes.concat(shadowNodes)}else{return node.querySelectorAll(selector).array().concat(node.shadowRoot?node.shadowRoot.querySelectorAll(selector).array():[])}},ensureComplete:function(scope){this.super(arguments);if(scope._heroes){scope._heroes.forEach(function(h){h.h1.style[TRANSITION_NAME]=null;h.h1.style[TRANSFORM_NAME]=null});scope._heroes=[]}},complete:function(scope,e){var done=false;scope._heroes.forEach(function(h){if(h.h1===e.path[0]){done=true}});if(done){this.super(arguments)}}})})();Polymer("core-animated-pages",{eventDelegates:{"core-transitionend":"transitionEnd"},transitions:"",selected:0,lastSelected:null,registerCallback:function(){this.tmeta=document.createElement("core-transition")},created:function(){this._transitions=[];this.transitioning=[]},transitionsChanged:function(){this._transitions=this.transitions.split(" ")},_transitionsChanged:function(old){if(this._transitionElements){this._transitionElements.forEach(function(t){t.teardown(this)},this)}this._transitionElements=[];this._transitions.forEach(function(transitionId){var t=this.getTransition(transitionId);if(t){this._transitionElements.push(t);t.setup(this)}},this)},getTransition:function(transitionId){return this.tmeta.byId(transitionId)},selectionSelect:function(e,detail){this.updateSelectedItem()},applyTransition:function(src,dst){if(this.animating){this.cancelAsync(this.animating);this.animating=null}Platform.flush();if(this.transitioning.indexOf(src)===-1){this.transitioning.push(src)}if(this.transitioning.indexOf(dst)===-1){this.transitioning.push(dst)}src.setAttribute("animate","");dst.setAttribute("animate","");var options={src:src,dst:dst,easing:"cubic-bezier(0.4, 0, 0.2, 1)"};this.fire("core-animated-pages-transition-prepare");this._transitionElements.forEach(function(transition){transition.prepare(this,options)},this);src.offsetTop;this.applySelection(dst,true);this.applySelection(src,false);this._transitionElements.forEach(function(transition){transition.go(this,options)},this);if(!this._transitionElements.length){this.complete()}else{this.animating=this.async(this.complete.bind(this),null,5e3)}},complete:function(){if(this.animating){this.cancelAsync(this.animating);this.animating=null}this.transitioning.forEach(function(t){t.removeAttribute("animate")});this.transitioning=[];this._transitionElements.forEach(function(transition){transition.ensureComplete(this)},this);this.fire("core-animated-pages-transition-end")},transitionEnd:function(e){if(this.transitioning.length){var completed=true;this._transitionElements.forEach(function(transition){if(!transition.completed){completed=false}});if(completed){this.job("transitionWatch",function(){this.complete()},100)}}},selectedChanged:function(old){this.lastSelected=old;this.super(arguments)},selectedItemChanged:function(oldItem){this.super(arguments);if(!oldItem){this.applySelection(this.selectedItem,true);return}if(this.hasAttribute("no-transition")||!this._transitionElements||!this._transitionElements.length){this.applySelection(oldItem,false);this.applySelection(this.selectedItem,true);return}if(oldItem&&this.selectedItem){var self=this;Platform.flush();Platform.endOfMicrotask(function(){self.applyTransition(oldItem,self.selectedItem)})}}});Polymer("core-toolbar");Polymer("core-iconset",{src:"",width:0,icons:"",iconSize:24,offsetX:0,offsetY:0,type:"iconset",created:function(){this.iconMap={};this.iconNames=[];this.themes={}},ready:function(){if(this.src&&this.ownerDocument!==document){this.src=this.resolvePath(this.src,this.ownerDocument.baseURI)}this.super();this.updateThemes()},iconsChanged:function(){var ox=this.offsetX;var oy=this.offsetY;this.icons&&this.icons.split(/\s+/g).forEach(function(name,i){this.iconNames.push(name);this.iconMap[name]={offsetX:ox,offsetY:oy};if(ox+this.iconSize<this.width){ox+=this.iconSize}else{ox=this.offsetX;oy+=this.iconSize}},this)},updateThemes:function(){var ts=this.querySelectorAll("property[theme]");ts&&ts.array().forEach(function(t){this.themes[t.getAttribute("theme")]={offsetX:parseInt(t.getAttribute("offsetX"))||0,offsetY:parseInt(t.getAttribute("offsetY"))||0}},this)},getOffset:function(icon,theme){var i=this.iconMap[icon];if(!i){var n=this.iconNames[Number(icon)];i=this.iconMap[n]}var t=this.themes[theme];if(i&&t){return{offsetX:i.offsetX+t.offsetX,offsetY:i.offsetY+t.offsetY}}return i},applyIcon:function(element,icon,scale){var offset=this.getOffset(icon);scale=scale||1;if(element&&offset){var icon=element._icon||document.createElement("div");var style=icon.style;style.backgroundImage="url("+this.src+")";style.backgroundPosition=-offset.offsetX*scale+"px"+" "+(-offset.offsetY*scale+"px");style.backgroundSize=scale===1?"auto":this.width*scale+"px";if(icon.parentNode!==element){element.appendChild(icon)}return icon}}});(function(){var meta;Polymer("core-icon",{src:"",icon:"",alt:null,observe:{icon:"updateIcon",alt:"updateAlt"},defaultIconset:"icons",ready:function(){if(!meta){meta=document.createElement("core-iconset")}if(this.hasAttribute("aria-label")){if(!this.hasAttribute("role")){this.setAttribute("role","img")}return}this.updateAlt()},srcChanged:function(){var icon=this._icon||document.createElement("div");icon.textContent="";icon.setAttribute("fit","");icon.style.backgroundImage="url("+this.src+")";icon.style.backgroundPosition="center";icon.style.backgroundSize="100%";if(!icon.parentNode){this.appendChild(icon)}this._icon=icon},getIconset:function(name){return meta.byId(name||this.defaultIconset)},updateIcon:function(oldVal,newVal){if(!this.icon){this.updateAlt();return}var parts=String(this.icon).split(":");var icon=parts.pop();if(icon){var set=this.getIconset(parts.pop());if(set){this._icon=set.applyIcon(this,icon);if(this._icon){this._icon.setAttribute("fit","")}}}if(oldVal){if(oldVal.split(":").pop()==this.getAttribute("aria-label")){this.updateAlt()}}},updateAlt:function(){if(this.getAttribute("aria-hidden")){return}if(this.alt===""){this.setAttribute("aria-hidden","true");if(this.hasAttribute("role")){this.removeAttribute("role")}if(this.hasAttribute("aria-label")){this.removeAttribute("aria-label")}}else{this.setAttribute("aria-label",this.alt||this.icon.split(":").pop());if(!this.hasAttribute("role")){this.setAttribute("role","img")}if(this.hasAttribute("aria-hidden")){this.removeAttribute("aria-hidden")}}}})})();Polymer("core-iconset-svg",{iconSize:24,type:"iconset",created:function(){this._icons={}},ready:function(){this.super();this.updateIcons()},iconById:function(id){return this._icons[id]||(this._icons[id]=this.querySelector("#"+id))},cloneIcon:function(id){var icon=this.iconById(id);if(icon){var content=icon.cloneNode(true);content.removeAttribute("id");var svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 "+this.iconSize+" "+this.iconSize);svg.style.pointerEvents="none";svg.appendChild(content);return svg}},get iconNames(){if(!this._iconNames){this._iconNames=this.findIconNames()}return this._iconNames},findIconNames:function(){var icons=this.querySelectorAll("[id]").array();if(icons.length){return icons.map(function(n){return n.id})}},applyIcon:function(element,icon){var root=element;var old=root.querySelector("svg");if(old){old.remove()}var svg=this.cloneIcon(icon);if(!svg){return}svg.setAttribute("height","100%");svg.setAttribute("width","100%");svg.setAttribute("preserveAspectRatio","xMidYMid meet");svg.style.display="block";root.insertBefore(svg,root.firstElementChild);return svg},updateIcons:function(selector,method){selector=selector||"[icon]";method=method||"updateIcon";var deep=window.ShadowDOMPolyfill?"":"html /deep/ ";var i$=document.querySelectorAll(deep+selector);for(var i=0,e;e=i$[i];i++){if(e[method]){e[method].call(e)}}}});Polymer("core-icon-button",{src:"",active:false,icon:"",activeChanged:function(){this.classList.toggle("selected",this.active)}});Polymer("paper-shadow",{publish:{target:{value:null,reflect:true},z:{value:1,reflect:true},animated:{value:false,reflect:true},hasPosition:{value:false}},registerCallback:function(polymerElement){var template=polymerElement.querySelector("template");this._style=template.content.querySelector("style");this._style.removeAttribute("no-shim")},fetchTemplate:function(){return null},attached:function(){this.installScopeStyle(this._style);if(!this.target){if(!this.parentElement&&this.parentNode.host){this.target=this.parentNode.host}else if(this.parentElement&&(window.ShadowDOMPolyfill?this.parentElement!==wrap(document.body):this.parentElement!==document.body)){this.target=this.parentElement}}},targetChanged:function(old){if(old){this.removeShadow(old)}if(this.target){this.addShadow(this.target)}},zChanged:function(old){if(this.target&&this.target._paperShadow){var shadow=this.target._paperShadow;["top","bottom"].forEach(function(s){shadow[s].classList.remove("paper-shadow-"+s+"-z-"+old);shadow[s].classList.add("paper-shadow-"+s+"-z-"+this.z)}.bind(this))}},animatedChanged:function(){if(this.target&&this.target._paperShadow){var shadow=this.target._paperShadow;["top","bottom"].forEach(function(s){if(this.animated){shadow[s].classList.add("paper-shadow-animated")}else{shadow[s].classList.remove("paper-shadow-animated")}}.bind(this))}},addShadow:function(node){if(node._paperShadow){return}var computed=getComputedStyle(node);if(!this.hasPosition&&computed.position==="static"){node.style.position="relative"}node.style.overflow="visible";["top","bottom"].forEach(function(s){var inner=node._paperShadow&&node._paperShadow[s]||document.createElement("div");inner.classList.add("paper-shadow");inner.classList.add("paper-shadow-"+s+"-z-"+this.z);if(this.animated){inner.classList.add("paper-shadow-animated")}if(node.shadowRoot){node.shadowRoot.insertBefore(inner,node.shadowRoot.firstChild)}else{node.insertBefore(inner,node.firstChild)}node._paperShadow=node._paperShadow||{};node._paperShadow[s]=inner}.bind(this))},removeShadow:function(node){if(!node._paperShadow){return}["top","bottom"].forEach(function(s){node._paperShadow[s].remove()});node._paperShadow=null;node.style.position=null}});Polymer("paper-focusable",{publish:{active:{value:false,reflect:true},focused:{value:false,reflect:true},pressed:{value:false,reflect:true},disabled:{value:false,reflect:true},isToggle:{value:false,reflect:false}},disabledChanged:function(){if(this.disabled){this.removeAttribute("tabindex")}else{this.setAttribute("tabindex",0)}},downAction:function(){this.pressed=true;this.focused=false;if(this.isToggle){this.active=!this.active}else{this.active=true}},contextMenuAction:function(e){this.upAction(e);this.focusAction()},upAction:function(){this.pressed=false;if(!this.isToggle){this.active=false}},focusAction:function(){if(!this.pressed){this.focused=true}},blurAction:function(){this.focused=false}});(function(){var waveMaxRadius=150;function waveRadiusFn(touchDownMs,touchUpMs,anim){var touchDown=touchDownMs/1e3;var touchUp=touchUpMs/1e3;var totalElapsed=touchDown+touchUp;var ww=anim.width,hh=anim.height;var waveRadius=Math.min(Math.sqrt(ww*ww+hh*hh),waveMaxRadius)*1.1+5;var duration=1.1-.2*(waveRadius/waveMaxRadius);var tt=totalElapsed/duration;var size=waveRadius*(1-Math.pow(80,-tt));return Math.abs(size)}function waveOpacityFn(td,tu,anim){var touchDown=td/1e3;var touchUp=tu/1e3;var totalElapsed=touchDown+touchUp;if(tu<=0){return anim.initialOpacity}return Math.max(0,anim.initialOpacity-touchUp*anim.opacityDecayVelocity)}function waveOuterOpacityFn(td,tu,anim){var touchDown=td/1e3;var touchUp=tu/1e3;var outerOpacity=touchDown*.3;var waveOpacity=waveOpacityFn(td,tu,anim);return Math.max(0,Math.min(outerOpacity,waveOpacity))}function waveDidFinish(wave,radius,anim){var waveOpacity=waveOpacityFn(wave.tDown,wave.tUp,anim);if(waveOpacity<.01&&radius>=Math.min(wave.maxRadius,waveMaxRadius)){return true}return false}function waveAtMaximum(wave,radius,anim){var waveOpacity=waveOpacityFn(wave.tDown,wave.tUp,anim);if(waveOpacity>=anim.initialOpacity&&radius>=Math.min(wave.maxRadius,waveMaxRadius)){return true}return false}function drawRipple(ctx,x,y,radius,innerColor,outerColor){if(outerColor){ctx.fillStyle=outerColor;ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)}ctx.beginPath();ctx.arc(x,y,radius,0,2*Math.PI,false);ctx.fillStyle=innerColor;ctx.fill()}function createWave(elem){var elementStyle=window.getComputedStyle(elem);var fgColor=elementStyle.color;var wave={waveColor:fgColor,maxRadius:0,isMouseDown:false,mouseDownStart:0,mouseUpStart:0,tDown:0,tUp:0};return wave}function removeWaveFromScope(scope,wave){if(scope.waves){var pos=scope.waves.indexOf(wave);scope.waves.splice(pos,1)}}var pow=Math.pow;var now=Date.now;if(window.performance&&performance.now){now=performance.now.bind(performance)}function cssColorWithAlpha(cssColor,alpha){var parts=cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);if(typeof alpha=="undefined"){alpha=1}if(!parts){return"rgba(255, 255, 255, "+alpha+")"}return"rgba("+parts[1]+", "+parts[2]+", "+parts[3]+", "+alpha+")"}function dist(p1,p2){return Math.sqrt(pow(p1.x-p2.x,2)+pow(p1.y-p2.y,2))}function distanceFromPointToFurthestCorner(point,size){var tl_d=dist(point,{x:0,y:0});var tr_d=dist(point,{x:size.w,y:0});var bl_d=dist(point,{x:0,y:size.h});var br_d=dist(point,{x:size.w,y:size.h});return Math.max(tl_d,tr_d,bl_d,br_d)}Polymer("paper-ripple",{initialOpacity:.25,opacityDecayVelocity:.8,backgroundFill:true,pixelDensity:2,eventDelegates:{down:"downAction",up:"upAction"},attached:function(){if(!this.$.canvas){var canvas=document.createElement("canvas");canvas.id="canvas";this.shadowRoot.appendChild(canvas);this.$.canvas=canvas}},ready:function(){this.waves=[]},setupCanvas:function(){this.$.canvas.setAttribute("width",this.$.canvas.clientWidth*this.pixelDensity+"px");this.$.canvas.setAttribute("height",this.$.canvas.clientHeight*this.pixelDensity+"px");var ctx=this.$.canvas.getContext("2d");ctx.scale(this.pixelDensity,this.pixelDensity);if(!this._loop){this._loop=this.animate.bind(this,ctx)}},downAction:function(e){this.setupCanvas();var wave=createWave(this.$.canvas);this.cancelled=false;wave.isMouseDown=true;wave.tDown=0;wave.tUp=0;wave.mouseUpStart=0;wave.mouseDownStart=now();var width=this.$.canvas.width/2;var height=this.$.canvas.height/2;var rect=this.getBoundingClientRect();var touchX=e.x-rect.left;var touchY=e.y-rect.top;wave.startPosition={x:touchX,y:touchY};if(this.classList.contains("recenteringTouch")){wave.endPosition={x:width/2,y:height/2};wave.slideDistance=dist(wave.startPosition,wave.endPosition)}wave.containerSize=Math.max(width,height);wave.maxRadius=distanceFromPointToFurthestCorner(wave.startPosition,{w:width,h:height});this.waves.push(wave);requestAnimationFrame(this._loop)},upAction:function(){for(var i=0;i<this.waves.length;i++){var wave=this.waves[i];if(wave.isMouseDown){wave.isMouseDown=false;wave.mouseUpStart=now();wave.mouseDownStart=0;wave.tUp=0;break}}this._loop&&requestAnimationFrame(this._loop)
},cancel:function(){this.cancelled=true},animate:function(ctx){var shouldRenderNextFrame=false;ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);var deleteTheseWaves=[];var longestTouchDownDuration=0;var longestTouchUpDuration=0;var lastWaveColor=null;var anim={initialOpacity:this.initialOpacity,opacityDecayVelocity:this.opacityDecayVelocity,height:ctx.canvas.height,width:ctx.canvas.width};for(var i=0;i<this.waves.length;i++){var wave=this.waves[i];if(wave.mouseDownStart>0){wave.tDown=now()-wave.mouseDownStart}if(wave.mouseUpStart>0){wave.tUp=now()-wave.mouseUpStart}var tUp=wave.tUp;var tDown=wave.tDown;longestTouchDownDuration=Math.max(longestTouchDownDuration,tDown);longestTouchUpDuration=Math.max(longestTouchUpDuration,tUp);var radius=waveRadiusFn(tDown,tUp,anim);var waveAlpha=waveOpacityFn(tDown,tUp,anim);var waveColor=cssColorWithAlpha(wave.waveColor,waveAlpha);lastWaveColor=wave.waveColor;var x=wave.startPosition.x;var y=wave.startPosition.y;if(wave.endPosition){var translateFraction=Math.min(1,radius/wave.containerSize*2/Math.sqrt(2));x+=translateFraction*(wave.endPosition.x-wave.startPosition.x);y+=translateFraction*(wave.endPosition.y-wave.startPosition.y)}var bgFillColor=null;if(this.backgroundFill){var bgFillAlpha=waveOuterOpacityFn(tDown,tUp,anim);bgFillColor=cssColorWithAlpha(wave.waveColor,bgFillAlpha)}drawRipple(ctx,x,y,radius,waveColor,bgFillColor);var maximumWave=waveAtMaximum(wave,radius,anim);var waveDissipated=waveDidFinish(wave,radius,anim);var shouldKeepWave=!waveDissipated||maximumWave;var shouldRenderWaveAgain=!waveDissipated&&!maximumWave;shouldRenderNextFrame=shouldRenderNextFrame||shouldRenderWaveAgain;if(!shouldKeepWave||this.cancelled){deleteTheseWaves.push(wave)}}if(shouldRenderNextFrame){requestAnimationFrame(this._loop)}for(var i=0;i<deleteTheseWaves.length;++i){var wave=deleteTheseWaves[i];removeWaveFromScope(this,wave)}if(!this.waves.length){ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);this._loop=null}}})})();Polymer("paper-button",{publish:{label:"",raisedButton:{value:false,reflect:true},iconSrc:"",icon:""},z:1,attached:function(){if(this.textContent&&!this.textContent.match(/\s+/)){console.warn('Using textContent to label the button is deprecated. Use the "label" property instead');this.label=this.textContent}},activeChanged:function(){this.super();if(this.active){if(!this.lastEvent){var rect=this.getBoundingClientRect();this.lastEvent={x:rect.left+rect.width/2,y:rect.top+rect.height/2}}this.$.ripple.downAction(this.lastEvent)}else{this.$.ripple.upAction()}this.adjustZ()},focusedChanged:function(){this.super();this.adjustZ()},disabledChanged:function(){this.super();this.adjustZ()},insideButton:function(x,y){var rect=this.getBoundingClientRect();return rect.left<=x&&x<=rect.right&&rect.top<=y&&y<=rect.bottom},adjustZ:function(){if(this.focused){this.classList.add("paper-shadow-animate-z-1-z-2")}else{this.classList.remove("paper-shadow-animate-z-1-z-2");if(this.active){this.z=2}else if(this.disabled){this.z=0}else{this.z=1}}},downAction:function(e){this.super(e);this.lastEvent=e},labelChanged:function(){this.setAttribute("aria-label",this.label)}});Polymer("paper-icon-button",{publish:{fill:{value:false,reflect:true}},ready:function(){this.$.ripple.classList.add("recenteringTouch");this.fillChanged()},fillChanged:function(){this.$.ripple.classList.toggle("circle",!this.fill)},iconChanged:function(oldIcon){if(!this.label){this.setAttribute("aria-label",this.icon)}}});Polymer("paper-fab",{publish:{raisedButton:{value:true,reflect:true}}});Polymer("github-readme",{user:"",repo:"",auto:false,ready:function(){},observe:{user:"setUrl",repo:"setUrl"},setUrl:function(){this.readmeUrl="https://api.github.com/repos/"+this.user+"/"+this.repo+"/readme"},go:function(){this.$.ajaxer.go()},ajaxResponseHandler:function(e){this.$.responseDiv.innerHTML=e.detail.response}});Polymer("vundle-doc",{user:"",repo:"",vimrcPath:".vimrc",ready:function(){this.$.ajaxer.go()},ajaxResponseHandler:function(e){this.responseBody=e.detail.response;var lines=this.responseBody.split("\n");var bundles=[];var inactiveBundles=[];for(i=0;i<lines.length;i++){if(matches=lines[i].match(/^\s*(bundle|plugin)\s+'(.*)'/i)){var b=this.parseBundle(matches[2]);b.active=true;bundles.push(b)}if(matches=lines[i].match(/^\s*"\s*bundle\s+'(.+\/.+)'/i)){var b=this.parseBundle(matches[1]);b.active=false;inactiveBundles.push(b)}}this.bundles={label:"Active Plugins",items:bundles};this.inactiveBundles={label:"Inactive Plugins",items:inactiveBundles}},parseBundle:function(bundle){var bundleObj;if(bundle.substr(0,6)=="git://"){bundleObj={label:bundle,type:"repo",icon:"cloud"}}else if(bundle.substr(0,7)=="file://"){bundleObj={label:bundle.substr(7),type:"file",icon:"folder"}}else{if(/^gmarik\/vundle$/i.test(bundle)){bundle="gmarik/vundle.vim"}bundleObj={label:bundle,type:"github",iconSrc:"GitHub-Mark-32px.png",iconSrcLight:"GitHub-Mark-Light-32px.png"};if(matches=bundle.match(/(.*)(\/+)(.*)/)){bundleObj.user=matches[1];bundleObj.repo=matches[3]}else{bundleObj.user="vim-scripts";bundleObj.repo=bundle}bundleObj.url="https://github.com/"+bundleObj.user+"/"+bundleObj.repo}return bundleObj},page:1,selectedBundle:null,transition:function(e){if(this.page===1&&e.target.templateInstance.model.bundle&&e.target.templateInstance.model.bundle.type=="github"){this.selectedBundle=e.target.templateInstance.model.bundle;this.page=0}else{this.page=1}},killEvent:function(e){e.stopPropagation()}});