import { useEffect, useState, useCallback } from 'react';
import { getBookmarkFirstImageWithCheck, getDefaultImages } from './imageUtils';
import { useAppDispatch } from '../store/hooks';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';

/**
 * Hook for fetching the first image of an item
 * Used in list views to fetch images asynchronously
 * @param itemId - The code/id of the item for image URL pattern
 * @param reduxId - The Redux store ID of the item
 * @param currentImages - Current images array if available
 * @param updateAction - Optional Redux action to update the image in store
 */
export const useFirstImage = (
  itemId: string | undefined,
  reduxId: string,
  currentImages?: string[],
  updateAction?: ActionCreatorWithPayload<{ id: string; url: string }>
) => {
  const dispatch = useAppDispatch();
  const [imageUrl, setImageUrl] = useState<string | null>(
    currentImages && currentImages.length > 0 ? currentImages[0] : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only fetch if image is not already available
    if (!imageUrl && itemId) {
      setLoading(true);
      setError(null);

      getBookmarkFirstImageWithCheck(itemId)
        .then((url) => {
          if (url) {
            setImageUrl(url);
            // Update Redux store if updateAction is provided
            if (updateAction) {
              dispatch(updateAction({ id: reduxId, url }));
            }
          }
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error('Failed to fetch image');
          setError(error);
          console.error(`Error fetching image for item ${reduxId}:`, error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [itemId, reduxId, imageUrl, dispatch, updateAction]);

  return { imageUrl, loading, error };
};

/**
 * Hook for fetching all images of an item
 * Used in detail screens to lazy load full image gallery
 */
export const useImages = (
  itemId: string | undefined,
  initialImages?: string[],
  maxImages: number = 5
) => {
  const [images, setImages] = useState<string[]>(initialImages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchedId, setLastFetchedId] = useState<string | undefined>();

  useEffect(() => {
    // If initial images are provided, use them
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
      setLastFetchedId(itemId);
      return;
    }

    // If no item ID, don't fetch
    if (!itemId) {
      return;
    }

    // If we already fetched for this ID, don't fetch again
    if (lastFetchedId === itemId) {
      return;
    }

    // Fetch images asynchronously
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      setLastFetchedId(itemId);

      try {
        const fetchedImages = await getDefaultImages(itemId, maxImages);
        setImages(fetchedImages);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch images');
        setError(error);
        console.error('Error loading images:', error);
        setLastFetchedId(undefined); // Allow retry on error
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [itemId, initialImages, maxImages, lastFetchedId]);

  const refetch = useCallback(async () => {
    if (!itemId) {
      return;
    }

    setLastFetchedId(undefined);
    setImages([]);
    setLoading(true);
    setError(null);

    try {
      const fetchedImages = await getDefaultImages(itemId, maxImages);
      setImages(fetchedImages);
      setLastFetchedId(itemId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch images');
      setError(error);
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  }, [itemId, maxImages]);

  return { images, loading, error, refetch };
};

/**
 * Hook for batch fetching first images for multiple items
 * Used in list screens to fetch images for all items asynchronously
 * @param items - Array of items to fetch images for
 * @param enabled - Whether to enable fetching
 * @param updateAction - Optional Redux action to update images in store
 */
export const useBatchImages = (
  items: Array<{ id: string; code?: string; images?: string[] }>,
  enabled: boolean = true,
  updateAction?: ActionCreatorWithPayload<{ id: string; url: string }>
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled || items.length === 0) {
      return;
    }

    // Fetch first image for each item that doesn't have one
    items.forEach((item) => {
      // Only fetch if images array is empty or missing
      if (!item.images || item.images.length === 0) {
        const itemId = item.code || item.id;
        if (itemId) {
          // Dispatch background fetch (fire and forget)
          getBookmarkFirstImageWithCheck(itemId)
            .then((imageUrl) => {
              if (imageUrl && updateAction) {
                dispatch(updateAction({ id: item.id, url: imageUrl }));
              }
            })
            .catch((error) => {
              console.error(`Error fetching image for item ${item.id}:`, error);
            });
        }
      }
    });
  }, [items, enabled, dispatch, updateAction]);
};
