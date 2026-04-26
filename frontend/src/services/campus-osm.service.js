const RIT_BBOX = {
  south: 13.0365,
  west: 80.0435,
  north: 13.04,
  east: 80.0475,
};

export async function fetchOSMBuildings() {
  const query = `
    [out:json][timeout:25];
    (
      way["building"](${RIT_BBOX.south},${RIT_BBOX.west},${RIT_BBOX.north},${RIT_BBOX.east});
      relation["building"](${RIT_BBOX.south},${RIT_BBOX.west},${RIT_BBOX.north},${RIT_BBOX.east});
    );
    out body geom;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    });
    const data = await res.json();

    const centerLat = 13.0382427;
    const centerLng = 80.0453935;
    const latToM = 111320;
    const lngToM = 111320 * Math.cos((centerLat * Math.PI) / 180);

    return (data.elements || [])
      .filter((el) => el.type === "way" && el.geometry?.length > 2)
      .map((el) => ({
        osmId: el.id,
        name: el.tags?.name || el.tags?.["addr:housename"] || null,
        buildingType: el.tags?.building || "yes",
        levels: Number.parseInt(el.tags?.["building:levels"] || "2", 10),
        footprint: el.geometry.map((node) => [
          (node.lon - centerLng) * lngToM,
          (node.lat - centerLat) * latToM,
        ]),
      }));
  } catch (error) {
    console.warn("OSM fetch failed, using config buildings:", error);
    return [];
  }
}
