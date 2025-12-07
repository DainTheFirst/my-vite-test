import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Импорты конфигурации и утилит
import config from './config';
import { ymapLoader, isYmapsLoaded } from './utils/ymapLoader';

// Импорты данных
import { initialMockFields, mockOperators, initialCustomers, initialOrders } from './data/mockData';

// Импорты хуков хранилища
import { 
  useFieldsStorage, 
  useOrdersStorage, 
  useOperatorsStorage, 
  useCustomersStorage 
} from './hooks/useLocalStorage';

// Импорты утилит
import { calculatePolygonArea, calculateCenter } from "./utils/geoCalculations";
import { generateId } from './utils/storageHelpers';

// Компоненты
import QuickStartPanel from "./components/QuickStartPanel.jsx";
import CompactAddFieldForm from "./components/CompactAddFieldForm.jsx";
import OperatorsManagement from "./components/OperatorsManagement.jsx";
import CustomersManagement from "./components/CustomersManagement.jsx";
import OrdersManagement from "./components/OrdersManagement.jsx";

function App() {
  // ========== СОСТОЯНИЯ ХРАНЕНИЯ ==========
  const [fields, setFields] = useFieldsStorage();
  const [orders, setOrders] = useOrdersStorage();
  const [operators, setOperators] = useOperatorsStorage();
  const [customers, setCustomers] = useCustomersStorage();

  // ========== СОСТОЯНИЯ ИНТЕРФЕЙСА ==========
  const [selectedCustomer, setSelectedCustomer] = useState('customer_1');
  const [drawingMode, setDrawingMode] = useState(false);
  const [newFieldPolygon, setNewFieldPolygon] = useState([]);
  const [manualCoords, setManualCoords] = useState('');
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [logoError, setLogoError] = useState(false);
  const [selectedFieldForOverview, setSelectedFieldForOverview] = useState(null);
  const [showOperatorsManagement, setShowOperatorsManagement] = useState(false);
  const [showCustomersManagement, setShowCustomersManagement] = useState(false);
  const [showOrdersManagement, setShowOrdersManagement] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [ymaps, setYmaps] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [mouseCoords, setMouseCoords] = useState(null);

  // Форма поля
  const [fieldFormData, setFieldFormData] = useState({
    name: '',
    crop: 'пшеница',
    area: 0,
    price: 1000,
    region: 'Московская область',
    owner: '',
    customerId: selectedCustomer,
    processingDate: new Date().toISOString().split('T')[0],
    status: 'ожидает'
  });

  // ========== РЕФЫ ==========
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const polygonRef = useRef(null);
  const fieldPolygons = useRef(new Map());
  const mapInitialized = useRef(false);
  const drawingModeRef = useRef(false);
  const newFieldPolygonRef = useRef([]);
  const eventListeners = useRef({ click: null, dblclick: null, mousemove: null });
  const temporaryObjects = useRef([]);

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 3000);
  }, []);

  const getCurrentCustomer = useCallback(() => {
    return customers.find(c => c.id === selectedCustomer) || customers[0];
  }, [customers, selectedCustomer]);

  const getCustomerFields = useCallback(() => {
    return fields.filter(field => field.customerId === selectedCustomer);
  }, [fields, selectedCustomer]);

  const getCustomerOrders = useCallback(() => {
    return orders.filter(order => order.customerId === selectedCustomer);
  }, [orders, selectedCustomer]);

  // ========== УПРАВЛЕНИЕ УВЕДОМЛЕНИЯМИ ==========
  const Notifications = ({ notifications }) => (
    <div className="notifications">
      {notifications.map(notif => (
        <div key={notif.id} className={`notification notification-${notif.type}`}>
          {notif.message}
        </div>
      ))}
    </div>
  );

  // ========== HEADER КОМПОНЕНТ ==========
  const Header = ({ logoError, setLogoError, debugMode, toggleDebugMode }) => (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-center">
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="АгроАвиаТех" 
                className="logo-image"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="logo-fallback">
                <div className="logo-text">АгроАвиаТех</div>
                <div className="logo-subtitle">Цифровая платформа для авиахимработ</div>
              </div>
            )}
          </div>
          <button 
            onClick={toggleDebugMode}
            className={`btn btn-sm ${debugMode ? 'btn-warning' : 'btn-outline'}`}
            style={{ position: 'absolute', right: '20px', top: '20px' }}
          >
            {debugMode ? '🔴 Отладка ВКЛ' : '🐛 Отладка'}
          </button>
        </div>
      </div>
    </header>
  );

  // ========== ФУНКЦИИ ДЛЯ КАРТЫ ==========
  const addFieldToMap = useCallback((field) => {
    if (!ymaps || !mapInstance.current || !field.coordinates || field.coordinates.length < 3) {
      return;
    }

    try {
      if (fieldPolygons.current.has(field.id)) {
        const oldPolygon = fieldPolygons.current.get(field.id);
        mapInstance.current.geoObjects.remove(oldPolygon);
        fieldPolygons.current.delete(field.id);
      }

      const polygonColor = config.map.polygonColors[field.status] || config.map.polygonColors.default;

      const polygon = new ymaps.Polygon([field.coordinates], {
        hintContent: field.name,
        balloonContent: `
          <div>
            <h3>${field.name}</h3>
            <p>Площадь: ${field.area} га</p>
            <p>Культура: ${field.crop}</p>
            <p>Статус: ${field.status}</p>
          </div>
        `
      }, {
        fillColor: polygonColor,
        strokeColor: '#0000FF',
        opacity: 0.8,
        strokeWidth: 3,
        fillOpacity: 0.4
      });
      
      polygon.events.add('click', (e) => {
        e.stopPropagation();
        handleSelectFieldForOverview(field);
      });
      
      mapInstance.current.geoObjects.add(polygon);
      fieldPolygons.current.set(field.id, polygon);
      
    } catch (error) {
      console.error('Error adding field to map:', error);
    }
  }, [ymaps]);

  const redrawAllFields = useCallback(() => {
    if (!ymaps || !mapInstance.current) return;

    mapInstance.current.geoObjects.removeAll();
    fieldPolygons.current.clear();
    
    fields.forEach(field => {
      if (field.coordinates && field.coordinates.length >= 3) {
        addFieldToMap(field);
      }
    });
  }, [fields, ymaps, addFieldToMap]);

  // ========== ФУНКЦИИ УПРАВЛЕНИЯ ПОЛЯМИ ==========
  const handleSelectFieldForOverview = useCallback((field) => {
    setSelectedFieldForOverview(field);
  }, []);

  const handleEditField = useCallback((field) => {
  console.log('Начинаем редактирование поля:', field);
  
  // Получаем АКТУАЛЬНЫЕ данные поля из текущего состояния fields
  const currentField = fields.find(f => f.id === field.id);
  
  if (!currentField) {
    console.error('Поле не найдено в списке полей');
    addNotification('Ошибка: поле не найдено', 'error');
    return;
  }
  
  setEditingField(currentField);
  setFieldFormData({
    name: currentField.name || '',
    crop: currentField.crop || 'пшеница',
    area: currentField.area || 0,
    price: currentField.price || 1000,
    region: currentField.region || 'Московская область',
    owner: currentField.owner || '',
    customerId: currentField.customerId || selectedCustomer,
    processingDate: currentField.processingDate || new Date().toISOString().split('T')[0],
    status: currentField.status || 'ожидает'
  });
  
  setShowAddFieldForm(true);
  setDrawingMode(false);
  
  // Отладка
  console.log('Актуальные данные поля:', {
    id: currentField.id,
    name: currentField.name,
    region: currentField.region,
    owner: currentField.owner
  });
  console.log('Данные формы установлены:', {
    name: currentField.name || '',
    region: currentField.region || 'Московская область',
    owner: currentField.owner || ''
  });
}, [fields, selectedCustomer, addNotification]);

  const handleDeleteField = useCallback((fieldId) => {
    if (window.confirm('Вы уверены, что хотите удалить это поле?')) {
      setFields(prev => prev.filter(field => field.id !== fieldId));
      addNotification('Поле успешно удалено', 'success');
      
      if (selectedFieldForOverview && selectedFieldForOverview.id === fieldId) {
        setSelectedFieldForOverview(null);
      }
      
      setTimeout(() => redrawAllFields(), 100);
    }
  }, [setFields, addNotification, selectedFieldForOverview, redrawAllFields]);

