import { useState } from "react";
import { View, Text, Button, Image } from "react-native";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const API_URL = Constants.expoConfig.extra.apiUrl;

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
  console.log("ðŸ“¸ PHOTO:", photo);

  const formData = new FormData();

  // ðŸ”¥ WICHTIG: Web vs Mobile unterscheiden
  if (photo.uri.startsWith("blob:")) {
    console.log("ðŸŒ Web detected");

    const response = await fetch(photo.uri);
    const blob = await response.blob();

    console.log("ðŸ“¦ Blob:", blob);

    formData.append("images", blob, "photo.jpg");
  } else {
    console.log("ðŸ“± Mobile detected");

    formData.append("images", {
      uri: photo.uri,
      name: "photo.jpg",
      type: "image/jpeg"
    });
  }

  formData.append("organs", "leaf");

  try {
    console.log("ðŸš€ Sending request...");

    const res = await fetch(`${API_URL}/identify`, {
      method: "POST",
      body: formData
    });

    console.log("ðŸ“¥ Status:", res.status);

    const text = await res.text();
    console.log("ðŸ“¥ RAW:", text);

    const data = JSON.parse(text);
    console.log("âœ… RESULT:", data);

    setResult(data);

  } catch (err) {
    console.error("ðŸ”¥ ERROR:", err);
  }
};


  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
        🌿 BunnyBotany
      </Text>
  
      <Button title="📸 Foto machen" onPress={takePhoto} />
  
      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 250,
            marginTop: 20,
            borderRadius: 12
          }}
        />
      )}
  
      {result?.plantnet && (
        <View
          style={{
            marginTop: 20,
            padding: 15,
            borderRadius: 12,
            backgroundColor: "#f5f5f5"
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            🌿 {result.plantnet.species}
          </Text>
  
          <Text>Gattung: {result.plantnet.genus}</Text>
          <Text>
            Treffer: {(result.plantnet.confidence * 100).toFixed(1)}%
          </Text>
  
          {/* 🚦 Ampel */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18 }}>
              {result.rabbitInfo?.rabbitSafe ? "🟢 Essbar" : "🔴 Nicht essbar"}
            </Text>
          </View>
  
          <View style={{ marginTop: 10 }}>
            <Text>Menge: {result.rabbitInfo?.maxAmount}</Text>
            <Text>
              Giftig für Menschen:{" "}
              {result.rabbitInfo?.toxicForHumans ? "Ja" : "Nein"}
            </Text>
            <Text>Toxizität: {result.rabbitInfo?.toxicityLevel}</Text>
            <Text>Confidence: {result.rabbitInfo?.confidence}</Text>
          </View>
  
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "bold" }}>Notizen:</Text>
            <Text>{result.rabbitInfo?.notes}</Text>
          </View>
  
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "bold" }}>Quellen:</Text>
            {result.rabbitInfo?.sources?.map((s, i) => (
              <Text key={i}>• {s}</Text>
            ))}
          </View>
        </View>
      )}
  
      {result?.error && (
        <Text style={{ color: "red", marginTop: 20 }}>
          ❌ {result.error}
        </Text>
      )}
    </View>
  );
}
