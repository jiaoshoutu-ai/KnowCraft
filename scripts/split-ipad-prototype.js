/**
 * Split prototypes/ipad.html into standalone page files using cheerio
 *
 * Each output file contains:
 * - Complete <head> with all styles and global scripts
 * - <body> containing only the specific page node
 *
 * Output: ./prototype-fragments-ipad/
 *   - home-screen.html
 *   - login.html
 *   - topic-library.html
 *   - topic-detail.html
 *   - vote.html
 *   - debate.html
 *   - feedback.html
 *   - profile.html
 *   - manifest.json
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'prototypes', 'ipad.html');
const OUT = path.join(ROOT, 'prototype-fragments-ipad');

console.log('📖 Reading source:', SRC);
const html = fs.readFileSync(SRC, 'utf-8');

// Parse with cheerio
const $ = cheerio.load(html, { decodeEntities: false });

// Extract <head> content
const headContent = $('head').html();
console.log('✓ Extracted <head> content');

// Find all screen nodes (pages)
const screens = [];
$('.screen').each((i, elem) => {
  const $elem = $(elem);
  const id = $elem.attr('id');
  if (!id) {
    console.warn('⚠️  Screen without id found, skipping');
    return;
  }

  // Get the outer HTML of this screen node
  const screenHtml = $.html(elem);

  screens.push({
    id,
    html: screenHtml,
    hasActiveClass: $elem.hasClass('active')
  });
});

console.log(`✓ Found ${screens.length} screens:`, screens.map(s => s.id).join(', '));

// Create output directory
fs.mkdirSync(OUT, { recursive: true });

// Generate HTML files for each screen
const manifest = {
  generated: new Date().toISOString(),
  source: 'prototypes/ipad.html',
  pages: []
};

for (const screen of screens) {
  // Force .active on each screen so it's visible in standalone mode
  const activeHtml = screen.html.replace(
    /class="screen(.*?)"/,
    'class="screen active$1"'
  );

  const outputHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
${headContent}
</head>
<body>
  <div class="ipad-frame">
    <div class="screen-container">
${activeHtml}
    </div>
  </div>

<script>
  // Navigate to another page fragment
  function showScreen(screenId) {
    window.location.href = screenId + '.html';
  }

  // Page-specific interaction functions
  function selectVote(element) {
    document.querySelectorAll('.vote-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    element.classList.add('selected');
  }

  function selectTopic(element, topicId) {
    document.querySelectorAll('.debate-topic-card').forEach(card => {
      if (card !== element) {
        card.style.borderColor = '#E9ECEF';
        const radio = card.querySelector('.topic-radio');
        const stances = card.querySelector('.stance-options');
        if (radio) { radio.style.background = 'transparent'; radio.style.borderColor = '#D5D8DC'; }
        if (stances) stances.style.display = 'none';
      }
    });
    element.style.borderColor = '#6C5CE7';
    const radio = element.querySelector('.topic-radio');
    if (radio) { radio.style.background = '#6C5CE7'; radio.style.borderColor = '#6C5CE7'; }
    const stances = element.querySelector('.stance-options');
    if (stances) stances.style.display = 'block';
  }

  function selectStance(element) {
    const parent = element.closest('.debate-topic-card');
    if (parent) {
      parent.querySelectorAll('.stance-card').forEach(card => {
        card.style.transform = 'scale(1)';
        card.style.boxShadow = 'none';
      });
    }
    element.style.transform = 'scale(1.03)';
    element.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    var diffSection = document.getElementById('difficulty-section');
    if (diffSection) diffSection.style.display = 'block';
  }

  function selectAngle(element) {
    document.querySelectorAll('.angle-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
  }

  function selectDifficultyCard(element) {
    document.querySelectorAll('.difficulty-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
  }

  function toggleDifficultyDetail(btn) {
    var card = btn.closest('.difficulty-card');
    var details = card.querySelector('.difficulty-details');
    var isExpanded = details.classList.contains('expanded');
    document.querySelectorAll('.difficulty-details').forEach(d => d.classList.remove('expanded'));
    document.querySelectorAll('.difficulty-expand-btn').forEach(b => b.textContent = '详情');
    if (!isExpanded) { details.classList.add('expanded'); btn.textContent = '收起'; }
  }

  var isVoiceMode = false;
  function toggleInputMode() {
    isVoiceMode = !isVoiceMode;
    var textMode = document.querySelector('.text-input-mode');
    var voiceMode = document.querySelector('.voice-input-mode');
    var toggleIcon = document.querySelector('.mode-icon');
    if (isVoiceMode) {
      textMode && textMode.classList.add('hidden');
      voiceMode && voiceMode.classList.add('active');
      if (toggleIcon) toggleIcon.textContent = '⌨️';
    } else {
      textMode && textMode.classList.remove('hidden');
      voiceMode && voiceMode.classList.remove('active');
      if (toggleIcon) toggleIcon.textContent = '🎤';
    }
  }

  function startRecording() {
    var voiceBtn = document.querySelector('.voice-btn');
    if (voiceBtn) { voiceBtn.classList.add('recording'); voiceBtn.innerHTML = '<span>🎤</span><span>松开结束录音</span>'; }
  }

  function stopRecording() {
    var voiceBtn = document.querySelector('.voice-btn');
    if (voiceBtn) { voiceBtn.classList.remove('recording'); voiceBtn.innerHTML = '<span>🎤</span><span>按住说话</span>'; }
  }

  function toggleDebateTopic() {
    var card = document.getElementById('debateTopicCard');
    if (card) card.classList.toggle('expanded');
  }

  function toggleStancePopup() {
    var popup = document.getElementById('stancePopup');
    if (popup) popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
  }
</script>
</body>
</html>
`;

  const filename = `${screen.id}.html`;
  const filepath = path.join(OUT, filename);
  fs.writeFileSync(filepath, outputHtml, 'utf-8');

  manifest.pages.push({
    id: screen.id,
    file: filename,
    isDefaultActive: screen.hasActiveClass
  });

  console.log(`  ✓ ${filename}`);
}

// Write manifest
fs.writeFileSync(
  path.join(OUT, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf-8'
);

console.log('\n✅ Done! Generated files in:', OUT);
console.log(`   Pages: ${screens.length}`);
console.log(`   Manifest: manifest.json`);
