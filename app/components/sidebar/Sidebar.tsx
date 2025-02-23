import { Button, ScrollView, Stack, Text, useTheme, YStack, XStack, Input } from 'tamagui';
import { 
  ChevronLeft, 
  Filter, 
  MoreVertical, 
  Plus, 
  Search 
} from '@tamagui/lucide-icons';
import { useState } from 'react';
import type { ChatHistoryItem } from './types';
import { RecentActivity } from './RecentActivity';
import { ChatHistoryList } from './ChatHistoryList';
import { NewChatButton } from './NewChatButton';
import { SidebarSearch } from './SidebarSearch';
import { SidebarHeader } from './SidebarHeader';

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

  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack
      position="absolute"
      left={sidebarOpen ? 0 : -300}
      top={0}
      bottom={0}
      width={300}
      backgroundColor={theme.name === 'dark' ? '$gray2Dark' : '$gray1Light'}
      borderRightWidth={1}
      borderRightColor={theme.borderColor?.val ?? '#e0e0e0'}
      animation="quick"
      padding="$4"
    >
      <YStack flex={1} space="$4">
        {/* Header with Collapse Button */}
        <SidebarHeader 
          title="Chat History" 
          onClose={() => setSidebarOpen(false)} 
          theme={theme} 
        />

        {/* Search Bar and Filters */}
        <SidebarSearch 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          theme={theme} 
        />

        {/* New Chat Button */}
        <NewChatButton 
          onPress={() => {
            // Add logic for new chat here
            setSidebarOpen(false);
          }} 
          theme={theme} 
        />

        {/* Chat History List */}
        <ChatHistoryList 
          filteredChats={filteredChats} 
          theme={theme} 
        />

        {/* Recent Activity */}
        <RecentActivity theme={theme} />
      </YStack>
    </Stack>
  );
}