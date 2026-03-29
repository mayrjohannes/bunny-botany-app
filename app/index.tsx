import { View, Text, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      cameraType: ImagePicker.CameraType.back
    });

    if (!res.canceled) {
      const photo = res.assets[0];

      // 👉 Übergabe an nächsten Screen
      router.push({
        pathname: "/result",
        params: { uri: photo.uri }
      });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        🐰 BunnyBotany
      </Text>

      <TouchableOpacity
        onPress={takePhoto}
        style={{
          backgroundColor: "#4CAF50",
          padding: 20,
          borderRadius: 20,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18 }}>
          📸 Foto aufnehmen
        </Text>
      </TouchableOpacity>
    </View>
  );
}
