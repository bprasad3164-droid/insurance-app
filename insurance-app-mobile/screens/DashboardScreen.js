import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, Easing } from "react-native";
import api from "../services/api";

export default function DashboardScreen({ navigation, route }) {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const role = route.params?.role || "User";
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const fetchData = useCallback(async () => {
    try {
      const polyRes = await api.get("/my-policies/");
      const claimRes = await api.get("/claim/my/");
      setPolicies(Array.isArray(polyRes.data) ? polyRes.data : []);
      setClaims(Array.isArray(claimRes.data) ? claimRes.data : []);
    } catch (error) {
      console.error("Dashboard Fetch Error", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#e0e5ec' }}>
      <Animated.View 
        style={[
            styles.bgShield,
            {
                transform: [{
                    translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 15]
                    })
                }]
            }
        ]}
      >
        <Text style={{ fontSize: 200, opacity: 0.05, color: '#3b82f6' }}>🛡️</Text>
      </Animated.View>

      <ScrollView 
          style={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Member Dashboard</Text>
          <Text style={styles.roleTag}>{role.toUpperCase()} ACCOUNT</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>POLICIES</Text>
            <Text style={styles.statValue}>{policies.length}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
            <Text style={[styles.statLabel, { color: '#fff' }]}>ACTIVE CLAIMS</Text>
            <Text style={[styles.statValue, { color: '#fff' }]}>{Array.isArray(claims) ? claims.filter(c => c.status === 'Pending').length : 0}</Text>
          </View>
        </View>

        {/* Navigation Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Policies")}>
            <Text style={styles.actionTitle}>Browse Marketplace</Text>
            <Text style={styles.actionSub}>Explore new coverage plans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Claim")}>
            <Text style={styles.actionTitle}>File New Claim</Text>
            <Text style={styles.actionSub}>Report a new incident</Text>
          </TouchableOpacity>
        </View>

        {/* Claim Timeline */}
        {claims.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SETTLEMENT TIMELINE</Text>
            {claims.map((claim, idx) => (
              <TouchableOpacity 
                  key={idx} 
                  style={styles.timelineCard}
                  onPress={() => navigation.navigate("ClaimDetail", { claimId: claim.id })}
              >
                <View style={styles.timelineHeader}>
                  <Text style={styles.claimId}>CLAIM #{claim.id}</Text>
                  <Text style={styles.claimAmount}>₹{claim.amount?.toLocaleString()}</Text>
                </View>
                
                <View style={styles.stepsRow}>
                  <View style={styles.step}>
                    <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.stepText}>Raised</Text>
                  </View>
                  <View style={styles.connector} />
                  <View style={styles.step}>
                    <View style={[styles.dot, { backgroundColor: claim.agent_status === 'Approved' ? '#10b981' : '#f59e0b' }]} />
                    <Text style={styles.stepText}>Audit</Text>
                  </View>
                  <View style={styles.connector} />
                  <View style={styles.step}>
                    <View style={[styles.dot, { backgroundColor: claim.status === 'Approved' ? '#10b981' : claim.status === 'Rejected' ? '#ef4444' : '#ccc' }]} />
                    <Text style={styles.stepText}>Settled</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', padding: 20 },
  bgShield: { position: 'absolute', top: 50, right: -50, zIndex: -1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e5ec' },
  welcomeSection: { marginTop: 20, marginBottom: 30 },
  welcomeText: { fontSize: 28, fontWeight: '900', color: '#1a202c' },
  roleTag: { fontSize: 10, fontWeight: 'bold', color: '#3b82f6', letterSpacing: 2, marginTop: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { 
    backgroundColor: '#e0e5ec', 
    width: '47%', 
    padding: 20, 
    borderRadius: 20,
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 9, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8
  },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#718096', marginBottom: 5 },
  statValue: { fontSize: 32, fontWeight: '900', color: '#1a202c' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#718096', letterSpacing: 1.5, marginBottom: 15 },
  actionCard: { 
    backgroundColor: '#e0e5ec', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#3b82f6',
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 9, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5
  },
  actionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a202c' },
  actionSub: { fontSize: 12, color: '#718096', marginTop: 3 },
  timelineCard: { 
    backgroundColor: '#e0e5ec', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 15,
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 9, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5
  },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  claimId: { fontSize: 14, fontWeight: 'bold', color: '#1a202c' },
  claimAmount: { fontSize: 14, fontWeight: '900', color: '#3b82f6' },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginBottom: 5 },
  stepText: { fontSize: 10, fontWeight: 'bold', color: '#718096' },
  connector: { flex: 1, height: 2, backgroundColor: '#f1f5f9', marginTop: -15, marginHorizontal: 5 }
});
