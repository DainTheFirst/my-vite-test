// Утилиты для работы с хранилищем и данными

/**
 * Генерирует уникальный ID
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Рассчитывает статистику по полям и заявкам
 * @param {Array} fields - Массив полей
 * @param {Array} orders - Массив заявок
 * @param {string} customerId - ID заказчика
 * @returns {Object} Статистика
 */
export function calculateStats(fields, orders, customerId) {
  const customerFields = fields.filter(field => field.customerId === customerId);
  const customerOrders = orders.filter(order => order.customerId === customerId);

  const totalArea = customerFields.reduce((sum, field) => sum + (field.area || 0), 0);
  const activeOrders = customerOrders.filter(order => 
    order.status === 'в работе' || order.status === 'ожидает подтверждения'
  ).length;

  return {
    totalFields: customerFields.length,
    totalArea,
    totalOrders: customerOrders.length,
    activeOrders
  };
}

/**
 * Экспортирует данные в JSON файл
 * @param {Object} data - Данные для экспорта
 * @param {string} filename - Имя файла
 */
export function exportData(data, filename) {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename;
  link.click();
}

/**
 * Импортирует данные из JSON файла
 * @param {File} file - Файл для импорта
 * @param {Function} callback - Колбек с импортированными данными
 */
export function importData(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      callback(data);
    } catch (error) {
      console.error('Ошибка при импорте данных:', error);
      alert('Ошибка при чтении файла. Убедитесь, что файл корректен.');
    }
  };
  reader.readAsText(file);
}

/**
 * Сохраняет данные в localStorage
 * @param {string} key - Ключ для сохранения
 * @param {any} data - Данные для сохранения
 * @returns {boolean} Успешно ли сохранение
 */
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения в localStorage:', error);
    return false;
  }
}

/**
 * Загружает данные из localStorage
 * @param {string} key - Ключ для загрузки
 * @returns {any|null} Данные или null при ошибке
 */
export function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Ошибка загрузки из localStorage:', error);
    return null;
  }
}

/**
 * Рассчитывает статистику по авиакомпании
 * @param {Array} orders - Массив заявок
 * @param {Object} operator - Авиакомпания
 * @returns {Object} Статистика
 */
export function calculateOperatorStats(orders, operator) {
  const operatorOrders = (orders || []).filter(order => order.operatorId === operator.id);
  const completedOrders = operatorOrders.filter(order => order.status === 'выполнено').length;
  
  // Подсчет общего количества ВС и суммарных характеристик
  const totalAircraft = operator?.aircrafts?.reduce((sum, ac) => sum + (ac.count || 1), 0) || 0;
  const aircraftTypes = operator?.aircrafts?.length || 0;
  
  return {
    totalOrders: operatorOrders.length,
    completedOrders: completedOrders,
    activeOrders: operatorOrders.filter(order => order.status === 'в работе').length,
    totalAircraft: totalAircraft,
    aircraftTypes: aircraftTypes
  };
}

/**
 * Расчет эффективности ВС
 * @param {Object} aircraft - Воздушное судно
 * @returns {number} Показатель эффективности
 */
export function calculateAircraftEfficiency(aircraft) {
  if (!aircraft) return 0;
  // Простая формула эффективности: (скорость * ширина) / стоимость часа
  const speed = parseFloat(aircraft.speed) || 0;
  const width = parseFloat(aircraft.spreadWidth) || 0;
  const cost = parseFloat(aircraft.hourCost) || 1;
  
  return cost > 0 ? (speed * width) / cost : 0;
}