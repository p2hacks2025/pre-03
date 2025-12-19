import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useState } from "react";

interface RecentPhotosState {
  photos: MediaLibrary.Asset[];
  isLoading: boolean;
  hasPermission: boolean | null;
}

export const useRecentPhotos = (limit = 20) => {
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [state, setState] = useState<RecentPhotosState>({
    photos: [],
    isLoading: true,
    hasPermission: null,
  });

  const fetchPhotos = useCallback(async () => {
    if (permission?.status !== "granted") {
      setState((prev) => ({ ...prev, isLoading: false, hasPermission: false }));
      return;
    }

    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        first: limit,
        mediaType: ["photo"],
        sortBy: [MediaLibrary.SortBy.modificationTime],
      });

      setState({
        photos: assets,
        isLoading: false,
        hasPermission: true,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [permission?.status, limit]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    ...state,
    requestPermission,
    refresh: fetchPhotos,
  };
};
