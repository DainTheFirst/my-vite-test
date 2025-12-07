import React from 'react';

const QuickStartPanel = ({ 
  onAddField, 
  onCreateOrder, 
  onLoadDemo, 
  onManageOperators, 
  onManageOrders, 
  onExportData, 
  stats 
}) => {
  return (
    <div className="quick-start-panel">
      <h2>🚀 Быстрый старт</h2>
      <div className="quick-actions">
        <button onClick={onAddField} className="btn btn-primary">
          🎯 Добавить поле
        </button>
        <button onClick={onCreateOrder} className="btn btn-secondary">
          📋 Создать заявку
        </button>
        <button onClick={onLoadDemo} className="btn btn-outline">
          📊 Загрузить демо-данные
        </button>
        <button onClick={onManageOperators} className="btn btn-outline">
          ✈️ Управление авиаторами
        </button>
        <button onClick={onManageOrders} className="btn btn-outline">
          📦 Управление заявками
        </button>
        <button onClick={onExportData} className="btn btn-outline">
          💾 Экспорт данных
        </button>
      </div>
      {stats && (
        <div className="stats-preview">
          <h3>Статистика:</h3>
          <p>Полей: {stats.totalFields}</p>
          <p>Площадь: {stats.totalArea} га</p>
          <p>Заявок: {stats.totalOrders}</p>
          <p>Активных: {stats.activeOrders}</p>
        </div>
      )}
    </div>
  );
};

export default QuickStartPanel;