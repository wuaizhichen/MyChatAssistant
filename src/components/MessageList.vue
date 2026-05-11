<template>
  <div class="message-list">
    <div v-for="msg in messages" :key="msg.id" class="message-item" :class="msg.role">
      <div class="message-avatar">
        <div class="avatar" :class="msg.role">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
      </div>
      <div class="message-body">
        <div class="message-role">{{ msg.role === 'user' ? '你' : 'AI 助手' }}</div>
        <div class="message-content">
          <MarkdownRenderer
            v-if="msg.role === 'assistant'"
            :content="msg.content"
            :isStreaming="isStreamingMessage(msg)"
          />
          <div v-else class="text-content">{{ msg.content }}</div>
        </div>
      </div>
    </div>
    <div v-if="loading && (!messages || messages.length === 0)" class="message-item assistant">
      <div class="message-avatar">
        <div class="avatar assistant">🤖</div>
      </div>
      <div class="message-body">
        <div class="message-role">AI 助手</div>
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MarkdownRenderer from './MarkdownRenderer.vue'

export default {
  name: 'MessageList',
  components: { MarkdownRenderer },
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    loading: Boolean
  },
  computed: {
    isStreaming() {
      return this.loading
    }
  },
  methods: {
    isStreamingMessage(msg) {
      const lastMsg = this.messages[this.messages.length - 1]
      return this.loading && lastMsg && lastMsg.id === msg.id && lastMsg.role === 'assistant'
    }
  }
}
</script>

<style lang="scss" scoped>
.message-list {
  max-width: 800px;
  margin: 0 auto;
}

.message-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &.user {
    flex-direction: row-reverse;

    .user-text {
      background: #e8f0fe;
      padding: 10px 16px;
      border-radius: 12px 12px 4px 12px;
      display: inline-block;
      max-width: 100%;
      word-break: break-word;
      line-height: 1.6;
    }
  }

  &.assistant {
    .message-content {
      line-height: 1.7;

      .text-content {
        word-break: break-word;
      }
    }
  }
}

.message-avatar {
  flex-shrink: 0;

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;

    &.user {
      background: #e8f0fe;
    }

    &.assistant {
      background: #f0f0f0;
    }
  }
}

.message-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .message-role {
    font-size: 13px;
    font-weight: 600;
    color: #666;
    margin-bottom: 4px;
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #999;
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>
