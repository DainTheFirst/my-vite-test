// Конфигурация приложения АгроАвиаТех
export const config = {
  // Ключи API Яндекс.Карт
  yandexMaps: {
    apiKey: 'ed1cff79-4634-459f-9ef4-c7903e8492cd',
    lang: 'ru_RU',
    version: '2.1'
  },
  
  // Настройки приложения
  app: {
    name: 'АгроАвиаТех',
    version: '1.0.0',
    defaultMapCenter: [55.7558, 37.6173], // Москва
    defaultZoom: 10
  },
  
  // Настройки карты
  map: {
    controls: ['zoomControl', 'fullscreenControl'],
    polygonColors: {
      default: '#FFFF00',
      processed: '#00FF00',
      pending: '#FF0000',
      drawing: '#00FF00'
    }
  },
  
  // Настройки уведомлений
  notifications: {
    duration: 5000,
    types: {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'error'
    }
  }
};

// URL для загрузки Яндекс.Карт
export const getYandexMapsUrl = () => {
  return `https://api-maps.yandex.ru/${config.yandexMaps.version}/?apikey=${config.yandexMaps.apiKey}&lang=${config.yandexMaps.lang}`;
};

// Экспорт по умолчанию для удобства
export default config;