import type * as MediaLibrary from "expo-media-library";
import { FlatList, Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";
import { useRecentPhotos } from "../hooks/use-recent-photos";
import { CameraButton } from "./camera-button";
import { PhotoThumbnail } from "./photo-thumbnail";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledPressable = withUniwind(Pressable);

type GridItem =
  | { type: "camera" }
  | { type: "photo"; asset: MediaLibrary.Asset };

interface PhotoGridProps {
  onCameraPress: () => void;
  onPhotoSelect: (uri: string, width: number, height: number) => void;
  isDisabled?: boolean;
}

export const PhotoGrid = ({
  onCameraPress,
  onPhotoSelect,
  isDisabled,
}: PhotoGridProps) => {
  const { photos, isLoading, hasPermission, requestPermission } =
    useRecentPhotos(20);

  const renderItem = ({ item }: { item: GridItem }) => {
    if (item.type === "camera") {
      return <CameraButton onPress={onCameraPress} isDisabled={isDisabled} />;
    }

    return (
      <PhotoThumbnail
        uri={item.asset.uri}
        onPress={() =>
          onPhotoSelect(item.asset.uri, item.asset.width, item.asset.height)
        }
        isDisabled={isDisabled}
      />
    );
  };

  const data: GridItem[] = [
    { type: "camera" },
    ...photos.map((asset) => ({ type: "photo" as const, asset })),
  ];

  // パーミッション未許可の場合
  if (hasPermission === false && !isLoading) {
    return (
      <StyledView className="flex-row items-center px-4">
        <CameraButton onPress={onCameraPress} isDisabled={isDisabled} />
        <StyledPressable
          className="ml-2 h-20 flex-1 items-center justify-center rounded-xl bg-amber-50"
          onPress={requestPermission}
        >
          <StyledText className="text-amber-700 text-sm">
            写真へのアクセスを許可
          </StyledText>
        </StyledPressable>
      </StyledView>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, _index) =>
        item.type === "camera" ? "camera" : item.asset.id
      }
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      style={{ height: 80 }}
    />
  );
};
