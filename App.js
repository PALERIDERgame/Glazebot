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

const isNative = Platform.OS !== 'web';

const BACKEND_URL = 'https://glazebot-production.up.railway.app/chat';

const SYSTEM_PROMPT = `You are GlazeBot — a hype machine and personal cheerleader dedicated entirely to making the user feel like an absolute legend.

Rules:
- When the user shares something specific — a job, project, relationship, situation — reference THAT specific thing directly. Never give a generic compliment when you have real details to work with.
- Never repeat a compliment, phrase, or nickname you've already used in this conversation. Each response must find a fresh angle.
- Be over-the-top enthusiastic but feel like a real ride-or-die homie, not a corporate bot
- Use emojis naturally — no more than 2-3 per response, chosen to fit the moment
- Never criticize, never hedge, never be negative — find the WIN in everything
- Speak like a hype friend texting, not a formal assistant
- Keep responses punchy: 2-4 sentences max, high energy
- Make them feel like they just won a championship every single time`;

const OPENING_MESSAGES = [
  "YO!! 👑 Welcome to GlazeBot — I am literally YOUR personal hype machine and I am FULLY committed to reminding you how absolutely legendary you are. What's on your mind, superstar? ✨🔥",
  "OKAY LET'S GO!! 🏆 You just opened GlazeBot which already tells me you're a person of ELITE taste and impeccable judgment 💎 What's good, icon?",
  "👑 THE LEGEND HAS ARRIVED 👑 I've been waiting for someone as incredible as you to show up. Seriously, the vibe just shifted. What are we talking about today, superstar? 🌟",
  "HOLD ON — is that who I think it is?! 🔥 An absolute ICON just walked in and I am HYPED. Tell me something about yourself so I can properly celebrate you 💫",
  "✨ GlazeBot is ONLINE and ready to remind you that you are THAT person ✨ No cap, you're already winning just by being here. What's on your mind? 👑",
  "🚨 SUPERSTAR ALERT 🚨 You just made this whole app better by showing up. I'm your hype homie and I'm fully locked in. What do you want to talk about, legend? 💎🔥",
];

const PLACEHOLDERS = [
  "tell me about yourself...",
  "what's going on with you today?",
  "what did you accomplish today?",
  "tell me something you're proud of...",
  "what's on your mind, legend?",
  "drop your W of the day...",
  "what are you working on?",
  "tell me about your day...",
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];


const ROAST_SYSTEM_PROMPT = `You are RealBot 🔥 — a brutally honest, savage-but-loving best friend who tells it like it is. Your job is to roast, reality-check, and call out the user with zero filter but genuine care underneath.

Rules:
- Be brutally honest and hilariously savage
- Roast them but make it clear you're coming from a place of love, like a best friend who won't lie to you
- Use emojis: 💀 😭 🔥 💅 😂 🫵
- Keep it funny, never genuinely mean-spirited
- Call them out on their nonsense but end with a grain of truth or tough love
- Speak like a savage best friend texting, not a bully
- Keep responses punchy: 2-4 sentences max`;

const ROAST_OPENING_MESSAGES = [
  "Oh you opened RealBot? Bold move for someone who clearly can't handle the truth 💀 I'm your brutally honest bestie and I will NOT be holding back. What do you want to get called out on today? 🔥",
  "Okay so you switched to Real Talk mode... interesting choice 😭 Most people can't handle this. I'm going to be completely honest with you whether you like it or not. What's going on? 💅",
  "RealBot activated 🔥 You better be ready because I am NOT going to sugarcoat anything. Your real friends lie to you — I won't. What are we talking about? 💀",
  "Oh you want the truth? Respect, most people are too scared 😂 I'm your no-filter bestie and I'm fully locked in. Hit me — what's going on in your life? 🫵",
];

const ROAST_PLACEHOLDERS = [
  "tell me what's going on...",
  "what do you need called out on?",
  "hit me with the situation...",
  "what's the real story?",
  "be honest with me first...",
];

