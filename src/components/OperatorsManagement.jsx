import React, { useState, useCallback, useMemo } from 'react';
import { generateId, calculateOperatorStats, calculateAircraftEfficiency } from '../utils/storageHelpers';
import OperatorForm from './OperatorForm';

const OperatorsManagement = ({ 
  operators = [], 
  setOperators, 
  orders = [],
  onClose 
}) => {
  const [editingOperator, setEditingOperator] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Обработчик сохранения авиакомпании
  const handleSaveOperator = useCallback((formData) => {
    const operatorData = {
      ...formData,
      id: editingOperator ? editingOperator.id : generateId(),
      createdAt: editingOperator ? editingOperator.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingOperator) {
      setOperators(operators.map(op => op.id === editingOperator.id ? operatorData : op));
    } else {
      setOperators(prev => [...prev, operatorData]);
    }

    setShowForm(false);
    setEditingOperator(null);
  }, [editingOperator, operators, setOperators]);

  // Обработчик удаления авиакомпании
  const handleDeleteOperator = useCallback((operatorId) => {
    const operatorOrders = orders?.filter(order => order.operatorId === operatorId) || [];
    
    if (operatorOrders.length > 0) {
      const confirmMessage = `У авиакомпании есть связанные заявки: ${operatorOrders.length} шт.\n\nВы уверены, что хотите удалить эту авиакомпанию?`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setOperators(operators.filter(op => op.id !== operatorId));
  }, [orders, operators, setOperators]);

  // Статистика по авиакомпании
  const getOperatorStats = useCallback((operatorId) => {
    const operator = operators.find(op => op.id === operatorId);
    return calculateOperatorStats(orders, operator);
  }, [orders, operators]);

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
        maxWidth: '95vw',
        maxHeight: '90vh',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Заголовок */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #eaeaea',
          background: '#f8f9fa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333', fontWeight: '600' }}>
              {showForm ? '✈️ Авиакомпания' : '✈️ Авиакомпании'}
            </h3>
            {!showForm && (
              <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '0.75rem' }}>
                Управление парком воздушных судов
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              padding: 0
            }}
            title="Закрыть"
          >
            ✕
          </button>
        </div>
        
        {/* Контент */}
        <div style={{
          padding: showForm ? '0' : '16px',
          overflowY: 'auto',
          flex: 1
        }}>
          {showForm ? (
            <OperatorForm
              key={editingOperator?.id || 'new-operator'}
              initialData={editingOperator}
              onSubmit={handleSaveOperator}
              onCancel={() => {
                setShowForm(false);
                setEditingOperator(null);
              }}
            />
          ) : (
            <CompactOperatorsList
              operators={operators}
              onEdit={setEditingOperator}
              onDelete={handleDeleteOperator}
              getOperatorStats={getOperatorStats}
              setShowForm={setShowForm}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </>
  );
};

// Компактный список авиакомпаний
const CompactOperatorsList = React.memo(({ 
  operators, 
  onEdit, 
  onDelete, 
  getOperatorStats,
  setShowForm,
  onClose
}) => {
  if (!operators || !Array.isArray(operators)) {
    return <div style={{ padding: '20px', color: '#666', fontSize: '0.9rem' }}>Данные недоступны</div>;
  }

  return (
    <div>
      {/* Панель действий */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '12px',
        gap: '8px'
      }}>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          <span style={{ color: '#333', fontWeight: '500' }}>{operators.length}</span> авиакомпаний
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => {
              onEdit(null);
              setShowForm(true);
            }}
            style={{
              padding: '5px 10px',
              border: 'none',
              background: 'linear-gradient(135deg, #1e90ff 0%, #3742fa 100%)',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            + Добавить
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '5px 10px',
              border: '1px solid #ddd',
              background: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Готово
          </button>
        </div>
      </div>

      {operators.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '30px 15px', 
          background: '#f8f9fa', 
          borderRadius: '6px',
          border: '1px dashed #ddd',
          fontSize: '0.85rem'
        }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>Нет зарегистрированных авиакомпаний</p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '6px 12px',
              border: 'none',
              background: 'linear-gradient(135deg, #1e90ff 0%, #3742fa 100%)',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            + Добавить первую
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '10px'
        }}>
          {operators.map(operator => (
            <OperatorCard
              key={operator.id}
              operator={operator}
              onEdit={onEdit}
              onDelete={onDelete}
              getOperatorStats={getOperatorStats}
              setShowForm={setShowForm}
            />
          ))}
        </div>
      )}
    </div>
  );
});

