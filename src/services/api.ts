/**
 * API service module for handling all backend communications
 * This file demonstrates:
 * - TypeScript interfaces for type safety
 * - Axios for HTTP requests
 * - RESTful API integration
 */

import axios from 'axios';

const BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

/**
 * Customer interface defining the shape of customer data
 * Required fields for customer management
 */
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

/**
 * Training interface defining the shape of training session data
 * Includes customer information for relationship mapping
 */
export interface Training {
  id: number;
  date: string;
  duration: number;
  activity: string;
  customer: Customer;
}

/**
 * Interface for creating new training sessions
 * Note: customer field is a URL string pointing to the customer resource
 */
export interface NewTraining {
  date: string;
  duration: number;
  activity: string;
  customer: string; // URL to customer
}

/**
 * API service object containing all API operations
 * Demonstrates:
 * - CRUD operations
 * - Promise-based async/await pattern
 * - Error handling through axios
 */
const api = {
  // Customer operations
  /**
   * Fetches all customers from the backend
   * @returns Promise<Customer[]> Array of customers
   */
  getCustomers: async () => {
    const response = await axios.get(`${BASE_URL}/customers`);
    return response.data._embedded.customers;
  },

  /**
   * Creates a new customer
   * @param customer Customer data to be created
   * @returns Promise<Customer> Created customer data
   */
  addCustomer: async (customer: Customer) => {
    const response = await axios.post(`${BASE_URL}/customers`, customer);
    return response.data;
  },

  /**
   * Updates an existing customer
   * @param customerUrl Full URL of the customer resource
   * @param customer Updated customer data
   * @returns Promise<Customer> Updated customer data
   */
  updateCustomer: async (customerUrl: string, customer: Customer) => {
    const response = await axios.put(customerUrl, customer);
    return response.data;
  },

  /**
   * Deletes a customer
   * @param customerUrl Full URL of the customer resource
   */
  deleteCustomer: async (customerUrl: string) => {
    await axios.delete(customerUrl);
  },

  // Training operations
  /**
   * Fetches all training sessions
   * @returns Promise<Training[]> Array of training sessions
   */
  getTrainings: async () => {
    const response = await axios.get(`${BASE_URL}/gettrainings`);
    return response.data;
  },

  /**
   * Creates a new training session
   * @param training Training session data to be created
   * @returns Promise<Training> Created training session data
   */
  addTraining: async (training: NewTraining) => {
    const response = await axios.post(`${BASE_URL}/trainings`, training);
    return response.data;
  },

  /**
   * Deletes a training session
   * @param trainingId ID of the training session to delete
   */
  deleteTraining: async (trainingId: number) => {
    await axios.delete(`${BASE_URL}/trainings/${trainingId}`);
  },
};

export default api; 