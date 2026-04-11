import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import PoliciesScreen from './screens/PoliciesScreen';
import ClaimScreen from './screens/ClaimScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
            headerStyle: { backgroundColor: '#e0e5ec', elevation: 0, shadowOpacity: 0 },
            headerTintColor: '#444',
            headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Policies" component={PoliciesScreen} />
        <Stack.Screen name="Claim" component={ClaimScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
