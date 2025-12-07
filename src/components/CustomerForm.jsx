import React, { useState, useEffect, useCallback, useRef } from 'react';

// Компоненты ввода с сохранением фокуса
const FocusableInput = React.memo(({ label, value, onChange, placeholder, type = 'text', ...props }) => {
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
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>
        {label}
      </label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ 
          width: '100%', 
          padding: '8px 12px', 
          border: '1px solid #ddd', 
          borderRadius: '6px', 
          fontSize: '0.95rem',
          boxSizing: 'border-box'
        }}
        {...props}
      />
    </div>
  );
});

const FocusableTextarea = React.memo(({ label, value, onChange, placeholder, ...props }) => {
  const textareaRef = useRef(null);
  
  const handleChange = useCallback((e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    
    onChange(e);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(start, end);
      }
    }, 0);
  }, [onChange]);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>
        {label}
      </label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ 
          width: '100%', 
          padding: '8px 12px', 
          border: '1px solid #ddd', 
          borderRadius: '6px',
          fontSize: '0.95rem',
          minHeight: '60px',
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: 'inherit'
        }}
        {...props}
      />
    </div>
  );
});

const CustomerForm = React.memo(({ 
  initialData = null, 
  onSubmit, 
  onCancel 
}) => {
  // Локальное состояние формы
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Инициализация формы
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        contact: initialData.contact || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        contact: '',
        address: '',
        phone: '',
        email: '',
        notes: ''
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

  const handleSubmit = useCallback(() => {
    if (!formData.name.trim()) {
      alert('Введите название компании');
      return;
    }
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#333' }}>
          {initialData ? '✏️ Редактирование заказчика' : '➕ Новый заказчик'}
        </h3>
        <button 
          onClick={handleCancel}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '20px', 
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <FocusableInput
          label="Название компании *"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="ООО 'Агрохолдинг'"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <FocusableInput
          label="Контактное лицо"
          value={formData.contact}
          onChange={handleChange('contact')}
          placeholder="Иванов Иван"
        />

        <FocusableInput
          label="Телефон"
          value={formData.phone}
          onChange={handleChange('phone')}
          placeholder="+7 (999) 123-45-67"
          type="tel"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <FocusableInput
          label="Email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="contact@agro.ru"
          type="email"
        />

        <FocusableInput
          label="Адрес"
          value={formData.address}
          onChange={handleChange('address')}
          placeholder="г. Москва, ул. Сельскохозяйственная, д. 1"
        />
      </div>

      <div style={{ marginBottom: '25px' }}>
        <FocusableTextarea
          label="Примечания"
          value={formData.notes}
          onChange={handleChange('notes')}
          placeholder="Дополнительная информация..."
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleCancel}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            background: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            minWidth: '80px'
          }}
        >
          Отмена
        </button>
        <button
          onClick={handleSubmit}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            minWidth: '100px'
          }}
        >
          {initialData ? '💾 Сохранить' : '➕ Добавить'}
        </button>
      </div>
    </div>
  );
});

export default CustomerForm;