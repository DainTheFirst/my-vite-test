import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateId } from '../utils/storageHelpers';

// Компактный компонент ввода
const CompactInput = React.memo(({ label, value, onChange, placeholder, type = 'text', unit, ...props }) => {
  const inputRef = useRef(null);
  
  const handleChange = useCallback((e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    
    onChange(e);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(start, end);
      }
    }, 0);
  }, [onChange]);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '3px', fontWeight: '500', fontSize: '0.85rem', color: '#555' }}>
        {label}
        {unit && <span style={{ color: '#888', marginLeft: '3px', fontSize: '0.75rem' }}>({unit})</span>}
      </label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ 
          width: '100%', 
          padding: '6px 10px', 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          fontSize: '0.9rem',
          boxSizing: 'border-box',
          background: '#fafafa'
        }}
        {...props}
      />
    </div>
  );
});

// Компактный компонент формы для одного ВС
const CompactAircraftForm = React.memo(({ 
  aircraft, 
  index, 
  onChange, 
  onRemove,
  isLast,
  onAddAnother 
}) => {
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(index, field, value);
  }, [index, onChange]);

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '10px',
      background: '#f8f9fa',
      marginBottom: '8px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '0.85rem', color: '#1e90ff' }}>✈️</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#333' }}>ВС #{index + 1}</span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{
            padding: '3px 6px',
            border: '1px solid #ff6b6b',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.7rem',
            lineHeight: 1
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <CompactInput
          label="Тип ВС"
          value={aircraft.type}
          onChange={handleChange('type')}
          placeholder="Ан-2, Ми-8, DJI Agras"
        />
        
        <CompactInput
          label="Кол-во"
          value={aircraft.count}
          onChange={handleChange('count')}
          placeholder="1"
          type="number"
          min="1"
          unit="шт"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <CompactInput
          label="Скорость"
          value={aircraft.speed}
          onChange={handleChange('speed')}
          placeholder="180"
          type="number"
          min="0"
          unit="км/ч"
        />
        
        <CompactInput
          label="Ширина"
          value={aircraft.spreadWidth}
          onChange={handleChange('spreadWidth')}
          placeholder="18"
          type="number"
          min="0"
          unit="м"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
        <CompactInput
          label="Бак"
          value={aircraft.tankCapacity}
          onChange={handleChange('tankCapacity')}
          placeholder="1240"
          type="number"
          min="0"
          unit="л"
        />
        
        <CompactInput
          label="Стоимость часа"
          value={aircraft.hourCost}
          onChange={handleChange('hourCost')}
          placeholder="15000"
          type="number"
          min="0"
          unit="руб"
        />
      </div>

      {isLast && (
        <div style={{ marginTop: '10px' }}>
          <button
            type="button"
            onClick={onAddAnother}
            style={{
              padding: '6px 10px',
              border: '1px dashed #1e90ff',
              background: 'transparent',
              color: '#1e90ff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '0.7rem' }}>+</span>
            Добавить ВС
          </button>
        </div>
      )}
    </div>
  );
});

CompactAircraftForm.displayName = 'CompactAircraftForm';

