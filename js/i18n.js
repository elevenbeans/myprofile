import { storage } from './state.js';

export const i18n = {
  en: {
    'hero-title': 'Software Engineer (AI Wrangler)',
    'hero-tagline': 'Minimalism first.\nThinking, logic, execution.',
    'section-experience': 'Experience',
    'section-projects': 'Projects',
    'section-hobbies': 'Interests',
    'exp-1-company': 'Trip.com Group',
    'exp-1-role': 'Senior FE Engineer & Team Leader',
    'exp-1-date': '2016.07 \u2013 2020.12',
    'exp-1-desc': 'Building travel booking systems at global scale.',
    'exp-2-company': 'Travix \u00b7 Cheaptickets.nl \u00b7 Budgetair.com',
    'exp-2-role': 'Technical Manager',
    'exp-2-date': '2021 \u2013 now',
    'exp-2-desc': 'International travel platforms and OTA price comparison.',
    'exp-3-company': 'Alibaba',
    'exp-3-role': 'Software Engineer',
    'exp-3-date': '2015 \u2013 2016',
    'exp-3-desc': 'E-commerce platform development.',
    'exp-4-company': "Xi'an Jiaotong University",
    'exp-4-major': 'Computer Science',
    'exp-4-date': '2012 \u2013 2015',
    'exp-5-company': 'Sichuan University',
    'exp-5-major': 'Computer Science',
    'exp-5-date': '2008 \u2013 2012',
    'project-nas-title': 'NAS Portal',
    'project-nas-desc': 'Self-hosted portal for files, photos & media, with a local AI assistant.',
    'project-blog-title': 'Blog',
    'project-blog-desc': 'Thoughts on engineering, travel, and side projects.',
    'project-game-title': 'Game of Life',
    'project-game-desc': "Conway's Game of Life simulation.",
    'tag-1': 'Self-hosting',
    'tag-2': 'Travel',
    'tag-3': 'Coffee',
    'tag-4': 'Cat',
    'tag-5': 'Music',
    'tag-6': 'Whisky',
    'tag-7': 'Vibe Coding',
    'exp-toggle-more': 'Show more',
    'exp-toggle-less': 'Show less',
    'lang-toggle-label': '中文',
    'skip-link': 'Skip to content',
    'opens-new-tab': '(opens in new tab)',
    'theme-label-light': 'Switch to dark mode',
    'theme-label-dark': 'Switch to light mode',
    'lang-label': 'Switch language',
    'back-to-top': 'Back to top',
    'hint-terminal': 'Open terminal',
    'hint-agent': 'Open code agent',
    'terminal-label': 'Terminal',
    'terminal-log-label': 'Terminal output',
    'terminal-input-label': 'Terminal input',
    'agent-label': 'Code agent',
    'agent-log-label': 'Agent messages',
    'agent-close': 'Close agent',
    'agent-input-label': 'Code agent input'
  },
  zh: {
    'hero-title': '\u8F6F\u4EF6\u5DE5\u7A0B\u5E08\uFF08AI \u9A6F\u5316\u5E08\uFF09',
    'hero-tagline': '\u6781\u7B80\u7B2C\u4E00\u3002\n\u601D\u8DEF\uFF0C\u903B\u8F91\uFF0C\u6267\u884C\u529B\u3002',
    'section-experience': '\u5DE5\u4F5C\u7ECF\u5386',
    'section-projects': '\u9879\u76EE',
    'section-hobbies': '\u5174\u8DA3\u7231\u597D',
    'exp-1-company': '\u643A\u7A0B\u96C6\u56E2',
    'exp-1-role': '\u8D44\u6DF1\u524D\u7AEF\u5DE5\u7A0B\u5E08 & TL',
    'exp-1-date': '2016.07 \u2013 2020.12',
    'exp-1-desc': '\u6784\u5EFA\u5168\u7403\u89C4\u6A21\u7684\u65C5\u884C\u9884\u8BA2\u7CFB\u7EDF\u3002',
    'exp-2-company': 'Travix \u00b7 Cheaptickets.nl \u00b7 Budgetair.com',
    'exp-2-role': '\u6280\u672F\u7ECF\u7406',
    'exp-2-date': '2021 \u2013 \u81F3\u4ECA',
    'exp-2-desc': '\u56FD\u9645\u65C5\u884C\u5E73\u53F0\u548COTA\u6BD4\u4EF7\u670D\u52A1\u3002',
    'exp-3-company': '\u963F\u91CC\u5DF4\u5DF4',
    'exp-3-role': '\u8F6F\u4EF6\u5DE5\u7A0B\u5E08',
    'exp-3-date': '2015 \u2013 2016',
    'exp-3-desc': '\u7535\u5546\u5E73\u53F0\u5F00\u53D1\u3002',
    'exp-4-company': '\u897F\u5B89\u4EA4\u901A\u5927\u5B66',
    'exp-4-major': '\u8BA1\u7B97\u673A\u79D1\u5B66\u4E0E\u6280\u672F',
    'exp-4-date': '2012 \u2013 2015',
    'exp-5-company': '\u56DB\u5DDD\u5927\u5B66',
    'exp-5-major': '\u8BA1\u7B97\u673A\u79D1\u5B66\u4E0E\u6280\u672F',
    'exp-5-date': '2008 \u2013 2012',
    'project-nas-title': 'NAS \u95E8\u6237',
    'project-nas-desc': '\u81EA\u6258\u7BA1\u95E8\u6237\uFF0C\u7BA1\u7406\u6587\u4EF6\u3001\u7167\u7247\u4E0E\u5A92\u4F53\uFF0C\u5185\u7F6E\u672C\u5730 AI \u52A9\u624B\u3002',
    'project-blog-title': '\u535A\u5BA2',
    'project-blog-desc': '\u5173\u4E8E\u5DE5\u7A0B\u3001\u65C5\u884C\u548C\u526F\u4E1A\u7684\u601D\u8003\u3002',
    'project-game-title': '\u751F\u547D\u6E38\u620F',
    'project-game-desc': '\u5EB7\u5A01\u751F\u547D\u6E38\u620F\u6A21\u62DF\u3002',
    'tag-1': '\u81EA\u6258\u7BA1',
    'tag-2': '\u65C5\u884C',
    'tag-3': '\u5496\u5561',
    'tag-4': '\u732B',
    'tag-5': '\u97F3\u4E50',
    'tag-6': '\u5A01\u58EB\u5FCC',
    'tag-7': 'Vibe Coding',
    'exp-toggle-more': '\u5C55\u5F00\u66F4\u591A',
    'exp-toggle-less': '\u6536\u8D77',
    'lang-toggle-label': 'EN',
    'skip-link': '跳到主要内容',
    'opens-new-tab': '（在新标签页打开）',
    'theme-label-light': '切换到深色模式',
    'theme-label-dark': '切换到浅色模式',
    'lang-label': '切换语言',
    'back-to-top': '回到顶部',
    'hint-terminal': '打开终端',
    'hint-agent': '打开代码助手',
    'terminal-label': '终端',
    'terminal-log-label': '终端输出',
    'terminal-input-label': '终端输入',
    'agent-label': '代码助手',
    'agent-log-label': '助手消息',
    'agent-close': '关闭代码助手',
    'agent-input-label': '代码助手输入'
  }
};

let currentLang = storage.get('lang', 'en');
if (currentLang !== 'en' && currentLang !== 'zh') currentLang = 'en';

export function getLang() {
  return currentLang;
}

export function t(key) {
  const dict = i18n[currentLang] || i18n.en;
  if (dict[key] !== undefined) return dict[key];
  if (i18n.en[key] !== undefined) return i18n.en[key];
  return key;
}

export function applyLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  const dict = i18n[currentLang];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
  });
  document.documentElement.lang = currentLang;
  storage.set('lang', currentLang);
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
}

export function toggleLang() {
  applyLang(currentLang === 'en' ? 'zh' : 'en');
}
