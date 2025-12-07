import React, { useState } from 'react';

function FieldCard({ 
  field, 
  isSelected = false, 
  onSelect, 
  onEdit, 
  onViewOnMap, 
  onDelete,
  showActions = true 
}) {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(field);
    }
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action(field);
  };

  return (
    <div 
      className={`field-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
    >
      <div className="field-info">
        <div className="field-header">
          <h3 className="field-name">{field.name}</h3>
          {showQuickActions && showActions && (
            <div className="quick-actions">
              <button 
                onClick={(e) => handleActionClick(e, onViewOnMap)}
                className="btn-icon"
                title="Показать на карте"
              >
                🗺️
              </button>
              <button 
                onClick={(e) => handleActionClick(e, onEdit)}
                className="btn-icon"
                title="Редактировать"
              >
                ✏️
              </button>
            </div>
          )}
        </div>

        <p className="field-meta">{field.owner} • {field.region}</p>
        
        <div className="field-details">
          <span className="field-area">{field.area} га</span>
          <span className="field-crop">{field.crop}</span>
        </div>

        <div className="field-footer">
          <div className="field-status">
            <span className={`status status-${field.status}`}>
              {field.status}
            </span>
          </div>
          
          {field.processingDate && (
            <div className="processing-date">
              📅 {new Date(field.processingDate).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      </div>

      {/* Расширенные действия (появляются при наведении) */}
      {showQuickActions && showActions && (
        <div className="extended-actions">
          <button 
            onClick={(e) => handleActionClick(e, onViewOnMap)}
            className="btn btn-secondary btn-sm"
          >
            🗺️ На карте
          </button>
          <button 
            onClick={(e) => handleActionClick(e, onEdit)}
            className="btn btn-warning btn-sm"
          >
            ✏️ Редактировать
          </button>
          <button 
            onClick={(e) => handleActionClick(e, onDelete)}
            className="btn btn-danger btn-sm"
          >
            🗑️ Удалить
          </button>
        </div>
      )}
    </div>
  );
}

export default FieldCard;