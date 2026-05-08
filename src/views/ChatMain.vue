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
          <p>{{ isGuest ? '游客模式 — 开始一段新的对话，探索 AI 的无限可能' : '开始一段新的对话，探索 AI 的无限可能' }}</p>
          <div class="guest-notice" v-if="isGuest">
            <el-alert
              title="游客模式下数据保存在本地浏览器中，登录后可同步至云端"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
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
        :loading="sendingMessage"
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

const GUEST_RESPONSES = [
  '你好！我是 AI 助手，目前你正在使用**游客模式**体验。\n\n在游客模式下，我会模拟回复帮助你了解平台功能。登录后即可连接真实的 AI 模型获得完整体验。\n\n你可以尝试以下操作：\n- 创建多个对话\n- 切换会话\n- 调整设置参数',
  '这是一个模拟回复。在登录后，你将获得真实的 AI 对话体验。\n\n当前游客模式支持：\n1. ✅ 创建和管理对话\n2. ✅ 本地保存聊天记录\n3. ✅ 体验平台界面和交互\n4. ❌ 真实 AI 对话（需登录）',
  '感谢你的提问！游客模式下我无法提供真实的 AI 回复，但我可以告诉你：\n\n**登录后的完整功能包括：**\n- 🤖 多种 AI 模型可选（GPT-3.5/GPT-4/GPT-4o）\n- 🔄 流式输出，实时看到回复\n- 💾 云端保存，多设备同步\n- ⚙️ 自定义温度、Token 等参数\n\n点击左侧「登录账号」即可开始完整体验！',
  '你好！我注意到你在游客模式下尝试与我对话。\n\n虽然我目前只能提供模拟回复，但这足以让你了解平台的操作方式。当你准备好后，随时可以登录获取完整体验。\n\n```javascript\n// 登录后你将解锁完整功能\nconst features = {\n  realAI: true,\n  streamOutput: true,\n  cloudSync: true,\n  multiModel: true\n};\n```'
]

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
    isGuest() {
      return this.$store.getters['user/isGuest']
    },
    currentConversation() {
      return this.$store.getters['chat/currentConversation']
    },
    currentMessages() {
      return this.$store.getters['chat/currentMessages']
    },
    streamEnabled() {
      return this.$store.getters['settings/streamEnabled']
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

      const conversationId = this.currentConversation.id
      const userMessage = {
        id: generateId(),
        role: 'user',
        content,
        createdAt: new Date().toISOString()
      }

      this.$store.dispatch('chat/addMessage', { conversationId, message: userMessage })

      const assistantMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString()
      }
      this.$store.dispatch('chat/addMessage', { conversationId, message: assistantMessage })

      this.sendingMessage = true
      this.$store.dispatch('chat/setSending', true)
      this.scrollToBottom()

      try {
        if (this.isGuest) {
          await this.sendGuestMessage(conversationId, content)
        } else if (this.streamEnabled) {
          await this.sendStreamMessage(conversationId, content)
        } else {
          await this.sendNormalMessage(conversationId, content)
        }
      } catch (err) {
        this.$store.dispatch('chat/updateAssistantMessage', {
          conversationId,
          content: '抱歉，发生了错误，请稍后重试。'
        })
      } finally {
        this.sendingMessage = false
        this.$store.dispatch('chat/setSending', false)
        this.streamController = null
      }
    },
    sendGuestMessage(conversationId) {
      return new Promise(resolve => {
        const response = GUEST_RESPONSES[Math.floor(Math.random() * GUEST_RESPONSES.length)]
        let index = 0
        const interval = setInterval(() => {
          if (index < response.length) {
            const chunkSize = Math.min(2, response.length - index)
            const chunk = response.substring(index, index + chunkSize)
            this.$store.dispatch('chat/updateAssistantMessage', {
              conversationId,
              content: chunk
            })
            index += chunkSize
            this.scrollToBottom()
          } else {
            clearInterval(interval)
            resolve()
          }
        }, 30)
        this._guestInterval = interval
      })
    },
    async sendNormalMessage(conversationId, content) {
      const res = await sendMessage(conversationId, { content })
      if (res.data) {
        this.$store.dispatch('chat/updateAssistantMessage', {
          conversationId,
          content: res.data.content || res.data.message || ''
        })
      }
    },
    sendStreamMessage(conversationId, content) {
      return new Promise((resolve, reject) => {
        this.streamController = sendMessageStream(
          conversationId,
          { content },
          (chunk) => {
            const text = chunk.content || chunk.choices?.[0]?.delta?.content || ''
            if (text) {
              this.$store.dispatch('chat/updateAssistantMessage', {
                conversationId,
                content: text
              })
              this.scrollToBottom()
            }
          },
          () => {
            resolve()
          },
          (err) => {
            reject(err)
          }
        )
      })
    },
    handleStop() {
      if (this._guestInterval) {
        clearInterval(this._guestInterval)
        this._guestInterval = null
      }
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
      margin-bottom: 16px;
    }

    .guest-notice {
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
