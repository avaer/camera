import * as THREE from 'three';
import {scene, renderer, camera, runtime, world, physics, ui, app, appManager} from 'app';

const cellphoneCamera = new THREE.PerspectiveCamera();
const rtWidth = 1024;
const rtHeight = 1024;
const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);

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

    /* closestWeapon = _getClosestWeapon();
    for (const weapon of weapons) {
      weapon.scale.setScalar(weapon === closestWeapon ? 2 : 1);
    } */
  });
})();