import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from "react-native";
import api from "../services/api";

export default function ClaimDetailScreen({ route, navigation }) {
  const { claimId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    try {
      const res = await api.get(`/claim-detail/${claimId}/`);
      setData(res.data);
    } catch (e) {
      Alert.alert("Error", "Could not load claim details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [claimId, navigation]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleDownload = () => {
    const url = `http://127.0.0.1:8000/api/claim/report/${claimId}/`;
    Linking.openURL(url).catch(err => Alert.alert("Error", "Could not open browser for download"));
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  const { claim = {}, policy = {}, payments = [], documents = [] } = data || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.claimId}>CLAIM #{claim.id} | {claim.claim_type?.toUpperCase() || 'GENERAL'}</Text>
        <Text style={styles.amount}>₹{claim.amount?.toLocaleString() || '0'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: claim.status === 'Approved' ? '#10b981' : '#f59e0b' }]}>
            <Text style={styles.statusText}>{(claim.status || 'Pending').toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROTECTION PLAN</Text>
        <View style={styles.clayCard}>
            <Text style={styles.policyName}>{policy.name}</Text>
            <Text style={styles.policyCat}>{policy.category.toUpperCase()}</Text>
            <Text style={styles.policyDesc}>{policy.description}</Text>
            
            <View style={styles.dateRow}>
                <View>
                    <Text style={styles.dateLabel}>RENEWAL</Text>
                    <Text style={styles.dateValue}>{policy?.renewal_date ? new Date(policy.renewal_date).toLocaleDateString() : 'N/A'}</Text>
                </View>
                <View>
                    <Text style={styles.dateLabel}>EXPIRY</Text>
                    <Text style={styles.dateValue}>{policy?.expiry_date ? new Date(policy.expiry_date).toLocaleDateString() : 'N/A'}</Text>
                </View>
            </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EVIDENCE SUBMITTED</Text>
        {documents.map((doc, idx) => (
            <TouchableOpacity key={idx} style={styles.docItem} onPress={() => Linking.openURL(`http://127.0.0.1:8000${doc.url}`)}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.viewLink}>View File</Text>
            </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PAYMENT HISTORY</Text>
        {payments.map((pmt, idx) => (
            <View key={idx} style={styles.pmtRow}>
                <View>
                    <Text style={styles.pmtMethod}>{pmt.method}</Text>
                    <Text style={styles.pmtDate}>{new Date(pmt.timestamp).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.pmtAmount}>₹{pmt.amount.toLocaleString()}</Text>
            </View>
        ))}
      </View>

      <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Text style={styles.downloadText}>DOWNLOAD AUDIT REPORT</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0e5ec', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e5ec' },
  headerCard: { 
    backgroundColor: '#1e293b', 
    padding: 30, 
    borderRadius: 30, 
    alignItems: 'center', 
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    elevation: 10
  },
  claimId: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 2, marginBottom: 5 },
  amount: { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 15 },
  statusBadge: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#718096', letterSpacing: 1.5, marginBottom: 15 },
  clayCard: { 
    backgroundColor: '#e0e5ec', 
    padding: 20, 
    borderRadius: 20,
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 9, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5
  },
  policyName: { fontSize: 20, fontWeight: 'bold', color: '#1a202c' },
  policyCat: { fontSize: 10, fontWeight: 'bold', color: '#3b82f6', marginTop: 2, marginBottom: 10 },
  policyDesc: { fontSize: 14, color: '#718096', lineHeight: 20, marginBottom: 20 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15 },
  dateLabel: { fontSize: 10, fontWeight: 'bold', color: '#a0aec0' },
  dateValue: { fontSize: 14, fontWeight: 'bold', color: '#1a202c' },
  docItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10 
  },
  docName: { fontSize: 14, fontWeight: 'bold', color: '#1a202c' },
  viewLink: { fontSize: 12, color: '#3b82f6', fontWeight: 'bold' },
  pmtRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  pmtMethod: { fontSize: 14, fontWeight: 'bold', color: '#1a202c' },
  pmtDate: { fontSize: 12, color: '#718096' },
  pmtAmount: { fontSize: 16, fontWeight: '900', color: '#1a202c' },
  downloadBtn: { 
    backgroundColor: '#3b82f6', 
    padding: 22, 
    borderRadius: 20, 
    alignItems: 'center',
    shadowColor: "#3b82f6",
    shadowOpacity: 0.4,
    elevation: 8
  },
  downloadText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
