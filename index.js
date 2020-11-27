import * as THREE from 'three';
import {scene, renderer, camera, runtime, world, physics, ui, app, appManager} from 'app';

const cellphoneCamera = new THREE.PerspectiveCamera();
const rtWidth = 512;
const rtHeight = 512;
const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);

const canvas = document.createElement('canvas');
canvas.width = rtWidth;
canvas.height = rtHeight;
const ctx = canvas.getContext('2d');
const imageData = ctx.createImageData(canvas.width, canvas.height);
const captureStream = canvas.captureStream();
const mediaRecorder = new MediaRecorder(captureStream, { mimeType: "video/webm; codecs=vp9" });
const recordedChunks = [];
mediaRecorder.ondataavailable = e => {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    console.log('got data', event.data.size);
    // download();
  }
};
mediaRecorder.start();

(async () => {
  const u = 'cellphone.glb';
  const fileUrl = app.files['./' + u];
  const res = await fetch(fileUrl);
  const file = await res.blob();
  file.name = u;
  let mesh = await runtime.loadFile(file, {
    optimize: false,
  });

  mesh.add(cellphoneCamera);

  const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), new THREE.MeshBasicMaterial({
    map: renderTarget.texture,
  }));
  mesh.add(plane);

  app.object.add(mesh);

  let lastTimestamp = performance.now();
  renderer.setAnimationLoop((timestamp, frame) => {
    timestamp = timestamp || performance.now();
    const timeDiff = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;
    const now = Date.now();

    plane.visible = false;
    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(scene, cellphoneCamera);
    renderer.setRenderTarget(null);
    plane.visible = true;

    renderer.readRenderTargetPixels(renderTarget, 0, 0, imageData.width, imageData.height, imageData.data);
    ctx.putImageData(imageData, 0, 0);

    mediaRecorder.requestData();

    /* closestWeapon = _getClosestWeapon();
    for (const weapon of weapons) {
      weapon.scale.setScalar(weapon === closestWeapon ? 2 : 1);
    } */
  });
})();