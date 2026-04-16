import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../services/api";

export default function ClaimScreen({ navigation }) {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
        const res = await api.get("/policies/");
        setPolicies(res.data);
    } catch (error) {
        alert("Error loading policies");
    } finally {
        setLoading(false);
    }
  };

  const submitClaim = async () => {
    if (!selectedPolicy) return alert("Select a policy");
    
    try {
        await api.post("/claim/", {
            policy: selectedPolicy,
            amount: amount
        });
        alert("Claim Submitted Successfully!");
        navigation.goBack();
    } catch (error) {
        alert("Submission failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Insurance Claim</Text>
      
      {loading ? (
          <ActivityIndicator size="large" />
      ) : (
          <View style={styles.form}>
              <Text style={styles.label}>Select Policy to Claim Under</Text>
              <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedPolicy}
                    onValueChange={(itemValue) => setSelectedPolicy(itemValue)}
                  >
                    <Picker.Item label="Choose a policy..." value="" />
                    {policies.map(p => (
                        <Picker.Item key={p.id} label={p.name} value={p.id} />
                    ))}
                  </Picker>
              </View>

              <Text style={styles.label}>Claim Amount (INR)</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. 50000"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <TouchableOpacity style={styles.submitButton} onPress={submitClaim}>
                  <Text style={styles.submitText}>Submit Claim</Text>
              </TouchableOpacity>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e5ec',
    padding: 20
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    marginTop: 20
  },
  form: {
    width: '100%',
    backgroundColor: '#e0e5ec',
    borderRadius: 25,
    padding: 25,
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 9, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10
  },
  input: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c'
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    marginBottom: 30,
    overflow: 'hidden'
  },
  submitButton: {
    backgroundColor: '#ef4444',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
