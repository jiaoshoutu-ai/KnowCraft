// 个人中心页面组件
const ProfilePage = {
  template: `
    <div class="phone-frame">
      <div class="screen-container">
        <!-- 状态栏 -->
        <div class="status-bar">
          <span class="time">9:41</span>
          <div class="icons">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        <!-- 导航栏 -->
        <div class="nav-bar">
          <div class="nav-back" @click="goBack">←</div>
          <div class="nav-title">我的档案</div>
        </div>

        <!-- 用户信息卡片 -->
        <div style="background: linear-gradient(135deg, var(--primary), #8B5CF6); padding: 24px 20px; color: white;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
            <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px;">
              👤
            </div>
            <div style="flex: 1;">
              <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">思辨小达人</div>
              <div style="font-size: 13px; opacity: 0.9;">Lv.3 进阶辩手</div>
            </div>
          </div>

          <!-- 统计数据 -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            <div style="background: rgba(255,255,255,0.15); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px;">{{ userStats.totalDebates }}</div>
              <div style="font-size: 11px; opacity: 0.9;">辩论次数</div>
            </div>
            <div style="background: rgba(255,255,255,0.15); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px;">{{ userStats.avgScore }}</div>
              <div style="font-size: 11px; opacity: 0.9;">平均分</div>
            </div>
            <div style="background: rgba(255,255,255,0.15); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px;">{{ userStats.streakDays }}</div>
              <div style="font-size: 11px; opacity: 0.9;">连续打卡</div>
            </div>
          </div>
        </div>

        <!-- 主内容区 -->
        <div style="padding: 20px;">
          <!-- 成就徽章 -->
          <div style="background: var(--card); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow);">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px;">
              🏆 成就徽章
            </h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
              <div v-for="(badge, index) in userStats.badges" :key="index"
                   style="text-align: center;">
                <div :style="{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 8px',
                  background: badge.unlocked ? 'var(--primary-bg)' : 'var(--bg)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  opacity: badge.unlocked ? 1 : 0.3,
                  filter: badge.unlocked ? 'none' : 'grayscale(100%)'
                }">
                  {{ badge.icon }}
                </div>
                <div :style="{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: badge.unlocked ? 'var(--text)' : 'var(--text-light)',
                  lineHeight: '1.2'
                }">
                  {{ badge.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- 能力雷达图（简化版） -->
          <div style="background: var(--card); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow);">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 16px;">
              📊 能力分布
            </h3>
            <div v-for="(ability, index) in userStats.abilities" :key="index" style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 20px;">{{ ability.icon }}</span>
                  <span style="font-size: 14px; font-weight: 600; color: var(--text);">{{ ability.name }}</span>
                </div>
                <div style="font-size: 16px; font-weight: 700; color: var(--primary);">
                  {{ ability.value }}
                </div>
              </div>
              <div style="height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden;">
                <div :style="{
                  height: '100%',
                  width: (ability.value * 10) + '%',
                  background: 'linear-gradient(90deg, var(--primary), #8B5CF6)',
                  transition: 'width 1s ease',
                  borderRadius: '4px'
                }"></div>
              </div>
            </div>
          </div>

          <!-- 辩论历史 -->
          <div style="background: var(--card); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 17px; font-weight: 700; color: var(--text);">
                📜 辩论历史
              </h3>
              <span style="font-size: 13px; color: var(--primary); cursor: pointer;">查看全部 →</span>
            </div>

            <div v-for="(debate, index) in userStats.recentDebates" :key="index"
                 style="display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border); cursor: pointer;">
              <div style="width: 48px; height: 48px; background: var(--primary-bg); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
                {{ debate.icon }}
              </div>
              <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; line-height: 1.4;">
                  {{ debate.title }}
                </div>
                <div style="font-size: 12px; color: var(--text-light);">
                  {{ debate.date }} · {{ debate.role }}
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
                <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                  {{ debate.score }}
                </div>
                <div style="font-size: 11px; color: var(--text-light);">分</div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn-secondary" @click="goHome" style="flex: 1;">
              返回首页
            </button>
            <button class="btn-primary" @click="shareProfile" style="flex: 1;">
              分享档案
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      userStats: {
        totalDebates: 15,
        avgScore: 41.5,
        streakDays: 7,
        badges: [
          { icon: '🌟', name: '初出茅庐', unlocked: true },
          { icon: '🔥', name: '连续7天', unlocked: true },
          { icon: '⚔️', name: '辩论达人', unlocked: true },
          { icon: '🏆', name: '满分王', unlocked: false },
          { icon: '📚', name: '知识渊博', unlocked: true },
          { icon: '💡', name: '创意无限', unlocked: false },
          { icon: '🎯', name: '精准打击', unlocked: true },
          { icon: '👑', name: '辩论之王', unlocked: false }
        ],
        abilities: [
          { name: '逻辑性', icon: '🧠', value: 8.2 },
          { name: '证据力', icon: '📚', value: 8.5 },
          { name: '表达力', icon: '🗣️', value: 7.8 },
          { name: '反驳力', icon: '⚔️', value: 8.0 },
          { name: '批判性思维', icon: '👁️', value: 8.3 }
        ],
        recentDebates: [
          {
            icon: '📱',
            title: '短视频平台是否应该为青少年沉迷承担主要责任？',
            date: '2024-01-15',
            role: '正方',
            score: 42
          },
          {
            icon: '🤖',
            title: '是否应该完全禁止未成年人使用短视频？',
            date: '2024-01-14',
            role: '反方',
            score: 45
          },
          {
            icon: '📵',
            title: '青少年模式能否真正解决短视频沉迷问题？',
            date: '2024-01-13',
            role: '正方',
            score: 38
          }
        ]
      }
    }
  },

  methods: {
    goBack() {
      this.$router.push('/')
    },
    goHome() {
      this.$router.push('/')
    },
    shareProfile() {
      alert('分享功能开发中...')
    }
  }
}
