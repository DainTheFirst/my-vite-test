// Функции для расчетов геополигонов

/**
 * Рассчитывает площадь полигона в гектарах по координатам [широта, долгота]
 * Используется формула гаусса (площадь многоугольника в градусах с преобразованием в гектары)
 * @param {Array} coordinates - Массив координат [lat, lng]
 * @returns {number} Площадь в гектарах
 */
export function calculatePolygonArea(coordinates) {
  if (!coordinates || coordinates.length < 3) {
    return 0;
  }

  let area = 0;
  const n = coordinates.length;

  // Преобразуем координаты в радианы и считаем площадь в квадратных градусах
  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = coordinates[i];
    const [lat2, lng2] = coordinates[(i + 1) % n];

    // Используем формулу гаусса для сферических координат
    area += (lng1 * lat2 - lng2 * lat1);
  }

  area = Math.abs(area) / 2;

  // Приблизительное преобразование в гектары (для средних широт)
  // 1 градус широты ≈ 111 км, 1 градус долготы ≈ 111 км * cos(lat)
  // Поэтому 1 квадратный градус ≈ 111 * 111 * cos(lat) км²
  // Для Московской области (55° широты) cos(55°) ≈ 0.5736
  const latRad = (coordinates[0][0] * Math.PI) / 180;
  const km2PerDegree2 = 111 * 111 * Math.cos(latRad);
  const areaKm2 = area * km2PerDegree2;
  const areaHectares = areaKm2 * 100; // 1 км² = 100 га

  return Math.round(areaHectares * 100) / 100; // Округляем до 2 знаков
}

/**
 * Рассчитывает центр полигона
 * @param {Array} coordinates - Массив координат [lat, lng]
 * @returns {Array} Координаты центра [lat, lng]
 */
export function calculateCenter(coordinates) { // ← УБЕДИТЕСЬ ЧТО ЕСТЬ export
  if (!coordinates || coordinates.length === 0) {
    return [55.7558, 37.6173]; // Москва по умолчанию
  }

  let sumLat = 0;
  let sumLng = 0;

  for (const [lat, lng] of coordinates) {
    sumLat += lat;
    sumLng += lng;
  }

  return [sumLat / coordinates.length, sumLng / coordinates.length];
}