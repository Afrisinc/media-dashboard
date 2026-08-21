import { describeApiError } from "@/lib/apiFetch";
import getApiClient from "@/services/apiClient";
import { useMutation } from "@tanstack/react-query";

export const useImageUpload = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        // The boundary is set by the browser; naming a Content-Type here would
        // omit it and the upload would arrive unparseable.
        const { data } = await getApiClient().post<{ data: { url: string } }>(
          "/media/upload/image",
          formData,
        );
        return data.data.url;
      } catch (error) {
        throw new Error(describeApiError(error));
      }
    },
  });
};
