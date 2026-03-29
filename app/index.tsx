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
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f2f2f2" }}>
      
      {/* HEADER */}
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        🌿 BunnyBotany
      </Text>
  
      <Button title="📸 Foto machen" onPress={takePhoto} />
  
      {/* IMAGE */}
      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 250,
            marginTop: 20,
            borderRadius: 16
          }}
        />
      )}
  
      {/* RESULT CARD */}
      {result?.plantnet && (
        <View
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            backgroundColor: "#ffffff",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3
          }}
        >
          {/* 🌿 PLANT INFO */}
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            🌿 {result.plantnet.species}
          </Text>
  
          <Text style={{ color: "#666", marginBottom: 10 }}>
            Gattung: {result.plantnet.genus}
          </Text>
  
          <Text style={{ marginBottom: 10 }}>
            Treffer: {(result.plantnet.confidence * 100).toFixed(1)}%
          </Text>
  
          {/* ⚠️ UNSICHER */}
          {result.plantnet.confidence < 0.2 && (
            <Text style={{ color: "orange", marginBottom: 10 }}>
              ⚠️ Unsichere Erkennung
            </Text>
          )}
  
          {/* 🚦 STATUS */}
          {(() => {
            const val = result.rabbitInfo?.rabbitSafe;
  
            if (val === true) {
              return (
                <Text style={{ fontSize: 18, color: "#2e7d32" }}>
                  🟢 Essbar
                </Text>
              );
            }
  
            if (val === false) {
              return (
                <Text style={{ fontSize: 18, color: "#c62828" }}>
                  🔴 Nicht essbar
                </Text>
              );
            }
  
            return (
              <Text style={{ fontSize: 18, color: "#757575" }}>
                ⚪ Keine Daten vorhanden
              </Text>
            );
          })()}
  
          {/* ⚠️ KEINE DATEN BLOCK */}
          {result.rabbitInfo?.matchType === "none" && (
            <View
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 10,
                backgroundColor: "#eeeeee"
              }}
            >
              <Text style={{ color: "#555" }}>
                ⚠️ Für diese Pflanze sind keine Kaninchen-Daten vorhanden.
              </Text>
            </View>
          )}
  
          {/* 📊 DETAILS */}
          <View style={{ marginTop: 15 }}>
            
            <Text>
              Menge:{" "}
              {result.rabbitInfo?.maxAmount ?? "Keine Daten"}
            </Text>
  
            <Text>
              Toxizität:{" "}
              {result.rabbitInfo?.toxicityLevel ?? "Keine Daten"}
            </Text>
  
            <Text>
              Giftig für Menschen:{" "}
              {result.rabbitInfo?.toxicForHumans === null
                ? "Keine Daten"
                : result.rabbitInfo?.toxicForHumans
                ? "Ja"
                : "Nein"}
            </Text>
  
            <Text>
              Datenqualität:{" "}
              {result.rabbitInfo?.confidence ?? "Keine Daten"}
            </Text>
  
          </View>
  
          {/* 📝 NOTES */}
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: "bold" }}>Notizen:</Text>
            <Text>
              {result.rabbitInfo?.notes ?? "Keine Daten"}
            </Text>
          </View>
  
          {/* 📚 SOURCES */}
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: "bold" }}>Quellen:</Text>
  
            {result.rabbitInfo?.sources?.length > 0 ? (
              result.rabbitInfo.sources.map((s, i) => (
                <Text key={i}>• {s}</Text>
              ))
            ) : (
              <Text style={{ color: "#777" }}>
                Keine Quellen vorhanden
              </Text>
            )}
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
  );

  
}
