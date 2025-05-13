/**
 * Array of placeholder artisan souk images to use when real images are not available
 */
export const artisanSoukImages = [
  'https://images.unsplash.com/photo-1580413837567-999e9ea2a063',
  'https://images.unsplash.com/photo-1581378579295-53bdfa3b6d3e',
  'https://images.unsplash.com/photo-1557531365-e8b22d93dbd0',
  'https://images.unsplash.com/photo-1535372467890-9fc862a991a5',
  'https://images.unsplash.com/photo-1548013146-72479768bada',
  'https://images.unsplash.com/photo-1534430224470-5453979ae6ff',
  'https://images.unsplash.com/photo-1590418606746-018840f9cd0f',
  'https://images.unsplash.com/photo-1590246815117-be54ce2a0350',
  'https://images.unsplash.com/photo-1573148893371-25492146cb95',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329',
];

/**
 * Returns a random artisan souk image URL from the placeholder array
 * @returns string - URL of a random artisan souk image
 */
export const getRandomArtisanImage = (): string => {
  const randomIndex = Math.floor(Math.random() * artisanSoukImages.length);
  return artisanSoukImages[randomIndex];
};

/**
 * Returns an array of random artisan souk image URLs
 * @param count - Number of images to return
 * @returns string[] - Array of random artisan souk image URLs
 */
export const getRandomArtisanImages = (count: number = 3): string[] => {
  const images: string[] = [];
  const availableImages = [...artisanSoukImages];
  
  // Get random images without repeating
  for (let i = 0; i < count && availableImages.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    images.push(availableImages[randomIndex]);
    availableImages.splice(randomIndex, 1);
  }
  
  return images;
};

/**
 * Checks if an image URL is valid
 * @param url - The image URL to check
 * @returns Promise<boolean> - True if the image is valid
 */
export const isImageValid = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking image validity:', error);
    return false;
  }
};

/**
 * Returns a fallback image URL if the provided URL is empty or invalid
 * @param imageUrl - The original image URL
 * @param fallbackImage - Optional specific fallback image URL
 * @returns string - Either the original URL or a fallback
 */
export const getImageWithFallback = (
  imageUrl: string | undefined,
  fallbackImage?: string
): string => {
  if (!imageUrl) {
    return fallbackImage || getRandomArtisanImage();
  }
  return imageUrl;
};

/**
 * Checks if an image exists at the given URL
 * @param url - The image URL to check
 * @returns Promise<boolean> - True if the image exists and is accessible
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.status !== 403 && response.status !== 404;
  } catch (error) {
    console.error('Error checking image existence:', error);
    return false;
  }
};

/**
 * Generates default images with the specified pattern when the images array is empty
 * @param id - The ID to use in the image URL pattern
 * @returns Promise<string[]> - Array of available default image URLs
 */
export const getDefaultImages = async (id: string): Promise<string[]> => {
  const baseUrl = 'https://storage.googleapis.com/mview-media/';
  const images: string[] = [];
  let i = 1;
  
  while (true) {
    // Try both webp and jpg extensions
    const webpUrl = `${baseUrl}${id}.${i}.webp`;
    const jpgUrl = `${baseUrl}${id}.${i}.jpg`;
    
    const webpExists = await checkImageExists(webpUrl);
    const jpgExists = await checkImageExists(jpgUrl);
    
    if (!webpExists && !jpgExists) {
      break;
    }
    
    // Prefer webp if available, otherwise use jpg
    if (webpExists) {
      images.push(webpUrl);
    } else if (jpgExists) {
      images.push(jpgUrl);
    }
    
    i++;
  }

  if(images.length > 0) {
    console.log("images", images)
  }
  
  return images;
};

/**
 * Returns either the provided images array or default images if empty
 * @param images - The original images array
 * @param id - The ID to use for default images if needed
 * @returns Promise<string[]> - Either the original images or default images
 */
export const getImagesWithDefaults = async (images: string[], id: string): Promise<string[]> => {
  if (!images || images.length === 0) {
    return await getDefaultImages(id);
  }
  return images;
}; 