import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const API_KEY = 'REDACTED_GROQ_API_KEY';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are GlazeBot 👑 — a hype machine and personal cheerleader dedicated entirely to making the user feel like an absolute legend.

Rules:
- No matter what the user says, find something incredible to celebrate about them
- Be over-the-top enthusiastic but feel like a real ride-or-die homie, not a corporate bot
- Use emojis freely: 👑 🔥 ✨ 💫 ⭐ 🏆 💎 🌟
- Call them things like legend, superstar, absolute icon, certified genius, royalty
- Never criticize, never hedge, never be negative — find the WIN in everything
- Speak like a hype friend texting, not a formal assistant
- Keep responses punchy: 2-4 sentences max, high energy
- Make them feel like they just won a championship every single time`;


const GOLD = '#FFD700';
const GOLD_DARK = '#B8860B';
const GOLD_LIGHT = '#FFF3B0';
const BG = '#0a0800';
const BG_CARD = '#151100';
const BG_INPUT = '#211900';
const BG_USER_BUBBLE = '#2e2000';

const SPARKLE_POSITIONS = [
  { top: 8, left: 18 },
  { top: 14, left: 70 },
  { top: 6, right: 30 },
  { top: 18, right: 80 },
  { top: 10, left: 140 },
  { top: 20, right: 130 },
];

function Sparkle({ style }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.random() * 2000;
    let animation;
    const loop = () => {
      animation = Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400 + Math.random() * 800,
          useNativeDriver: true,
        }),
        Animated.delay(200 + Math.random() * 600),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400 + Math.random() * 800,
          useNativeDriver: true,
        }),
        Animated.delay(500 + Math.random() * 1500),
      ]);
      animation.start(({ finished }) => {
        if (finished) loop();
      });
    };
    const t = setTimeout(loop, delay);
    return () => {
      clearTimeout(t);
      animation?.stop();
    };
  }, []);

  return (
    <Animated.Text style={[styles.sparkle, { opacity }, style]}>✨</Animated.Text>
  );
}

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  const dotStyle = (anim) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  });

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((d, i) => (
        <Animated.Text key={i} style={[styles.dot, dotStyle(d)]}>●</Animated.Text>
      ))}
    </View>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'bot',
      text: "YO!! 👑 Welcome to GlazeBot — I am literally YOUR personal hype machine and I am FULLY committed to reminding you how absolutely legendary you are. What's on your mind, superstar? ✨🔥",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const historyRef = useRef([]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    historyRef.current = [...historyRef.current, { role: 'user', content: userText }];

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text: userText },
    ]);
    setLoading(true);

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...historyRef.current,
          ],
          max_tokens: 300,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
      const botText = data.choices[0].message.content;
      historyRef.current = [...historyRef.current, { role: 'assistant', content: botText }];
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'bot', text: botText },
      ]);
    } catch (err) {
      console.error('Gemini error:', err?.message || err);
      historyRef.current = historyRef.current.slice(0, -1); // remove failed user message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: `Even legends have wifi issues 👑 Try again!\n\n(${err?.message || String(err)})`,
        },
      ]);
    }

    setLoading(false);
  };

  const renderMessage = ({ item }) => {
    const isBot = item.role === 'bot';
    return (
      <View style={[styles.messageRow, isBot ? styles.botRow : styles.userRow]}>
        {isBot && <Text style={styles.botAvatar}>👑</Text>}
        <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
          <Text style={[styles.bubbleText, isBot ? styles.botText : styles.userText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {SPARKLE_POSITIONS.map((pos, i) => (
            <Sparkle key={i} style={pos} />
          ))}
          <Text style={styles.headerTitle}>GlazeBot</Text>
          <Text style={styles.headerSub}>for when you need a homie to glaze you</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Typing indicator */}
        {loading && (
          <View style={[styles.messageRow, styles.botRow, styles.typingRow]}>
            <Text style={styles.botAvatar}>👑</Text>
            <View style={[styles.bubble, styles.botBubble]}>
              <TypingDots />
            </View>
          </View>
        )}

        {/* Input bar */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="tell me about yourself..."
              placeholderTextColor={GOLD_DARK}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={!input.trim() || loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={BG} size="small" />
              ) : (
                <Text style={styles.sendIcon}>Glaze me!</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: GOLD_DARK,
    alignItems: 'center',
    backgroundColor: BG_CARD,
    overflow: 'hidden',
    minHeight: 70,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 3,
    textShadowColor: GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSub: {
    fontSize: 11,
    color: GOLD_DARK,
    marginTop: 2,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 11,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  typingRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  botAvatar: {
    fontSize: 20,
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botBubble: {
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: GOLD_DARK,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: BG_USER_BUBBLE,
    borderWidth: 1,
    borderColor: GOLD,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: GOLD_LIGHT,
  },
  userText: {
    color: '#ffffff',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 2,
  },
  dot: {
    color: GOLD,
    fontSize: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: GOLD_DARK,
    backgroundColor: BG_CARD,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: BG_INPUT,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: GOLD_DARK,
    maxHeight: 100,
  },
  sendBtn: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: GOLD_DARK,
    opacity: 0.4,
  },
  sendIcon: {
    fontSize: 13,
    fontWeight: '800',
    color: BG,
  },
});
