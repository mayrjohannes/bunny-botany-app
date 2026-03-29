import { useState } from "react";
import { View, Text, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      upload(res.assets[0]);
    }
  };

const upload = async (photo) => {
  console.log("📸 PHOTO:", photo);

  const formData = new FormData();

  // 🔥 WICHTIG: Web vs Mobile unterscheiden
  if (photo.uri.startsWith("blob:")) {
    console.log("🌐 Web detected");

    const response = await fetch(photo.uri);
    const blob = await response.blob();

    console.log("📦 Blob:", blob);

    formData.append("images", blob, "photo.jpg");
  } else {
    console.log("📱 Mobile detected");

    formData.append("images", {
      uri: photo.uri,
      name: "photo.jpg",
      type: "image/jpeg"
    });
  }

  formData.append("organs", "leaf");

  try {
    console.log("🚀 Sending request...");

    const res = await fetch("https://bunnybotany.prevus.at/identify", {
      method: "POST",
      body: formData
    });

    console.log("📥 Status:", res.status);

    const text = await res.text();
    console.log("📥 RAW:", text);

    const data = JSON.parse(text);
    console.log("✅ RESULT:", data);

    setResult(data);

  } catch (err) {
    console.error("🔥 ERROR:", err);
  }
};


  return (
    <View style={{ padding: 20 }}>
      <Button title="📸 Foto machen" onPress={takePhoto} />

      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}

      {result?.plantnet && (
        <View>
          <Text>🌿 {result.plantnet.species}</Text>
          <Text>🐰 Essbar: {String(result.rabbitInfo.rabbitSafe)}</Text>
        </View>
      )}
      {result?.error && (
        <Text style={{ color: "red" }}>
    �     �� {result.error}
        </Text>
      )}

    </View>
  );
}
