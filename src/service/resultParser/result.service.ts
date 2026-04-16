/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"
import { serverFetch } from '@/lib/server-fetch';
import { revalidateTag } from 'next/cache';



export async function uploadResultPDF(formData: FormData) {
  try {
    const uploadFormData = new FormData();

    // (Optional) If you want to send extra data
    const data: any = {};
    formData.forEach((value, key) => {
      if (key !== 'file' && value) {
        data[key] = value;
      }
    });

    uploadFormData.append('data', JSON.stringify(data));

    const file = formData.get('file');
    if (file && file instanceof File && file.size > 0) {
      uploadFormData.append('file', file);
    }

    const response = await serverFetch.post('/result-parser/upload', {
      body: uploadFormData,
    });

    const result = await response.json();

    if (result.success) {
      // optional cache revalidation
      revalidateTag('results', 'revalidate');
    }

    return result;
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Something went wrong',
    };
  }
}