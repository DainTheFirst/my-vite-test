import config from '../config';

export const initialMockFields = [
  {
    id: 'field_1',
    name: 'Поле №1',
    coordinates: [
      [55.7558, 37.6173],
      [55.7500, 37.6200], 
      [55.7450, 37.6150],
      [55.7558, 37.6173]
    ],
    area: 45.2,
    crop: 'пшеница',
    region: 'Московская область',
    owner: 'ИП Петров',
    customerId: 'customer_1',
    status: 'ожидает',
    price: 1000,
    processingDate: '2024-01-15'
  }
];
// Моковые данные для демонстрации

export const mockOperators = [
  {
    id: 'operator_1',
    name: 'Авиапарк №1',
    contact: '+7 (495) 123-45-67',
    price: 1500,
    aircraft: [
      { id: 'ac_1', name: 'АН-2', status: 'доступен' },
      { id: 'ac_2', name: 'Ми-2', status: 'в ремонте' }
    ]
  },
  {
    id: 'operator_2',
    name: 'Сельхозавиация',
    contact: '+7 (495) 765-43-21', 
    price: 1300,
    aircraft: [
      { id: 'ac_3', name: 'АН-2', status: 'доступен' },
      { id: 'ac_4', name: 'Ансат', status: 'доступен' }
    ]
  }
];

export const initialCustomers = [
  {
    id: 'customer_1',
    name: 'ООО "Агрохолдинг"',
    contact: 'Иван Петров, +7 (495) 111-22-33'
  },
  {
    id: 'customer_2', 
    name: 'Фермерское хозяйство "Нива"',
    contact: 'Сергей Сидоров, +7 (495) 444-55-66'
  }
];

export const initialOrders = [
  {
    id: 'order_1',
    fieldId: 'field_1',
    fieldName: 'Поле №1',
    operatorId: 'operator_1',
    operatorName: 'Авиапарк №1',
    customerId: 'customer_1',
    area: 120.5,
    totalCost: 180750,
    date: '2024-06-10',
    status: 'выполнено',
    coordinates: [55.7558, 37.6173]
  }
];