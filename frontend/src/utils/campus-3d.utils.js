import * as THREE from "three";

export function extrudeBuilding(footprint, height, options = {}) {
  const {
    bodyColor = "#C5A882",
    roofColor = "#8B7355",
  } = options;

  const group = new THREE.Group();
  const shape = new THREE.Shape();

  footprint.forEach(([x, z], idx) => {
    if (idx === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  });
  shape.closePath();

  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });
  bodyGeo.rotateX(-Math.PI / 2);

  const bodyMat = new THREE.MeshPhongMaterial({
    color: bodyColor,
    specular: "#666666",
    shininess: 20,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: false });
  roofGeo.rotateX(-Math.PI / 2);
  const roofMesh = new THREE.Mesh(roofGeo, new THREE.MeshPhongMaterial({ color: roofColor }));
  roofMesh.position.y = height;
  roofMesh.castShadow = true;
  group.add(roofMesh);

  const floorLinesMat = new THREE.LineBasicMaterial({
    color: "#00000030",
    transparent: true,
    opacity: 0.3,
  });
  const floorCount = Math.round(height / 4);
  for (let floor = 1; floor < floorCount; floor += 1) {
    const pts = footprint.map(([x, z]) => new THREE.Vector3(x, floor * (height / floorCount), z));
    pts.push(pts[0].clone());
    const floorLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), floorLinesMat);
    group.add(floorLine);
  }

  return { group, bodyMesh, bodyMat };
}

export function createIoTOrb(color = "#00E676", yOffset = 0) {
  const group = new THREE.Group();

  const geo = new THREE.SphereGeometry(2.5, 16, 16);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.92,
  });
  const sphere = new THREE.Mesh(geo, mat);
  group.add(sphere);

  const ringGeo = new THREE.RingGeometry(3.5, 4.5, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  const light = new THREE.PointLight(color, 2, 60);
  group.add(light);

  group.position.y = yOffset;
  return { group, mat, ringMat, light };
}

export function valueToColor(value) {
  if (value < 0.35) return "#00E676";
  if (value < 0.7) return "#FFEA00";
  return "#FF5252";
}

export function createTree(x, z) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.2, 5, 6),
    new THREE.MeshLambertMaterial({ color: "#5C3D1E" })
  );
  trunk.position.set(x, 2.5, z);
  trunk.castShadow = true;
  group.add(trunk);

  [[0, 5], [3.5, 9], [7, 13]].forEach(([yOffset, radius], idx) => {
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(8 - idx * 2, 9, 8),
      new THREE.MeshLambertMaterial({ color: idx === 0 ? "#2E7D32" : "#388E3C" })
    );
    foliage.position.set(x, 5 + yOffset, z);
    foliage.castShadow = true;
    group.add(foliage);
  });

  return group;
}
