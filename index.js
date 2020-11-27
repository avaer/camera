import * as THREE from 'three';
import {scene, renderer, camera, runtime, world, physics, ui, app, appManager} from 'app';

// const localVector = new THREE.Vector3();
// const localMatrix = new THREE.Matrix4();

(async () => {
  const u = app.files['cellphone.glb'];
  const transforms = physics.getRigTransforms();
  const {position, quaternion} = transforms[0];
  world.addObject(u, app.appId, position, quaternion); // XXX

  app.object.add(world);

  let lastTimestamp = performance.now();
  renderer.setAnimationLoop((timestamp, frame) => {
    timestamp = timestamp || performance.now();
    const timeDiff = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;
    const now = Date.now();

    /* closestWeapon = _getClosestWeapon();
    for (const weapon of weapons) {
      weapon.scale.setScalar(weapon === closestWeapon ? 2 : 1);
    } */
  });
})();