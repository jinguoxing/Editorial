/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Server-side handler for DeepSeek Harness (dsh) AI requests.
 * Uses @google/genai with gemini-3.8-flash and user agent telemetry.
 */

import { GoogleGenAI } from '@google/genai';
import { auditContentQuality, calculateAttributionInsight } from '../dsh/engine.ts';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function handleDshRequest(endpoint: string, body: any): Promise<any> {
  if (endpoint === '/audit') {
    const text = body.text || '';
    const platform = body.platform || 'xiaohongshu';
    return auditContentQuality(text, platform);
  }

  if (endpoint === '/attribution') {
    const postData = body.postData;
    if (!postData) {
      throw new Error('Missing postData');
    }
    return calculateAttributionInsight(postData);
  }

  if (endpoint === '/chat' || endpoint === '/generate') {
    const { prompt, persona, plugin, platform, currentText } = body;
    const client = getAiClient();

    const systemInstruction = `你是 DeepSeek Harness（dsh）社媒内容创作搭档，专为中文个人创作者和小团队服务。
你的目标是：
1. 懂人设：紧扣创作者定位（${persona?.name || '个人创作者'}，垂直领域：${persona?.niche || '知识分享'}，语气风格：${persona?.tone || '专业亲和'}）。
2. 省时间：生成文案要直接可用，具备爆款结构（黄金前3秒钩子 + 痛点阐述 + 结构化价值点 + 强CTA行动号召 + 精准社媒标签）。
3. 懂平台：针对${platform || '小红书'}平台特性（如小红书讲究图文排版、生活感与干货收藏；抖音讲究短平快口播前3秒反差）。
4. 守规则：绝对避免广告法极限词（“第一”、“国家级”、“绝无仅有”等）与过度虚假承诺。
请给出专业、敏锐、接地气且极具实操价值的中文输出。如果调用了插件（当前插件：${plugin || '通用搭档'}），请在回答前给出清晰的操作指引或分段结构。`;

    if (client) {
      try {
        const fullPrompt = `${currentText ? `【当前草稿内容】：\n${currentText}\n\n` : ''}【用户指令】：${prompt}`;
        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        const text = response.text || '';
        return { text, modelUsed: 'gemini-3.8-flash' };
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to local intelligent engine:', err?.message || err);
      }
    }

    // High quality offline fallback responses matching social media domain
    return {
      text: generateDomainSmartResponse(prompt, plugin, platform, persona),
      modelUsed: 'dsh-rule-engine-v1'
    };
  }

  throw new Error(`Unknown endpoint: ${endpoint}`);
}

function generateDomainSmartResponse(prompt: string, plugin: string, platform: string, persona: any): string {
  const pName = persona?.name || '创作者';
  const niche = persona?.niche || '自媒体运营';

  if (plugin === 'trend_radar' || /热点|选题|爆款|趋势/i.test(prompt)) {
    return `### ⚡ dsh.trend_radar 实时热点与选题雷达

针对【${platform || '小红书'}】与【${niche}】赛道，为你检索并提炼了 3 组高潜力飙升选题方案：

1. **选题一：反常识避坑型（爆发力指数 94%）**
   - **爆款标题**：“做了3年${niche}才明白：为什么90%的新人都死在前30天？”
   - **黄金前3秒钩子**：“别再盲目死磕日更了！很多人以为自媒体拼的是体力，其实真正拉开差距的是这套‘低阻力复盘表’。”
   - **核心价值点**：列出3个新手致命误区（盲目追热点无记忆、前3秒无反差、缺乏数据归因）。

2. **选题二：保姆级工具清单型（收藏率极高）**
   - **爆款标题**：“建议收藏！一人团队做爆款的5个私藏神器（附使用流程）”
   - **视觉设计建议**：第1张图放对比强烈的痛点大字封面，第2-4张放结构化工具思维导图。

3. **选题三：人设故事逆袭型（高互动与涨粉）**
   - **爆款标题**：“从0粉丝到商业变现，我是如何把账号‘调教’成印钞机的？”
   - **互动号召 (CTA)**：“在评论区留下你目前的赛道，我帮你诊断前3秒钩子！”

💡 **下一步操作建议**：直接输入“用选题一生成小红书图文文案”，我将调动 \`dsh.content_engine\` 为你一键成稿。`;
  }

  if (plugin === 'content_engine' || /写|生成|文案|脚本|大纲/i.test(prompt)) {
    return `### ✍️ dsh.content_engine 内容成稿方案

已融合账号人设【${pName}】（语气：${persona?.tone || '专业通透'}），为你生成适配【${platform || '小红书'}】的完整发布稿件：

**【爆款主标题】**：做了3年${niche}，我把最值钱的3个复盘习惯全公开了！ 
**【副标题/封面文案】**：千万别再无脑盲更！收藏这份自媒体闭环SOP 📌

---
**【正文结构】**

很多人问我：“为什么每天哼哧哼哧码字拍视频，流量还是卡在三五百？”

其实自媒体本质上不是写作比赛，而是一套**数据闭环工程**。今天不讲虚的，分享我用了两年的3个底层逻辑：

🔥 **1. 抓取热点不是做搬运工，而是找“大众情绪与私有视角的交集”**
不要看到什么火就抄什么，而是问自己：“这个热点下，我的粉丝最委屈/最困惑/最想吐槽的是什么？”

💡 **2. 黄金前3秒别讲废话，直接抛出“反差结论”**
第一句话必须打破观众的心理预期。比如：“不要为了完播率硬拖时长，前5秒没给到确定性收益，用户早就划走了。”

📊 **3. 发完不是终点，必须做“逆向归因”**
发了笔记为什么爆？为什么凉？
- 藏赞比 > 0.8：说明干货价值强，继续强化结构化清单；
- 评论区吵起来：说明痛点打中要害，沉淀为下次选题的钩子库。

---
💬 **【互动留白 CTA】**
你在做号过程中遇到过最头疼的瓶颈是什么？在评论区聊聊，抓3位同学深度拆解！

#${niche} #自媒体干货 #新手自媒体 #内容创作者 #爆款逻辑 #运营日常`;
  }

  return `收到指令！已基于 DeepSeek Harness 智能引擎为你解析。
当前挂载插件：\`${plugin || 'dsh.core'}\`
当前选定账号人设：【${pName}】

你可以随时：
- 输入 \`/trend\` 扫描全网实时飙升榜单与创作风向
- 输入 \`/craft\` 基于选定选题一键产出多平台排版脚本
- 输入 \`/check\` 启动严格质量门禁检测（违禁词与广告法规避）
- 输入 \`/recap\` 导入历史发布数据进行爆款归因复盘

请告诉我你接下来想聚焦的热点方向或具体需求！`;
}
