const STORAGE_KEY = 'mood_entries_v1';

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function upsertToday(mood, note) {
  const date = todayISO();
  const entries = loadEntries();
  const idx = entries.findIndex(e => e.date === date);
  if (idx >= 0) {
    entries[idx].mood = mood;
    entries[idx].note = note;
  } else {
    entries.push({ date, mood, note });
  }
  saveEntries(entries);
  render();
  feedback(`Entrée du ${date} enregistrée.`);
}

function deleteEntry(date) {
  let entries = loadEntries();
  entries = entries.filter(e => e.date !== date);
  saveEntries(entries);
  render();
  feedback(`Entrée ${date} supprimée.`);
}

function clearToday() {
  const d = todayISO();
  deleteEntry(d);
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function feedback(msg) {
  const el = document.getElementById('feedback');
  el.textContent = msg;
  if (!msg) return;
  setTimeout(() => {
    if (el.textContent === msg) el.textContent = '';
  }, 2500);
}

function computeStats(entries) {
  const count = entries.length;
  const moodsFreq = {};
  let positiveCount = 0;
  
  for (const e of entries) {
    moodsFreq[e.mood] = (moodsFreq[e.mood] || 0) + 1;
    // Count positive moods (Très bien and Bien)
    if (e.mood === 'Très bien' || e.mood === 'Bien') {
      positiveCount++;
    }
  }
  
  let mostMood = null;
  let max = 0;
  for (const [m, v] of Object.entries(moodsFreq)) {
    if (v > max) { max = v; mostMood = m; }
  }

  // Streak (jours consécutifs) basé sur dates existantes
  const set = new Set(entries.map(e => e.date));
  let streak = 0;
  let cursor = new Date();
  for (;;) {
    const iso = cursor.toISOString().slice(0, 10);
    if (set.has(iso)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }

  const positivePercentage = count > 0 ? Math.round((positiveCount / count) * 100) : 0;

  return {
    count,
    mostMood,
    streak,
    positivePercentage
  };
}

function render() {
  const filterValue = document.getElementById('filter-select').value;
  const entries = loadEntries().sort((a, b) => b.date.localeCompare(a.date));
  const list = document.getElementById('entries-list');
  list.innerHTML = '';

  for (const e of entries) {
    if (filterValue !== 'all' && e.mood !== filterValue) continue;
    const li = document.createElement('li');
    li.className = 'entry';
    li.innerHTML = `
      <div class="entry-header">
        <span>${e.date}</span>
        <span class="mood-tag">${e.mood}</span>
      </div>
      <div class="note">${e.note ? escapeHtml(e.note) : '<em class="empty">Pas de note</em>'}</div>
      <div class="actions-row">
        <button data-edit="${e.date}" class="secondary">Modifier</button>
        <button data-delete="${e.date}" class="danger">Supprimer</button>
      </div>
    `;
    list.appendChild(li);
  }

  updateStats(entries);
  syncTodayButtonVisibility(entries);
  drawMoodChart(entries);
}

function syncTodayButtonVisibility(entries) {
  const today = todayISO();
  const hasToday = entries.some(e => e.date === today);
  const clearBtn = document.getElementById('clear-today');
  clearBtn.disabled = !hasToday;
}

function updateStats(entries) {
  const stats = computeStats(entries);
  const daysCount = document.getElementById('days-count');
  const mostFreq = document.getElementById('most-frequent');
  const positivePerc = document.getElementById('positive-percentage');
  const streakEl = document.getElementById('streak');

  daysCount.textContent = `${stats.count} jour${stats.count > 1 ? 's' : ''} suivi${stats.count > 1 ? 's' : ''}`;
  mostFreq.textContent = `Humeur la plus fréquente : ${stats.mostMood || '—'}`;
  positivePerc.textContent = `Humeurs positives : ${stats.count > 0 ? stats.positivePercentage + '%' : '—'}`;
  streakEl.textContent = `Série actuelle : ${stats.streak}`;
}

function populateFormFor(date) {
  const entries = loadEntries();
  const found = entries.find(e => e.date === date);
  if (!found) return;
  document.getElementById('mood-select').value = found.mood;
  document.getElementById('note').value = found.note;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  feedback(`Modification de l'entrée du ${date} (enregistre pour mettre à jour).`);
}

function drawMoodChart(entries) {
  const canvas = document.getElementById('mood-chart');
  const ctx = canvas.getContext('2d');
  const emptyMessage = document.getElementById('chart-empty');
  
  if (entries.length < 2) {
    canvas.style.display = 'none';
    emptyMessage.style.display = 'block';
    return;
  }
  
  canvas.style.display = 'block';
  emptyMessage.style.display = 'none';
  
  // Set up canvas dimensions
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Sort entries by date
  const sortedEntries = entries.slice().sort((a, b) => a.date.localeCompare(b.date));
  
  // Mood values for chart
  const moodValues = {
    'Très bien': 5,
    'Bien': 4,
    'Moyen': 3,
    'Fatigué': 2,
    'Stressé': 1
  };
  
  const moodColors = {
    'Très bien': '#4CAF50',
    'Bien': '#8BC34A',
    'Moyen': '#FFC107',
    'Fatigué': '#FF9800',
    'Stressé': '#F44336'
  };
  
  // Draw grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    const y = padding + (graphHeight * (5 - i)) / 4;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  // Draw mood labels
  const moodLabels = ['Stressé', 'Fatigué', 'Moyen', 'Bien', 'Très bien'];
  ctx.fillStyle = '#666';
  ctx.font = '10px system-ui';
  ctx.textAlign = 'right';
  moodLabels.forEach((label, i) => {
    const y = padding + (graphHeight * i) / 4 + 3;
    ctx.fillText(label, padding - 5, y);
  });
  
  // Draw chart line
  if (sortedEntries.length > 1) {
    ctx.strokeStyle = '#2d6cdf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    sortedEntries.forEach((entry, i) => {
      const x = padding + (graphWidth * i) / (sortedEntries.length - 1);
      const moodValue = moodValues[entry.mood];
      const y = padding + graphHeight - (graphHeight * (moodValue - 1)) / 4;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw mood points
    sortedEntries.forEach((entry, i) => {
      const x = padding + (graphWidth * i) / (sortedEntries.length - 1);
      const moodValue = moodValues[entry.mood];
      const y = padding + graphHeight - (graphHeight * (moodValue - 1)) / 4;
      
      ctx.fillStyle = moodColors[entry.mood];
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
}

function exportJSON() {
  const entries = loadEntries().sort((a,b) => a.date.localeCompare(b.date));
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = todayISO();
  a.href = url;
  a.download = `mood-entries-${today}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV() {
  const entries = loadEntries().sort((a,b) => a.date.localeCompare(b.date));
  let csv = 'Date,Humeur,Note\n';
  
  for (const entry of entries) {
    const note = entry.note.replace(/"/g, '""'); // Escape quotes
    csv += `"${entry.date}","${entry.mood}","${note}"\n`;
  }
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = todayISO();
  a.href = url;
  a.download = `mood-entries-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('mood-form').addEventListener('submit', e => {
  e.preventDefault();
  const mood = document.getElementById('mood-select').value;
  if (!mood) return feedback('Choisis une humeur.');
  const note = document.getElementById('note').value.trim();
  upsertToday(mood, note);
});

document.getElementById('clear-today').addEventListener('click', () => {
  const d = todayISO();
  if (confirm(`Supprimer l'entrée du ${d} ?`)) {
    clearToday();
  }
});

document.getElementById('entries-list').addEventListener('click', e => {
  const t = e.target;
  if (t.matches('[data-delete]')) {
    const date = t.getAttribute('data-delete');
    if (confirm(`Supprimer l'entrée du ${date} ?`)) {
      deleteEntry(date);
    }
  }
  if (t.matches('[data-edit]')) {
    const date = t.getAttribute('data-edit');
    populateFormFor(date);
  }
});

document.getElementById('filter-select').addEventListener('change', () => render());
document.getElementById('export-json').addEventListener('click', exportJSON);
document.getElementById('export-csv').addEventListener('click', exportCSV);

// Redraw chart on window resize
window.addEventListener('resize', () => {
  const entries = loadEntries();
  drawMoodChart(entries);
});

render();