CompactOperatorsList.displayName = 'CompactOperatorsList';

// Компактная карточка авиакомпании
const OperatorCard = React.memo(({ 
  operator, 
  onEdit, 
  onDelete, 
  getOperatorStats,
  setShowForm 
}) => {
  const stats = useMemo(() => getOperatorStats(operator.id), [operator.id, getOperatorStats]);
  const status = operator.status || 'активен';
  const aircrafts = operator.aircrafts || [];
  const totalAircraft = aircrafts.reduce((sum, ac) => sum + (ac.count || 1), 0);
  
  const statusColors = {
    'активен': { bg: '#e8f5e8', color: '#2e7d32', border: '#c8e6c9' },
    'неактивен': { bg: '#ffebee', color: '#c62828', border: '#ffcdd2' },
    'в ремонте': { bg: '#fff8e1', color: '#f57f17', border: '#ffecb3' }
  };
  
  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '10px',
        background: 'white',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}
      onClick={() => {
        onEdit(operator);
        setShowForm(true);
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#1e90ff';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 144, 255, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e0e0e0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <h4 style={{ 
              margin: 0, 
              color: '#333', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {String(operator.name || 'Без названия')}
            </h4>
            <span style={{ 
              background: statusColors[status]?.bg || '#e0e0e0',
              color: statusColors[status]?.color || '#333',
              border: `1px solid ${statusColors[status]?.border || '#d0d0d0'}`,
              fontSize: '0.65rem', 
              padding: '1px 4px', 
              borderRadius: '8px',
              flexShrink: 0
            }}>
              {status}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#666' }}>
            {operator.pilot && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span>👨‍✈️</span>
                <span>{String(operator.pilot)}</span>
              </span>
            )}
            {operator.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span>📱</span>
                <span>{String(operator.phone)}</span>
              </span>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '6px' }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(operator);
              setShowForm(true);
            }}
            style={{
              padding: '3px 6px',
              border: '1px solid #ddd',
              background: 'white',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              lineHeight: 1
            }}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(operator.id);
            }}
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
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {/* Информация о ВС */}
      {aircrafts.length > 0 ? (
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <span>✈️</span>
              <span>{aircrafts.map(ac => ac.type).filter(Boolean).join(', ') || 'Типы не указаны'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🔢</span>
              <span>{totalAircraft} ед. / {aircrafts.length} типов</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '0.75rem', color: '#999', fontStyle: 'italic', marginBottom: '6px' }}>
          ✈️ Нет информации о воздушных судах
        </div>
      )}
      
      {operator.notes && (
        <div style={{ 
          fontSize: '0.7rem', 
          color: '#888', 
          padding: '4px',
          background: '#f8f9fa',
          borderRadius: '3px',
          marginBottom: '6px',
          lineHeight: 1.2
        }}>
          <div style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            📝 {String(operator.notes)}
          </div>
        </div>
      )}
      
      {/* Статистика */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '6px',
        borderTop: '1px solid #eee',
        fontSize: '0.7rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: '600', color: '#1e90ff', fontSize: '0.8rem' }}>{stats.totalOrders}</div>
          <div style={{ color: '#888', fontSize: '0.6rem' }}>заявок</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: '600', color: '#1e90ff', fontSize: '0.8rem' }}>{totalAircraft}</div>
          <div style={{ color: '#888', fontSize: '0.6rem' }}>ВС</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: '600', color: '#1e90ff', fontSize: '0.8rem' }}>{aircrafts.length}</div>
          <div style={{ color: '#888', fontSize: '0.6rem' }}>типов</div>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '3px',
          padding: '2px 6px',
          background: '#1e90ff',
          color: 'white',
          borderRadius: '8px',
          fontSize: '0.65rem',
          fontWeight: '500'
        }}>
          <span style={{ fontSize: '0.6rem' }}>→</span>
          редактировать
        </div>
      </div>
    </div>
  );
});

OperatorCard.displayName = 'OperatorCard';

export default OperatorsManagement;