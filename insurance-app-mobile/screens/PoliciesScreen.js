import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import api from "../services/api";

export default function PoliciesScreen({ navigation }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const fetchPolicies = useCallback(async () => {
    try {
        const res = await api.get("/policies/");
        setPolicies(res.data);
    } catch (error) {
        alert("Could not load policies");
    } finally {
        setLoading(false);
    }
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.policyCard}>
      <Text style={styles.policyName}>{item.name}</Text>
      <Text style={styles.policyDesc}>{item.description}</Text>
      <View style={styles.footer}>
          <View>
            <Text style={styles.premiumText}>₹ {item.premium.toLocaleString()}</Text>
            <Text style={styles.perYear}>BASE PREMIUM</Text>
          </View>
          <TouchableOpacity 
            style={styles.quoteBtn} 
            onPress={() => navigation.navigate("BuyPolicy", { policyId: item.id })}
          >
            <Text style={styles.quoteBtnText}>Get Quote</Text>
          </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Product Catalog</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <FlatList
          data={policies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
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
    marginBottom: 20,
    marginTop: 20
  },
  list: {
    paddingBottom: 20
  },
  policyCard: {
    backgroundColor: '#e0e5ec',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 9, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5
  },
  policyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a'
  },
  policyDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15
  },
  premiumText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3b82f6'
  },
  perYear: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginTop: 2
  },
  quoteBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.2,
    elevation: 4
  },
  quoteBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  }
});