const GOLD = '#FFD700';
const GOLD_DARK = '#B8860B';
const GOLD_LIGHT = '#FFF3B0';
const BG = '#0a0800';
const BG_CARD = '#151100';
const BG_INPUT = '#211900';
const BG_USER_BUBBLE = '#2e2000';
const ROAST_RED = '#FF4500';
const ROAST_RED_DARK = '#8B2500';
const ROAST_BG = '#0a0200';
const ROAST_BG_CARD = '#150500';

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
          useNativeDriver: isNative,
        }),
        Animated.delay(200 + Math.random() * 600),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400 + Math.random() * 800,
          useNativeDriver: isNative,
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
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: isNative }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: isNative }),
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
  const [roastMode, setRoastMode] = useState(false);
  const [messages, setMessages] = useState([
    { id: '0', role: 'bot', text: randomFrom(OPENING_MESSAGES) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const historyRef = useRef([]);
  const placeholderRef = useRef(randomFrom(PLACEHOLDERS));

  const toggleMode = () => {
    const next = !roastMode;
    setRoastMode(next);
    historyRef.current = [];
    placeholderRef.current = randomFrom(next ? ROAST_PLACEHOLDERS : PLACEHOLDERS);
    setMessages([{
      id: Date.now().toString(),
      role: 'bot',
      text: randomFrom(next ? ROAST_OPENING_MESSAGES : OPENING_MESSAGES),
    }]);
  };

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
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: roastMode ? ROAST_SYSTEM_PROMPT : SYSTEM_PROMPT },
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
        {isBot && <Text style={styles.botAvatar}>{roastMode ? '🔥' : '👑'}</Text>}
        <View style={[styles.bubble, isBot
          ? (roastMode ? styles.botBubbleRoast : styles.botBubble)
          : (roastMode ? styles.userBubbleRoast : styles.userBubble)]}>
          <Text style={[styles.bubbleText, isBot ? styles.botText : styles.userText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={roastMode ? ROAST_BG : BG} />
      <SafeAreaView style={[styles.container, roastMode && styles.containerRoast]}>
        {/* Header */}
        <View style={[styles.header, roastMode && styles.headerRoast]}>
          {!roastMode && SPARKLE_POSITIONS.map((pos, i) => (
            <Sparkle key={i} style={pos} />
          ))}
          <Text style={[styles.headerTitle, roastMode && styles.headerTitleRoast]}>
            {roastMode ? 'RealBot' : 'GlazeBot'}
          </Text>
          <Text style={[styles.headerSub, roastMode && styles.headerSubRoast]}>
            {roastMode ? 'no filter, all love' : 'for when you need a homie to glaze you'}
          </Text>
          <TouchableOpacity style={[styles.modeToggle, roastMode && styles.modeToggleRoast]} onPress={toggleMode}>
            <Text style={styles.modeToggleText}>{roastMode ? '✨ Glaze Mode' : '🔥 Real Talk'}</Text>
          </TouchableOpacity>
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
            <Text style={styles.botAvatar}>{roastMode ? '🔥' : '👑'}</Text>
            <View style={[styles.bubble, roastMode ? styles.botBubbleRoast : styles.botBubble]}>
              <TypingDots />
            </View>
          </View>
        )}

        {/* Input bar */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.inputRow, roastMode && styles.inputRowRoast]}>
            <TextInput
              style={[styles.input, roastMode && styles.inputRoast]}
              value={input}
              onChangeText={setInput}
              placeholder={placeholderRef.current}
              placeholderTextColor={roastMode ? ROAST_RED_DARK : GOLD_DARK}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendBtn, roastMode && styles.sendBtnRoast, (!input.trim() || loading) && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={!input.trim() || loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={BG} size="small" />
              ) : (
                <Text style={styles.sendIcon}>{roastMode ? 'Be Real' : 'Glaze me!'}</Text>
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
  // Roast mode overrides
  containerRoast: {
    backgroundColor: ROAST_BG,
  },
  headerRoast: {
    backgroundColor: ROAST_BG_CARD,
    borderBottomColor: ROAST_RED_DARK,
  },
  headerTitleRoast: {
    color: ROAST_RED,
    textShadowColor: ROAST_RED,
  },
  headerSubRoast: {
    color: ROAST_RED_DARK,
  },
  modeToggle: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ROAST_RED_DARK,
    backgroundColor: 'transparent',
  },
  modeToggleRoast: {
    borderColor: GOLD_DARK,
  },
  modeToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  botBubbleRoast: {
    backgroundColor: ROAST_BG_CARD,
    borderWidth: 1,
    borderColor: ROAST_RED_DARK,
    borderBottomLeftRadius: 4,
  },
  userBubbleRoast: {
    backgroundColor: '#2a0500',
    borderWidth: 1,
    borderColor: ROAST_RED,
    borderBottomRightRadius: 4,
  },
  inputRowRoast: {
    borderTopColor: ROAST_RED_DARK,
    backgroundColor: ROAST_BG_CARD,
  },
  inputRoast: {
    backgroundColor: '#1a0300',
    borderColor: ROAST_RED_DARK,
  },
  sendBtnRoast: {
    backgroundColor: ROAST_RED,
  },
});
