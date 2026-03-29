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

  const formatBoolean = (val, labels = {}) => {
    if (val === true) {
      return {
        text: labels.true || "Ja",
        color: "#2e7d32"
      };
    }
  
    if (val === false) {
      return {
        text: labels.false || "Nein",
        color: "#c62828"
      };
    }
  
    return {
      text: labels.null || "Keine Daten",
      color: "#757575"
    };
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
  
      {/* HEADER */}
      <View style={{ padding: 20, paddingTop: 60 }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          🐰 BunnyBotany
        </Text>
        <Text style={{ color: "#666", marginTop: 5 }}>
          Pflanzen für dein Kaninchen prüfen
        </Text>
      </View>
  
      {/* MAIN CONTENT */}
      <View style={{ flex: 1, padding: 20 }}>
  
        {/* CAMERA BUTTON */}
        <TouchableOpacity
          onPress={takePhoto}
          style={{
            backgroundColor: "#4CAF50",
            padding: 20,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 5
          }}
        >
          <Text style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}>
            📸 Foto aufnehmen
          </Text>
        </TouchableOpacity>
  
        {/* IMAGE PREVIEW */}
        {image && (
          <Image
            source={{ uri: image }}
            style={{
              width: "100%",
              height: 220,
              borderRadius: 20,
              marginTop: 20
            }}
          />
        )}
  
        {/* RESULT CARD */}
        {result?.plantnet && (
          <View
            style={{
              marginTop: 20,
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 3
            }}
          >
  
            {/* 🌿 NAME */}
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
              {result.plantnet.species}
            </Text>
  
            <Text style={{ color: "#777", marginBottom: 10 }}>
              {result.plantnet.genus}
            </Text>
  
            {/* CONFIDENCE BAR */}
            <View
              style={{
                height: 8,
                backgroundColor: "#eee",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 10
              }}
            >
              <View
                style={{
                  width: `${Math.min(
                    result.plantnet.confidence * 100,
                    100
                  )}%`,
                  height: "100%",
                  backgroundColor: "#4CAF50"
                }}
              />
            </View>
  
            <Text style={{ fontSize: 12, color: "#777" }}>
              {(result.plantnet.confidence * 100).toFixed(1)}% Erkennung
            </Text>
  
            {/* 🚦 STATUS */}
            {(() => {
              const val = result.rabbitInfo?.rabbitSafe;
  
              let bg = "#eee";
              let text = "⚪ Keine Daten";
              let color = "#555";
  
              if (val === true) {
                bg = "#e8f5e9";
                text = "🟢 Essbar";
                color = "#2e7d32";
              }
  
              if (val === false) {
                bg = "#ffebee";
                text = "🔴 Nicht essbar";
                color = "#c62828";
              }
  
              return (
                <View
                  style={{
                    marginTop: 15,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: bg
                  }}
                >
                  <Text style={{ fontSize: 18, color }}>
                    {text}
                  </Text>
                </View>
              );
            })()}
  
            {/* ⚠️ NO DATA */}
            {result.rabbitInfo?.matchType === "none" && (
              <Text style={{ marginTop: 10, color: "#777" }}>
                Keine Fütterungsinformationen vorhanden
              </Text>
            )}
  
            {/* DETAILS */}
            <View style={{ marginTop: 15 }}>
              <Text>🐰 Menge: {result.rabbitInfo?.maxAmount ?? "Keine Daten"}</Text>
              <Text>☠️ Toxizität: {result.rabbitInfo?.toxicityLevel ?? "Keine Daten"}</Text>
              <Text>
                👤 Mensch:{" "}
                {result.rabbitInfo?.toxicForHumans === null
                  ? "Keine Daten"
                  : result.rabbitInfo?.toxicForHumans
                  ? "Giftig"
                  : "Ungiftig"}
              </Text>
            </View>
  
            {/* NOTES */}
            <View style={{ marginTop: 15 }}>
              <Text style={{ fontWeight: "bold" }}>📝 Hinweise</Text>
              <Text style={{ color: "#555" }}>
                {result.rabbitInfo?.notes ?? "Keine Daten"}
              </Text>
            </View>
  
          </View>
        )}
  
        {/* ERROR */}
        {result?.error && (
          <Text style={{ color: "red", marginTop: 20 }}>
            ❌ {result.error}
          </Text>
        )}
  
      </View>
    </View>
  );

  
}
