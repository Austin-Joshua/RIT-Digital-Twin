import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import RIT_CAMPUS from "../config/rit-campus.config";
import { extrudeBuilding, createIoTOrb, valueToColor } from "../utils/campus-3d.utils";
import { fetchOSMBuildings } from "../services/campus-osm.service";
import apiClient from "../services/api";

function mockIoT() {
  const data = {};
  RIT_CAMPUS.BUILDINGS.forEach((building) => {
    data[building.id] = {};
    building.iotSensors.forEach((sensor) => {
      data[building.id][sensor] = sensor === "temperature"
        ? 22 + Math.random() * 14
        : sensor === "air_quality"
          ? 30 + Math.random() * 120
          : sensor === "machinery_vibration"
            ? 20 + Math.random() * 80
            : Math.random();
    });
  });
  return data;
}

function normalizeCampusIoT(payload, fallback = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  const defaults = mockIoT();
  const next = {};

  RIT_CAMPUS.BUILDINGS.forEach((building) => {
    const srcBuilding = source[building.id] || {};
    const prevBuilding = fallback[building.id] || {};
    next[building.id] = {};

    building.iotSensors.forEach((sensor) => {
      const raw = srcBuilding[sensor];
      if (typeof raw === "number" && Number.isFinite(raw)) {
        next[building.id][sensor] = raw;
      } else if (typeof prevBuilding[sensor] === "number" && Number.isFinite(prevBuilding[sensor])) {
        next[building.id][sensor] = prevBuilding[sensor];
      } else {
        next[building.id][sensor] = defaults[building.id][sensor];
      }
    });
  });

  return next;
}

