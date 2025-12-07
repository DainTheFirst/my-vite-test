import { useState, useEffect } from 'react';

// Хуки для работы с localStorage

export function useFieldsStorage() {
  const [fields, setFields] = useState(() => {
    const stored = localStorage.getItem('agroaviatech-fields');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('agroaviatech-fields', JSON.stringify(fields));
  }, [fields]);

  return [fields, setFields];
}

export function useOrdersStorage() {
  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem('agroaviatech-orders');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('agroaviatech-orders', JSON.stringify(orders));
  }, [orders]);

  return [orders, setOrders];
}

export function useOperatorsStorage() {
  const [operators, setOperators] = useState(() => {
    const stored = localStorage.getItem('agroaviatech-operators');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('agroaviatech-operators', JSON.stringify(operators));
  }, [operators]);

  return [operators, setOperators];
}

export function useCustomersStorage() {
  const [customers, setCustomers] = useState(() => {
    const stored = localStorage.getItem('agroaviatech-customers');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('agroaviatech-customers', JSON.stringify(customers));
  }, [customers]);

  return [customers, setCustomers];
}