import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import RIT_CAMPUS from "../config/rit-campus.config";
import { extrudeBuilding, createIoTOrb } from "../utils/campus-3d.utils";
import { fetchOSMBuildings } from "../services/campus-osm.service";

export default function CampusMap3D({ overlayById = {}, selectedId = null, onSelect }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(null);
  const meshMapRef = useRef({});
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const orbsRef = useRef([]);
  const treeRefs = useRef({ trunk: null, foliage: [] });
  const visibilityRef = useRef({ hidden: false });
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const animStateRef = useRef({ cursor: 0, lastTick: 0 });
  const perfRef = useRef({ lastTs: 0, frames: 0 });

  const [osmLoaded, setOsmLoaded] = useState(false);
  const [satLoaded, setSatLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ fps: 0, drawCalls: 0, trianglesK: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const lowPower = window.innerWidth < 900 || (window.devicePixelRatio || 1) > 2;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0B0F1E");
    scene.fog = new THREE.FogExp2("#0B0F1E", 0.00055);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.5, 4000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0x334466, 0.7));
    const sun = new THREE.DirectionalLight(0xfff5e0, 2.2);
    sun.position.set(150, 350, 200);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -350;
    sun.shadow.camera.right = sun.shadow.camera.top = 350;
    sun.shadow.camera.far = 1200;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0x9bbdff, 0x3d2b1f, 0.5));

    const groundGeo = new THREE.PlaneGeometry(700, 700, 64, 64);
    const groundMat = new THREE.MeshLambertMaterial({ color: "#2C4020" });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      const { lat, lng } = RIT_CAMPUS.CENTER;
      const satUrl =
        "https://maps.googleapis.com/maps/api/staticmap"
        + `?center=${lat},${lng}&zoom=18&size=1024x1024&maptype=satellite&key=${apiKey}`;
      new THREE.TextureLoader().load(
        satUrl,
        (tex) => {
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          groundMat.map = tex;
          groundMat.color.set("#ffffff");
          groundMat.needsUpdate = true;
          setSatLoaded(true);
        },
        undefined,
        () => {}
      );
    }

    const wallMat = new THREE.MeshPhongMaterial({ color: "#8B7355" });
    [
      [-185, 0, 370, 1.5],
      [185, 0, 370, 1.5],
      [0, -185, 1.5, 370],
      [0, 185, 1.5, 370],
    ].forEach(([x, z, w, d]) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), wallMat);
      wall.position.set(x, 2, z);
      wall.castShadow = true;
      wall.frustumCulled = true;
      scene.add(wall);
    });

    const roadMats = {
      main: new THREE.MeshLambertMaterial({ color: "#3A3A3A" }),
      perimeter: new THREE.MeshLambertMaterial({ color: "#404040" }),
      service: new THREE.MeshLambertMaterial({ color: "#4A4A4A" }),
    };
    RIT_CAMPUS.ROADS.forEach((road) => {
      const pts = road.points.map(([x, z]) => new THREE.Vector3(x, 0.05, z));
      for (let i = 0; i < pts.length - 1; i += 1) {
        const a = pts[i];
        const b = pts[i + 1];
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        const len = a.distanceTo(b);
        const angle = Math.atan2(b.x - a.x, b.z - a.z);
        const seg = new THREE.Mesh(
          new THREE.BoxGeometry(road.width, 0.15, len),
          roadMats[road.type] || roadMats.service
        );
        seg.position.copy(mid);
        seg.rotation.y = angle;
        seg.receiveShadow = true;
        seg.frustumCulled = true;
        scene.add(seg);
      }
    });

    const totalTrees = RIT_CAMPUS.TREE_CLUSTERS.reduce((sum, cluster) => sum + cluster.count, 0);
    if (totalTrees > 0) {
      const trunkGeo = new THREE.CylinderGeometry(0.8, 1.2, 5, lowPower ? 5 : 6);
      const trunkMat = new THREE.MeshLambertMaterial({ color: "#5C3D1E" });
      const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, totalTrees);
      trunkMesh.castShadow = true;
      trunkMesh.receiveShadow = true;
      trunkMesh.frustumCulled = true;

      const foliageGeos = [
        new THREE.ConeGeometry(8, 9, lowPower ? 6 : 8),
        new THREE.ConeGeometry(6, 9, lowPower ? 6 : 8),
        new THREE.ConeGeometry(4, 9, lowPower ? 6 : 8),
      ];
      const foliageMeshes = foliageGeos.map((geo, idx) => {
        const mesh = new THREE.InstancedMesh(
          geo,
          new THREE.MeshLambertMaterial({ color: idx === 0 ? "#2E7D32" : "#388E3C" }),
          totalTrees
        );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = true;
        return mesh;
      });

      const dummy = new THREE.Object3D();
      let idx = 0;
      RIT_CAMPUS.TREE_CLUSTERS.forEach(({ cx, cz, count, spread }) => {
        for (let i = 0; i < count; i += 1) {
          const x = cx + (Math.random() - 0.5) * spread * 2;
          const z = cz + (Math.random() - 0.5) * spread * 2;
          dummy.position.set(x, 2.5, z);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          trunkMesh.setMatrixAt(idx, dummy.matrix);

          [5, 8.5, 12].forEach((y, layer) => {
            dummy.position.set(x, y, z);
            dummy.updateMatrix();
            foliageMeshes[layer].setMatrixAt(idx, dummy.matrix);
          });
          idx += 1;
        }
      });

      trunkMesh.instanceMatrix.needsUpdate = true;
      foliageMeshes.forEach((mesh) => {
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
      });
      scene.add(trunkMesh);
      treeRefs.current = { trunk: trunkMesh, foliage: foliageMeshes };
    }

    RIT_CAMPUS.BUILDINGS.forEach((building) => {
      const { group, bodyMesh, bodyMat } = extrudeBuilding(building.footprint, building.height, {
        bodyColor: building.color,
        roofColor: building.roofColor,
      });
      group.frustumCulled = true;
      bodyMesh.userData.buildingId = building.id;
      bodyMesh.userData.buildingName = building.name;
      bodyMesh.frustumCulled = true;

      const cx = building.footprint.reduce((sum, p) => sum + p[0], 0) / building.footprint.length;
      const cz = building.footprint.reduce((sum, p) => sum + p[1], 0) / building.footprint.length;

      const orb = createIoTOrb("#8AA0B8", building.height + 6);
      orb.group.position.set(cx, 0, cz);
      orb.group.visible = false;
      orb.group.frustumCulled = true;
      scene.add(orb.group);
      orbsRef.current.push(orb);

      scene.add(group);
      meshMapRef.current[building.id] = { group, bodyMesh, bodyMat, orb, baseColor: building.color };
    });

    fetchOSMBuildings()
      .then((osmBuildings) => {
        osmBuildings.forEach((osm) => {
          const alreadyCovered = RIT_CAMPUS.BUILDINGS.some((b) => {
            const bx = b.footprint.reduce((sum, p) => sum + p[0], 0) / b.footprint.length;
            const ox = osm.footprint.reduce((sum, p) => sum + p[0], 0) / osm.footprint.length;
            return Math.abs(bx - ox) < 20;
          });
          if (!alreadyCovered && osm.footprint.length > 2) {
            const { group } = extrudeBuilding(osm.footprint, osm.levels * 4, {
              bodyColor: "#B8B0A0",
              roofColor: "#909080",
            });
            group.frustumCulled = true;
            scene.add(group);
          }
        });
        setOsmLoaded(true);
      })
      .catch(() => setOsmLoaded(false));

    requestAnimationFrame(() => setLoading(false));

    let dragging = false;
    let prevMouse = { x: 0, y: 0 };
    const orbitState = { theta: Math.PI * 0.3, phi: 1.1, radius: 650 };
    const target = new THREE.Vector3(0, 0, 0);
    const applyOrbit = () => {
      const { theta, phi, radius } = orbitState;
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
    };
    applyOrbit();

    const onDown = (e) => {
      dragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      orbitState.theta -= dx * 0.004;
      orbitState.phi = Math.max(0.15, Math.min(Math.PI / 2.1, orbitState.phi + dy * 0.004));
      prevMouse = { x: e.clientX, y: e.clientY };
      applyOrbit();
    };
    const onUp = () => {
      dragging = false;
    };
    const onWheel = (e) => {
      orbitState.radius = Math.max(80, Math.min(1200, orbitState.radius + e.deltaY * 0.6));
      applyOrbit();
    };
    const onClick = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const bodies = Object.values(meshMapRef.current).map((m) => m.bodyMesh);
      const hits = raycasterRef.current.intersectObjects(bodies, true);
      if (hits.length > 0) {
        const id = hits[0].object.userData.buildingId;
        onSelectRef.current?.(id);
      } else {
        onSelectRef.current?.(null);
      }
    };
    const onTouchStart = (e) => {
      if (!e.touches?.length) return;
      dragging = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e) => {
      if (!e.touches?.length) return;
      onMove(e.touches[0]);
    };
    const onTouchEnd = () => {
      dragging = false;
    };
    const onVisibilityChange = () => {
      visibilityRef.current.hidden = document.visibilityState !== "visible";
    };

    mount.addEventListener("mousedown", onDown);
    mount.addEventListener("mousemove", onMove);
    mount.addEventListener("mouseup", onUp);
    mount.addEventListener("wheel", onWheel, { passive: true });
    mount.addEventListener("click", onClick);
    mount.addEventListener("touchstart", onTouchStart, { passive: true });
    mount.addEventListener("touchmove", onTouchMove, { passive: true });
    mount.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (visibilityRef.current.hidden) return;
      t += 0.016;

      const orbArray = orbsRef.current;
      const now = performance.now();
      if (now - animStateRef.current.lastTick > 180 && orbArray.length > 0) {
        const windowSize = Math.min(lowPower ? 2 : 4, orbArray.length);
        for (let i = 0; i < windowSize; i += 1) {
          const idx = (animStateRef.current.cursor + i) % orbArray.length;
          const { group, light } = orbArray[idx];
          if (!group.visible) continue;
          const pulse = 0.85 + Math.sin(t * 1.4 + idx * 0.6) * 0.1;
          group.children[0].scale.setScalar(pulse);
          group.children[1].scale.setScalar(1 + (1 - pulse) * 0.5);
          light.intensity = 1.5 + Math.sin(t * 2 + idx) * 0.5;
        }
        animStateRef.current.cursor = (animStateRef.current.cursor + windowSize) % orbArray.length;
        animStateRef.current.lastTick = now;
      }

      renderer.render(scene, camera);
      if (!perfRef.current.lastTs) {
        perfRef.current.lastTs = now;
      }
      perfRef.current.frames += 1;
      if (now - perfRef.current.lastTs > 1000) {
        setStats({
          fps: Math.round((perfRef.current.frames * 1000) / (now - perfRef.current.lastTs)),
          drawCalls: renderer.info.render.calls,
          trianglesK: Math.round(renderer.info.render.triangles / 1000),
        });
        perfRef.current.frames = 0;
        perfRef.current.lastTs = now;
      }
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mount.removeEventListener("mousedown", onDown);
      mount.removeEventListener("mousemove", onMove);
      mount.removeEventListener("mouseup", onUp);
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("click", onClick);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove", onTouchMove);
      mount.removeEventListener("touchend", onTouchEnd);

      if (treeRefs.current.trunk) {
        treeRefs.current.trunk.geometry.dispose();
        treeRefs.current.trunk.material.dispose();
      }
      treeRefs.current.foliage.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    RIT_CAMPUS.BUILDINGS.forEach((building) => {
      const mesh = meshMapRef.current[building.id];
      if (!mesh) return;
      const overlay = overlayById[building.id];
      const color = overlay?.color || mesh.baseColor || building.color;
      mesh.bodyMat.color.set(color);
      mesh.orb.group.visible = Boolean(overlay?.color);
      if (overlay?.color) {
        mesh.orb.mat.color.set(overlay.color);
        mesh.orb.ringMat.color.set(overlay.color);
        mesh.orb.light.color.set(overlay.color);
      }
      const selected = selectedId === building.id;
      mesh.bodyMat.emissive = new THREE.Color(selected ? "#1A3A5C" : "#000000");
      mesh.bodyMat.emissiveIntensity = selected ? 0.45 : 0;
    });
  }, [overlayById, selectedId]);

  return (
    <div className="relative w-full" style={{ height: "100%", minHeight: 480, background: "#0B0F1E" }}>
      <div ref={mountRef} className="absolute inset-0" />

      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ background: "#0B0F1E", color: "#9BB0C8" }}>
          <p>Opening the campus modelâ€¦</p>
        </div>
      )}

      <div className="absolute top-3 left-3 z-10 text-xs" style={{ color: "#D5E2F0" }}>
        <p style={{ margin: 0, fontWeight: 700 }}>Campus model</p>
        <p style={{ margin: "2px 0 0", color: "#9BB0C8" }}>
          Visual shell
          {osmLoaded ? " Â· OSM context" : ""}
          {satLoaded ? " Â· satellite" : ""}
        </p>
      </div>

      <div className="absolute bottom-3 right-3 z-10 text-right text-xs" style={{ color: "#8AA0B8" }}>
        <p style={{ margin: 0 }}>{RIT_CAMPUS.BUILDINGS.length} model buildings Â· rooms load on open</p>
        <p style={{ margin: 0 }}>FPS {stats.fps} Â· {stats.drawCalls} draws</p>
      </div>
    </div>
  );
}
