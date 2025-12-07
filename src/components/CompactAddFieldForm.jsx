import React from 'react';

const CompactAddFieldForm = ({ formData, onChange, onSubmit, onCancel, isEditing }) => {
  const handleChange = (field, value) => {
    console.log(`Changing ${field} to:`, value); // Отладка
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="compact-add-field-form">
      <div className="form-row">
        <div className="form-group">
          <label>Название поля *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Поле №1"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Культура</label>
          <select
            value={formData.crop}
            onChange={(e) => handleChange('crop', e.target.value)}
          >
            <option value="пшеница">Пшеница</option>
            <option value="ячмень">Ячмень</option>
            <option value="кукуруза">Кукуруза</option>
            <option value="соя">Соя</option>
            <option value="рапс">Рапс</option>
            <option value="подсолнечник">Подсолнечник</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Регион *</label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => handleChange('region', e.target.value)}
            placeholder="Московская область"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Владелец</label>
          <input
            type="text"
            value={formData.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
            placeholder="Иванов И.И."
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Площадь (га) *</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={formData.area}
            onChange={(e) => handleChange('area', parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Стоимость обработки (₽)</label>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Дата обработки</label>
          <input
            type="date"
            value={formData.processingDate}
            onChange={(e) => handleChange('processingDate', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Статус</label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="ожидает">Ожидает</option>
            <option value="в работе">В работе</option>
            <option value="обработано">Обработано</option>
            <option value="отменено">Отменено</option>
          </select>
        </div>
      </div>
      
      {/* Скрытое поле customerId */}
      <input
        type="hidden"
        value={formData.customerId}
        onChange={(e) => handleChange('customerId', e.target.value)}
      />
      
      {/* Отладка - показываем текущие данные формы */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: '#f0f0f0', 
          fontSize: '12px',
          borderRadius: '4px'
        }}>
          <strong>Отладка формы:</strong>
          <div>Регион: {formData.region}</div>
          <div>Название: {formData.name}</div>
          <div>Владелец: {formData.owner}</div>
        </div>
      )}
    </div>
  );
};

export default CompactAddFieldForm;