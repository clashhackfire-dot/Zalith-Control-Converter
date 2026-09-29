(()=>{"use strict";
const $=id=>document.getElementById(id), file=$("file"), upload=$("upload"), out=$("out"), name=$("name"), status=$("status"), details=$("details"), warnings=$("warnings"), convert=$("convert"), download=$("download"), preview=$("preview"), screen=$("screen");
let source=null,result=null,base="layout";
upload.onclick=()=>file.click();
file.onchange=()=>{if(file.files[0])load(file.files[0])};
function setStatus(c,t,d){status.className=c;status.textContent=t;details.textContent=d||""}
function load(f){source=f;base=f.name.replace(/\.json$/i,"")||"layout";name.textContent=f.name;out.hidden=false;convert.hidden=true;download.hidden=true;preview.hidden=true;warnings.innerHTML="";
f.text().then(t=>{let d;try{d=JSON.parse(t)}catch(e){setStatus("err","❌ Invalid layout file.","The file is not valid JSON.");return}
if(isNew(d)){result=d;setStatus("ok","✓ This layout is already compatible with Zalith Launcher 2.",count(d)+" controls");showPreview(d);download.hidden=false;return}
if(!isOld(d)){setStatus("err","❌ Unsupported layout format.","The file is not a supported Zalith Launcher 1 / PojavLauncher layout.");return}
setStatus("warn","Detected: Zalith Launcher 1 / PojavLauncher","Press Convert to transform it.");convert.hidden=false;
convert.onclick=()=>{try{const converted=convertOld(d);result=converted.data;setStatus("ok","✓ Conversion successful",converted.count+" controls converted");warnings.innerHTML="";for(const w of converted.warnings){const x=document.createElement("div");x.className="warning";x.textContent="⚠ "+w;warnings.appendChild(x)}showPreview(result);download.hidden=false;convert.hidden=true}catch(e){setStatus("err","❌ Conversion failed.",e.message)}}
}).catch(()=>setStatus("err","❌ Invalid layout file.","The file could not be read."))}
function isNew(d){return d&&d.editorVersion===12&&d.info&&Array.isArray(d.layers)&&Array.isArray(d.styles)}
function isOld(d){return d&&Array.isArray(d.mControlDataList)}
function count(d){return(d.layers||[]).reduce((n,l)=>n+(l.normalButtons?.length||0)+(l.textBoxes?.length||0)+(l.joystickButtons?.length||0),0)}
const K={32:"GLFW_KEY_SPACE",44:"GLFW_KEY_COMMA",45:"GLFW_KEY_MINUS",46:"GLFW_KEY_PERIOD",61:"GLFW_KEY_EQUAL",65:"GLFW_KEY_A",66:"GLFW_KEY_B",67:"GLFW_KEY_C",68:"GLFW_KEY_D",69:"GLFW_KEY_E",70:"GLFW_KEY_F",71:"GLFW_KEY_G",72:"GLFW_KEY_H",73:"GLFW_KEY_I",74:"GLFW_KEY_J",75:"GLFW_KEY_K",76:"GLFW_KEY_L",77:"GLFW_KEY_M",78:"GLFW_KEY_N",79:"GLFW_KEY_O",80:"GLFW_KEY_P",81:"GLFW_KEY_Q",82:"GLFW_KEY_R",83:"GLFW_KEY_S",84:"GLFW_KEY_T",85:"GLFW_KEY_U",86:"GLFW_KEY_V",87:"GLFW_KEY_W",88:"GLFW_KEY_X",89:"GLFW_KEY_Y",90:"GLFW_KEY_Z",256:"GLFW_KEY_ESCAPE",257:"GLFW_KEY_ENTER",258:"GLFW_KEY_TAB",259:"GLFW_KEY_BACKSPACE",260:"GLFW_KEY_INSERT",261:"GLFW_KEY_DELETE",262:"GLFW_KEY_RIGHT",263:"GLFW_KEY_LEFT",264:"GLFW_KEY_DOWN",265:"GLFW_KEY_UP",290:"GLFW_KEY_F1",291:"GLFW_KEY_F2",292:"GLFW_KEY_F3",293:"GLFW_KEY_F4",294:"GLFW_KEY_F5",295:"GLFW_KEY_F6",296:"GLFW_KEY_F7",297:"GLFW_KEY_F8",298:"GLFW_KEY_F9",299:"GLFW_KEY_F10",300:"GLFW_KEY_F11",301:"GLFW_KEY_F12",266:"GLFW_KEY_PAGE_UP",267:"GLFW_KEY_PAGE_DOWN",340:"GLFW_KEY_LEFT_SHIFT",341:"GLFW_KEY_LEFT_CONTROL",342:"GLFW_KEY_LEFT_ALT",344:"GLFW_KEY_RIGHT_SHIFT",345:"GLFW_KEY_RIGHT_CONTROL",346:"GLFW_KEY_RIGHT_ALT"};
const SPECIAL={"-1":{type:"launcher_event",key:"launcher.event.switch_ime"},"-2":{type:"launcher_event",key:"launcher.event.switch_menu"},"-3":{type:"launcher_event",key:"GLFW_MOUSE_BUTTON_LEFT"},"-4":{type:"launcher_event",key:"GLFW_MOUSE_BUTTON_RIGHT"},"-5":null,"-6":{type:"launcher_event",key:"GLFW_MOUSE_BUTTON_MIDDLE"},"-7":{type:"launcher_event",key:"launcher.event.scroll_up"},"-8":{type:"launcher_event",key:"launcher.event.scroll_down"},"-9":{type:"launcher_event",key:"launcher.event.switch_menu"}};
function uid(){return crypto.randomUUID?crypto.randomUUID().replaceAll("-",""):Math.random().toString(36).slice(2)+Date.now()}
function tr(v){return{default:v==null||v==="null"?"":String(v),matchQueue:[]}}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function evalExpr(s,b){
 if(typeof s==="number")return s;
 if(typeof s!=="string"||!s.trim())return NaN;
 const W=10000,H=10000,width=Number(b.width)||50,height=Number(b.height)||50,margin=0,scale=1;
 let e=s.replace(/\$\{screen_width\}/g,String(W)).replace(/\$\{screen_height\}/g,String(H)).replace(/\$\{width\}/g,String(width)).replace(/\$\{height\}/g,String(height)).replace(/\$\{margin\}/g,String(margin)).replace(/\$\{preferred_scale\}/g,String(scale)).replace(/\$\{right\}/g,String(W-width)).replace(/\$\{bottom\}/g,String(H-height)).replace(/\$\{top\}/g,"0").replace(/\$\{left\}/g,"0");
 e=e.replace(/px\(([-+]?(?:\d+(?:\.\d*)?|\.\d+))\)/g,"($1)");
 if(!/^[0-9eE+\-*/().\s]+$/.test(e))return NaN;
 try{return Function('"use strict";return('+e+')')()}catch(_){return NaN}
}
function position(b,w){
 const x=evalExpr(b.dynamicX,b),y=evalExpr(b.dynamicY,b);
 if(!Number.isFinite(x)||!Number.isFinite(y))w.push("A control has an unsupported dynamic position expression; its position was estimated.");
 return{x:Math.round(clamp(Number.isFinite(x)?x:5000,0,10000)),y:Math.round(clamp(Number.isFinite(y)?y:5000,0,10000))}
}
function events(b,w){
 const a=[];
 for(const raw of b.keycodes||[]){const n=Number(raw);if(!n)continue;
  if(K[n])a.push({type:"key",key:K[n]});
  else if(n<0&&SPECIAL[String(n)])a.push(SPECIAL[String(n)]);
  else if(n===-5)w.push("The legacy virtual-mouse control has no direct Zalith 2 click-event equivalent.");
  else if(n<0)w.push("A legacy special keycode "+n+" could not be mapped.");
  else w.push("A control uses unknown GLFW keycode "+n+".")
 }
 return a
}
function styleFor(b,sid){
 const alpha=Number.isFinite(Number(b.opacity))?clamp(Number(b.opacity),0,1):1;
 const bg=Number.isFinite(Number(b.bgColor))?Number(b.bgColor)>>>0:0x4d000000;
 const stroke=Number.isFinite(Number(b.strokeColor))?Number(b.strokeColor)>>>0:0xffffffff;
 const sw=Number.isFinite(Number(b.strokeWidth))?Math.max(0,Number(b.strokeWidth)):0;
 const radius=Number.isFinite(Number(b.cornerRadius))?Math.max(0,Number(b.cornerRadius)):0;
 const r={topStart:radius,topEnd:radius,bottomEnd:radius,bottomStart:radius};
 return{name:"Converted "+sid.slice(0,8),uuid:sid,animateSwap:false,commonStyle:true,lightStyle:{alpha,pressedAlpha:Math.min(1,alpha+0.1),backgroundColor:bg,pressedBackgroundColor:bg,contentColor:0xffffffff,pressedContentColor:0xffffffff,borderWidth:sw,pressedBorderWidth:sw,borderColor:stroke,pressedBorderColor:stroke,borderRadius:r,pressedBorderRadius:r},darkStyle:null}
}
function buttonSize(b){const wd=Math.max(5,Number(b.width)||50),hd=Math.max(5,Number(b.height)||50);return{type:"dp",widthDp:wd,heightDp:hd,widthPercentage:Math.max(100,Math.min(10000,Math.round(wd/1000*10000))),heightPercentage:Math.max(100,Math.min(10000,Math.round(hd/1000*10000))),widthReference:"screen_height",heightReference:"screen_height"}}
function visibility(b){return b.displayInGame&&b.displayInMenu?"always":b.displayInGame?"in_game":"in_menu"}
function convertOld(d){
 const w=[],styles=[],normal=[],joysticks=[];
 for(const b of d.mControlDataList||[]){
  const sid=uid(),ev=events(b,w);styles.push(styleFor(b,sid));
  normal.push({text:tr(b.name),uuid:uid(),position:position(b,w),buttonSize:buttonSize(b),buttonStyle:sid,visibilityType:visibility(b),clickEvents:ev,isSwipple:!!b.isSwipeable,isPenetrable:!!b.passThruEnabled,isToggleable:!!b.isToggle})
 }
 const joystickStyleId=uid();
 const joysticksource=d.mJoystickDataList?.[0]||{};
 const joystickAlpha=Math.max(0,Math.min(1,Number(joysticksource.opacity)||1));
 styles.push({name:"Converted Joystick",uuid:joystickStyleId,commonStyle:true,lightStyle:{alpha:joystickAlpha,backgroundColor:1291845633,joystickColor:2147483775,joystickCanLockColor:2164195583,joystickLockedColor:2164195327,lockMarkColor:4294967295,borderWidthRatio:0,borderColor:4294967295,backgroundShape:50,joystickShape:50,joystickSize:0.5},darkStyle:{alpha:joystickAlpha,backgroundColor:1291845633,joystickColor:2147483775,joystickCanLockColor:2164195583,joystickLockedColor:2164195327,lockMarkColor:4294967295,borderWidthRatio:0,borderColor:4294967295,backgroundShape:50,joystickShape:50,joystickSize:0.5}});
 for(const j of d.mJoystickDataList||[]){
  const size=Math.max(20,Number(j.width)||Number(j.height)||200);
  joysticks.push({uuid:uid(),position:position(j,w),sizeType:"dp",sizeDp:size,sizePercentage:Math.max(2000,Math.min(10000,Math.round(size/1000*10000))),visibilityType:visibility(j),joystickStyleId,deadZoneRatio:0.5,lockThreshold:0.3,canLock:!!j.forwardLock,triggerMode:"DRAG",directionEvents:{North:[{type:"key",key:"GLFW_KEY_W"}],NorthEast:[{type:"key",key:"GLFW_KEY_W"},{type:"key",key:"GLFW_KEY_D"}],NorthWest:[{type:"key",key:"GLFW_KEY_W"},{type:"key",key:"GLFW_KEY_A"}],South:[{type:"key",key:"GLFW_KEY_S"}],SouthEast:[{type:"key",key:"GLFW_KEY_S"},{type:"key",key:"GLFW_KEY_D"}],SouthWest:[{type:"key",key:"GLFW_KEY_S"},{type:"key",key:"GLFW_KEY_A"}],East:[{type:"key",key:"GLFW_KEY_D"}],West:[{type:"key",key:"GLFW_KEY_A"}]},lockEvents:[{type:"key",key:"GLFW_KEY_LEFT_CONTROL"}]});
 }
 if((d.mDrawerDataList||[]).length)w.push("Legacy control drawers are not directly supported by Zalith 2 and were not converted.");
 const i=d.mControlInfoDataList||{},r={info:{name:tr(i.name&&i.name!=="null"?i.name:base),author:tr(i.author&&i.author!=="null"?i.author:""),description:tr(i.desc&&i.desc!=="null"?i.desc:""),versionCode:0,versionName:String(i.version&&i.version!=="null"?i.version:"1.0")},layers:[{name:"converted",uuid:uid(),hide:false,hideWhenMouse:true,hideWhenGamepad:true,visibilityType:"always",normalButtons:normal,textBoxes:[],joystickButtons:joysticks}],styles,joystickStyles:[],editorVersion:12};
 return{data:r,count:normal.length+joysticks.length,warnings:w}
}
function showPreview(d){screen.innerHTML="";for(const l of d.layers||[])for(const b of(l.normalButtons||[]).slice(0,80)){const e=document.createElement("div");e.className="control";e.textContent=b.text?.default||"";e.style.left=(b.position.x/100)+"%";e.style.top=(b.position.y/100)+"%";e.style.width=Math.max(2,(b.buttonSize?.widthPercentage||500)/100)+"%";e.style.height=Math.max(2,(b.buttonSize?.heightPercentage||500)/100)+"%";screen.appendChild(e)}preview.hidden=false}
download.onclick=()=>{if(!result)return;const blob=new Blob([JSON.stringify(result,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=base+"-zalith2.json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u)}
})();