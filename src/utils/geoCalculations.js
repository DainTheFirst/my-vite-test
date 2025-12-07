// Функции для расчетов геополигонов

export function calculatePolygonArea(coordinates) {
  if (!coordinates || coordinates.length < 3) {
    return 0;
  }

  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = coordinates[i];
    const [lat2, lng2] = coordinates[(i + 1) % n];
    area += (lng1 * lat2 - lng2 * lat1);
  }

  area = Math.abs(area) / 2;

  const latRad = (coordinates[0][0] * Math.PI) / 180;
  const km2PerDegree2 = 111 * 111 * Math.cos(latRad);
  const areaKm2 = area * km2PerDegree2;
  const areaHectares = areaKm2 * 100;

  return Math.round(areaHectares * 100) / 100;
}

export function calculateCenter(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    return [55.7558, 37.6173];
  }

  let sumLat = 0;
  let sumLng = 0;

  for (const [lat, lng] of coordinates) {
    sumLat += lat;
    sumLng += lng;
  }

  return [sumLat / coordinates.length, sumLng / coordinates.length];
}