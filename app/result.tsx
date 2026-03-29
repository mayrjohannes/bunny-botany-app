import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ResultScreen() {
  const { uri } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    upload();
  }, []);

  const upload = async () => {
    try {
      const formData = new FormData();

      formData.append("images", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg"
      } as any);

      const res = await fetch(
        "https://bunnybotany.prevus.at:4000/identify",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Fehler bei der Verarbeitung" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>

      {/* 📸 Bild */}
      <Image
        source={{ uri: uri as string }}
        style={{
          width: "100%",
          height: 220,
          borderRadius: 20,
          marginBottom: 20
        }}
      />

      {/* ⏳ LOADING */}
      {loading && (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ marginTop: 10 }}>
            Pflanze wird analysiert...
          </Text>
        </View>
      )}

      {/* 🌿 RESULT */}
      {!loading && result?.plantnet && (
        <View>
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {result.plantnet.species}
          </Text>

          <Text style={{ color: "#777" }}>
            {result.plantnet.genus}
          </Text>

          <Text style={{ marginTop: 10 }}>
            {(result.plantnet.confidence * 100).toFixed(1)}% Sicherheit
          </Text>

          {/* 🐰 */}
          <Text style={{ marginTop: 20 }}>
            🐰 Essbar:{" "}
            {result.rabbitInfo.rabbitSafe === null
              ? "Keine Daten"
              : result.rabbitInfo.rabbitSafe
              ? "Ja"
              : "Nein"}
          </Text>

          <Text>
            ☠️ Mensch:{" "}
            {result.rabbitInfo.toxicForHumans === null
              ? "Keine Daten"
              : result.rabbitInfo.toxicForHumans
              ? "Giftig"
              : "Ungiftig"}
          </Text>

          <Text style={{ marginTop: 10 }}>
            📝 {result.rabbitInfo.notes}
          </Text>
        </View>
      )}

      {/* ❌ ERROR */}
      {!loading && result?.error && (
        <Text style={{ color: "red" }}>
          ❌ {result.error}
        </Text>
      )}

      {/* 🔁 NEW PHOTO */}
      {!loading && (
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{
            marginTop: 30,
            backgroundColor: "#4CAF50",
            padding: 15,
            borderRadius: 15,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>
            🔁 Neues Foto
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
