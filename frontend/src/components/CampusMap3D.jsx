import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import RIT_CAMPUS from "../config/rit-campus.config";
import { extrudeBuilding, createIoTOrb, valueToColor, statusToColor } from "../utils/campus-3d.utils";
import { fetchOSMBuildings } from "../services/campus-osm.service";
import apiClient from "../services/api";

function mockIoT() {
  const data = {};
  (RIT_CAMPUS.BUILDINGS || []).forEach((building) => {
    data[building.id] = {};
    (building.iotSensors || []).forEach((sensor) => {
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

  (RIT_CAMPUS.BUILDINGS || []).forEach((building) => {
    const srcBuilding = source[building.id] || {};
    const prevBuilding = fallback[building.id] || {};
    next[building.id] = {};

    (building.iotSensors || []).forEach((sensor) => {
      const raw = srcBuilding[sensor];
      if (typeof raw === "number" && Number.isFinite(raw)) {
        next[building.id][sensor] = raw;
      } else if (typeof prevBuilding[sensor] === "number" && Number.isFinite(prevBuilding[sensor])) {
        next[building.id][sensor] = prevBuilding[sensor];
      } else {
        next[building.id][sensor] = defaults[building.id]?.[sensor] ?? 0.5;
      }
    });
  });

  return next;
}

export default function CampusMap3D({ scenarioId = 'normal-day', simulatedClock = '10:00' } = {}) {
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
  const perfRef = useRef({ lastTs: 0, frames: 0 });

  const [iotData, setIotData] = useState(mockIoT);
  const [viewMode, setViewMode] = useState("occupancy");
  const [selected, setSelected] = useState(null);
  const [osmLoaded, setOsmLoaded] = useState(false);
  const [satLoaded, setSatLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ fps: 0, drawCalls: 0, trianglesK: 0 });
  const [telemetrySource, setTelemetrySource] = useState("DETERMINISTIC SYNTHETIC TELEMETRY");
  const [showProvenanceInfo, setShowProvenanceInfo] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const orbitControlsRef = useRef({ zoomIn: null, zoomOut: null, resetView: null });

  const loadIoTData = useCallback(async () => {
    try {
      let isLive = false;
      try {
        const liveRes = await apiClient.get("/twin/iot/live");
        if (liveRes?.data && Object.keys(liveRes.data).length > 0) {
          isLive = true;
          setTelemetrySource("LIVE IOT SENSOR STREAM");
        }
      } catch (_e) {
        /* live sensor stream unavailable, fall back to synthetic telemetry */
      }

      const params = {};
      if (scenarioId) params.scenarioId = scenarioId;
      if (simulatedClock) params.clock = simulatedClock;

      const response = await apiClient.get("/iot/campus-overview", { params });
      if (!isLive) {
        setTelemetrySource(scenarioId && scenarioId !== 'normal-day'
          ? `SYNTHETIC SCENARIO: ${scenarioId.toUpperCase()}`
          : "DETERMINISTIC SYNTHETIC TELEMETRY");
      }
      setIotData((prev) => normalizeCampusIoT(response?.data, prev));
    } catch (_error) {
      setIotData((prev) => normalizeCampusIoT(null, prev));
      setTelemetrySource("DETERMINISTIC SYNTHETIC TELEMETRY");
    }
  }, [scenarioId, simulatedClock]);

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

    // Ground Plane representing RIT Campus Tangent Plane at 13.0389 N, 80.0449 E
    const groundGeo = new THREE.PlaneGeometry(800, 800, 64, 64);
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

    // Campus Perimeter Boundary Walls
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

    // Campus Roads
    const roadMats = {
      main: new THREE.MeshLambertMaterial({ color: "#3A3A3A" }),
      perimeter: new THREE.MeshLambertMaterial({ color: "#404040" }),
      service: new THREE.MeshLambertMaterial({ color: "#4A4A4A" }),
    };
    (RIT_CAMPUS.ROADS || []).forEach((road) => {
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

    // Instanced Campus Trees
    const totalTrees = (RIT_CAMPUS.TREE_CLUSTERS || []).reduce((sum, cluster) => sum + cluster.count, 0);
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

    // Build unified real campus buildings (Official RIT Blocks + Peripheral OSM Structures)
    const allCampusBuildings = [
      ...(RIT_CAMPUS.BUILDINGS || []),
      ...(RIT_CAMPUS.PERIPHERAL_BUILDINGS || [])
    ];

    allCampusBuildings.forEach((building) => {
      if (!building.footprint || building.footprint.length < 3) return;

      const height = building.height || building.heightMeters || (building.levels ? building.levels * 4 : 16);
      const isPeripheral = building.geometryStatus === 'UNVERIFIED';

      const bodyColor = isPeripheral ? '#6B7280' : (building.color || '#C0B090');
      const roofColor = isPeripheral ? '#4B5563' : (building.roofColor || '#8B7355');

      const { group, bodyMesh, bodyMat, roofMesh, roofMat } = extrudeBuilding(
        building.footprint,
        height,
        {
          bodyColor,
          roofColor,
          transparent: isPeripheral,
          opacity: isPeripheral ? 0.82 : 1.0,
        }
      );

      group.frustumCulled = true;
      bodyMesh.userData.buildingId = building.id;
      bodyMesh.userData.buildingName = building.name;
      bodyMesh.userData.building = building;
      bodyMesh.frustumCulled = true;

      // Centroid in local metric tangent plane
      const cx = building.localX ?? (building.footprint.reduce((sum, p) => sum + p[0], 0) / building.footprint.length);
      const cz = building.localZ ?? (building.footprint.reduce((sum, p) => sum + p[1], 0) / building.footprint.length);

      let orb = null;
      if (building.iotSensors && building.iotSensors.length > 0) {
        const iot = iotData[building.id] || {};
        const primary = building.iotSensors[0];
        const rawVal = iot[primary] ?? 0.5;
        const normVal = primary === "temperature" ? (rawVal - 20) / 20 : rawVal;

        orb = createIoTOrb(valueToColor(normVal), height + 6);
        orb.group.position.set(cx, 0, cz);
        orb.group.frustumCulled = true;
        scene.add(orb.group);
        orbsRef.current.push(orb);
      }

      scene.add(group);
      meshMapRef.current[building.id] = { group, bodyMesh, bodyMat, roofMesh, roofMat, orb, building };
    });

    // Asynchronously fetch authoritative backend geospatial records to enrich metadata
    fetchOSMBuildings()
      .then((authoritativeBuildings) => {
        authoritativeBuildings.forEach((backendB) => {
          if (meshMapRef.current[backendB.id]) {
            meshMapRef.current[backendB.id].building = {
              ...meshMapRef.current[backendB.id].building,
              ...backendB
            };
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

    orbitControlsRef.current = {
      zoomIn: () => {
        orbitState.radius = Math.max(80, orbitState.radius - 80);
        applyOrbit();
      },
      zoomOut: () => {
        orbitState.radius = Math.min(1200, orbitState.radius + 80);
        applyOrbit();
      },
      resetView: () => {
        orbitState.theta = Math.PI * 0.3;
        orbitState.phi = 1.1;
        orbitState.radius = 650;
        applyOrbit();
      }
    };

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
        const entry = meshMapRef.current[id];
        if (entry && entry.building) {
          setSelected({
            ...entry.building,
            iot: iotData[id]
          });
        }
      } else {
        setSelected(null);
      }
    };

    let pinchDist = 0;
    const onTouchStart = (e) => {
      if (!e.touches?.length) return;
      if (e.touches.length === 1) {
        dragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        dragging = false;
        pinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };
    const onTouchMove = (e) => {
      if (!e.touches?.length) return;
      if (e.touches.length === 1 && dragging) {
        onMove(e.touches[0]);
      } else if (e.touches.length === 2) {
        const newDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (pinchDist > 0) {
          const delta = (pinchDist - newDist) * 1.6;
          orbitState.radius = Math.max(80, Math.min(1200, orbitState.radius + delta));
          applyOrbit();
        }
        pinchDist = newDist;
      }
    };
    const onTouchEnd = () => {
      dragging = false;
      pinchDist = 0;
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

      Object.values(meshMapRef.current).forEach(({ group, bodyMesh, bodyMat, roofMesh, roofMat, orb }) => {
        if (bodyMesh) {
          bodyMesh.geometry?.dispose();
          bodyMat?.dispose();
        }
        if (roofMesh) {
          roofMesh.geometry?.dispose();
          roofMat?.dispose();
        }
        if (orb) {
          orb.mat?.dispose();
          orb.ringMat?.dispose();
          scene.remove(orb.group);
        }
        scene.remove(group);
      });
      meshMapRef.current = {};
      orbsRef.current = [];

      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Update visual styles on viewMode or iotData changes
  useEffect(() => {
    Object.values(meshMapRef.current).forEach(({ bodyMat, roofMat, orb, building }) => {
      if (!bodyMat || !roofMat) return;

      if (viewMode === "geometry_status") {
        const statusColor = statusToColor(building.geometryStatus);
        bodyMat.color.set(statusColor);
        roofMat.color.set(statusColor);
        if (orb) {
          orb.mat.color.set(statusColor);
          orb.ringMat.color.set(statusColor);
          orb.light.color.set(statusColor);
        }
      } else {
        const isPeripheral = building.geometryStatus === 'UNVERIFIED';
        const defaultBody = isPeripheral ? '#6B7280' : (building.color || '#C0B090');
        const defaultRoof = isPeripheral ? '#4B5563' : (building.roofColor || '#8B7355');
        bodyMat.color.set(defaultBody);
        roofMat.color.set(defaultRoof);

        if (orb && building.iotSensors?.length > 0) {
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
          orb.mat.color.set(color);
          orb.ringMat.color.set(color);
          orb.light.color.set(color);
        }
      }
    });
  }, [viewMode, iotData]);

  // Selected building highlight
  useEffect(() => {
    Object.values(meshMapRef.current).forEach(({ bodyMat, building }) => {
      if (!bodyMat) return;
      const isCurrent = selected?.id === building.id;
      bodyMat.emissive = new THREE.Color(isCurrent ? "#1E40AF" : "#000000");
      bodyMat.emissiveIntensity = isCurrent ? 0.65 : 0;
    });
  }, [selected]);

  useEffect(() => {
    const kick = setTimeout(() => {
      loadIoTData();
    }, 0);
    const timer = setInterval(loadIoTData, 30000);
    return () => {
      clearTimeout(kick);
      clearInterval(timer);
    };
  }, [loadIoTData]);

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

  const MODES = [
    { id: "occupancy", label: "Occupancy", icon: "👥" },
    { id: "energy", label: "Energy", icon: "⚡" },
    { id: "temperature", label: "Temperature", icon: "🌡" },
    { id: "air_quality", label: "Air Quality", icon: "💨" },
    { id: "geometry_status", label: "Geometry", icon: "📐" },
  ];

  const totalBuildingsCount = (RIT_CAMPUS.BUILDINGS?.length || 0) + (RIT_CAMPUS.PERIPHERAL_BUILDINGS?.length || 0);

  return (
    <div className="relative w-full bg-gray-950" style={{ height: "100vh", minHeight: 600 }}>
      <div ref={mountRef} className="absolute inset-0" />

      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-950">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-blue-300 text-sm font-mono">Initialising RIT Geographic 3D Campus...</p>
        </div>
      )}

      {/* Header bar */}
      <div
        className="absolute top-0 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(to bottom, rgba(11,15,30,0.95), transparent)" }}
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="text-white font-bold text-base leading-tight">Rajalakshmi Institute of Technology</p>
            <button
              type="button"
              onClick={() => setShowProvenanceInfo(!showProvenanceInfo)}
              title="Click to view sensor telemetry provenance"
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                telemetrySource.includes("LIVE")
                  ? "bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  : "bg-blue-950 text-blue-300 border-blue-600"
              }`}
            >
              ● {telemetrySource} ℹ️
            </button>
          </div>
          <p className="text-blue-400 text-xs font-mono">
            13.0389°N 80.0449°E · WGS84 (EPSG:4326) · Kuthambakkam, Chennai
            {osmLoaded && <span className="ml-2 text-emerald-400 font-semibold">● Real OSM Geometry</span>}
            {satLoaded && <span className="ml-2 text-green-400">● Satellite</span>}
          </p>
        </div>

        <div className="flex gap-1.5 bg-black bg-opacity-60 backdrop-blur rounded-xl px-3 py-2 border border-gray-800">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                viewMode === mode.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {mode.icon} {mode.label}
            </button>
          ))}
          <button
            onClick={() => setShowGlossary(true)}
            type="button"
            title="Open Simulation Glossary & Guide"
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-600/50 hover:bg-blue-900 transition-all ml-1"
          >
            📖 Glossary
          </button>
          <button
            onClick={loadIoTData}
            type="button"
            title="Refresh IoT Telemetry"
            className="px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-all ml-1"
          >
            ⟳
          </button>
        </div>
      </div>

      {/* Floating Zoom & Camera Dock */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-1.5 bg-black/80 backdrop-blur border border-gray-800 p-1.5 rounded-xl shadow-xl">
        <button
          type="button"
          onClick={() => orbitControlsRef.current?.zoomIn?.()}
          title="Zoom In"
          className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-blue-600 text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => orbitControlsRef.current?.zoomOut?.()}
          title="Zoom Out"
          className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-blue-600 text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => orbitControlsRef.current?.resetView?.()}
          title="Reset Orbit View"
          className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-blue-600 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
        >
          ⊙
        </button>
      </div>

      {/* Gesture banner for touch */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-black/75 backdrop-blur border border-gray-800 rounded-full text-[11px] text-gray-300 font-medium pointer-events-none shadow-lg">
        📱 Pinch to zoom · 1 finger to rotate · 2 fingers to pan
      </div>

      {/* Telemetry provenance info modal */}
      {showProvenanceInfo && (
        <div className="absolute top-16 left-4 z-30 max-w-sm bg-gray-950 bg-opacity-95 border border-blue-500/50 backdrop-blur rounded-xl p-3.5 text-xs text-gray-200 shadow-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-blue-400 text-xs uppercase tracking-wider">Spatial Telemetry Provenance</span>
            <button type="button" onClick={() => setShowProvenanceInfo(false)} className="text-gray-400 hover:text-white font-bold text-sm ml-2">✕</button>
          </div>
          <p className="mb-2 leading-relaxed text-gray-300">
            <strong>Geospatial Foundation:</strong> All building footprints are derived from authoritative OpenStreetMap & Microsoft Building Footprints surveyed around <strong>13.0389° N, 80.0449° E</strong>.
          </p>
          <p className="mb-2 leading-relaxed text-gray-300">
            <strong>Operational Telemetry:</strong> Crowd density and room occupancy are calculated from <em>timetabled course enrollments & scheduled room capacities</em>, not physical GPS seat tracking.
          </p>
          <p className="leading-relaxed text-gray-300">
            When hardware IoT turnstiles or smart energy meters report data via the Ingestion Gateway (<code className="text-emerald-300 font-mono">/api/twin/iot/ingest</code>), the badge updates to <strong>LIVE IOT SENSOR STREAM</strong>.
          </p>
        </div>
      )}

      {/* Glossary Modal */}
      {showGlossary && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-blue-500/60 rounded-2xl max-w-md w-full p-5 text-gray-200 shadow-2xl space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="text-base font-bold text-blue-400">📖 Digital Twin & Simulation Glossary</h3>
              <button onClick={() => setShowGlossary(false)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-gray-950/70 p-2.5 rounded-lg border border-gray-800">
                <strong className="text-emerald-400 block mb-0.5">Geometry Status: VERIFIED</strong>
                <span>Footprint geometry extracted from OpenStreetMap/MS Footprints and verified against official RIT architectural block naming and campus layout.</span>
              </div>
              <div className="bg-gray-950/70 p-2.5 rounded-lg border border-gray-800">
                <strong className="text-amber-400 block mb-0.5">Geometry Status: APPROXIMATE</strong>
                <span>Polygonal footprint matches real geographic coordinates; vertical height is estimated from verified floor counts (4m per floor).</span>
              </div>
              <div className="bg-gray-950/70 p-2.5 rounded-lg border border-gray-800">
                <strong className="text-gray-400 block mb-0.5">Geometry Status: UNVERIFIED</strong>
                <span>Real mapped peripheral structure in OSM dataset whose specific academic or administrative purpose has not been formally verified.</span>
              </div>
              <div className="bg-gray-950/70 p-2.5 rounded-lg border border-gray-800">
                <strong className="text-cyan-400 block mb-0.5">Local Tangent Plane Projection</strong>
                <span>WGS84 ellipsoidal coordinates (EPSG:4326) projected to local metric Cartesian coordinates relative to campus origin (13.0389° N, 80.0449° E).</span>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button onClick={() => setShowGlossary(false)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer">
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Legend */}
      <div className="absolute top-24 right-4 z-10 bg-black bg-opacity-80 backdrop-blur rounded-xl p-3 text-xs border border-gray-800 shadow-xl min-w-[170px]">
        <p className="text-gray-400 uppercase tracking-widest text-[10px] mb-2 font-bold flex items-center justify-between">
          <span>{viewMode === "geometry_status" ? "Geometry Provenance" : "Telemetry Scale"}</span>
          <span className="text-blue-400 font-mono text-[9px]">EPSG:4326</span>
        </p>
        {viewMode === "geometry_status" ? (
          <>
            {[
              ["#10B981", "VERIFIED (Official RIT)"],
              ["#F59E0B", "APPROXIMATE (Extruded)"],
              ["#6B7280", "UNVERIFIED (Peripheral OSM)"],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center gap-2 mb-1.5">
                <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ background: color }} />
                <span className="text-gray-300 font-medium text-[11px]">{label}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            {[
              ["#00E676", "Normal / Low"],
              ["#FFEA00", "Moderate"],
              ["#FF5252", "High / Critical"],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center gap-2 mb-1.5">
                <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ background: color }} />
                <span className="text-gray-300 font-medium text-[11px]">{label}</span>
              </div>
            ))}
          </>
        )}
        <hr className="border-gray-800 my-2" />
        <div className="text-gray-400 text-[10px] space-y-0.5">
          <p>🖱️ Drag · Orbit around RIT</p>
          <p>📜 Scroll · Zoom campus</p>
          <p>👆 Click · Inspect building</p>
        </div>
        <hr className="border-gray-800 my-2" />
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>FPS: {stats.fps}</span>
          <span>Calls: {stats.drawCalls}</span>
        </div>
        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
          Triangles: ~{stats.trianglesK}k
        </div>
      </div>

      {/* Bottom status and attribution bar */}
      <div className="absolute bottom-4 right-4 z-10 text-right text-xs text-gray-400 font-mono bg-black/70 backdrop-blur px-3 py-2 rounded-xl border border-gray-800 shadow-lg">
        <p className="text-gray-200 font-semibold">{totalBuildingsCount} buildings rendered (10 official · {RIT_CAMPUS.PERIPHERAL_BUILDINGS?.length || 0} peripheral)</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Map data © OpenStreetMap contributors, ODbL 1.0</p>
        <p className="text-[10px] text-blue-400">EPSG:4326 WGS84 → Metric Local Tangent Plane</p>
      </div>

      {/* Selected Building Details Card */}
      {selected && (
        <div className="absolute bottom-4 left-4 z-20 w-84 max-w-[calc(100vw-32px)] bg-gray-900/95 backdrop-blur-md border border-blue-500/40 rounded-2xl p-4 shadow-2xl">
          <div className="flex justify-between items-start mb-1.5 pb-2 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">
                  {selected.code || selected.type || 'CAMPUS BLOCK'}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    selected.geometryStatus === 'VERIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                      : selected.geometryStatus === 'APPROXIMATE'
                      ? 'bg-amber-950 text-amber-300 border-amber-500'
                      : 'bg-gray-800 text-gray-300 border-gray-600'
                  }`}
                >
                  ● {selected.geometryStatus || 'UNVERIFIED'}
                </span>
              </div>
              <h3 className="text-white font-bold text-sm leading-snug mt-0.5">{selected.name}</h3>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-400 hover:text-white transition text-lg leading-none ml-2"
              type="button"
              aria-label="Close panel"
            >
              ×
            </button>
          </div>

          {/* Coordinates & Provenance Metadata */}
          <div className="text-[11px] font-mono bg-gray-950/70 p-2 rounded-lg border border-gray-800/80 mb-2 space-y-1">
            <div className="flex justify-between text-gray-400">
              <span>Coordinates:</span>
              <span className="text-blue-300">
                {selected.latitude ? `${selected.latitude.toFixed(5)}°N, ${selected.longitude.toFixed(5)}°E` : '13.0389°N, 80.0449°E'}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Geometry Source:</span>
              <span className="text-gray-200">{selected.geometrySource || 'OPENSTREETMAP_WGS84'}</span>
            </div>
            {selected.osmWayId && (
              <div className="flex justify-between text-gray-400">
                <span>OSM Way ID:</span>
                <a
                  href={`https://www.openstreetmap.org/way/${selected.osmWayId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  #{selected.osmWayId} ↗
                </a>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Height Source:</span>
              <span className="text-emerald-400">{selected.heightSource || 'ARCHITECTURAL_SURVEY'}</span>
            </div>
          </div>

          {selected.departments?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {selected.departments.slice(0, 4).map((department) => (
                <span key={department} className="px-2 py-0.5 bg-blue-950/80 text-blue-300 text-[10px] rounded-full border border-blue-800/50">
                  {department}
                </span>
              ))}
            </div>
          )}

          {/* Telemetry Section */}
          {selected.iotSensors && selected.iotSensors.length > 0 ? (
            <div className="space-y-2 mb-3">
              {selected.iotSensors.map((key) => {
                const sensor = formatSensor(key, (iotData[selected.id] || selected.iot)?.[key]);
                if (!sensor) return null;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-0.5">
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
          ) : (
            <div className="text-gray-400 text-xs italic bg-gray-950/60 p-2.5 rounded-lg border border-gray-800 mb-3">
              Peripheral campus structure. No active operational telemetry linked.
            </div>
          )}

          <div className="pt-2 border-t border-gray-800 flex justify-between text-[11px] text-gray-400 mb-3">
            <span>{selected.levels || selected.floors || 4} floors · {selected.height || selected.heightMeters || 16}m</span>
            <span className={selected.landmark ? "text-yellow-400 font-semibold" : ""}>{selected.landmark ? "⭐ Official Block" : "Peripheral Structure"}</span>
          </div>

          {/* Ask Copilot Button */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('rit-copilot-ask', {
                detail: {
                  query: `Tell me about ${selected.name} (${selected.code || selected.id}), its geometry status (${selected.geometryStatus}), height source, and operational data.`,
                  buildingId: selected.id
                }
              }));
            }}
            className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <span>🤖</span> Ask Copilot About This Building
          </button>
        </div>
      )}
    </div>
  );
}
