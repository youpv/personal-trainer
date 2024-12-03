import axios from 'axios';

const BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

export interface Customer {
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
  _links?: {
    self: {
      href: string;
    };
  };
}

export interface Training {
  id: number;
  date: string;
  duration: number;
  activity: string;
  customer: Customer;
}

export interface NewTraining {
  date: string;
  duration: number;
  activity: string;
  customer: string; // URL to customer
}

const api = {
  // Customer operations
  getCustomers: async () => {
    const response = await axios.get(`${BASE_URL}/customers`);
    return response.data._embedded.customers;
  },

  addCustomer: async (customer: Customer) => {
    const response = await axios.post(`${BASE_URL}/customers`, customer);
    return response.data;
  },

  updateCustomer: async (customerUrl: string, customer: Customer) => {
    const response = await axios.put(customerUrl, customer);
    return response.data;
  },

  deleteCustomer: async (customerUrl: string) => {
    await axios.delete(customerUrl);
  },

  // Training operations
  getTrainings: async () => {
    const response = await axios.get(`${BASE_URL}/gettrainings`);
    return response.data;
  },

  addTraining: async (training: NewTraining) => {
    const response = await axios.post(`${BASE_URL}/trainings`, training);
    return response.data;
  },

  deleteTraining: async (trainingId: number) => {
    await axios.delete(`${BASE_URL}/trainings/${trainingId}`);
  },
};

export default api; 