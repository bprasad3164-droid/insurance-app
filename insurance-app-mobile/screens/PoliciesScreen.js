import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import api from "../services/api";

export default function PoliciesScreen() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
        const res = await api.get("/policies/");
        setPolicies(res.data);
    } catch (error) {
        alert("Could not load policies");
    } finally {
        setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.policyCard}>
      <Text style={styles.policyName}>{item.name}</Text>
      <Text style={styles.policyDesc}>{item.description}</Text>
      <View style={styles.footer}>
          <Text style={styles.premiumText}>₹ {item.premium.toLocaleString()}</Text>
          <Text style={styles.tag}>Active</Text>
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
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
  tag: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold'
  }
});
