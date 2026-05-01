import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { ContactCard } from '../../../components/ContactCard';
import { OnlineIndicator } from '../../../components/OnlineIndicator';
import { useContacts } from '../../../hooks/useContacts';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../../utils/styles';
import { Contact } from '../../../utils/types';

export default function ChatsScreen() {
  const { contacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactPress = (contact: Contact) => {
    router.push(`/(tabs)/chat/${contact.id}?name=${contact.name}`);
  };

  return (
    <SafeAreaView style={[styles.safeAreaContainer, { backgroundColor: COLORS.background }]}>
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={COLORS.textTertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="搜尋聯絡人..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 朋友頭貼快速導航列表 */}
      <View style={styles.quickAccessContainer}>
        <FlatList
          data={contacts}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleContactPress(item)}
              style={({ pressed }) => [
                styles.avatarWrapper,
                pressed && styles.avatarWrapperPressed,
              ]}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.quickAccessAvatar}
                />
                <View style={styles.onlineIndicatorWrapper}>
                  <OnlineIndicator isOnline={item.isOnline} size={14} />
                </View>
              </View>
              <Text style={styles.avatarLabel} numberOfLines={1}>{item.name}</Text>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickAccessContent}
        />
      </View>

        <FlatList
          data={filteredContacts}
          renderItem={({ item }) => (
            <ContactCard
              contact={item}
              onPress={handleContactPress}
            />
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled
          style={styles.contactsList}
        />
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundLight,
    zIndex: 1,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
  },
  quickAccessContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 1,
  },
  quickAccessContent: {
    paddingHorizontal: SPACING.md,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  avatarWrapperPressed: {
    opacity: 0.7,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  quickAccessAvatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
  },
  onlineIndicatorWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    padding: 2,
  },
  avatarLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    maxWidth: 56,
    textAlign: 'center',
  },
  contactsList: {
    zIndex: 1,
  },
});
