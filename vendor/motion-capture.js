!function(t){function e(i){if(r[i])return r[i].exports;var o=r[i]={exports:{},id:i,loaded:!1};return t[i].call(o.exports,o,o.exports,e),o.loaded=!0,o.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){if("undefined"==typeof AFRAME)throw new Error("Component attempted to register before AFRAME was available.");r(1),r(2),r(3),r(4),r(5),r(6)},function(t,e){var r={axismove:{id:0,props:["id","axis"]},buttonchanged:{id:1,props:["id","state"]},buttondown:{id:2,props:["id","state"]},buttonup:{id:3,props:["id","state"]},touchstart:{id:4,props:["id","state"]},touchend:{id:5,props:["id","state"]}};AFRAME.registerComponent("motion-capture-recorder",{schema:{autoRecord:{default:!1},enabled:{default:!0},hand:{default:"right"},persistStroke:{default:!1},visibleStroke:{default:!0}},init:function(){this.drawing=!1,this.recordedEvents=[],this.recordedPoses=[],this.addEventListeners()},addEventListeners:function(){var t=this.el;this.recordEvent=this.recordEvent.bind(this),t.addEventListener("axismove",this.recordEvent),t.addEventListener("buttonchanged",this.onTriggerChanged.bind(this)),t.addEventListener("buttonchanged",this.recordEvent),t.addEventListener("buttonup",this.recordEvent),t.addEventListener("buttondown",this.recordEvent),t.addEventListener("touchstart",this.recordEvent),t.addEventListener("touchend",this.recordEvent)},recordEvent:function(t){var e;this.isRecording&&(e={},r[t.type].props.forEach(function(r){e[r]=t.detail[r]}),this.recordedEvents.push({name:t.type,detail:e,timestamp:this.lastTimestamp}))},onTriggerChanged:function(t){var e,r=this.data;if(r.enabled&&!r.autoRecord&&1===t.detail.id)return e=t.detail.state.value,e<=.1?void(this.isRecording&&this.stopRecording()):void(this.isRecording||this.startRecording())},getJSONData:function(){if(this.recordedPoses)return{poses:this.system.getStrokeJSON(this.recordedPoses),events:this.recordedEvents}},saveCapture:function(t){var e=JSON.stringify(this.getJSONData()),r=t?"application/octet-binary":"application/json",i=new Blob([e],{type:r}),o=URL.createObjectURL(i),n="motion-capture-"+document.title+"-"+Date.now()+".json",a=document.createElement("a");a.setAttribute("class","motion-capture-download"),a.href=o,a.setAttribute("download",n),a.innerHTML="downloading...",a.style.display="none",document.body.appendChild(a),setTimeout(function(){a.click(),document.body.removeChild(a)},1)},update:function(){var t=this.el,e=this.data;if(this.data.autoRecord)this.startRecording();else{if(t.components.camera)return;t.setAttribute("vive-controls",{hand:e.hand}),t.setAttribute("oculus-touch-controls",{hand:e.hand}),t.setAttribute("stroke",{hand:e.hand})}},tick:function(){var t=new THREE.Vector3,e=new THREE.Quaternion,r=new THREE.Vector3;return function(i,o){var n,a;this.lastTimestamp=i,this.data.enabled&&this.isRecording&&(n={position:this.el.getAttribute("position"),rotation:this.el.getAttribute("rotation"),timestamp:i},this.recordedPoses.push(n),this.data.visibleStroke&&(this.el.object3D.updateMatrixWorld(),this.el.object3D.matrixWorld.decompose(t,e,r),a=this.getPointerPosition(t,e),this.el.components.stroke.drawPoint(t,e,i,a)))}}(),getPointerPosition:function(){var t=new THREE.Vector3,e=new THREE.Vector3(0,.7,1);return function(r,i){var o=e.clone().applyQuaternion(i).normalize().multiplyScalar(-.03);return t.copy(r).add(o),t}}(),startRecording:function(){var t=this.el;this.isRecording||(t.components.stroke&&t.components.stroke.reset(),this.isRecording=!0,this.recordedPoses=[],this.recordedEvents=[],t.emit("strokestarted",{entity:t,poses:this.recordedPoses}))},stopRecording:function(){var t=this.el;this.isRecording&&(t.emit("strokeended",{poses:this.recordedPoses}),this.isRecording=!1,this.data.visibleStroke&&!this.data.persistStroke&&t.components.stroke.reset())}})},function(t,e){function r(t,e){t.setAttribute("position",e.position),t.setAttribute("rotation",e.rotation)}AFRAME.registerComponent("motion-capture-replayer",{schema:{enabled:{default:!0},recorderEl:{type:"selector"},loop:{default:!0},src:{default:""},spectatorCamera:{default:!1}},init:function(){this.currentPoseTime=0,this.currentEventTime=0,this.currentPoseIndex=0,this.currentEventIndex=0,this.onStrokeStarted=this.onStrokeStarted.bind(this),this.onStrokeEnded=this.onStrokeEnded.bind(this),this.discardedFrames=0,this.playingEvents=[],this.playingPoses=[]},update:function(t){var e=this.data;this.updateRecorder(e.recorderEl,t.recorderEl),t.src!==e.src&&e.src&&this.updateSrc(e.src)},updateRecorder:function(t,e){e&&e!==t&&(e.removeEventListener("strokestarted",this.onStrokeStarted),e.removeEventListener("strokeended",this.onStrokeEnded)),t&&e!==t&&(t.addEventListener("strokestarted",this.onStrokeStarted),t.addEventListener("strokeended",this.onStrokeEnded))},updateSrc:function(t){this.el.sceneEl.systems["motion-capture-recorder"].loadRecordingFromUrl(t,!1,this.startReplaying.bind(this))},onStrokeStarted:function(t){this.reset()},onStrokeEnded:function(t){this.startReplayingPoses(t.detail.poses)},play:function(){this.playingStroke&&this.playStroke(this.playingStroke)},startReplaying:function(t){this.ignoredFrames=0,this.storeInitialPose(),this.isReplaying=!0,this.startReplayingPoses(t.poses),this.startReplayingEvents(t.events)},stopReplaying:function(){this.isReplaying=!1,this.restoreInitialPose()},storeInitialPose:function(){var t=this.el;this.initialPose={position:t.getAttribute("position"),rotation:t.getAttribute("rotation")}},restoreInitialPose:function(){var t=this.el;this.initialPose&&(t.setAttribute("position",this.initialPose.position),t.setAttribute("rotation",this.initialPose.rotation))},startReplayingPoses:function(t){this.isReplaying=!0,this.currentPoseIndex=0,0!==t.length&&(this.playingPoses=t,this.currentPoseTime=t[0].timestamp)},startReplayingEvents:function(t){var e;this.isReplaying=!0,this.currentEventIndex=0,0!==t.length&&(e=t[0],this.playingEvents=t,this.currentEventTime=e.timestamp,this.el.emit(e.name,e))},reset:function(){this.playingPoses=null,this.currentTime=void 0,this.currentPoseIndex=void 0},playRecording:function(t){var e,i,o=this.playingPoses,n=this.playingEvents;for(e=o&&o[this.currentPoseIndex],i=n&&n[this.currentEventIndex],this.currentPoseTime+=t,this.currentEventTime+=t;e&&this.currentPoseTime>=e.timestamp||i&&this.currentPoseTime>=i.timestamp;)e&&this.currentPoseTime>=e.timestamp&&(this.currentPoseIndex===o.length&&this.data.loop&&(this.currentPoseIndex=0,this.currentPoseTime=o[0].timestamp),r(this.el,e),this.currentPoseIndex+=1,e=o[this.currentPoseIndex]),i&&this.currentPoseTime>=i.timestamp&&(this.currentEventIndex===n.length&&this.data.loop&&(this.currentEventIndex=0,this.currentEventTime=n[0].timestamp),this.el.emit(i.name,{id:i.detail.id}),this.currentEventIndex+=1,i=this.playingEvents[this.currentEventIndex])},tick:function(t,e){return 2===this.ignoredFrames||window.debug?void(this.isReplaying&&this.playRecording(e)):void this.ignoredFrames++}})},function(t,e){var r=AFRAME.utils.debug("aframe-motion-capture:avatar-recorder:info"),i=AFRAME.utils.debug("aframe-motion-capture:avatar-recorder:warn"),o="avatar-recording";AFRAME.registerComponent("avatar-recorder",{schema:{autoRecord:{default:!1},autoPlay:{default:!0},localStorage:{default:!0},loop:{default:!0},binaryFormat:{default:!1}},init:function(){function t(t){e.cameraEl=t,e.cameraEl.setAttribute("motion-capture-recorder",{autoRecord:!1,visibleStroke:!1})}var e=this,r=this.el;this.trackedControllerEls={},this.onKeyDown=this.onKeyDown.bind(this),this.tick=AFRAME.utils.throttle(this.throttledTick,100,this),r.camera&&r.camera.el?t(r.camera.el):r.addEventListener("camera-set-active",function(e){t(e.detail.cameraEl)})},replayRecording:function(){var t=this.data,e=this.el;t=JSON.parse(localStorage.getItem(o))||this.recordingData,t&&(r("Replaying recording."),e.setAttribute("avatar-replayer",{loop:t.loop}),e.components["avatar-replayer"].startReplaying(t))},stopReplaying:function(){var t=this.el.components["avatar-replayer"];t&&(r("Stopped replaying."),t.stopReplaying())},throttledTick:function(){var t=this,e=this.el.querySelectorAll("[tracked-controls]");e.forEach(function(e){return e.id?void(t.trackedControllerEls[e.id]||(e.setAttribute("motion-capture-recorder",{autoRecord:!1,visibleStroke:!1}),t.trackedControllerEls[e.id]=e,this.isRecording&&e.components["motion-capture-recorder"].startRecording())):void i("Found tracked controllers with no id. It will not be recorded")})},play:function(){var t=this;this.el;this.data.autoPlay&&setTimeout(function(){t.replayRecording()},500),window.addEventListener("keydown",this.onKeyDown)},pause:function(){window.removeEventListener("keydown",this.onKeyDown)},onKeyDown:function(t){var e=t.keyCode;if(32===e||80===e||67===e)switch(e){case 32:this.toggleRecording();break;case 80:this.toggleReplaying();break;case 67:r("Recording cleared from localStorage."),this.recordingData=null,localStorage.removeItem(o)}},toggleReplaying:function(){var t=this.el.components["avatar-replayer"];t||(this.el.setAttribute("avatar-replayer",""),t=this.el.components["avatar-replayer"]),t.isReplaying?this.stopReplaying():this.replayRecording()},toggleRecording:function(){this.isRecording?this.stopRecording():this.startRecording()},startRecording:function(){var t=this.trackedControllerEls,e=Object.keys(t);this.isRecording||(r("Starting recording!"),this.stopReplaying(),this.isRecording=!0,this.cameraEl.components["motion-capture-recorder"].startRecording(),e.forEach(function(e){t[e].components["motion-capture-recorder"].startRecording()}))},stopRecording:function(){var t=this.trackedControllerEls,e=Object.keys(t);this.isRecording&&(r("Stopped recording."),this.isRecording=!1,this.cameraEl.components["motion-capture-recorder"].stopRecording(),e.forEach(function(e){t[e].components["motion-capture-recorder"].stopRecording()}),this.saveRecording(),this.data.autoPlay&&this.replayRecording())},getJSONData:function(){var t={},e=this.trackedControllerEls,r=Object.keys(e);if(!this.isRecording)return this.isRecording=!1,t.camera=this.cameraEl.components["motion-capture-recorder"].getJSONData(),r.forEach(function(r){t[r]=e[r].components["motion-capture-recorder"].getJSONData()}),this.recordingData=t,t},saveRecording:function(){var t=this.getJSONData();this.data.localStorage?(r("Recording saved to localStorage."),this.saveToLocalStorage(t)):(r("Recording saved to file."),this.saveRecordingFile(t))},saveToLocalStorage:function(t){localStorage.setItem(o,JSON.stringify(t))},saveRecordingFile:function(t){var e=JSON.stringify(t),r=this.data.binaryFormat?"application/octet-binary":"application/json",i=new Blob([e],{type:r}),o=URL.createObjectURL(i),n="player-recording-"+document.title+"-"+Date.now()+".json",a=document.createElement("a");a.href=o,a.setAttribute("download",n),a.innerHTML="downloading...",a.style.display="none",document.body.appendChild(a),setTimeout(function(){a.click(),document.body.removeChild(a)},1)}})},function(t,e){var r=AFRAME.utils.debug("aframe-motion-capture:avatar-replayer:error"),i=AFRAME.utils.debug("aframe-motion-capture:avatar-replayer:info"),o=AFRAME.utils.debug("aframe-motion-capture:avatar-replayer:warn");AFRAME.registerComponent("avatar-replayer",{schema:{src:{default:""},loop:{default:!0},spectatorMode:{default:!1}},init:function(){var t=this.el;this.storeInitialCamera=this.storeInitialCamera.bind(this),t.camera?this.currentCameraEl=t.camera.el:this.el.addEventListener("camera-set-active",this.storeInitialCamera),this.onKeyDown=this.onKeyDown.bind(this)},storeInitialCamera:function(){this.currentCameraEl=this.el.camera.el,this.el.removeEventListener("camera-set-active",this.storeInitialCamera)},play:function(){window.addEventListener("keydown",this.onKeyDown)},pause:function(){window.removeEventListener("keydown",this.onKeyDown)},onKeyDown:function(t){var e=t.keyCode;if(9===e)switch(e){case 9:this.toggleSpectatorCamera()}},toggleSpectatorCamera:function(){var t=!this.el.getAttribute("avatar-replayer").spectatorMode;this.el.setAttribute("avatar-replayer","spectatorMode",t)},update:function(t){var e=this.data;this.updateSpectatorCamera(),e.src&&t.src!==e.src&&this.updateSrc(e.src)},updateSpectatorCamera:function(){var t=this.data.spectatorMode,e=this.spectatorCameraEl;if(this.el.camera&&!(t&&e&&e.getAttribute("camera").active))return t&&!e?void this.initSpectatorCamera():void(t?e.setAttribute("camera","active",!0):this.currentCameraEl.setAttribute("camera","active",!0))},initSpectatorCamera:function(){var t,e=this.currentCameraEl=this.el.camera.el,r=e.getAttribute("position");!this.spectatorCameraEl&&this.data.spectatorMode&&(t=this.spectatorCameraEl=document.createElement("a-entity"),t.id="spectatorCamera",t.setAttribute("camera",""),t.setAttribute("position",{x:r.x,y:r.y,z:r.z+1}),t.setAttribute("look-controls",""),t.setAttribute("wasd-controls",""),e.setAttribute("geometry",{primitive:"box",height:.3,width:.3,depth:.2}),e.setAttribute("material",{color:"cyan"}),e.removeAttribute("data-aframe-default-camera"),e.addEventListener("pause",function(){e.play()}),this.el.appendChild(t))},updateSrc:function(t){this.loadRecordingFromUrl(t,!1,this.startReplaying.bind(this))},startReplaying:function(t){var e=this.data,o=this,n=this.el;return this.recordingreplayData=t,this.isReplaying=!0,this.el.camera?(Object.keys(t).forEach(function(o){var a;if("camera"===o)i("Setting motion-capture-replayer on camera."),a=n.camera.el;else if(a=n.querySelector("#"+o),!a)return void r("No element found with ID "+o+".");i("Setting motion-capture-replayer on "+o+"."),a.setAttribute("motion-capture-replayer",{loop:e.loop}),a.components["motion-capture-replayer"].startReplaying(t[o])}),void this.initSpectatorCamera()):void this.el.addEventListener("camera-set-active",function(){o.startReplaying(t)})},stopReplaying:function(){var t,e=this;this.isReplaying&&this.recordingData&&(this.isReplaying=!1,t=Object.keys(this.recordingData),t.forEach(function(t){"camera"===t?e.el.camera.el.components["motion-capture-replayer"].stopReplaying():(el=document.querySelector("#"+t),el||o("No element with id "+t),el.components["motion-capture-replayer"].stopReplaying())}))},loadRecordingFromUrl:function(t,e,r){var i,o=new THREE.FileLoader(this.manager),n=this;o.crossOrigin="anonymous",e===!0&&o.setResponseType("arraybuffer"),o.load(t,function(t){i=e===!0?n.loadStrokeBinary(t):JSON.parse(t),r&&r(i)})}})},function(t,e){AFRAME.registerComponent("stroke",{schema:{enabled:{default:!0},color:{default:"#ef2d5e",type:"color"}},init:function(){var t,e=this.maxPoints=3e3;this.idx=0,this.numPoints=0,this.vertices=new Float32Array(3*e*3),this.normals=new Float32Array(3*e*3),this.uvs=new Float32Array(2*e*2),this.geometry=new THREE.BufferGeometry,this.geometry.setDrawRange(0,0),this.geometry.addAttribute("position",new THREE.BufferAttribute(this.vertices,3).setDynamic(!0)),this.geometry.addAttribute("uv",new THREE.BufferAttribute(this.uvs,2).setDynamic(!0)),this.geometry.addAttribute("normal",new THREE.BufferAttribute(this.normals,3).setDynamic(!0)),this.material=new THREE.MeshStandardMaterial({color:this.data.color,roughness:.75,metalness:.25,side:THREE.DoubleSide});var r=new THREE.Mesh(this.geometry,this.material);r.drawMode=THREE.TriangleStripDrawMode,r.frustumCulled=!1,t=document.createElement("a-entity"),t.setObject3D("stroke",r),this.el.sceneEl.appendChild(t)},update:function(){this.material.color.set(this.data.color)},drawPoint:function(){var t=new THREE.Vector3,e=new THREE.Vector3,r=new THREE.Vector3;new THREE.Vector3,new THREE.Vector3;return function(o,n,a,s){var c=0,d=this.numPoints,l=.01;if(d!==this.maxPoints){for(i=0;i<d;i++)this.uvs[c++]=i/(d-1),this.uvs[c++]=0,this.uvs[c++]=i/(d-1),this.uvs[c++]=1;return t.set(1,0,0),t.applyQuaternion(n),t.normalize(),e.copy(s),r.copy(s),e.add(t.clone().multiplyScalar(l/2)),r.add(t.clone().multiplyScalar(-l/2)),this.vertices[this.idx++]=e.x,this.vertices[this.idx++]=e.y,this.vertices[this.idx++]=e.z,this.vertices[this.idx++]=r.x,this.vertices[this.idx++]=r.y,this.vertices[this.idx++]=r.z,this.computeVertexNormals(),this.geometry.attributes.normal.needsUpdate=!0,this.geometry.attributes.position.needsUpdate=!0,this.geometry.attributes.uv.needsUpdate=!0,this.geometry.setDrawRange(0,2*d),this.numPoints+=1,!0}}}(),reset:function(){var t=0,e=this.vertices;for(i=0;i<this.numPoints;i++)e[t++]=0,e[t++]=0,e[t++]=0,e[t++]=0,e[t++]=0,e[t++]=0;this.geometry.setDrawRange(0,0),this.idx=0,this.numPoints=0},computeVertexNormals:function(){for(var t=new THREE.Vector3,e=new THREE.Vector3,r=new THREE.Vector3,i=new THREE.Vector3,o=new THREE.Vector3,n=0,a=this.idx;n<a;n++)this.normals[n]=0;var s=!0;for(n=0,a=this.idx;n<a;n+=3)s?(t.fromArray(this.vertices,n),e.fromArray(this.vertices,n+3),r.fromArray(this.vertices,n+6)):(t.fromArray(this.vertices,n+3),e.fromArray(this.vertices,n),r.fromArray(this.vertices,n+6)),s=!s,i.subVectors(r,e),o.subVectors(t,e),i.cross(o),i.normalize(),this.normals[n]+=i.x,this.normals[n+1]+=i.y,this.normals[n+2]+=i.z,this.normals[n+3]+=i.x,this.normals[n+4]+=i.y,this.normals[n+5]+=i.z,this.normals[n+6]+=i.x,this.normals[n+7]+=i.y,this.normals[n+8]+=i.z;for(n=6,a=this.idx-6;n<a;n++)this.normals[n]=this.normals[n]/3;this.normals[3]=this.normals[3]/2,this.normals[4]=this.normals[4]/2,this.normals[5]=this.normals[5]/2,this.normals[this.idx-6]=this.normals[this.idx-6]/2,this.normals[this.idx-6+1]=this.normals[this.idx-6+1]/2,this.normals[this.idx-6+2]=this.normals[this.idx-6+2]/2,this.geometry.normalizeNormals()}})},function(t,e){AFRAME.registerSystem("motion-capture-recorder",{init:function(){this.strokes=[]},undo:function(){var t=this.strokes.pop();if(t){var e=t.entity;e.emit("stroke-removed",{entity:e}),e.parentNode.removeChild(e)}},clear:function(){for(var t=0;t<this.strokes.length;t++){var e=this.strokes[t].entity;e.parentNode.removeChild(e)}this.strokes=[]},generateRandomStrokes:function(t){function e(){return 2*Math.random()-1}for(var r=0;r<t;r++)for(var i=parseInt(500*Math.random()),o=[],n=new THREE.Vector3(e(),e(),e()),a=new THREE.Vector3,s=new THREE.Quaternion,c=.2,d=0;d<i;d++){a.set(e(),e(),e()),a.multiplyScalar(e()/20),s.setFromUnitVectors(n.clone().normalize(),a.clone().normalize()),n=n.add(a);var l=0,h=this.getPointerPosition(n,s);o.addPoint(n,s,h,c,l)}},saveStroke:function(t){this.strokes.push(t)},getPointerPosition:function(){var t=new THREE.Vector3,e=new THREE.Vector3(0,.7,1);return function(r,i){var o=e.clone().applyQuaternion(i).normalize().multiplyScalar(-.03);return t.copy(r).add(o),t}}(),getJSON:function(){var t={version:VERSION,strokes:[],author:""};for(i=0;i<this.strokes.length;i++)t.strokes.push(this.strokes[i].getJSON(this));return t},getStrokeJSON:function(t){for(var e,r=[],i=0;i<t.length;i++)e=t[i],r.push({position:e.position,rotation:e.rotation,timestamp:e.timestamp});return r},getBinary:function(){var t=[],e="apainter",r=this.strokes=[],i=e.length,o=new BinaryManager(new ArrayBuffer(i));o.writeString(e),o.writeUint16(VERSION),o.writeUint32(this.strokes.length),t.push(o.getDataView());for(var n=0;n<r.length;n++)t.push(this.getStrokeBinary(r[n]));return t},getStrokeBinary:function(t){var e=4+36*t.length,r=new BinaryManager(new ArrayBuffer(e));r.writeUint32(t.length);for(var i=0;i<t.length;i++){var o=t[i];r.writeFloat32Array(o.position.toArray()),r.writeFloat32Array(o.orientation.toArray()),r.writeUint32(o.timestamp)}return r.getDataView()},loadJSON:function(t){var e;t.version!==VERSION&&console.error("Invalid version: ",version,"(Expected: "+VERSION+")");for(var r=0;r<t.strokes.length;r++)e=t.strokes[r],this.loadStrokeJSON(t.strokes[r])},loadBinary:function(t){var e=new BinaryManager(t),r=e.readString();if("apainter"!==r)return void console.error("Invalid `magic` header");var i=e.readUint16();i!==VERSION&&console.error("Invalid version: ",i,"(Expected: "+VERSION+")");for(var o=e.readUint32(),n=0;n<o;n++)for(var a=e.readUint32(),s=[],c=0;c<a;c++){var d=e.readVector3();e.readQuaternion(),e.readUint32();s.push({position:d,rotation:rotation,timestamp:time})}},loadRecordingFromUrl:function(t,e,r){var i,o=new THREE.XHRLoader(this.manager),n=this;o.crossOrigin="anonymous",e===!0&&o.setResponseType("arraybuffer"),o.load(t,function(t){i=e===!0?n.loadStrokeBinary(t):JSON.parse(t),r&&r(i)})},loadFromUrl:function(t,e){var r=new THREE.XHRLoader(this.manager),i=this;r.crossOrigin="anonymous",e===!0&&r.setResponseType("arraybuffer"),r.load(t,function(t){e===!0?i.loadBinary(t):i.loadJSON(JSON.parse(t))})}})}]);