import axiosClient from '@/lib/axiosClient';
import { About, UpdateAboutData } from '@/types/about';

export const aboutService = {
  getAbout: async (): Promise<About> => {
    const response = await axiosClient.get('/about');
    return response.data.data;
  },

  updateAbout: async (data: UpdateAboutData): Promise<About> => {
    const response = await axiosClient.put('/about', data);
    return response.data.data;
  },
};

