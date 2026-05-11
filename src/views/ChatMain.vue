<template>
  <div class="chat-main">
    <div class="chat-header" v-if="currentConversation">
      <h3 class="chat-title">{{ currentConversation.title }}</h3>
      <el-dropdown @command="handleCommand">
        <el-button type="text" icon="el-icon-more"></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="rename">重命名</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <div class="chat-body" ref="chatBody">
      <div class="welcome-screen" v-if="!currentConversation">
        <div class="welcome-content">
          <div class="welcome-icon">🤖</div>
          <h2>智能聊天平台</h2>
          <p>开始一段新的对话，探索 AI 的无限可能</p>
          <div class="welcome-input-wrapper">
            <el-input
              v-model="welcomeInput"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              placeholder="输入消息开始对话... (Enter 发送，Shift+Enter 换行)"
              @keydown.native.enter.exact.prevent="handleWelcomeSend"
            />
            <el-button
              type="primary"
              icon="el-icon-s-promotion"
              circle
              :disabled="!welcomeInput.trim()"
              @click="handleWelcomeSend"
            />
          </div>
          <div class="quick-actions">
            <el-button round @click="quickStart('帮我写一封邮件')">✉️ 写邮件</el-button>
            <el-button round @click="quickStart('帮我写一段代码')">💻 写代码</el-button>
            <el-button round @click="quickStart('帮我翻译一段文字')">🌍 翻译</el-button>
            <el-button round @click="quickStart('帮我分析一个问题')">🧠 分析</el-button>
          </div>
        </div>
      </div>

      <MessageList
        v-else
        :messages="currentMessages"
        :loading="sendingMessage && !hasAssistantContent"
      />
    </div>

    <div class="chat-input-area" v-if="currentConversation">
      <ChatInput
        :disabled="sendingMessage"
        @send="handleSend"
        @stop="handleStop"
      />
    </div>
  </div>
</template>

<script>
import MessageList from '@/components/MessageList.vue'
import ChatInput from '@/components/ChatInput.vue'
import { sendMessage, sendMessageStream } from '@/api/chat'
import { generateId } from '@/utils'

export default {
  name: 'ChatMain',
  components: { MessageList, ChatInput },
  data() {
    return {
      sendingMessage: false,
      streamController: null,
      welcomeInput: ''
    }
  },
  computed: {
    currentConversation() {
      return this.$store.getters['chat/currentConversation']
    },
    currentMessages() {
      return this.$store.getters['chat/currentMessages']
    },
    streamEnabled() {
      return this.$store.getters['settings/streamEnabled']
    },
    // 检查最后一条 AI 消息是否有内容（用于流式输出时隐藏 loading 动画）
    hasAssistantContent() {
      const msgs = this.currentMessages
      if (msgs && msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1]
        return lastMsg.role === 'assistant' && lastMsg.content && lastMsg.content.length > 0
      }
      return false
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id) {
        if (id) {
          this.$store.dispatch('chat/selectConversation', id)
          this.$store.dispatch('chat/fetchMessages', id)
        } else {
          this.$store.dispatch('chat/selectConversation', null)
        }
      }
    }
  },
  methods: {
    handleWelcomeSend() {
      const text = this.welcomeInput.trim()
      if (!text) return
      this.quickStart(text)
      this.welcomeInput = ''
    },
    async quickStart(prompt) {
      try {
        const conv = await this.$store.dispatch('chat/createConversation', '新对话')
        if (this.$route.path !== '/chat') {
          this.$router.push(`/chat/${conv.id}`)
        } else {
          this.$store.dispatch('chat/selectConversation', conv.id)
          this.$nextTick(() => {
            this.handleSend(prompt)
          })
        }
      } catch (err) {
        this.$message.error('创建对话失败')
      }
    },
    async handleSend(content) {
      if (!this.currentConversation || this.sendingMessage) return

      const sessionId = this.currentConversation.id
      const userMessage = {
        id: generateId(),
        role: 'user',
        content,
        createdAt: new Date().toISOString()
      }

      this.$store.dispatch('chat/addMessage', { sessionId, message: userMessage })

      const assistantMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString()
      }
      this.$store.dispatch('chat/addMessage', { sessionId, message: assistantMessage })

      this.sendingMessage = true
      this.$store.dispatch('chat/setSending', true)
      this.scrollToBottom()

      try {
        if (this.streamEnabled) {
          await this.sendStreamMessage(sessionId, content)
        } else {
          await this.sendNormalMessage(sessionId, content)
        }
      } catch (err) {
        this.$store.dispatch('chat/updateAssistantMessage', {
          sessionId,
          content: '抱歉，发生了错误，请稍后重试。'
        })
      } finally {
        this.sendingMessage = false
        this.$store.dispatch('chat/setSending', false)
        this.streamController = null
      }
    },
    async sendNormalMessage(sessionId, content) {
      const res = await sendMessage(sessionId, { content })
      if (res.data) {
        this.$store.dispatch('chat/updateAssistantMessage', {
          sessionId,
          content: res.data.content || res.data.message || ''
        })
      }
    },
    sendStreamMessage(sessionId, content) {
      return new Promise((resolve, reject) => {
        const requestData = { content: content }
        console.log('发送流式请求:', JSON.stringify(requestData))
        
        let accumulatedContent = ''
        
        this.streamController = sendMessageStream(
          sessionId,
          requestData,
          (chunk) => {
            const text = chunk.content || ''
            if (text) {
              // 累积内容并更新消息
              accumulatedContent += text
              this.$store.dispatch('chat/updateAssistantMessage', {
                sessionId,
                content: accumulatedContent
              })
              this.scrollToBottom()
            }
          },
          () => {
            console.log('流式响应完成，总长度:', accumulatedContent.length)
            resolve()
          },
          (err) => {
            console.error('流式响应错误:', err)
            reject(err)
          }
        )
      })
    },
    handleStop() {
      if (this.streamController) {
        this.streamController.abort()
        this.streamController = null
      }
      this.sendingMessage = false
      this.$store.dispatch('chat/setSending', false)
    },
    handleCommand(command) {
      if (command === 'rename') {
        this.$prompt('请输入新的对话标题', '重命名', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: this.currentConversation.title
        }).then(({ value }) => {
          this.$store.dispatch('chat/updateConversationTitle', {
            id: this.currentConversation.id,
            title: value
          })
        }).catch(() => {})
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const body = this.$refs.chatBody
        if (body) {
          body.scrollTop = body.scrollHeight
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #fff;

  .chat-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  .welcome-content {
    text-align: center;
    max-width: 600px;

    .welcome-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    h2 {
      font-size: 28px;
      color: #333;
      margin-bottom: 8px;
    }

    p {
      color: #999;
      margin-bottom: 24px;
    }

    .welcome-input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      max-width: 500px;
      margin: 0 auto 24px;
      padding: 12px 16px;
      background: #f7f7f8;
      border: 1px solid #e5e5e5;
      border-radius: 12px;

      ::v-deep .el-textarea__inner {
        border: none;
        background: transparent;
        resize: none;
        padding: 4px 0;
        font-size: 15px;
        line-height: 1.5;
        box-shadow: none !important;
      }

      &:focus-within {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
      }
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }
  }
}

.chat-input-area {
  border-top: 1px solid #e8e8e8;
  padding: 16px 20px;
  background: #fff;
}
</style>
