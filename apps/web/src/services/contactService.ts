import apiClient from './api';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  async submitContact(data: ContactFormData): Promise<void> {
    await apiClient.post('/contact', data);
  },
};