const handleUpdateField = useCallback(() => {
  if (!editingField) {
    console.error('Нет поля для редактирования');
    addNotification('Ошибка: поле не выбрано для редактирования', 'error');
    return;
  }

  console.log('=== СОХРАНЕНИЕ ИЗМЕНЕНИЙ ДЛЯ ПОЛЯ ===');
  console.log('ID поля:', editingField.id);
  console.log('Данные из формы:', fieldFormData);
  console.log('Старое поле:', {
    id: editingField.id,
    name: editingField.name,
    region: editingField.region,
    owner: editingField.owner,
    crop: editingField.crop,
    price: editingField.price,
    status: editingField.status
  });

  // ВАЖНО: ЯВНО создаем новый объект со ВСЕМИ данными
  const updatedField = {
    // Геоданные и идентификаторы из старого поля
    id: editingField.id,
    coordinates: editingField.coordinates || [],
    center: editingField.center,
    createdAt: editingField.createdAt,
    
    // ВСЕ данные из формы (важно: не используем spread оператор на editingField!)
    name: fieldFormData.name,
    crop: fieldFormData.crop,
    area: Number(fieldFormData.area),
    price: Number(fieldFormData.price),
    region: fieldFormData.region,
    owner: fieldFormData.owner,
    customerId: fieldFormData.customerId || editingField.customerId,
    processingDate: fieldFormData.processingDate,
    status: fieldFormData.status,
    
    // Метаданные
    updatedAt: new Date().toISOString()
  };

  console.log('Обновленное поле будет:', {
    id: updatedField.id,
    name: updatedField.name,
    region: updatedField.region,
    owner: updatedField.owner,
    crop: updatedField.crop,
    price: updatedField.price,
    status: updatedField.status
  });

  // ОБНОВЛЯЕМ ПОЛЯ - используем функциональное обновление для гарантии
  setFields(prevFields => {
    console.log('Предыдущие поля:', prevFields.map(f => ({ id: f.id, name: f.name, region: f.region })));
    
    const newFields = prevFields.map(field => {
      if (field.id === editingField.id) {
        console.log('Найдено поле для обновления:', field.id);
        console.log('Заменяем на:', updatedField);
        return updatedField;
      }
      return field;
    });
    
    // Проверяем результат
    const savedField = newFields.find(f => f.id === editingField.id);
    console.log('Сохраненное поле после обновления:', {
      id: savedField?.id,
      name: savedField?.name,
      region: savedField?.region,
      owner: savedField?.owner,
      crop: savedField?.crop,
      price: savedField?.price,
      status: savedField?.status
    });
    
    return newFields;
  });
// Обновляем selectedFieldForOverview сразу после обновления fields
    if (selectedFieldForOverview && selectedFieldForOverview.id === editingField.id) {
      setSelectedFieldForOverview(updatedField);
    }
  // ОБНОВЛЯЕМ selectedFieldForOverview, если оно указывает на это поле
  setSelectedFieldForOverview(prev => 
    prev && prev.id === editingField.id ? updatedField : prev
  );

  // Проверяем localStorage сразу после обновления
  setTimeout(() => {
    const storedFields = JSON.parse(localStorage.getItem('agroaviatech-fields') || '[]');
    const storedField = storedFields.find(f => f.id === editingField.id);
    console.log('Поле в localStorage после обновления:', {
      id: storedField?.id,
      name: storedField?.name,
      region: storedField?.region,
      owner: storedField?.owner
    });
  }, 100);

  addNotification(`✅ Поле "${updatedField.name}" успешно обновлено`, 'success');
  
  // Закрываем форму редактирования и сбрасываем состояние
  setEditingField(null);
  setShowAddFieldForm(false);
  
  // Сбрасываем форму
  setFieldFormData({
    name: `Поле №${fields.length + 1}`,
    crop: 'пшеница',
    area: 0,
    price: 1000,
    region: 'Московская область',
    owner: '',
    customerId: selectedCustomer,
    processingDate: new Date().toISOString().split('T')[0],
    status: 'ожидает'
  });

  // Обновляем карту
  setTimeout(() => redrawAllFields(), 100);
}, [editingField, fieldFormData, setFields, addNotification, selectedCustomer, redrawAllFields, fields.length]);

