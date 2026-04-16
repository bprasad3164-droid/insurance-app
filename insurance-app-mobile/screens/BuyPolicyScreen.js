import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import api from "../services/api";

export default function BuyPolicyScreen({ route, navigation }) {
  const { policyId } = route.params;
  const [policy, setPolicy] = useState(null);
  const [age, setAge] = useState("25");
  const [salary, setSalary] = useState("500000");
  const [premium, setPremium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const fetchPolicy = useCallback(async () => {
    try {
      const res = await api.get("/policies/");
      const policies = Array.isArray(res.data) ? res.data : [];
      const found = policies.find(p => p.id === policyId);
      setPolicy(found);
      if (found) calculatePremium(found.id, age, salary);
    } catch (e) {
      alert("Error loading policy details");
    } finally {
      setLoading(false);
    }
  }, [policyId, age, salary, calculatePremium]);

  const calculatePremium = useCallback(async (pId, currentAge, currentSalary) => {
    setCalculating(true);
    try {
      const res = await api.post("/calculate/", {
        policy_id: pId || policyId,
        age: currentAge,
        salary: currentSalary
      });
      setPremium(res.data.premium);
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  }, [policyId]);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  const handlePurchase = async () => {
    try {
      await api.post("/buy-policy/", {
        policy_id: policyId,
        premium: premium
      });
      alert("Policy Purchased Successfully!");
      navigation.navigate("Dashboard");
    } catch (e) {
      const msg = e.response?.data?.details || e.response?.data?.msg || "Purchase failed";
      alert("Error: " + msg);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
    >
        <ScrollView style={styles.container}>
        <View style={styles.card}>
            <Text style={styles.policyTitle}>{policy?.name}</Text>
            <Text style={styles.policyDesc}>{policy?.description}</Text>
            
            <View style={styles.divider} />

            <View style={styles.inputGroup}>
                <Text style={styles.label}>YOUR AGE</Text>
                <TextInput 
                    style={styles.input}
                    value={age}
                    keyboardType="numeric"
                    onChangeText={(val) => {
                        setAge(val);
                        if (val) calculatePremium(policyId, val, salary);
                    }}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>ANNUAL INCOME (INR)</Text>
                <TextInput 
                    style={styles.input}
                    value={salary}
                    keyboardType="numeric"
                    onChangeText={(val) => {
                        setSalary(val);
                        if (val) calculatePremium(policyId, age, val);
                    }}
                />
            </View>
        </View>

        <View style={styles.quoteCard}>
            <Text style={styles.quoteLabel}>ESTIMATED PREMIUM</Text>
            {calculating ? (
                <ActivityIndicator color="#3b82f6" style={{ marginVertical: 10 }} />
            ) : (
                <Text style={styles.quoteValue}>₹{premium?.toLocaleString()}</Text>
            )}
            <Text style={styles.perYear}>PER YEAR</Text>
        </View>

        <TouchableOpacity 
            style={styles.buyButton}
            onPress={handlePurchase}
            disabled={calculating}
        >
            <Text style={styles.buyText}>CONFIRM PURCHASE</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0e5ec', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e5ec' },
  card: { 
    backgroundColor: '#e0e5ec', 
    padding: 25, 
    borderRadius: 30, 
    marginBottom: 20,
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 9, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8
  },
  policyTitle: { fontSize: 24, fontWeight: '900', color: '#1a202c', marginBottom: 10 },
  policyDesc: { fontSize: 14, color: '#718096', lineHeight: 22, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#a0aec0', letterSpacing: 1.5, marginBottom: 8 },
  input: { 
    backgroundColor: '#f8fafc', 
    padding: 15, 
    borderRadius: 15, 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#1a202c'
  },
  quoteCard: { 
    backgroundColor: '#1e293b', 
    padding: 30, 
    borderRadius: 30, 
    alignItems: 'center', 
    marginBottom: 20,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    elevation: 10
  },
  quoteLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 2, marginBottom: 10 },
  quoteValue: { fontSize: 40, fontWeight: '900', color: '#fff' },
  perYear: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginTop: 5 },
  buyButton: { 
    backgroundColor: '#3b82f6', 
    padding: 22, 
    borderRadius: 20, 
    alignItems: 'center',
    shadowColor: "#3b82f6",
    shadowOpacity: 0.4,
    elevation: 10
  },
  buyText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 }
});
