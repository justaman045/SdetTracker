export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getDaysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.floor(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export function calcStreak(logs) {
  if (!logs || logs.length === 0) return 0;
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = getTodayString();
  let streak = 0;
  let current = today;

  for (const log of sorted) {
    if (log.date === current) {
      streak++;
      const d = new Date(current);
      d.setDate(d.getDate() - 1);
      current = d.toISOString().split('T')[0];
    } else if (log.date < current) {
      break;
    }
  }
  return streak;
}

export function calcLongestStreak(logs) {
  if (!logs || logs.length === 0) return 0;
  const dates = [...new Set(logs.map((l) => l.date))].sort();
  let max = 0;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 1;
    }
  }
  return Math.max(max, dates.length > 0 ? 1 : 0);
}

export function parseMarkdown(md) {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // HR
  html = html.replace(/^---$/gm, '<hr/>');
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  // Paragraphs
  const lines = html.split('\n');
  const result = [];
  let inBlock = false;
  for (const line of lines) {
    if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<pre') || line.startsWith('<hr')) {
      inBlock = false;
      result.push(line);
    } else if (line.trim() === '') {
      inBlock = false;
      result.push('');
    } else {
      if (!inBlock) result.push(`<p>${line}</p>`);
      else result[result.length - 1] = result[result.length - 1].replace(/<\/p>$/, ` ${line}</p>`);
      inBlock = true;
    }
  }
  return result.join('\n');
}

export function getMotivationalMessage(percent) {
  if (percent === 0) return "Every expert was once a beginner. Let's start! 🚀";
  if (percent < 10) return "You've taken the first step. Keep the momentum going!";
  if (percent < 25) return "Great start! Consistency is the key to mastery.";
  if (percent < 50) return "You're building solid foundations. Keep pushing!";
  if (percent < 75) return "Halfway through! You're becoming a seriously strong SDET.";
  if (percent < 90) return "Almost there! You're in the top tier of candidates.";
  if (percent < 100) return "Final stretch! Employers will be impressed.";
  return "Complete! You're fully interview-ready. Go land that role! 🎉";
}
