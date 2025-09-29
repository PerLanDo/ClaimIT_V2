import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MSUIITLogo } from '../../components/MSUIITLogo';
import { ThemeSwitch } from '../../components/ThemeSwitch';
import { UserRole } from '../../types/database';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [schoolId, setSchoolId] = useState('');

  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();

  const roles: { key: UserRole; label: string }[] = [
    { key: 'student', label: 'Student' },
    { key: 'staff', label: 'Staff' },
    { key: 'teacher', label: 'Teacher' },
    { key: 'admin', label: 'Admin' },
  ];

  const isValidUniversityEmail = (email: string): boolean => {
    return (
      email.endsWith('.edu') ||
      email.includes('university') ||
      email.includes('edu')
    );
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidUniversityEmail(email)) {
      Alert.alert('Error', 'Please use a valid university email address');
      return;
    }

    if (isSignUp && !fullName) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, {
          full_name: fullName,
          role: selectedRole,
          school_id_number: schoolId || undefined,
        });
        Alert.alert('Success', 'Account created successfully! Please sign in.');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.themeToggle}>
        <ThemeSwitch />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <MSUIITLogo size="large" />
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            MSU-IIT CLAIMIT
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Official Lost & Found Tracker
          </Text>
          <Text style={[styles.universityText, { color: theme.colors.text }]}>
            Mindanao State University - Iligan Institute of Technology
          </Text>
        </View>

        <View
          style={[
            styles.roleSelector,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {roles.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[
                styles.roleButton,
                { backgroundColor: theme.colors.background },
                selectedRole === role.key && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => setSelectedRole(role.key)}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  { color: theme.colors.text },
                  selectedRole === role.key && {
                    color: theme.colors.textOnPrimary,
                  },
                  selectedRole === role.key && styles.roleButtonTextActive,
                ]}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.loginText}>
          {isSignUp ? 'Create Account with' : 'Login with'} your University
          Email
        </Text>

        {isSignUp && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Student/Staff ID (optional)"
              value={schoolId}
              onChangeText={setSchoolId}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="university.email@your.edu"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.notice}>Only valid university emails allowed</Text>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>
              {isSignUp ? 'CREATE ACCOUNT' : 'LOGIN'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.switchButtonText}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#A85751',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#A85751',
    borderColor: '#A85751',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  loginText: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#A85751',
    marginBottom: 16,
  },
  notice: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#A85751',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#A85751',
    fontSize: 14,
    fontWeight: '500',
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  universityText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
