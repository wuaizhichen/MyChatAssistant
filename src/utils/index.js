/**
 * 工具函数
 */
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 创建 Markdown 解析器实例
const md = new MarkdownIt({
  html: false,       // 不解析 HTML 标签
  linkify: true,     // 自动转换 URL 为链接
  typographer: true,  // 自动转换标点符号
  // 代码高亮
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs-code-block"><div class="code-header"><span class="code-lang">${lang}</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.hljs-code-block').querySelector('code').textContent)">复制</button></div><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch (_) {}
    }
    return `<pre class="hljs-code-block"><div class="code-header"><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.hljs-code-block').querySelector('code').textContent)">复制</button></div><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

/**
 * 渲染 Markdown 为 HTML
 * @param {string} content - Markdown 原文
 * @returns {string} HTML 字符串
 */
export function renderMarkdown(content) {
  if (!content) return ''
  return md.render(content)
}

/**
 * 格式化时间显示
 * @param {string} dateStr - ISO 日期字符串
 * @returns {string} 格式化后的时间
 */
export function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const oneDay = 86400000

  // 今天：显示时间
  if (diff < oneDay && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < 2 * oneDay) {
    // 昨天
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < 7 * oneDay) {
    // 一周内：显示星期
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  // 超过一周：显示完整日期
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}
