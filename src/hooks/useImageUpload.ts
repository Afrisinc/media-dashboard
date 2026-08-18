import { useMutation } from "@tanstack/react-query";
import { getRuntimeConfig } from "@/lib/config";
import { getToken } from "@/lib/authUtils";

export const useImageUpload = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const config = getRuntimeConfig();
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${config.serverUrl}/media/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.resp_msg || "Upload failed");
      }

      const result = await response.json();
      return result.data.url;
    },
  });
};