// В App.jsx добавьте эту функцию
const testStorage = useCallback(() => {
  console.log('=== ТЕСТ ХРАНИЛИЩА ===');
  
  // 1. Проверяем текущее состояние
  console.log('Текущее состояние fields:', fields.length, 'полей');
  
  // 2. Проверяем localStorage
  const storedFields = JSON.parse(localStorage.getItem('agroaviatech-fields') || '[]');
  console.log('Данные в localStorage:', storedFields.length, 'полей');
  
  // 3. Сравниваем
  if (fields.length !== storedFields.length) {
    console.error('РАСХОЖДЕНИЕ: разное количество полей!');
  }
  
  // 4. Проверяем конкретное поле
  if (editingField) {
    const storedField = storedFields.find(f => f.id === editingField.id);
    console.log('Редактируемое поле в localStorage:', storedField);
  }
  
  addNotification('Тест хранилища выполнен', 'info');
}, [fields, editingField, addNotification]);

// Добавьте кнопку в debugMode
{debugMode && (
  <button onClick={testStorage} className="debug-btn" style={{marginTop: '10px'}}>
    🗄️ Тест хранилища
  </button>
)}


  // ========== ФУНКЦИИ РИСОВАНИЯ ПОЛЕЙ ==========
  const clearTemporaryObjects = useCallback(() => {
    if (!ymaps || !mapInstance.current) return;
    
    temporaryObjects.current.forEach(obj => {
      mapInstance.current.geoObjects.remove(obj);
    });
    temporaryObjects.current = [];
    
    if (polygonRef.current) {
      mapInstance.current.geoObjects.remove(polygonRef.current);
      polygonRef.current = null;
    }
  }, [ymaps]);

  const updateTemporaryPolygon = useCallback((coordinates) => {
    if (!ymaps || !mapInstance.current) return;

    clearTemporaryObjects();
    if (coordinates.length === 0) return;

    coordinates.forEach((coord, index) => {
      const point = new ymaps.Placemark(coord, {
        hintContent: `Точка ${index + 1}`
      }, {
        preset: 'islands#redCircleIcon',
        iconColor: 'rgba(255, 0, 0, 0)',
        iconStrokeColor: '#FF0000',
        iconStrokeWidth: 2,
        iconLayout: 'default#image',
        iconImageSize: [12, 12],
        iconImageOffset: [-6, -6],
        draggable: false,
        zIndex: 1000
      });
      mapInstance.current.geoObjects.add(point);
      temporaryObjects.current.push(point);
    });

    if (coordinates.length >= 3) {
      const polygonCoords = [...coordinates, coordinates[0]];
      const temporaryPolygon = new ymaps.Polygon([polygonCoords], {}, {
        fillColor: config.map.polygonColors.drawing,
        strokeColor: '#0000FF',
        opacity: 0.8,
        strokeWidth: 3,
        fillOpacity: 0.3,
        strokeStyle: 'shortdash'
      });

      polygonRef.current = temporaryPolygon;
      mapInstance.current.geoObjects.add(temporaryPolygon);
      temporaryObjects.current.push(temporaryPolygon);
    }
    
    if (coordinates.length >= 2) {
      for (let i = 0; i < coordinates.length - 1; i++) {
        const line = new ymaps.Polyline([coordinates[i], coordinates[i + 1]], {}, {
          strokeColor: '#0000FF',
          strokeWidth: 2,
          strokeOpacity: 0.5
        });
        mapInstance.current.geoObjects.add(line);
        temporaryObjects.current.push(line);
      }
    }
  }, [ymaps, clearTemporaryObjects]);

  const handleMapClick = useCallback((e) => {
    if (!drawingModeRef.current) return;

    const coords = e.get('coords');
    const newPolygon = [...newFieldPolygonRef.current, coords];
    newFieldPolygonRef.current = newPolygon;
    setNewFieldPolygon(newPolygon);
    
    if (newPolygon.length >= 3) {
      const area = calculatePolygonArea(newPolygon);
      setFieldFormData(formData => ({ ...formData, area }));
    }
  }, []);

  const handleMapDoubleClick = useCallback((e) => {
    if (!drawingModeRef.current) return;

    const pointsCount = newFieldPolygonRef.current.length;
    if (pointsCount >= 3) {
      addNotification(`Рисование завершено. Создано ${pointsCount} точек.`, 'success');
      setDrawingMode(false);
    } else {
      addNotification('Полигон должен содержать минимум 3 точки', 'warning');
    }
  }, [addNotification]);

  const setupEventListeners = useCallback(() => {
    if (!mapInstance.current) return;
    
    // Удаляем старые слушатели
    Object.entries(eventListeners.current).forEach(([event, listener]) => {
      if (listener) {
        mapInstance.current.events.remove(listener);
      }
    });
    
    // Добавляем новые
    eventListeners.current.click = mapInstance.current.events.add('click', handleMapClick);
    eventListeners.current.dblclick = mapInstance.current.events.add('dblclick', handleMapDoubleClick);
  }, [handleMapClick, handleMapDoubleClick]);

  const startSimpleDrawing = useCallback(() => {
    if (!ymaps || !mapInstance.current) {
      addNotification('Карта не готова для рисования', 'error');
      return;
    }

    drawingModeRef.current = true;
    newFieldPolygonRef.current = [];
    setDrawingMode(true);
    setShowAddFieldForm(true);
    setNewFieldPolygon([]);
    setEditingField(null);
    
    clearTemporaryObjects();
    setupEventListeners();
    addNotification('Режим рисования активирован. Кликайте на карту для добавления точек полигона.', 'info');
  }, [ymaps, clearTemporaryObjects, setupEventListeners, addNotification]);

  const stopDrawing = useCallback(() => {
    drawingModeRef.current = false;
    setDrawingMode(false);
    
    // Удаляем слушатели событий
    if (mapInstance.current) {
      Object.entries(eventListeners.current).forEach(([event, listener]) => {
        if (listener) {
          mapInstance.current.events.remove(listener);
          eventListeners.current[event] = null;
        }
      });
    }

    if (newFieldPolygonRef.current.length < 3) {
      clearTemporaryObjects();
      setNewFieldPolygon([]);
      newFieldPolygonRef.current = [];
      addNotification('Рисование отменено. Недостаточно точек для полигона.', 'info');
    }
  }, [addNotification, clearTemporaryObjects]);

  // ========== ФУНКЦИИ СОЗДАНИЯ ПОЛЯ ==========
  const createDemoPolygon = useCallback(() => {
    const demoCoords = [
      [55.7558, 37.6173],
      [55.7500, 37.6200],
      [55.7450, 37.6150]
    ];
    
    newFieldPolygonRef.current = demoCoords;
    setNewFieldPolygon(demoCoords);
    const area = calculatePolygonArea([...demoCoords, demoCoords[0]]);
    setFieldFormData(prev => ({ ...prev, area }));
    
    if (ymaps && mapInstance.current) {
      updateTemporaryPolygon(demoCoords);
    }
    
    addNotification(`Создан демо-полигон. Площадь: ${area.toFixed(2)} га`, 'success');
  }, [ymaps, addNotification, updateTemporaryPolygon]);

  const handleManualCoordsSubmit = useCallback(() => {
    if (!manualCoords.trim()) {
      addNotification('Введите координаты', 'error');
      return;
    }

    try {
      const coords = manualCoords.split(';').map(pair => {
        const [lat, lng] = pair.split(',').map(coord => parseFloat(coord.trim()));
        if (isNaN(lat) || isNaN(lng)) {
          throw new Error('Неверный формат координат');
        }
        return [lat, lng];
      });

      if (coords.length < 3) {
        addNotification('Полигон должен содержать минимум 3 точки', 'error');
        return;
      }

      newFieldPolygonRef.current = coords;
      setNewFieldPolygon(coords);
      const area = calculatePolygonArea([...coords, coords[0]]);
      setFieldFormData(prev => ({ ...prev, area }));
      
      if (ymaps && mapInstance.current) {
        updateTemporaryPolygon(coords);
      }

      addNotification(`Полигон создан по координатам. Точек: ${coords.length}, Площадь: ${area.toFixed(2)} га`, 'success');
    } catch (error) {
      addNotification('Ошибка в формате координат. Используйте: 55.7558,37.6173; 55.7500,37.6200; 55.7450,37.6150', 'error');
    }
  }, [manualCoords, ymaps, addNotification, updateTemporaryPolygon]);

