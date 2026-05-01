import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChatBubble } from '../../../components/ChatBubble';
import { ChatInput } from '../../../components/ChatInput';
import { OnlineIndicator } from '../../../components/OnlineIndicator';
import { useChat } from '../../../hooks/useChat';
import { useContacts } from '../../../hooks/useContacts';
import { THEME_COLORS, useTheme } from '../../../hooks/useTheme';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../../utils/styles';

export default function ChatScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{
    id: string;
    name: string;
  }>();

  const { messages, addMessage } = useChat(id || '');
  const { loadChatBackground, setChatBackgroundColor, setChatBackgroundImage, appBackgroundColor, appBackgroundImage } = useTheme();
  const { contacts } = useContacts();

  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [chatBackground, setChatBackground] = useState<{ color?: string; imageUri?: string }>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // 從聯絡人資料中找到對應的聯絡人
  const contact = contacts.find((c) => c.id === id);

  // 加载聊天室背景
  useEffect(() => {
    if (id) {
      loadChatBackground(id).then((bg: { color?: string; imageUri?: string }) => {
        setChatBackground(bg);
      });
    }
  }, [id]);

  // 每次返回此頁面時刷新背景
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadChatBackground(id).then((bg: { color?: string; imageUri?: string }) => {
          setChatBackground(bg);
        });
      }
    }, [id])
  );

  if (!id) {
    return null;
  }

  const handleColorSelect = async (color: string) => {
    setChatBackground({ color });
    await setChatBackgroundColor(id, color);
    setShowBackgroundModal(false);
  };

  const handleImageSelect = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('權限被拒絕', '需要相簿存取權限才能選擇照片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setChatBackground({ imageUri });
        await setChatBackgroundImage(id, imageUri);
        setShowBackgroundModal(false);
      }
    } catch (error) {
      Alert.alert('錯誤', '選擇圖片時出錯');
      console.error('Error picking image:', error);
    }
  };

  return (
    <SafeAreaView key={refreshKey} style={[styles.safeAreaContainer, { backgroundColor: chatBackground.color || appBackgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* 頂部頭部區域 */}
          <View style={[styles.header, { backgroundColor: COLORS.background }]}>
            {/* 返回按鈕 */}
            <Pressable
              onPress={() => router.push('/(tabs)/chats')}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color={COLORS.primary}
              />
            </Pressable>

            {/* 聯絡人信息 */}
            <View style={styles.contactInfo}>
              {/* 頭貼 + 在線狀態 */}
              <View style={styles.avatarContainer}>
                {contact?.avatar && (
                  <Image
                    source={{ uri: contact.avatar }}
                    style={styles.avatar}
                  />
                )}
                <View style={styles.onlineIndicatorContainer}>
                  <OnlineIndicator isOnline={contact?.isOnline || false} size={16} />
                </View>
              </View>

              {/* 名字和在線狀態文字 */}
              <View style={styles.contactNameContainer}>
                <Text style={styles.contactName}>{contact?.name || name}</Text>
                {contact?.isOnline && (
                  <Text style={styles.onlineStatus}>上線</Text>
                )}
              </View>
            </View>

            {/* 右側按鈕組 */}
            <View style={styles.actionButtons}>
              {/* 電話按鈕 */}
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="phone"
                  size={24}
                  color={COLORS.primary}
                />
              </Pressable>

              {/* 視訊按鈕 */}
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="video"
                  size={24}
                  color={COLORS.primary}
                />
              </Pressable>

              {/* 資訊按鈕 */}
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color={COLORS.primary}
                />
              </Pressable>

              {/* 背景設置按鈕 */}
              <Pressable
                onPress={() => setShowBackgroundModal(true)}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="palette"
                  size={24}
                  color={COLORS.primary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.messagesContainer}>
            {/* 聊天室背景圖片或應用背景圖片 */}
            {(chatBackground.imageUri || appBackgroundImage) && (
              <Image
                source={{ uri: chatBackground.imageUri || appBackgroundImage }}
                style={styles.backgroundImage}
              />
            )}

            <FlatList
              data={messages}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageLine,
                    {
                      justifyContent: item.isSender ? 'flex-end' : 'flex-start',
                    },
                  ]}
                >
                  <ChatBubble
                    text={item.text}
                    isSender={item.isSender}
                    timestamp={item.timestamp}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.messageList,
                chatBackground.color && { backgroundColor: chatBackground.color },
              ]}
              scrollEnabled
              showsVerticalScrollIndicator={false}
            />
          </View>

          <ChatInput onSendMessage={addMessage} />
        </View>
      </KeyboardAvoidingView>

      {/* 背景選擇 Modal */}
      <Modal
        visible={showBackgroundModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBackgroundModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowBackgroundModal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>選擇背景</Text>
              <Pressable onPress={() => setShowBackgroundModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.text}
                />
              </Pressable>
            </View>

            <ScrollView style={styles.backgroundOptions}>
              {/* 顏色選項 */}
              <Text style={styles.optionTitle}>背景顏色</Text>
              <View style={styles.colorGrid}>
                {Object.entries(THEME_COLORS).map(([key, color]) => (
                  <Pressable
                    key={key as string}
                    onPress={() => handleColorSelect(color)}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      chatBackground.color === color && styles.colorOptionSelected,
                    ]}
                  >
                    {chatBackground.color === color && (
                      <MaterialCommunityIcons
                        name="check"
                        size={24}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>
                ))}
              </View>

              {/* 圖片選項 */}
              <Text style={styles.optionTitle}>背景圖片</Text>
              <Pressable
                onPress={handleImageSelect}
                style={[
                  styles.imageOption,
                  chatBackground.imageUri && styles.imageOptionSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name="image-plus"
                  size={32}
                  color={COLORS.primary}
                />
                <Text style={styles.imageOptionText}>選擇圖片</Text>
              </Pressable>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
  },
  onlineIndicatorContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    padding: 2,
  },
  contactNameContainer: {
    flex: 1,
  },
  contactName: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
  },
  onlineStatus: {
    ...TYPOGRAPHY.caption,
    color: COLORS.online,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.md,
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  messageList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messageLine: {
    flexDirection: 'row',
    marginVertical: SPACING.sm,
  },
  messagesContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    zIndex: -1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingBottom: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.text,
  },
  backgroundOptions: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  optionTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  colorOption: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  imageOption: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  imageOptionSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  imageOptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
});
