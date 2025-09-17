import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert } from 'react-native';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Enter a prompt');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.100:10000/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      setImageUrl(data.images[0]);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>📱 AI Image Generator</Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Describe image..."
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      <Button title="Generate" onPress={generateImage} />
      {imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 300, height: 300, marginTop: 20 }} />}
    </View>
  );
}