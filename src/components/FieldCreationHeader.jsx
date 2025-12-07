import React from 'react';

const FieldCreationHeader = ({ onCancel, title = "Создание нового поля" }) => {
  return (
    <div className="field-creation-header">
      <h2>{title}</h2>
      <button onClick={onCancel} className="btn btn-secondary">
        Отмена
      </button>
    </div>
  );
};

export default FieldCreationHeader;