const OperatorForm = React.memo(({ 
  initialData = null, 
  onSubmit, 
  onCancel 
}) => {
  // Локальное состояние формы
  const [formData, setFormData] = useState({
    name: '',
    pilot: '',
    phone: '',
    status: 'активен',
    notes: '',
    aircrafts: [
      {
        id: generateId(),
        type: '',
        count: 1,
        speed: '',
        spreadWidth: '',
        tankCapacity: '',
        hourCost: ''
      }
    ]
  });

  // Инициализация формы
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        pilot: initialData.pilot || '',
        phone: initialData.phone || '',
        status: initialData.status || 'активен',
        notes: initialData.notes || '',
        aircrafts: initialData.aircrafts || [
          {
            id: generateId(),
            type: '',
            count: 1,
            speed: '',
            spreadWidth: '',
            tankCapacity: '',
            hourCost: ''
          }
        ]
      });
    }
  }, [initialData]);

  // Обработчики изменений
  const handleChange = useCallback((field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setFormData(prev => ({
      ...prev,
      status
    }));
  }, []);

  const handleAircraftChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newAircrafts = [...prev.aircrafts];
      newAircrafts[index] = {
        ...newAircrafts[index],
        [field]: value
      };
      return {
        ...prev,
        aircrafts: newAircrafts
      };
    });
  }, []);

  const handleAddAircraft = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      aircrafts: [
        ...prev.aircrafts,
        {
          id: generateId(),
          type: '',
          count: 1,
          speed: '',
          spreadWidth: '',
          tankCapacity: '',
          hourCost: ''
        }
      ]
    }));
  }, []);

  const handleRemoveAircraft = useCallback((index) => {
    if (formData.aircrafts.length <= 1) {
      alert('Должен быть хотя бы один тип воздушного судна');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      aircrafts: prev.aircrafts.filter((_, i) => i !== index)
    }));
  }, [formData.aircrafts.length]);

  // Расчет суммарных характеристик ВС
  const calculateTotals = useCallback(() => {
    const totals = {
      totalAircraft: 0,
      avgSpeed: 0,
      avgWidth: 0,
      totalTankCapacity: 0,
      avgHourCost: 0
    };

    const validAircrafts = formData.aircrafts.filter(ac => ac.type && ac.count > 0);
    if (validAircrafts.length === 0) return totals;

    validAircrafts.forEach(ac => {
      totals.totalAircraft += ac.count || 0;
      totals.avgSpeed += (ac.speed || 0) * (ac.count || 1);
      totals.avgWidth += (ac.spreadWidth || 0) * (ac.count || 1);
      totals.totalTankCapacity += (ac.tankCapacity || 0) * (ac.count || 1);
      totals.avgHourCost += (ac.hourCost || 0) * (ac.count || 1);
    });

    totals.avgSpeed = totals.totalAircraft > 0 ? totals.avgSpeed / totals.totalAircraft : 0;
    totals.avgWidth = totals.totalAircraft > 0 ? totals.avgWidth / totals.totalAircraft : 0;
    totals.avgHourCost = totals.totalAircraft > 0 ? totals.avgHourCost / totals.totalAircraft : 0;

    return totals;
  }, [formData.aircrafts]);

  // Отправка формы
  const handleSubmit = useCallback(() => {
    if (!formData.name.trim()) {
      alert('Введите название авиакомпании');
      return;
    }

    const invalidAircrafts = formData.aircrafts.filter(ac => !ac.type.trim());
    if (invalidAircrafts.length > 0) {
      alert('Укажите тип для всех воздушных судов');
      return;
    }

    const validAircrafts = formData.aircrafts.map(ac => ({
      ...ac,
      id: ac.id || generateId(),
      count: Number(ac.count) || 1,
      speed: Number(ac.speed) || 0,
      spreadWidth: Number(ac.spreadWidth) || 0,
      tankCapacity: Number(ac.tankCapacity) || 0,
      hourCost: Number(ac.hourCost) || 0
    }));

    onSubmit({
      ...formData,
      aircrafts: validAircrafts
    });
  }, [formData, onSubmit]);

  const totals = calculateTotals();

  return (
    <div style={{ padding: '15px', maxHeight: '80vh', overflowY: 'auto' }}>
      {/* Основная информация */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '12px' }}>
          <CompactInput
            label="Название авиакомпании *"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="Авиакомпания 'АгроАвиа'"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <CompactInput
            label="Ответственный пилот"
            value={formData.pilot}
            onChange={handleChange('pilot')}
            placeholder="Иванов И.И."
          />

          <CompactInput
            label="Телефон"
            value={formData.phone}
            onChange={handleChange('phone')}
            placeholder="+7 (999) 123-45-67"
            type="tel"
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '3px', fontWeight: '500', fontSize: '0.85rem', color: '#555' }}>
            Статус
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['активен', 'неактивен', 'в ремонте'].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                style={{
                  padding: '4px 8px',
                  border: `1px solid ${formData.status === status ? '#1e90ff' : '#ddd'}`,
                  background: formData.status === status ? '#1e90ff' : 'white',
                  color: formData.status === status ? 'white' : '#666',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  transition: 'all 0.2s'
                }}
              >
                {status === 'активен' && '✅ '}
                {status === 'неактивен' && '⛔ '}
                {status === 'в ремонте' && '🔧 '}
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '3px', fontWeight: '500', fontSize: '0.85rem', color: '#555' }}>
            Примечания
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Дополнительная информация..."
            style={{ 
              width: '100%', 
              padding: '6px 10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '0.85rem',
              minHeight: '40px',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              background: '#fafafa'
            }}
          />
        </div>
      </div>

      {/* Управление воздушными судами */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '10px',
          paddingBottom: '6px',
          borderBottom: '1px solid #eee'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '0.85rem', color: '#1e90ff' }}>✈️</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#333' }}>Воздушные суда</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>
            <strong>{totals.totalAircraft}</strong> ед.
          </div>
        </div>

        {formData.aircrafts.map((aircraft, index) => (
          <CompactAircraftForm
            key={aircraft.id}
            aircraft={aircraft}
            index={index}
            onChange={handleAircraftChange}
            onRemove={handleRemoveAircraft}
            isLast={index === formData.aircrafts.length - 1}
            onAddAnother={handleAddAircraft}
          />
        ))}
      </div>

      {/* Сводная информация (только если есть ВС) */}
      {totals.totalAircraft > 0 && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          background: '#f0f7ff',
          borderRadius: '4px',
          border: '1px solid #d0e7ff'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e90ff' }}>{totals.totalAircraft}</div>
              <div style={{ fontSize: '0.7rem', color: '#666' }}>Всего ВС</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e90ff' }}>{totals.avgSpeed.toFixed(0)}</div>
              <div style={{ fontSize: '0.7rem', color: '#666' }}>Ср. скорость</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e90ff' }}>{totals.avgWidth.toFixed(1)}</div>
              <div style={{ fontSize: '0.7rem', color: '#666' }}>Ср. ширина</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e90ff' }}>{totals.avgHourCost.toFixed(0)}</div>
              <div style={{ fontSize: '0.7rem', color: '#666' }}>Ср. стоимость</div>
            </div>
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        justifyContent: 'flex-end',
        paddingTop: '10px',
        borderTop: '1px solid #eee'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            background: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: '#666'
          }}
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            padding: '6px 12px',
            border: 'none',
            background: 'linear-gradient(135deg, #1e90ff 0%, #3742fa 100%)',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}
        >
          {initialData ? '💾 Сохранить' : '✈️ Добавить'}
        </button>
      </div>
    </div>
  );
});

export default OperatorForm;