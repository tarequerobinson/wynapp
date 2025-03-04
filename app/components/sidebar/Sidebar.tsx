import { Button, ScrollView, Stack, Text, useTheme, YStack, XStack, AnimatePresence } from 'tamagui';
import { 
  ChevronLeft, 
  Filter, 
  MoreVertical, 
  Plus, 
  Search 
} from '@tamagui/lucide-icons';
import { useState } from 'react';
import type { ChatHistoryItem } from '@/components/chat/types';
import { RecentActivity } from './RecentActivity';
import { ChatHistoryList } from './ChatHistoryList';
import { NewChatButton } from './NewChatButton';
import { SidebarSearch } from './SidebarSearch';
import { SidebarHeader } from './SidebarHeader';
import { Overlay } from './Overlay'; // Import your Overlay component

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  chatHistory: ChatHistoryItem[];
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  chatHistory,
}: SidebarProps) {
  const theme = useTheme();
  const isDark = theme.name === 'dark';
  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Use your Overlay component */}
      {sidebarOpen && <Overlay onPress={() => setSidebarOpen(false)} />}
      
      <Stack
        position="absolute"
        left={sidebarOpen ? 0 : -300}
        top={0}
        bottom={0}
        width={300}
        backgroundColor={isDark ? "$color1" : "$background"}
        borderRightWidth={1}
        borderRightColor="$gray4"
        padding="$4"
        zIndex={100}
        transition="all 0.25s ease"
      >
        <YStack flex={1} space="$4">
          <SidebarHeader 
            title="Chat History" 
            onClose={() => setSidebarOpen(false)}
          />
          <SidebarSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
          />
          <NewChatButton 
            onPress={() => {
              setSidebarOpen(false);
            }} 
          />
          <ChatHistoryList 
            filteredChats={filteredChats}
          />
          <RecentActivity />
        </YStack>
      </Stack>
    </>
  );
}