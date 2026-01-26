import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Typography, Gradients, Shadows, Layout } from "../../constants/theme";
import { GradientButton } from "../../components/ui/GradientButton";
import { useEmailLogin } from "../services/authServices";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useState } from "react";

export default function LoginScreen() {
  const { signIn, signUp, loading } = useEmailLogin();
  
  const [isSignUp, setIsSignUp] = useState(true); // Start with Sign Up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return;
    
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.centerWrapper}
          keyboardShouldPersistTaps="handled"
        >
          {/* Floating Card */}
          <Animated.View entering={FadeInUp.springify()} style={styles.cardWrapper}>
            <View style={styles.card}>

              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>Smart Student Assistant</Text>
              <Text style={styles.subtitle}>
                {isSignUp ? "Create your account" : "Welcome back!"}
              </Text>

              {/* Features */}
              <View style={styles.features}>
                <Feature icon="sparkles" text="AI-powered notes & planning" />
                <Feature icon="calendar" text="Smart timetable & daily planner" />
                <Feature icon="checkmark-done" text="Stay focused & productive" />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              {/* Submit Button */}
              <View style={styles.buttonContainer}>
                <GradientButton
                  title={isSignUp ? "Create Account" : "Sign In"}
                  onPress={handleSubmit}
                  variant="primary"
                  disabled={loading}
                />
              </View>

              {/* Toggle Sign Up / Sign In */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={loading}>
                  <Text style={styles.toggleLink}>
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms & Privacy Policy
              </Text>

            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Feature({ icon, text }: { icon: any; text: string }) {
  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={Colors.light.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.l,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 28,
    padding: Spacing.l,
    alignItems: "center",
    ...Shadows.large,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.m,
  },
  logo: {
    width: 64,
    height: 64,
  },
  title: {
    ...Typography.header,
    fontSize: 26,
    textAlign: "center",
    marginBottom: Spacing.s,
  },
  subtitle: {
    ...Typography.body,
    textAlign: "center",
    marginBottom: Spacing.l,
  },
  features: {
    width: "100%",
    marginBottom: Spacing.l,
    gap: Spacing.s,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s,
    paddingVertical: 6,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.light.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    marginBottom: Spacing.m,
    width: "100%",
    gap: Spacing.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 8,
  },
  buttonContainer: {
    width: "100%",
    marginTop: Spacing.s,
  },
  toggleContainer: {
    flexDirection: "row",
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  toggleLink: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  footerText: {
    marginTop: Spacing.s,
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});