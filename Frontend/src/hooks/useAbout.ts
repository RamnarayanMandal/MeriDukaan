import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aboutService } from '@/service/aboutService';
import { About, UpdateAboutData } from '@/types/about';
import { showSuccess, showError } from '@/lib/sweetAlert';

export const useAbout = () => {
  return useQuery<About>({
    queryKey: ['about'],
    queryFn: aboutService.getAbout,
  });
};

export const useUpdateAbout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAboutData) => aboutService.updateAbout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
      showSuccess('Success', 'About content updated successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to update about content');
    },
  });
};

