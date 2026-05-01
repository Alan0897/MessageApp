import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { AvatarPicker } from '../../../components/AvatarPicker';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/styles';

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=10';
const DEFAULT_USER_NAME = '我的頭像';
const AVATAR_STORAGE_KEY = 'user_avatar';
const USER_NAME_STORAGE_KEY = 'user_name';

export default function SettingsScreen() {
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [userName, setUserName] = useState(DEFAULT_USER_NAME);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const loadUserData = async () => {
    try {
      const [savedAvatar, savedUserName] = await Promise.all([
        AsyncStorage.getItem(AVATAR_STORAGE_KEY),
        AsyncStorage.getItem(USER_NAME_STORAGE_KEY),
      ]);

      if (savedAvatar) setAvatar(savedAvatar);
      if (savedUserName) setUserName(savedUserName);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 從存儲加載用戶數據
  useEffect(() => {
    loadUserData();
  }, []);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          '權限被拒絕',
          '需要相簿存取權限才能選擇照片',
          [{ text: '確定', onPress: () => {} }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0].uri;
        setAvatar(selectedImage);

        // 保存到本地存儲
        await AsyncStorage.setItem(AVATAR_STORAGE_KEY, selectedImage);

        Alert.alert('成功', '頭像已更新', [
          { text: '確定', onPress: () => {} },
        ]);
      }
    } catch (error) {
      Alert.alert('錯誤', '選擇照片時出錯', [
        { text: '確定', onPress: () => {} },
      ]);
      console.error('Error picking image:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeAreaContainer, { backgroundColor: COLORS.background }]}>
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>
          <Text style={styles.loadingText}>加載中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView key={refreshKey} style={[styles.safeAreaContainer, { backgroundColor: COLORS.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: COLORS.background }]}
        contentContainerStyle={styles.contentContainer}
      >
      <AvatarPicker
        avatar={avatar}
        name={userName}
        onPickImage={handlePickImage}
      />

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>關於</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>應用版本</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>開發者</Text>
          <Text style={styles.infoValue}>Facebook Messenger</Text>
        </View>
      </View>
    </ScrollView>
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
  contentContainer: {
    paddingBottom: SPACING.xl,
    zIndex: 1,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  sectionContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
});
