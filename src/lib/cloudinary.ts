export const uploadImage = async (file: File): Promise<string> => {
  // Validate inputs
  if (!file) {
    console.error('Upload error: No file provided');
    throw new Error('No file provided for upload');
  }
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.error('Upload error: Cloudinary cloud name is not set');
    throw new Error('Cloudinary cloud name is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'contestant_image'); // Hardcode to contestant_image
  formData.append('folder', 'contestant'); // Hardcode to contestant

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary API error:', errorData);
      throw new Error(`Image upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    if (!data.secure_url) {
      console.error('Upload error: No secure_url in response', data);
      throw new Error('Image upload failed: No secure URL returned');
    }

    return data.secure_url; // Return the secure URL
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};