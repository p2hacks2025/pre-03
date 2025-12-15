import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Card, Divider, Spinner } from "heroui-native";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { StatusItem, useHealthCheck } from "@/features/health";

const StyledView = withUniwind(View);
const StyledText = withUniwind(Text);
const StyledScrollView = withUniwind(ScrollView);
const StyledIonicons = withUniwind(Ionicons);

export const HealthScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { api, db, isLoading, allOk, refresh } = useHealthCheck();

  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
        <StyledText className="mt-4 text-muted">
          Checking system status...
        </StyledText>
      </StyledView>
    );
  }

  return (
    <StyledScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
      }}
    >
      <StyledView className="mb-6 items-center">
        <StyledView
          className={`size-12 items-center justify-center rounded-full ${
            allOk ? "bg-success-soft-hover" : "bg-danger-soft-hover"
          }`}
        >
          {allOk ? (
            <StyledIonicons
              name="checkmark-circle"
              size={28}
              className="text-success"
            />
          ) : (
            <StyledIonicons
              name="close-circle"
              size={28}
              className="text-danger"
            />
          )}
        </StyledView>
        <StyledText className="mt-2 font-semibold text-foreground text-lg">
          {allOk ? "All Systems Operational" : "System Issues Detected"}
        </StyledText>
      </StyledView>

      <Card className="mb-6">
        <Card.Body className="p-0">
          <StatusItem
            icon="server-outline"
            title="API Server"
            message={api?.message ?? "Unknown"}
            ok={api?.ok}
          />
          <Divider />
          <StatusItem
            icon="globe-outline"
            title="Environment"
            message="API runtime"
            badge={{
              label: api?.environment ?? "unknown",
              color: api?.environment === "production" ? "success" : "default",
            }}
          />
          <Divider />
          <StatusItem
            icon="server-outline"
            title="Database"
            message={db?.message ?? "Unknown"}
            ok={db?.ok}
          />
        </Card.Body>
      </Card>

      {/* Actions */}
      <StyledView className="gap-3">
        <Button variant="secondary" onPress={refresh}>
          <StyledIonicons
            name="refresh-outline"
            size={18}
            className="text-accent-soft-foreground"
          />
          <Button.Label>Refresh Status</Button.Label>
        </Button>
        <Button variant="ghost" onPress={() => router.back()}>
          <Button.Label>Back to Home</Button.Label>
        </Button>
      </StyledView>
    </StyledScrollView>
  );
};
