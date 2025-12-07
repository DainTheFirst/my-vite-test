import React from 'react';

const FieldDetailsPanel = ({ 
  field, 
  onEdit, 
  onViewOnMap, 
  onDelete, 
  onCreateOrder, 
  onClose 
}) => {
  return (
    <div className="field-details-panel">
      <h2>Детали поля</h2>
      <div className="field-info">
        <h3>{field.name}</h3>
        <p><strong>Владелец:</strong> {field.owner}</p>
        <p><strong>Регион:</strong> {field.region}</p>
        <p><strong>Культура:</strong> {field.crop}</p>
        <p><strong>Площадь:</strong> {field.area} га</p>
        <p><strong>Статус:</strong> <span className={`status status-${field.status}`}>{field.status}</span></p>
        <p><strong>Дата обработки:</strong> {field.processingDate}</p>
      </div>
      <div className="field-actions">
        <button onClick={() => onEdit(field)} className="btn btn-primary">Редактировать</button>
        <button onClick={() => onViewOnMap(field)} className="btn btn-outline">Показать на карте</button>
        <button onClick={() => onCreateOrder(field)} className="btn btn-secondary">Создать заявку</button>
        <button onClick={() => onDelete(field.id)} className="btn btn-danger">Удалить</button>
        <button onClick={onClose} className="btn btn-secondary">Закрыть</button>
      </div>
    </div>
  );
};

export default FieldDetailsPanel;