export default function CampusMap3D() {
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
  const animStateRef = useRef({ cursor: 0, lastTick: 0 });
  const perfRef = useRef({ lastTs: performance.now(), frames: 0 });

  const [iotData, setIotData] = useState(mockIoT);
  const [viewMode, setViewMode] = useState("occupancy");
  const [selected, setSelected] = useState(null);
  const [osmLoaded, setOsmLoaded] = useState(false);
  const [satLoaded, setSatLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ fps: 0, drawCalls: 0, trianglesK: 0 });

  const loadIoTData = useCallback(async () => {
    try {
      const response = await apiClient.get("/iot/campus-overview");
      setIotData((prev) => normalizeCampusIoT(response?.data, prev));
    } catch (_error) {
      setIotData((prev) => normalizeCampusIoT(null, prev));
    }
  }, []);

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
      const iot = iotData[building.id] || {};
      const primary = building.iotSensors[0];
      const rawVal = iot[primary] ?? 0.5;
      const normVal = primary === "temperature" ? (rawVal - 20) / 20 : rawVal;

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

      const orb = createIoTOrb(valueToColor(normVal), building.height + 6);
      orb.group.position.set(cx, 0, cz);
      orb.group.frustumCulled = true;
      scene.add(orb.group);
      orbsRef.current.push(orb);

      scene.add(group);
      meshMapRef.current[building.id] = { group, bodyMesh, bodyMat, orb };
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

    setLoading(false);

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
        const building = RIT_CAMPUS.BUILDINGS.find((b) => b.id === id);
        if (building) setSelected({ ...building, iot: iotData[id] });
      } else {
        setSelected(null);
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
      if (now - animStateRef.current.lastTick > 100 && orbArray.length > 0) {
        const windowSize = Math.min(lowPower ? 2 : 4, orbArray.length);
        for (let i = 0; i < windowSize; i += 1) {
          const idx = (animStateRef.current.cursor + i) % orbArray.length;
          const { group, light } = orbArray[idx];
          const pulse = 0.75 + Math.sin(t * 1.8 + idx * 0.6) * 0.25;
          group.children[0].scale.setScalar(pulse);
          group.children[1].scale.setScalar(1 + (1 - pulse) * 0.5);
          light.intensity = 1.5 + Math.sin(t * 2 + idx) * 0.5;
        }
        animStateRef.current.cursor = (animStateRef.current.cursor + windowSize) % orbArray.length;
        animStateRef.current.lastTick = now;
      }

      renderer.render(scene, camera);
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
      const iot = iotData[building.id] || {};
      const sensor = viewMode !== "all" ? viewMode : building.iotSensors[0];
      const rawVal = iot[sensor] ?? 0.5;
      const normVal = sensor === "temperature"
        ? (rawVal - 20) / 20
        : sensor === "air_quality"
          ? rawVal / 150
          : sensor === "machinery_vibration"
            ? rawVal / 100
            : rawVal;

      const color = valueToColor(Math.max(0, Math.min(1, normVal)));
      mesh.orb.mat.color.set(color);
      mesh.orb.ringMat.color.set(color);
      mesh.orb.light.color.set(color);
    });
  }, [viewMode, iotData]);

  useEffect(() => {
    RIT_CAMPUS.BUILDINGS.forEach((building) => {
      const mesh = meshMapRef.current[building.id];
      if (!mesh) return;
      mesh.bodyMat.emissive = new THREE.Color(selected?.id === building.id ? "#1A3A5C" : "#000000");
      mesh.bodyMat.emissiveIntensity = selected?.id === building.id ? 0.5 : 0;
    });
  }, [selected]);

  useEffect(() => {
    loadIoTData();
    const timer = setInterval(loadIoTData, 30000);
    return () => clearInterval(timer);
  }, [loadIoTData]);

  useEffect(() => {
    if (!selected?.id) return;
    setSelected((prev) => {
      if (!prev?.id) return prev;
      return { ...prev, iot: iotData[prev.id] || prev.iot };
    });
  }, [iotData, selected?.id]);

  const formatSensor = (key, val) => {
    const meta = RIT_CAMPUS.SENSOR_LABELS[key];
    if (!meta) return null;
    const display = key === "temperature"
      ? `${(val || 0).toFixed(1)}${meta.unit}`
      : key === "air_quality" || key === "machinery_vibration"
        ? `${(val || 0).toFixed(0)} ${meta.unit}`
        : `${Math.round(((val || 0) * 100))}${meta.unit}`;
    const norm = key === "temperature"
      ? ((val || 0) - 20) / 20
      : key === "air_quality"
        ? (val || 0) / 150
        : key === "machinery_vibration"
          ? (val || 0) / 100
          : (val || 0);
    return { ...meta, display, norm: Math.max(0, Math.min(1, norm)) };
  };

  const MODES = ["occupancy", "energy", "temperature", "air_quality"];

  return (
    <div className="relative w-full bg-gray-950" style={{ height: "100vh", minHeight: 600 }}>
      <div ref={mountRef} className="absolute inset-0" />

      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-950">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-blue-300 text-sm font-mono">Initialising RIT Campus 3D...</p>
        </div>
      )}

      <div
        className="absolute top-0 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(to bottom, rgba(11,15,30,0.95), transparent)" }}
      >
        <div>
          <p className="text-white font-bold text-base leading-tight">RIT Chennai Campus</p>
          <p className="text-blue-400 text-xs font-mono">
            13.0382N 80.0454E · 10.88 acres
            {osmLoaded && <span className="ml-2 text-green-400">● OSM</span>}
            {satLoaded && <span className="ml-2 text-green-400">● Satellite</span>}
          </p>
        </div>

        <div className="flex gap-1.5 bg-black bg-opacity-50 rounded-xl px-3 py-2">
          {MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                viewMode === mode
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {RIT_CAMPUS.SENSOR_LABELS[mode]?.icon} {mode.replace("_", " ")}
            </button>
          ))}
          <button
            onClick={loadIoTData}
            type="button"
            className="px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-all ml-1"
          >
            ⟳
          </button>
        </div>
      </div>

      <div className="absolute top-16 right-4 z-10 bg-black bg-opacity-70 backdrop-blur rounded-xl p-3 text-xs">
        <p className="text-gray-400 uppercase tracking-widest text-[10px] mb-2 font-semibold">Legend</p>
        {[["#00E676", "Normal / Low"], ["#FFEA00", "Moderate"], ["#FF5252", "High / Critical"]].map(
          ([color, label]) => (
            <div key={label} className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ background: color }} />
              <span className="text-gray-300">{label}</span>
            </div>
          )
        )}
        <hr className="border-gray-700 my-2" />
        <div className="text-gray-500 space-y-0.5">
          <p>Drag - orbit</p>
          <p>Scroll - zoom</p>
          <p>Click - inspect</p>
        </div>
        <hr className="border-gray-700 my-2" />
        <p className="text-gray-400">FPS: {stats.fps}</p>
        <p className="text-gray-400">Draw calls: {stats.drawCalls}</p>
        <p className="text-gray-400">Triangles: ~{stats.trianglesK}k</p>
      </div>

      <div className="absolute bottom-4 right-4 z-10 text-right text-xs text-gray-500 font-mono">
        <p>{RIT_CAMPUS.BUILDINGS.length} buildings rendered</p>
        <p>Three.js r128 + OSM</p>
      </div>

      {selected && (
        <div className="absolute bottom-4 left-4 z-20 w-80 bg-gray-900 bg-opacity-95 backdrop-blur border border-blue-800 rounded-2xl p-4 shadow-2xl">
          <div className="flex justify-between items-start mb-1">
            <div>
              <span className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">{selected.type}</span>
              <h3 className="text-white font-bold text-sm leading-tight">{selected.name}</h3>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-500 hover:text-white transition text-lg leading-none ml-2 mt-0.5"
              type="button"
            >
              ×
            </button>
          </div>

          {selected.departments?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 mt-2">
              {selected.departments.slice(0, 4).map((department) => (
                <span key={department} className="px-2 py-0.5 bg-blue-950 text-blue-300 text-[10px] rounded-full">
                  {department}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2.5">
            {selected.iotSensors.map((key) => {
              const sensor = formatSensor(key, selected.iot?.[key]);
              if (!sensor) return null;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{sensor.icon} {sensor.label}</span>
                    <span className="font-mono font-bold" style={{ color: valueToColor(sensor.norm) }}>
                      {sensor.display}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-700"
                      style={{
                        width: `${sensor.norm * 100}%`,
                        background: valueToColor(sensor.norm),
                        boxShadow: `0 0 6px ${valueToColor(sensor.norm)}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
            <span>{selected.floors} floors · {selected.height}m</span>
            <span className={selected.landmark ? "text-yellow-400" : ""}>{selected.landmark ? "Landmark" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}
