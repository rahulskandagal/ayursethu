import { api } from "./client";

export interface UploadResult {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadResult>("/uploads", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