const createField = useCallback(() => {
  if (newFieldPolygonRef.current.length < 3) {
    addNotification('Создайте полигон на карте или введите координаты', 'error');
    return;
  }

  let finalCoordinates = newFieldPolygonRef.current;
  if (newFieldPolygonRef.current[0][0] !== newFieldPolygonRef.current[newFieldPolygonRef.current.length-1][0] || 
      newFieldPolygonRef.current[0][1] !== newFieldPolygonRef.current[newFieldPolygonRef.current.length-1][1]) {
    finalCoordinates = [...newFieldPolygonRef.current, newFieldPolygonRef.current[0]];
  }

  const center = calculateCenter(finalCoordinates);
  const area = calculatePolygonArea(finalCoordinates);
  
  // ЯВНО создаем новое поле
  const newField = {
    id: generateId(),
    name: fieldFormData.name,
    crop: fieldFormData.crop,
    area: area,
    price: Number(fieldFormData.price),
    region: fieldFormData.region,
    owner: fieldFormData.owner,
    customerId: fieldFormData.customerId || selectedCustomer,
    processingDate: fieldFormData.processingDate,
    status: fieldFormData.status,
    coordinates: finalCoordinates,
    center: center,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('Создаю новое поле:', newField);

  setFields(prev => [...prev, newField]);
  addNotification(`Поле "${newField.name}" успешно создано!`, 'success');
  
  // Сбрасываем состояние
  newFieldPolygonRef.current = [];
  setNewFieldPolygon([]);
  setManualCoords('');
  setDrawingMode(false);
  setShowAddFieldForm(false);
  
  clearTemporaryObjects();
  
  if (mapInstance.current) {
    Object.entries(eventListeners.current).forEach(([event, listener]) => {
      if (listener) {
        mapInstance.current.events.remove(listener);
        eventListeners.current[event] = null;
      }
    });
  }
  
  setTimeout(() => redrawAllFields(), 100);
  
  // Сбрасываем форму
  setFieldFormData({
    name: `Поле №${fields.length + 2}`,
    crop: 'пшеница',
    area: 0,
    price: 1000,
    region: 'Московская область',
    owner: '',
    customerId: selectedCustomer,
    processingDate: new Date().toISOString().split('T')[0],
    status: 'ожидает'
  });
}, [fieldFormData, setFields, addNotification, redrawAllFields, clearTemporaryObjects, selectedCustomer, fields.length]);

const checkAllFields = useCallback(() => {
  console.log('=== ВСЕ ПОЛЯ В БАЗЕ ===');
  fields.forEach((field, index) => {
    console.log(`Поле ${index + 1}:`, {
      id: field.id,
      name: field.name,
      region: field.region,
      owner: field.owner,
      crop: field.crop,
      area: field.area
    });
  });
  
  addNotification('Все поля выведены в консоль', 'info');
}, [fields]);

// Добавьте в debugMode панель:
{debugMode && (
  <button onClick={checkAllFields} className="debug-btn" style={{marginTop: '10px'}}>
    📋 Проверить все поля
  </button>
)}

  // ========== ДРУГИЕ ФУНКЦИИ ==========
  const handleShowOnMap = useCallback((field) => {
    if (!ymaps || !mapInstance.current) {
      addNotification('Карта не готова', 'error');
      return;
    }

    try {
      const center = calculateCenter(field.coordinates);
      mapInstance.current.setCenter(center);
      
      const currentZoom = mapInstance.current.getZoom();
      mapInstance.current.setZoom(currentZoom + 2, { duration: 500 });
      
      if (fieldPolygons.current.has(field.id)) {
        const polygon = fieldPolygons.current.get(field.id);
        polygon.options.set({
          strokeWidth: 5,
          strokeColor: '#FF0000'
        });
        
        setTimeout(() => {
          if (fieldPolygons.current.has(field.id)) {
            const polygon = fieldPolygons.current.get(field.id);
            polygon.options.set({
              strokeWidth: 3,
              strokeColor: '#0000FF'
            });
          }
        }, 3000);
      }
      
      addNotification(`Карта центрирована на поле "${field.name}"`, 'info');
    } catch (error) {
      console.error('Error showing field on map:', error);
      addNotification('Ошибка при отображении поля на карте', 'error');
    }
  }, [ymaps, addNotification]);

  const handleShowAllFieldsOnMap = useCallback(() => {
    if (!ymaps || !mapInstance.current) {
      addNotification('Карта не готова', 'error');
      return;
    }

    const customerFields = getCustomerFields();
    if (customerFields.length === 0) {
      addNotification('Нет полей для отображения', 'warning');
      return;
    }

    try {
      const allCoordinates = [];
      customerFields.forEach(field => {
        if (field.coordinates && field.coordinates.length > 0) {
          allCoordinates.push(...field.coordinates);
        }
      });

      if (allCoordinates.length === 0) {
        addNotification('У полей нет координат для отображения', 'warning');
        return;
      }

      let minLat = allCoordinates[0][0];
      let maxLat = allCoordinates[0][0];
      let minLng = allCoordinates[0][1];
      let maxLng = allCoordinates[0][1];
      
      allCoordinates.forEach(coord => {
        minLat = Math.min(minLat, coord[0]);
        maxLat = Math.max(maxLat, coord[0]);
        minLng = Math.min(minLng, coord[1]);
        maxLng = Math.max(maxLng, coord[1]);
      });
      
      const bounds = [[minLat, minLng], [maxLat, maxLng]];
      
      mapInstance.current.setBounds(bounds, {
        checkZoomRange: true,
        zoomMargin: 50
      });
      
      addNotification(`Отображены все поля заказчика (${customerFields.length} шт.)`, 'success');
    } catch (error) {
      console.error('Error showing all fields on map:', error);
      addNotification('Ошибка при отображении всех полей', 'error');
    }
  }, [ymaps, addNotification, getCustomerFields]);

  const handleCreateOrder = useCallback((field) => {
    if (!field) {
      addNotification('Выберите поле для создания заявки', 'error');
      return;
    }

    const newOrder = {
    id: generateId(),
    fieldId: field.id,
    customerId: selectedCustomer,
    fieldName: field.name,
    area: field.area,
    crop: field.crop,
    status: 'новая',
    createdAt: new Date().toISOString(),
    price: field.price || 1000,
    processingDate: field.processingDate || null, // Добавляем дату выполнения
    operatorId: null, // Изначально оператор не назначен
    notes: '' // Дополнительные заметки
  };

    setOrders(prev => [...prev, newOrder]);
    addNotification(`Создана новая заявка для поля "${field.name}"`, 'success');
  }, [selectedCustomer, addNotification, setOrders]);

const handleUpdateOrderStatus = useCallback((orderId, newStatus) => {
  setOrders(prev => prev.map(order => {
    if (order.id === orderId) {
      const updatedOrder = {
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Если статус меняется на "выполнено", добавляем дату выполнения
      if (newStatus === 'выполнено' && !order.completedAt) {
        updatedOrder.completedAt = new Date().toISOString();
      }
      
      addNotification(`Статус заявки обновлен на "${newStatus}"`, 'success');
      return updatedOrder;
    }
    return order;
  }));
}, [setOrders, addNotification]);

const handleAssignOperator = useCallback((orderId, operatorId) => {
  setOrders(prev => prev.map(order => {
    if (order.id === orderId) {
      const operator = operators.find(op => op.id === operatorId);
      addNotification(`Оператор "${operator?.name}" назначен на заявку`, 'success');
      return {
        ...order,
        operatorId,
        assignedAt: new Date().toISOString()
      };
    }
    return order;
  }));
}, [operators, addNotification, setOrders]);

const handleDeleteOrder = useCallback((orderId) => {
  if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
    setOrders(prev => prev.filter(order => order.id !== orderId));
    addNotification('Заявка успешно удалена', 'success');
  }
}, [addNotification, setOrders]);


  const exportAllData = useCallback(() => {
    const data = {
      fields: getCustomerFields(),
      orders: getCustomerOrders(),
      operators,
      customers,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `agroaviatech_export_${selectedCustomer}_${Date.now()}.json`;
    link.click();
    
    addNotification('Данные успешно экспортированы', 'success');
  }, [getCustomerFields, getCustomerOrders, operators, customers, selectedCustomer, addNotification]);

  // ========== ИНИЦИАЛИЗАЦИЯ КАРТЫ ==========
  const initMap = useCallback((ymapsInstance) => {
    if (!mapRef.current || mapInitialized.current) return;

    try {
      const map = new ymapsInstance.Map(mapRef.current, {
        center: config.app.defaultMapCenter,
        zoom: config.app.defaultZoom,
        controls: config.map.controls
      });

      mapInstance.current = map;
      mapInitialized.current = true;
      
      if (debugMode) {
        eventListeners.current.mousemove = map.events.add('mousemove', (e) => {
          const coords = e.get('coords');
          setMouseCoords(coords);
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      showMapFallback();
    }
  }, [debugMode]);

  const showMapFallback = () => {
    if (!mapRef.current) return;
    mapRef.current.innerHTML = `
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0;border:2px dashed #ccc;">
        <div style="text-align:center;">
          <h3>${config.app.name}</h3>
          <p>Карта временно недоступна</p>
          <p>Используйте ручной ввод координат</p>
          <p>API ключ: ${config.yandexMaps.apiKey ? 'настроен' : 'отсутствует'}</p>
        </div>
      </div>
    `;
  };

  // ========== ЭФФЕКТЫ ==========
useEffect(() => {
  // Синхронизируем selectedFieldForOverview с актуальными данными
  if (selectedFieldForOverview) {
    const currentField = fields.find(f => f.id === selectedFieldForOverview.id);
    if (currentField && JSON.stringify(currentField) !== JSON.stringify(selectedFieldForOverview)) {
      console.log('Обновляем selectedFieldForOverview с актуальными данными');
      setSelectedFieldForOverview(currentField);
    }
  }
}, [fields, selectedFieldForOverview]);


// Добавьте этот useEffect для отладки
useEffect(() => {
  if (debugMode) {
    console.log('=== СОСТОЯНИЕ ОБНОВЛЕНО ===');
    console.log('editingField:', editingField);
    console.log('selectedFieldForOverview:', selectedFieldForOverview);
    console.log('fieldFormData:', fieldFormData);
  }
}, [editingField, selectedFieldForOverview, fieldFormData, debugMode]);

  useEffect(() => {
    // Загружаем демо-данные если нет сохраненных
    if (fields.length === 0 && initialMockFields.length > 0) {
      setFields(initialMockFields);
    }
    if (operators.length === 0 && mockOperators.length > 0) {
      setOperators(mockOperators);
    }
    if (customers.length === 0 && initialCustomers.length > 0) {
      setCustomers(initialCustomers);
    }
    if (orders.length === 0 && initialOrders.length > 0) {
      setOrders(initialOrders);
    }
  }, [setFields, setOperators, setCustomers, setOrders, fields.length, operators.length, customers.length, orders.length]);

  // useEffect(() => {
  //  setFieldFormData(prev => ({
  //    ...prev,
  //    name: `Поле №${fields.length + 1}`,
  //    customerId: selectedCustomer
  //  }));
  //}, [selectedCustomer, fields.length]);
  useEffect(() => {
    if (!editingField && !drawingMode) {
      setFieldFormData(prev => ({
        ...prev,
        customerId: selectedCustomer
      }));
    }
}, [selectedCustomer, editingField, drawingMode]);


  useEffect(() => {
    if (mapInitialized.current) return;

    const loadYandexMaps = async () => {
      try {
        const ymapsInstance = await ymapLoader();
        setYmaps(ymapsInstance);
        setMapLoaded(true);
        
        if (!mapInitialized.current) {
          initMap(ymapsInstance);
          mapInitialized.current = true;
        }
      } catch (error) {
        console.error('Failed to load Yandex Maps:', error);
        addNotification('Ошибка загрузки карты. Проверьте API ключ.', 'error');
        showMapFallback();
      }
    };

    if (!isYmapsLoaded()) {
      loadYandexMaps();
    } else {
      setYmaps(window.ymaps);
      setMapLoaded(true);
      
      if (!mapInitialized.current) {
        initMap(window.ymaps);
        mapInitialized.current = true;
      }
    }

    return () => {
      if (mapInstance.current) {
        Object.entries(eventListeners.current).forEach(([event, listener]) => {
          if (listener) {
            mapInstance.current.events.remove(listener);
          }
        });
        try {
          mapInstance.current.destroy();
        } catch (error) {
          console.log('Error destroying map:', error);
        }
        mapInstance.current = null;
      }
      mapInitialized.current = false;
    };
  }, [initMap, addNotification]);

  useEffect(() => {
    if (mapLoaded && ymaps && fields.length > 0 && mapInitialized.current) {
      setTimeout(() => redrawAllFields(), 100);
    }
  }, [fields, mapLoaded, ymaps, redrawAllFields]);

  useEffect(() => {
    if (newFieldPolygon.length > 0 && ymaps && mapInstance.current) {
      updateTemporaryPolygon(newFieldPolygon);
    }
  }, [newFieldPolygon, ymaps, updateTemporaryPolygon]);

  useEffect(() => {
    drawingModeRef.current = drawingMode;
  }, [drawingMode]);

  useEffect(() => {
    newFieldPolygonRef.current = newFieldPolygon;
  }, [newFieldPolygon]);

  // ========== СТАТИСТИКА ==========
  const stats = {
    totalFields: getCustomerFields().length,
    totalArea: getCustomerFields().reduce((sum, field) => sum + (field.area || 0), 0),
    totalOrders: getCustomerOrders().length,
    activeOrders: getCustomerOrders().filter(order => order.status === 'в работе').length
  };

  // ========== РЕНДЕР ==========
  return (
    <div className="app">
      <Notifications notifications={notifications} />
      <Header 
        logoError={logoError} 
        setLogoError={setLogoError} 
        debugMode={debugMode} 
        toggleDebugMode={() => setDebugMode(!debugMode)} 
      />

      <main className="main-content">
        <div className="container">
          {/* Блок выбора заказчика */}
          <div className="customer-section">
            <div className="customer-selector-main">
              <label>Выберите заказчика:</label>
              <select 
                value={selectedCustomer} 
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="customer-select"
              >
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <button 
                onClick={() => setShowCustomersManagement(true)}
                className="btn btn-secondary btn-sm"
              >
                👥 Управление
              </button>
            </div>
          </div>

          {/* Быстрый старт */}
          {!drawingMode && !showAddFieldForm && !selectedFieldForOverview && (
            <QuickStartPanel 
              onAddField={startSimpleDrawing}
              onCreateOrder={() => {
                if (getCustomerFields().length > 0) {
                  handleCreateOrder(getCustomerFields()[0]);
                } else {
                  addNotification('Нет полей для создания заявки', 'warning');
                }
              }}
              onLoadDemo={() => {
                setFields(initialMockFields);
                setOperators(mockOperators);
                setCustomers(initialCustomers);
                setOrders(initialOrders);
                addNotification('Демо-данные загружены', 'success');
              }}
              onManageOperators={() => setShowOperatorsManagement(true)}
              onManageOrders={() => setShowOrdersManagement(true)}
              onExportData={exportAllData}
            />
          )}

          {/* Основной layout */}
          <div className="app-layout">
            {/* Левая колонка */}
            <div className="left-column">
              {drawingMode || showAddFieldForm ? (
                <div className="drawing-controls-compact">
                  <div className="card">
                    <div className="card-header">
                      <h3>{editingField ? 'Редактирование поля' : 'Создание поля'}</h3>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={editingField ? handleUpdateField : createField}
                          className="btn btn-primary btn-sm"
                          disabled={newFieldPolygon.length < 3 && !editingField}
                        >
                          {editingField ? '💾 Сохранить' : '✅ Создать поле'}
                        </button>
                        <button 
                          onClick={() => {
                            setDrawingMode(false);
                            setShowAddFieldForm(false);
                            setEditingField(null);
                            stopDrawing();
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          ✕ Отмена
                        </button>
                      </div>
                    </div>
                    
                    {!editingField && (
                      <div className="manual-coords">
                        <h4>Ввод координат вручную:</h4>
                        <textarea
                          value={manualCoords}
                          onChange={(e) => setManualCoords(e.target.value)}
                          placeholder="55.7558,37.6173; 55.7500,37.6200; 55.7450,37.6150"
                          rows={3}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button onClick={handleManualCoordsSubmit} className="btn btn-outline btn-sm">
                            Построить по координатам
                          </button>
                          <button onClick={createDemoPolygon} className="btn btn-primary btn-sm">
                            Демо-полигон
                          </button>
                        </div>
                      </div>
                    )}

                    {!editingField && newFieldPolygon.length > 0 && (
                      <div className="drawing-info">
                        <div className="polygon-stats">
                          <p>✅ Создано точек: {newFieldPolygon.length}</p>
                          <p>Площадь: {fieldFormData.area.toFixed(2)} га</p>
                          {newFieldPolygon.length < 3 && (
                            <p style={{ color: 'orange' }}>Нужно минимум 3 точки для полигона</p>
                          )}
                        </div>
                      </div>
                    )}

                    <CompactAddFieldForm
                      formData={fieldFormData}
                      onChange={setFieldFormData}
                      onSubmit={editingField ? handleUpdateField : createField}
                      onCancel={() => {
                        setDrawingMode(false);
                        setShowAddFieldForm(false);
                        setEditingField(null);
                        stopDrawing();
                      }}
                      isEditing={!!editingField}
                    />
                  </div>
                </div>
              ) : selectedFieldForOverview ? (
                <div className="card">
                  <div className="card-header">
                    <h3>📋 Детали поля</h3>
                    <button 
                      onClick={() => setSelectedFieldForOverview(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="field-details-panel">
                    <h4>{selectedFieldForOverview.name}</h4>
                    <p><strong>Владелец:</strong> {selectedFieldForOverview.owner}</p>
                    <p><strong>Регион:</strong> {selectedFieldForOverview.region}</p>
                    <p><strong>Площадь:</strong> {selectedFieldForOverview.area} га</p>
                    <p><strong>Культура:</strong> {selectedFieldForOverview.crop}</p>
                    <p><strong>Статус:</strong> {selectedFieldForOverview.status}</p>
                    {selectedFieldForOverview.coordinates && (
                      <p><strong>Точек полигона:</strong> {selectedFieldForOverview.coordinates.length}</p>
                    )}
                    <div className="field-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleShowOnMap(selectedFieldForOverview)}
                        className="btn btn-outline btn-sm"
                      >
                        🗺️ Показать на карте
                      </button>
                      <button 
                        onClick={() => handleEditField(selectedFieldForOverview)}
                        className="btn btn-outline btn-sm"
                      >
                        ✏️ Редактировать
                      </button>
                      <button 
                        onClick={() => handleDeleteField(selectedFieldForOverview.id)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Панель управления полями */}
                  <div className="card">
                    <div className="card-header">
                      <h3>📋 Управление полями</h3>
                    </div>
                    <div className="fields-management-panel">
                      <div className="management-buttons" style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        marginBottom: '15px',
                        flexWrap: 'wrap'
                      }}>
                        <button 
                          onClick={startSimpleDrawing}
                          className="btn btn-primary btn-sm"
                        >
                          🎯 Добавить поле
                        </button>
                        <button 
                          onClick={handleShowAllFieldsOnMap}
                          className="btn btn-outline btn-sm"
                        >
                          🗺️ Показать все на карте
                        </button>
                        <button 
                          onClick={exportAllData}
                          className="btn btn-outline btn-sm"
                        >
                          📤 Экспорт данных
                        </button>
                      </div>
                    </div>

                    <div className="customer-info">
                      <h4>{getCurrentCustomer()?.name}</h4>
                      <p>{getCurrentCustomer()?.contact}</p>
                    </div>

                    {getCustomerFields().length === 0 ? (
                      <div className="empty-state">
                        <p>Нет полей для выбранного заказчика</p>
                        <button 
                          onClick={startSimpleDrawing}
                          className="btn btn-primary btn-sm"
                        >
                          🎯 Добавить первое поле
                        </button>
                      </div>
                    ) : (
                      <div className="fields-list">
                        {getCustomerFields().map(field => (
                          <div 
                            key={field.id}
                            className={`field-card ${selectedFieldForOverview?.id === field.id ? 'selected' : ''}`}
                          >
                            <div 
                              className="field-info"
                              onClick={() => handleSelectFieldForOverview(field)}
                              style={{ cursor: 'pointer' }}
                            >
                              <h4 className="field-name">{field.name}</h4>
                              <p className="field-meta">{field.owner} • {field.region}</p>
                              <div className="field-details">
                                <span className="field-area">{field.area} га</span>
                                <span className="field-crop">{field.crop}</span>
                              </div>
                              <div className="field-status">
                                <span className={`status status-${field.status}`}>
                                  {field.status}
                                </span>
                              </div>
                            </div>
                            <div className="field-actions" style={{ 
                              display: 'flex', 
                              gap: '8px', 
                              marginTop: '10px',
                              justifyContent: 'space-between'
                            }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowOnMap(field);
                                }}
                                className="btn btn-outline btn-xs"
                                title="Показать на карте"
                              >
                                🗺️
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditField(field);
                                }}
                                className="btn btn-outline btn-xs"
                                title="Редактировать поле"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteField(field.id);
                                }}
                                className="btn btn-danger btn-xs"
                                title="Удалить поле"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h3>📊 Статистика</h3>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-value">{stats.totalFields}</div>
                        <div className="stat-label">полей</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{stats.totalArea.toFixed(1)}</div>
                        <div className="stat-label">га всего</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{stats.totalOrders}</div>
                        <div className="stat-label">заявок</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{stats.activeOrders}</div>
                        <div className="stat-label">в работе</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Правая колонка - карта */}
            <div className="right-column">
              <div className="card">
                <div className="card-header">
                  <h3>🗺️ Карта полей</h3>
                  {!drawingMode && (
                    <button 
                      onClick={startSimpleDrawing}
                      className="btn btn-primary btn-sm"
                    >
                      🎯 Рисовать поле
                    </button>
                  )}
                </div>
                <div className={`map-container ${drawingMode ? 'drawing-mode' : ''}`}>
                  <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
                    {!mapLoaded && (
                      <div className="map-loading">
                        <p>Загрузка карты...</p>
                        <p>API ключ: {config.yandexMaps.apiKey ? 'настроен' : 'отсутствует'}</p>
                      </div>
                    )}
                  </div>
                </div>
                {drawingMode && (
                  <div className="drawing-hint">
                    <p>🖱️ Кликайте на карту для добавления точек полигона</p>
                    <p>✅ Двойной клик завершает рисование</p>
                    <p>📏 Создано точек: {newFieldPolygon.length}</p>
                    {newFieldPolygon.length > 0 && (
                      <p>📍 Последняя точка: {newFieldPolygon[newFieldPolygon.length-1][0].toFixed(4)}, {newFieldPolygon[newFieldPolygon.length-1][1].toFixed(4)}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Панель отладки */}
      {debugMode && (
        <div className="debug-panel">
          <h4>🐛 Отладка</h4>
          {mouseCoords && (
            <div className="debug-section">
              <strong>Координаты курсора:</strong><br />
              Ш: {mouseCoords[0].toFixed(6)}<br />
              Д: {mouseCoords[1].toFixed(6)}
            </div>
          )}
          <div className="debug-section">
            <strong>Статус карты:</strong><br />
            Загружена: {mapLoaded ? '✅' : '❌'}<br />
            Инициализирована: {mapInitialized.current ? '✅' : '❌'}<br />
            Режим рисования: {drawingMode ? '✅' : '❌'}<br />
            Точек в полигоне: {newFieldPolygon.length}
          </div>
          <button 
            onClick={() => {
              console.log('=== ПРОВЕРКА СОСТОЯНИЯ ===');
              console.log('drawingMode:', drawingMode);
              console.log('newFieldPolygon:', newFieldPolygon);
              console.log('mapInstance:', !!mapInstance.current);
              console.log('ymaps:', !!ymaps);
              console.log('fields:', fields);
              console.log('editingField:', editingField);
              console.log('fieldFormData:', fieldFormData);
            }}
            className="debug-btn"
          >
            Проверить состояние (в консоль)
          </button>
        </div>
      )}

      {/* Модальные окна управления */}
      {showOperatorsManagement && (
        <OperatorsManagement 
          operators={operators}
          setOperators={setOperators}
          onClose={() => setShowOperatorsManagement(false)}
        />
      )}

      {showCustomersManagement && (
        <CustomersManagement 
          customers={customers}
          setCustomers={setCustomers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          onClose={() => setShowCustomersManagement(false)}
          fields={fields}
          orders={orders}
        />
      )}

      {showOrdersManagement && (
        <OrdersManagement 
          orders={getCustomerOrders()}
          fields={getCustomerFields()}
          operators={operators}
          onClose={() => setShowOrdersManagement(false)}
          onCreateOrder={handleCreateOrder} // Добавляем эту функцию
          onDeleteOrder={handleDeleteOrder} // ← Добавьте эту строку
        />
      )}
    </div>
  );
}

export default App;