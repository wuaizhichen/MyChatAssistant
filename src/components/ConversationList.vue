<template>
  <div class="conversation-list">
    <div class="search-box" v-if="!collapsed">
      <el-input
        v-model="searchText"
        placeholder="搜索对话..."
        prefix-icon="el-icon-search"
        size="small"
        clearable
      />
    </div>
    <div class="list-content">
      <div
        v-for="conv in filteredConversations"
        :key="conv.id"
        class="conversation-item"
        :class="{ active: conv.id === currentId }"
        @click="handleClick(conv.id)"
      >
        <div v-if="collapsed" class="conv-icon" :title="conv.title">💬</div>
        <template v-else>
          <div class="conv-info">
            <div class="conv-title">{{ conv.title }}</div>
            <div class="conv-time">{{ formatTime(conv.updatedAt) }}</div>
          </div>
          <el-button
            type="text"
            icon="el-icon-delete"
            class="delete-btn"
            size="mini"
            @click.stop="$emit('delete', conv.id)"
          />
        </template>
      </div>
      <div class="empty-list" v-if="filteredConversations.length === 0 && !collapsed">
        <span>暂无对话</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatTime } from '@/utils'

export default {
  name: 'ConversationList',
  props: {
    collapsed: Boolean
  },
  data() {
    return {
      searchText: ''
    }
  },
  computed: {
    conversations() {
      return this.$store.getters['chat/sortedConversations']
    },
    currentId() {
      return this.$store.state.chat.currentConversationId
    },
    filteredConversations() {
      if (!this.searchText) return this.conversations
      const keyword = this.searchText.toLowerCase()
      return this.conversations.filter(c =>
        c.title.toLowerCase().includes(keyword)
      )
    }
  },
  methods: {
    formatTime,
    handleClick(id) {
      if (this.collapsed) {
        this.$emit('expand')
      } else {
        this.$emit('select', id)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.conversation-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 8px 12px;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #ececf1;
  transition: background 0.2s;
  margin-bottom: 2px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
  }

  .conv-icon {
    font-size: 20px;
    text-align: center;
    width: 100%;
    cursor: pointer;
  }

  .conv-info {
    flex: 1;
    overflow: hidden;

    .conv-title {
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .conv-time {
      font-size: 12px;
      color: #8e8ea0;
      margin-top: 2px;
    }
  }

  .delete-btn {
    color: #8e8ea0;
    opacity: 0;
    transition: opacity 0.2s;

    &:hover {
      color: #ef4444;
    }
  }

  &:hover .delete-btn {
    opacity: 1;
  }
}

.empty-list {
  text-align: center;
  color: #8e8ea0;
  padding: 20px;
  font-size: 14px;
}
</style>
