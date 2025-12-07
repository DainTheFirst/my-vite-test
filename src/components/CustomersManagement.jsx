import React, { useState, useCallback, useMemo } from 'react';
import { generateId } from '../utils/storageHelpers';
import CustomerForm from './CustomerForm'; // Импортируем новую форму

const CustomersManagement = ({ 
  customers = [], 
  setCustomers, 
  selectedCustomer, 
  onSelectCustomer, 
  onClose,
  fields = [], 
  orders = [] 
}) => {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Обработчик сохранения заказчика
  const handleSaveCustomer = useCallback((formData) => {
    const customerData = {
      ...formData,
      id: editingCustomer ? editingCustomer.id : generateId(),
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingCustomer) {
      setCustomers(customers.map(customer => 
        customer.id === editingCustomer.id ? customerData : customer
      ));
    } else {
      setCustomers(prev => [...prev, customerData]);
    }

    setShowForm(false);
    setEditingCustomer(null);
  }, [editingCustomer, customers, setCustomers]);

  // Обработчик удаления заказчика
  const handleDeleteCustomer = useCallback((customerId) => {
    const customerFields = (fields || []).filter(field => field.customerId === customerId);
    const customerOrders = (orders || []).filter(order => order.customerId === customerId);
    
    if (customerFields.length > 0 || customerOrders.length > 0) {
      const confirmMessage = `
        У заказчика есть данные:
        - Полей: ${customerFields.length}
        - Заявок: ${customerOrders.length}
        
        Удалить заказчика и все связанные данные?`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setCustomers(customers.filter(customer => customer.id !== customerId));
    
    if (selectedCustomer === customerId && customers.length > 1) {
      const remaining = customers.filter(customer => customer.id !== customerId);
      onSelectCustomer(remaining[0].id);
    }
  }, [customers, fields, orders, selectedCustomer, onSelectCustomer, setCustomers]);

  // Статистика по заказчику
  const getCustomerStats = useCallback((customerId) => {
    const customerFields = (fields || []).filter(field => field.customerId === customerId);
    const customerOrders = (orders || []).filter(order => order.customerId === customerId);
    
    return {
      fields: customerFields.length,
      orders: customerOrders.length,
      totalArea: customerFields.reduce((sum, field) => sum + (field.area || 0), 0)
    };
  }, [fields, orders]);

  // Компонент карточки заказчика
  const CustomerCard = React.memo(({ customer, isSelected, onSelect, onEdit, onDelete }) => {
    const stats = useMemo(() => getCustomerStats(customer.id), [customer.id, getCustomerStats]);
    
    return (
      <div
        style={{
          border: isSelected ? '1px solid #667eea' : '1px solid #e0e0e0',
          borderRadius: '6px',
          padding: '12px',
          background: isSelected 
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' 
            : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={onSelect}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <h4 style={{ 
                margin: 0, 
                color: '#333', 
                fontSize: '0.95rem', 
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {String(customer.name || '')}
              </h4>
              {isSelected && (
                <span style={{ 
                  background: '#667eea', 
                  color: 'white', 
                  fontSize: '0.65rem', 
                  padding: '1px 4px', 
                  borderRadius: '8px',
                  flexShrink: 0
                }}>
                  активен
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#666', flexWrap: 'wrap' }}>
              {customer.contact && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ opacity: 0.7 }}>👤</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{String(customer.contact)}</span>
                </span>
              )}
              {customer.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ opacity: 0.7 }}>📱</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{String(customer.phone)}</span>
                </span>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '6px' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(customer);
              }}
              style={{
                padding: '3px 6px',
                border: '1px solid #ddd',
                background: 'white',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                lineHeight: 1
              }}
              title="Редактировать"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(customer.id);
              }}
              style={{
                padding: '3px 6px',
                border: '1px solid #ff6b6b',
                background: '#ff6b6b',
                color: 'white',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                lineHeight: 1
              }}
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '6px' }}>
          {customer.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <span style={{ opacity: 0.7 }}>📧</span>
              <span style={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{String(customer.email)}</span>
            </div>
          )}
          
          {customer.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ opacity: 0.7 }}>📍</span>
              <span style={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{String(customer.address)}</span>
            </div>
          )}
        </div>
        
        {customer.notes && (
          <div style={{ 
            fontSize: '0.7rem', 
            color: '#888', 
            fontStyle: 'italic',
            padding: '4px',
            background: '#f8f9fa',
            borderRadius: '3px',
            marginBottom: '8px',
            lineHeight: 1.2
          }}>
            <div style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              📝 {String(customer.notes)}
            </div>
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px solid #eee',
          fontSize: '0.7rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: '600', color: '#667eea', fontSize: '0.85rem' }}>{stats.fields}</div>
            <div style={{ color: '#888', fontSize: '0.65rem' }}>полей</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: '600', color: '#667eea', fontSize: '0.85rem' }}>{stats.orders}</div>
            <div style={{ color: '#888', fontSize: '0.65rem' }}>заявок</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: '600', color: '#667eea', fontSize: '0.85rem' }}>{stats.totalArea.toFixed(1)}</div>
            <div style={{ color: '#888', fontSize: '0.65rem' }}>га</div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '3px',
            padding: '2px 6px',
            background: isSelected ? '#667eea' : '#f0f0f0',
            color: isSelected ? 'white' : '#666',
            borderRadius: '10px',
            fontSize: '0.65rem',
            fontWeight: '500'
          }}>
            <span style={{ fontSize: '0.6rem' }}>{isSelected ? '✓' : '→'}</span>
            {isSelected ? 'активен' : 'выбрать'}
          </div>
        </div>
      </div>
    );
  });

  CustomerCard.displayName = 'CustomerCard';

  // Компактный список заказчиков
  const CompactCustomersList = React.memo(() => {
    if (!customers || !Array.isArray(customers)) {
      return <div>Ошибка: данные заказчиков недоступны</div>;
    }

    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>👥 Заказчики ({customers.length})</h3>
            <p style={{ margin: '3px 0 0 0', color: '#666', fontSize: '0.8rem' }}>
              Выберите или добавьте заказчика
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setShowForm(true);
              }}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              ➕ Добавить
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}
            >
              Готово
            </button>
          </div>
        </div>

        {customers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 15px', 
            background: '#f8f9fa', 
            borderRadius: '6px',
            border: '1px dashed #ddd',
            fontSize: '0.9rem'
          }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>Нет зарегистрированных заказчиков</p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '6px 15px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              ➕ Добавить первого заказчика
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
            maxHeight: 'calc(85vh - 150px)',
            overflowY: 'auto',
            padding: '2px'
          }}>
            {customers.map(customer => {
              if (!customer || typeof customer !== 'object') {
                return null;
              }

              return (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedCustomer === customer.id}
                  onSelect={() => onSelectCustomer(customer.id)}
                  onEdit={(cust) => {
                    setEditingCustomer(cust);
                    setShowForm(true);
                  }}
                  onDelete={handleDeleteCustomer}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  });

  CompactCustomersList.displayName = 'CompactCustomersList';

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000
      }} onClick={onClose} />
      
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: showForm ? '550px' : '700px',
        maxWidth: '90vw',
        maxHeight: '85vh',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #eaeaea',
          background: '#f8f9fa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px 12px 0 0'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#333' }}>
              {showForm 
                ? (editingCustomer ? '✏️ Редактирование' : '➕ Новый заказчик') 
                : '👥 Управление заказчиками'
              }
            </h2>
            {!showForm && (
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.85rem' }}>
                Выберите или добавьте заказчика для работы
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}
            title="Закрыть"
          >
            ✕
          </button>
        </div>
        
        <div style={{
          padding: showForm ? '0' : '20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {showForm ? (
            <CustomerForm
              key={editingCustomer?.id || 'new-customer'}
              initialData={editingCustomer}
              onSubmit={handleSaveCustomer}
              onCancel={() => {
                setShowForm(false);
                setEditingCustomer(null);
              }}
            />
          ) : (
            <CompactCustomersList />
          )}
        </div>
      </div>
    </>
  );
};

export default CustomersManagement;