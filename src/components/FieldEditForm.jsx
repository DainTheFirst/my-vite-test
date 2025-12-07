import React, { useState } from 'react';

const FieldEditForm = ({ 
  field, 
  customers, 
  onSave, 
  onCancel, 
  onViewOnMap, 
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    name: field.name,
    crop: field.crop,
    area: field.area,
    price: field.price,
    region: field.region,
    owner: field.owner,
    customerId: field.customerId,
    processingDate: field.processingDate,
    status: field.status
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(field.id, formData);
  };

  return (
    <div className="field-edit-form">
      <h2>Редактирование поля</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название поля</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Культура</label>
          <select 
            value={formData.crop}
            onChange={(e) => setFormData({...formData, crop: e.target.value})}
          >
            <option value="пшеница">Пшеница</option>
            <option value="ячмень">Ячмень</option>
            <option value="кукуруза">Кукуруза</option>
            <option value="подсолнечник">Подсолнечник</option>
          </select>
        </div>
        <div className="form-group">
          <label>Площадь (га)</label>
          <input 
            type="number" 
            value={formData.area}
            onChange={(e) => setFormData({...formData, area: parseFloat(e.target.value) || 0})}
            required
          />
        </div>
        <div className="form-group">
          <label>Регион</label>
          <input 
            type="text" 
            value={formData.region}
            onChange={(e) => setFormData({...formData, region: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Владелец</label>
          <input 
            type="text" 
            value={formData.owner}
            onChange={(e) => setFormData({...formData, owner: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Заказчик</label>
          <select 
            value={formData.customerId}
            onChange={(e) => setFormData({...formData, customerId: e.target.value})}
          >
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Статус</label>
          <select 
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="обработано">Обработано</option>
            <option value="в работе">В работе</option>
            <option value="ожидает">Ожидает</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Сохранить</button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">Отмена</button>
          <button type="button" onClick={() => onViewOnMap(field)} className="btn btn-outline">Показать на карте</button>
          <button type="button" onClick={() => onDelete(field.id)} className="btn btn-danger">Удалить</button>
        </div>
      </form>
    </div>
  );
};

export default FieldEditForm;