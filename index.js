import * as THREE from 'three';
import {scene, renderer, camera, runtime, world, physics, ui, crypto, app, appManager} from 'app';

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
// let totalSize = 0;
// const maxSize = 200 * 1024;
const _start = () => {
  mediaRecorder.ondataavailable = e => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
      console.log('got data', event.data.size, totalSize/*, maxSize*/);
      /* totalSize += event.data.size;
      if (totalSize >= maxSize && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      } */
    }
  };
  mediaRecorder.onstop = async e => {
    const blob = new Blob(recordedChunks, {
      type: 'video/webm',
    });
    blob.name = 'capture.webm';

    recordedChunks.length = 0;
    // totalSize = 0;

    const token = await crypto.mintToken(blob, {
      description: 'captured video',
    });
    console.log('got token', token);
  };
  mediaRecorder.start();
};
const _stop = () => {
  mediaRecorder.stop();
};
/* const _toggle = () => {
  if (mediaRecorder.state === 'inactive') {
    _start();
  } else {
    _stop();
  }
}; */

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
  let lastGrabbed = false;
  renderer.setAnimationLoop((timestamp, frame) => {
    timestamp = timestamp || performance.now();
    const timeDiff = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;
    const now = Date.now();

    const currentWeapon = world.getGrab('right');
    const grabbed = currentWeapon === app.object;
    if (grabbed && !lastGrabbed) {
      _start();
    } else if (lastGrabbed && !grabbed) {
      _stop();
    }
    lastGrabbed = grabbed;

    {
      plane.visible = false;
      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(scene, cellphoneCamera);
      renderer.setRenderTarget(null);
      plane.visible = true;

      renderer.readRenderTargetPixels(renderTarget, 0, 0, imageData.width, imageData.height, imageData.data);
      ctx.putImageData(imageData, 0, 0);

      if (mediaRecorder.state === 'recording') {
        mediaRecorder.requestData();
      }
    }

    /* closestWeapon = _getClosestWeapon();
    for (const weapon of weapons) {
      weapon.scale.setScalar(weapon === closestWeapon ? 2 : 1);
    } */
  });
})();