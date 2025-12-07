import React, { useState, useCallback, useEffect } from 'react';
import './OrdersManagement.css';

const OrdersManagement = ({ 
  orders, 
  fields, 
  operators, 
  onClose, 
  onCreateOrder, 
  onDeleteOrder 
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('все');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFieldForOrder, setSelectedFieldForOrder] = useState('');
  const [showCreateOrderForm, setShowCreateOrderForm] = useState(false);

  // Устанавливаем первое поле по умолчанию при загрузке
  useEffect(() => {
    if (fields.length > 0 && !selectedFieldForOrder) {
      setSelectedFieldForOrder(fields[0].id);
    }
  }, [fields, selectedFieldForOrder]);

  // Фильтрация заявок
  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'все' && order.status !== statusFilter) {
      return false;
    }
    
    if (searchTerm) {
      const field = fields.find(f => f.id === order.fieldId);
      const searchLower = searchTerm.toLowerCase();
      const matchesFieldName = field?.name?.toLowerCase().includes(searchLower) || false;
      const matchesCrop = field?.crop?.toLowerCase().includes(searchLower) || false;
      const matchesOrderId = order.id?.toLowerCase().includes(searchLower) || false;
      
      if (!matchesFieldName && !matchesCrop && !matchesOrderId) {
        return false;
      }
    }
    
    return true;
  });

  // Группировка по статусу
  const ordersByStatus = {
    'новая': orders.filter(o => o.status === 'новая'),
    'в работе': orders.filter(o => o.status === 'в работе'),
    'выполнено': orders.filter(o => o.status === 'выполнено'),
    'отменено': orders.filter(o => o.status === 'отменено')
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'не указана';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return 'некорректная дата';
    }
  };

  // Получение информации о поле
  const getFieldInfo = (fieldId) => {
    return fields.find(f => f.id === fieldId) || {};
  };

  // Создание новой заявки
  const handleCreateNewOrder = () => {
    if (!selectedFieldForOrder) {
      alert('Выберите поле для заявки');
      return;
    }
    
    const selectedField = fields.find(f => f.id === selectedFieldForOrder);
    if (!selectedField) {
      alert('Выбранное поле не найдено');
      return;
    }
    
    if (onCreateOrder) {
      onCreateOrder(selectedField);
      addNotification(`Заявка для поля "${selectedField.name}" создана`, 'success');
      setShowCreateOrderForm(false);
    }
  };

  // Удаление заявки
  const handleDelete = (orderId, fieldName = 'неизвестное поле') => {
    if (window.confirm(`Вы уверены, что хотите удалить заявку для поля "${fieldName}"?`)) {
      if (onDeleteOrder) {
        onDeleteOrder(orderId);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
      }
    }
  };

  // Функция для добавления уведомлений (если её нет в компоненте)
  const addNotification = (message, type = 'info') => {
    // Временная реализация - в реальном приложении нужно передавать из родителя
    alert(message);
  };

  // Функция для изменения статуса
  const handleStatusChange = (orderId, newStatus) => {
    console.log(`Изменение статуса заявки ${orderId} на ${newStatus}`);
    // TODO: Реализовать в родительском компоненте
  };

  return (
    <div className="orders-management-modal">
      <div className="orders-management-overlay" onClick={onClose}></div>
      <div className="orders-management-content">
        {/* Заголовок */}
        <div className="orders-management-header">
          <h2>📋 Управление заявками</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Статистика заявок */}
        <div className="orders-stats">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Всего заявок</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{ordersByStatus['новая'].length}</div>
              <div className="stat-label">Новые</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{ordersByStatus['в работе'].length}</div>
              <div className="stat-label">В работе</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{ordersByStatus['выполнено'].length}</div>
              <div className="stat-label">Выполнено</div>
            </div>
          </div>
        </div>

        {/* Панель управления */}
        <div className="orders-controls">
          <div className="control-group">
            <input
              type="text"
              placeholder="🔍 Поиск по названию поля, культуре или ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="control-group">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="все">Все статусы</option>
              <option value="новая">Новая</option>
              <option value="в работе">В работе</option>
              <option value="выполнено">Выполнено</option>
              <option value="отменено">Отменено</option>
            </select>
            
            <button 
              onClick={() => setShowCreateOrderForm(true)}
              className="btn btn-primary btn-sm"
              disabled={fields.length === 0}
            >
              + Создать заявку
            </button>
          </div>
        </div>

        {/* Форма создания заявки */}
        {showCreateOrderForm && fields.length > 0 && (
          <div className="create-order-form card">
            <div className="card-header">
              <h3>Создание новой заявки</h3>
              <button 
                onClick={() => setShowCreateOrderForm(false)}
                className="btn btn-secondary btn-sm"
              >
                ✕ Отмена
              </button>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Выберите поле *</label>
                <select
                  value={selectedFieldForOrder}
                  onChange={(e) => setSelectedFieldForOrder(e.target.value)}
                  className="form-control"
                  required
                >
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>
                      {field.name} ({field.crop}) - {field.area} га
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedFieldForOrder && (
                <div className="field-info-preview">
                  <h4>Информация о выбранном поле:</h4>
                  <div className="field-details">
                    <p><strong>Название:</strong> {getFieldInfo(selectedFieldForOrder).name}</p>
                    <p><strong>Культура:</strong> {getFieldInfo(selectedFieldForOrder).crop}</p>
                    <p><strong>Площадь:</strong> {getFieldInfo(selectedFieldForOrder).area} га</p>
                    <p><strong>Регион:</strong> {getFieldInfo(selectedFieldForOrder).region}</p>
                  </div>
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  onClick={handleCreateNewOrder}
                  className="btn btn-primary"
                  disabled={!selectedFieldForOrder}
                >
                  ✅ Создать заявку
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Таблица заявок */}
        <div className="orders-table-container">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <p>Заявки не найдены</p>
              {fields.length === 0 ? (
                <div className="alert alert-warning">
                  <p>Сначала добавьте поля для создания заявок</p>
                </div>
              ) : (
                <button 
                  onClick={() => setShowCreateOrderForm(true)}
                  className="btn btn-primary"
                >
                  Создать первую заявку
                </button>
              )}
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Поле / Культура</th>
                  <th>Площадь</th>
                  <th>Дата заявки</th>
                  <th>Дата выполнения</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const field = getFieldInfo(order.fieldId);
                  return (
                    <tr 
                      key={order.id}
                      className={`order-row ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td>{index + 1}</td>
                      <td>
                        <div className="field-info">
                          <div className="field-name">{field.name || 'Неизвестное поле'}</div>
                          <div className="field-crop">{field.crop || 'Не указана'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="area-cell">
                          {field.area ? `${field.area} га` : '—'}
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          {order.processingDate ? formatDate(order.processingDate) : 'не назначена'}
                        </div>
                      </td>
                      <td>
                        <select 
                          value={order.status || 'новая'} 
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`status-select status-${order.status}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="новая">Новая</option>
                          <option value="в работе">В работе</option>
                          <option value="выполнено">Выполнено</option>
                          <option value="отменено">Отменено</option>
                        </select>
                      </td>
                      <td>
                        <div className="order-actions">
                          <button 
                            className="btn btn-outline btn-xs"
                            title="Показать на карте"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Реализовать показ на карте
                            }}
                          >
                            🗺️
                          </button>
                          <button 
                            className="btn btn-outline btn-xs"
                            title="Детали"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                          >
                            👁️
                          </button>
                          {onDeleteOrder && (
                            <button 
                              className="btn btn-danger btn-xs"
                              title="Удалить заявку"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(order.id, field.name);
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Детали заявки */}
        {selectedOrder && (
          <div className="order-details-panel">
            <div className="order-details-header">
              <h3>Детали заявки #{selectedOrder.id.slice(-6)}</h3>
              <button onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            
            <div className="order-details-content">
              <div className="detail-row">
                <span className="detail-label">ID заявки:</span>
                <span className="detail-value">{selectedOrder.id}</span>
              </div>
              
              {(() => {
                const field = getFieldInfo(selectedOrder.fieldId);
                return (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Поле:</span>
                      <span className="detail-value">{field.name || 'Неизвестное поле'}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Культура:</span>
                      <span className="detail-value">{field.crop || 'Не указана'}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Площадь:</span>
                      <span className="detail-value">{field.area ? `${field.area} га` : '—'}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Владелец поля:</span>
                      <span className="detail-value">{field.owner || 'Не указан'}</span>
                    </div>
                  </>
                );
              })()}
              
              <div className="detail-row">
                <span className="detail-label">Дата создания:</span>
                <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Статус:</span>
                <span className={`detail-value status-badge status-${selectedOrder.status}`}>
                  {selectedOrder.status}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Стоимость:</span>
                <span className="detail-value">{selectedOrder.price ? `${selectedOrder.price} ₽` : 'не указана'}</span>
              </div>
              
              <div className="order-actions-panel">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleStatusChange(selectedOrder.id, 'в работе')}
                >
                  Начать работу
                </button>
                
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => handleStatusChange(selectedOrder.id, 'выполнено')}
                >
                  Завершить
                </button>
                
                <button 
                  className="btn btn-warning btn-sm"
                  onClick={() => handleStatusChange(selectedOrder.id, 'отменено')}
                >
                  Отменить
                </button>
                
                {onDeleteOrder && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(selectedOrder.id, getFieldInfo(selectedOrder.fieldId).name)}
                  >
                    Удалить заявку
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Панель экспорта */}
        <div className="export-panel">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
              const dataStr = JSON.stringify(orders, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(dataBlob);
              link.download = `заявки_${new Date().toISOString().split('T')[0]}.json`;
              link.click();
            }}
          >
            📤 Экспорт в JSON
          </button>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
              const headers = ['ID', 'Поле', 'Культура', 'Площадь', 'Дата заявки', 'Статус', 'Стоимость'];
              const csvData = orders.map(order => {
                const field = getFieldInfo(order.fieldId);
                return [
                  order.id,
                  field.name || '',
                  field.crop || '',
                  field.area || '',
                  formatDate(order.createdAt),
                  order.status,
                  order.price || ''
                ];
              });
              
              const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `заявки_${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
            }}
          >
            📊 Экспорт в CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;