export const uploadFile = async (file: File, signedUrl: string): Promise<void> => {
  await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop() || '';
};

export const isImage = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  return imageExtensions.includes(getFileExtension(filename).toLowerCase());
};

export const isVideo = (filename: string): boolean => {
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi'];
  return videoExtensions.includes(getFileExtension(filename).toLowerCase());
};


