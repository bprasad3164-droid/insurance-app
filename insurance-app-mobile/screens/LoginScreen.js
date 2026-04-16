import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import api from "../services/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
        const res = await api.post("/login/", { email, password });
        navigation.navigate("Dashboard", { role: res.data.role });
    } catch (error) {
        alert("Login Failed: Check your credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insurance Portal</Text>
      <View style={styles.inputContainer}>
        <TextInput 
            style={styles.input} 
            placeholder="Email Address" 
            keyboardType="email-address" 
            autoCapitalize="none"
            onChangeText={setEmail} 
        />
        <TextInput 
            style={styles.input} 
            placeholder="Password" 
            secureTextEntry 
            onChangeText={setPassword} 
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e5ec',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#444',
    marginBottom: 40
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20
  },
  input: {
    backgroundColor: '#e0e5ec',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 9, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
    fontSize: 16
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 9, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
