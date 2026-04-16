import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, Easing } from "react-native";
import api from "../services/api";

export default function DashboardScreen({ navigation, route }) {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [activities, setActivities] = useState([]);
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
      if (role === 'agent') {
        const claimRes = await api.get("/claims/all/");
        const apptRes = await api.get("/my-appointments/");
        setClaims(Array.isArray(claimRes.data) ? claimRes.data : []);
        setPolicies(Array.isArray(apptRes.data) ? apptRes.data : []); // Using 'policies' state to store appts for agents
      } else {
        const polyRes = await api.get("/my-policies/");
        const claimRes = await api.get("/claim/my/");
        const actRes = await api.get("/activities/");
        setPolicies(Array.isArray(polyRes.data) ? polyRes.data : []);
        setClaims(Array.isArray(claimRes.data) ? claimRes.data : []);
        setActivities(Array.isArray(actRes.data) ? actRes.data.slice(0, 3) : []);
      }
    } catch (error) {
      console.error("Dashboard Fetch Error", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

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
          <Text style={styles.welcomeText}>{role === 'agent' ? "Mission Hub" : "Member Dashboard"}</Text>
          <Text style={styles.roleTag}>{role.toUpperCase()} ACCOUNT</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{role === 'agent' ? "PENDING SURVEYS" : "POLICIES"}</Text>
            <Text style={styles.statValue}>{policies.length}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: role === 'agent' ? '#10b981' : '#3b82f6' }]}>
            <Text style={[styles.statLabel, { color: '#fff' }]}>{role === 'agent' ? "CLAIMS ASSIGNED" : "ACTIVE CLAIMS"}</Text>
            <Text style={[styles.statValue, { color: '#fff' }]}>{claims.length}</Text>
          </View>
        </View>

        {/* Navigation Cards (Only for Users) */}
        {role !== 'agent' && (
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
        )}

        {/* Missions / Claim Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{role === 'agent' ? "FIELD ASSIGNMENTS" : "SETTLEMENT TIMELINE"}</Text>
          {claims.length > 0 ? claims.map((claim, idx) => (
            <TouchableOpacity 
                key={idx} 
                style={[styles.timelineCard, role === 'agent' && { borderLeftWidth: 5, borderLeftColor: '#10b981' }]}
                onPress={() => navigation.navigate("ClaimDetail", { claimId: claim.id })}
            >
              <View style={styles.timelineHeader}>
                <Text style={styles.claimId}>CLAIM #{claim.id} {role === 'agent' && `(${claim.claim_type || 'General'})`}</Text>
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
          )) : (
            <Text style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic', marginTop: 20 }}>
              {role === 'agent' ? "No active field missions assigned." : "No active claims in progress."}
            </Text>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <View style={styles.activityFeed}>
            {activities.length > 0 ? activities.map((act, i) => (
              <View key={i} style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: act.action_type === 'PAYMENT' ? '#10b981' : act.action_type === 'CLAIM' ? '#f59e0b' : '#3b82f6' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityDesc}>{act.description}</Text>
                  <Text style={styles.activityTime}>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            )) : (
              <Text style={{ fontSize: 12, color: '#a0aec0', fontStyle: 'italic' }}>No recent events recorded.</Text>
            )}
          </View>
        </View>

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
  connector: { flex: 1, height: 2, backgroundColor: '#f1f5f9', marginTop: -15, marginHorizontal: 5 },
  activityFeed: { backgroundColor: '#e0e5ec', padding: 15, borderRadius: 20, shadowColor: "#a3b1c6", shadowOffset: { width: 9, height: 9 }, shadowOpacity: 1, shadowRadius: 16, elevation: 5 },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  activityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  activityDesc: { fontSize: 13, fontWeight: 'bold', color: '#4a5568' },
  activityTime: { fontSize: 9, fontWeight: 'bold', color: '#a0aec0', marginTop: 2 }
});
