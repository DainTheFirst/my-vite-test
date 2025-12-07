import { getYandexMapsUrl } from '../config';

let loadingPromise = null;
let isInitialized = false;

/**
 * Загрузчик Яндекс.Карт с обработкой ошибок и предотвращением дублирования
 */
export const ymapLoader = () => {
  // Если Яндекс.Карты уже загружены и проинициализированы
  if (window.ymaps && isInitialized) {
    return Promise.resolve(window.ymaps);
  }

  // Если уже есть промис загрузки, возвращаем его
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    // Если Яндекс.Карты уже загружены, но не отмечены как инициализированные
    if (window.ymaps) {
      window.ymaps.ready(() => {
        console.log('Yandex Maps API already loaded, reusing');
        isInitialized = true;
        resolve(window.ymaps);
      });
      return;
    }

    // Создаем script для загрузки карт
    const script = document.createElement('script');
    script.src = getYandexMapsUrl();
    script.async = true;

    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error('Яндекс.Карты не загрузились'));
        return;
      }
      
      window.ymaps.ready(() => {
        console.log('Yandex Maps API loaded successfully');
        isInitialized = true;
        resolve(window.ymaps);
      });
    };

    script.onerror = (error) => {
      console.error('Failed to load Yandex Maps:', error);
      reject(new Error(`Ошибка загрузки Яндекс.Карт: ${error.message}`));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
};

/**
 * Проверка доступности Яндекс.Карт
 */
export const isYmapsLoaded = () => {
  return !!window.ymaps && isInitialized;
};

/**
 * Сброс состояния загрузчика (для тестирования)
 */
export const resetYmapLoader = () => {
  loadingPromise = null;
  isInitialized = false;
};