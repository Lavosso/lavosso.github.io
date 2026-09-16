/*
  Minimalistyczny timer CNC dla 3 maszyn.
  Kluczowa logika: czas liczony z timestampów, a nie z inkrementacji sekund.
*/

const STORAGE_KEY = 'cncTimerStateV1';
const NOTIFICATION_STORAGE_KEY = 'cncTimerNotificationsV1';
const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug');
const DEBUG_STORAGE_KEY = 'cncTimerDebugV1';

function debugState() {
    try {
        return JSON.parse(localStorage.getItem(DEBUG_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveDebugState(patch) {
    const current = debugState();

    localStorage.setItem(
        DEBUG_STORAGE_KEY,
        JSON.stringify({
            ...current,
            ...patch,
        })
    );
}

function updateDebugPanel() {
    if (!DEBUG_MODE) {
        return;
    }

    let panel = document.getElementById('cnc-debug-panel');

    if (!panel) {
        panel = document.createElement('pre');
        panel.id = 'cnc-debug-panel';

        Object.assign(panel.style, {
            position: 'fixed',
            left: '8px',
            right: '8px',
            bottom: '8px',
            zIndex: '99999',
            margin: '0',
            padding: '10px',
            borderRadius: '8px',
            background: '#111',
            color: '#fff',
            font: '12px monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: '220px',
            overflow: 'auto',
        });

        document.body.appendChild(panel);
    }

    const state = debugState();
    const now = Date.now();

    panel.textContent = [
        'CNC TIMER DEBUG',
        `Now: ${new Date(now).toLocaleTimeString()}`,
        `Last JS tick: ${state.lastTick ? new Date(state.lastTick).toLocaleTimeString() : '—'}`,
        `Last visibility: ${state.lastVisibility || '—'}`,
        `Tick count: ${state.tickCount || 0}`,
        `Last gap: ${state.lastGapMs != null ? `${state.lastGapMs} ms` : '—'}`,
        `Document hidden: ${document.hidden}`,
    ].join('\n');
}

function debugTick() {
    const now = Date.now();
    const state = debugState();

    const gap = state.lastTick ? now - state.lastTick : 0;

    saveDebugState({
        lastTick: now,
        lastGapMs: gap,
        lastVisibility: document.visibilityState,
        tickCount: (state.tickCount || 0) + 1,
    });

    updateDebugPanel();
}
const STATUS = {
  READY: 'GOTOWA',
  RUNNING: 'PRACUJE',
  FINISHED: 'ZAKOŃCZONA'
};

const DEFAULT_MACHINES = [
  createMachine('m1', 'Frezarka 1'),
  createMachine('m2', 'Frezarka 2'),
  createMachine('m3', 'Frezarka 3')
];

const appState = {
  machines: loadState(),
  editing: {},
  notifications: loadNotificationSettings()
};

const machinesRoot = document.getElementById('machines');
const machineTemplate = document.getElementById('machine-template');
const globalMessage = document.getElementById('global-message');
const notificationsToggle = document.getElementById('notifications-toggle');

if (refreshStatusesFromTime()) {
  saveState();
}
syncNotificationStateFromPermission();
renderAll();
updateNotificationsToggleUi();
setupNotificationToggle();
startUiRefresh();
registerServiceWorker();

document.addEventListener('visibilitychange', () => {
    saveDebugState({
        visibilityEvent: Date.now(),
        lastVisibility: document.visibilityState,
    });

    updateDebugPanel();
  if (!document.hidden) {
    const changed = refreshStatusesFromTime();
    refreshLivePanels();
    if (changed) {
      saveState();
    }
  }
});
window.addEventListener('pagehide', () => {
    saveDebugState({
        pagehide: Date.now(),
    });
});

window.addEventListener('pageshow', () => {
    saveDebugState({
        pageshow: Date.now(),
    });

    updateDebugPanel();
});

window.addEventListener('freeze', () => {
    saveDebugState({
        freeze: Date.now(),
    });

    updateDebugPanel();
});

window.addEventListener('resume', () => {
    saveDebugState({
        resume: Date.now(),
    });

    updateDebugPanel();
});
window.addEventListener('focus', () => {
  const changed = refreshStatusesFromTime();
  refreshLivePanels();
  if (changed) {
    saveState();
  }
});

function createMachine(id, machineName) {
  return {
    id,
    machineName,
    partName: '',
    durationSeconds: 30 * 60,
    durationMinutes: 30,
    status: STATUS.READY,
    startTimestamp: null,
    endTimestamp: null,
    completionNotified: false,
    warningNotified: false,
    notificationCycleId: null
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneDefaultMachines();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 3) {
      return cloneDefaultMachines();
    }

    return parsed.map((machine, index) => normalizeMachine(machine, index));
  } catch {
    return cloneDefaultMachines();
  }
}

function normalizeMachine(machine, index) {
  const normalized = {
    ...createMachine(`m${index + 1}`, `Frezarka ${index + 1}`),
    ...machine
  };

  const durationSecondsFromState = Number(machine?.durationSeconds);
  const durationMinutesFromState = Number(machine?.durationMinutes);

  if (Number.isFinite(durationSecondsFromState) && durationSecondsFromState > 0) {
    normalized.durationSeconds = Math.round(durationSecondsFromState);
  } else if (Number.isFinite(durationMinutesFromState) && durationMinutesFromState > 0) {
    normalized.durationSeconds = Math.round(durationMinutesFromState * 60);
  } else {
    normalized.durationSeconds = 30 * 60;
  }

  normalized.durationMinutes = Math.floor(normalized.durationSeconds / 60);
  normalized.completionNotified = Boolean(normalized.completionNotified);
  normalized.warningNotified = Boolean(normalized.warningNotified);
  normalized.notificationCycleId = normalized.notificationCycleId || null;

  return normalized;
}

function cloneDefaultMachines() {
  return DEFAULT_MACHINES.map((machine) => ({ ...machine }));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.machines));
}

function loadNotificationSettings() {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) {
      return { enabled: false };
    }

    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed?.enabled)
    };
  } catch {
    return { enabled: false };
  }
}

function syncNotificationStateFromPermission() {
  if (!('Notification' in window)) {
    appState.notifications.enabled = false;
    saveNotificationSettings();
    return;
  }

  if (Notification.permission !== 'granted' && appState.notifications.enabled) {
    appState.notifications.enabled = false;
    saveNotificationSettings();
  }
}

function saveNotificationSettings() {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(appState.notifications));
}

function setupNotificationToggle() {
  if (!notificationsToggle) {
    return;
  }

  notificationsToggle.addEventListener('click', async () => {
    if (appState.notifications.enabled) {
      appState.notifications.enabled = false;
      saveNotificationSettings();
      updateNotificationsToggleUi();
      showGlobalMessage('Powiadomienia wyłączone.');
      return;
    }

    if (!('Notification' in window)) {
      showGlobalMessage('Ta przeglądarka nie obsługuje powiadomień.');
      return;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      appState.notifications.enabled = false;
      saveNotificationSettings();
      updateNotificationsToggleUi();
      showGlobalMessage('Brak zgody na powiadomienia.');
      return;
    }

    appState.notifications.enabled = true;
    saveNotificationSettings();
    updateNotificationsToggleUi();
    showGlobalMessage('Powiadomienia włączone.');
  });
}

function updateNotificationsToggleUi() {
  if (!notificationsToggle) {
    return;
  }

  const enabled = appState.notifications.enabled;
  notificationsToggle.textContent = `Powiadomienia: ${enabled ? 'ON' : 'OFF'}`;
  notificationsToggle.setAttribute('aria-pressed', String(enabled));
}

function startUiRefresh() {
    setInterval(() => {
        debugTick();

        const changed = refreshStatusesFromTime();
        refreshLivePanels();

        if (changed) {
            saveState();
        }
    }, 1000);
}

function refreshStatusesFromTime() {
  let changed = false;
  const now = Date.now();

  appState.machines.forEach((machine) => {
    if (machine.status !== STATUS.RUNNING || !machine.endTimestamp) {
      return;
    }

    if (maybeNotifyWarning(machine, now)) {
      changed = true;
    }

    if (now >= machine.endTimestamp) {
      const shouldNotifyCompletion = !machine.completionNotified;
      machine.status = STATUS.FINISHED;
      if (shouldNotifyCompletion) {
        showGlobalMessage(`${machine.machineName}: obróbka zakończona.`);
      }
      machine.completionNotified = true;
      machine.warningNotified = true;
      if (shouldNotifyCompletion) {
        maybeNotifyCompletion(machine);
      }
      changed = true;
    }
  });

  return changed;
}

function renderAll() {
  machinesRoot.innerHTML = '';
  appState.machines.forEach((machine) => {
    machinesRoot.appendChild(renderMachine(machine));
  });
}

function renderMachine(machine) {
  const fragment = machineTemplate.content.cloneNode(true);
  const card = fragment.querySelector('.machine-card');
  const nameDisplay = fragment.querySelector('.machine-name-display');
  const statusBadge = fragment.querySelector('.status-badge');
  const machineNameInput = fragment.querySelector('.machine-name-input');
  const partNameInput = fragment.querySelector('.part-name-input');
  const durationMinutesInput = fragment.querySelector('.duration-minutes-input');
  const durationSecondsInput = fragment.querySelector('.duration-seconds-input');
  const remainingTimeEl = fragment.querySelector('.remaining-time');
  const etaEl = fragment.querySelector('.eta');
  const percentEl = fragment.querySelector('.percentage');
  const progressBar = fragment.querySelector('.progress-bar');
  const finishMessage = fragment.querySelector('.finish-message');
  const startBtn = fragment.querySelector('.start-btn');
  const doneBtn = fragment.querySelector('.done-btn');
  const editBtn = fragment.querySelector('.edit-btn');
  const resetBtn = fragment.querySelector('.reset-btn');

  card.dataset.machineId = machine.id;
  nameDisplay.textContent = machine.machineName;
  machineNameInput.value = machine.machineName;
  partNameInput.value = machine.partName;

  const durationParts = splitDuration(machine.durationSeconds);
  durationMinutesInput.value = durationParts.minutes;
  durationSecondsInput.value = durationParts.seconds;

  const isEditing = Boolean(appState.editing[machine.id]);
  machineNameInput.disabled = !isEditing;
  partNameInput.disabled = !isEditing;
  durationMinutesInput.disabled = !isEditing;
  durationSecondsInput.disabled = !isEditing;
  editBtn.textContent = isEditing ? 'ZAPISZ' : 'EDYTUJ';

  paintStatus(card, statusBadge, machine.status);

  const timing = getTiming(machine);
  remainingTimeEl.textContent = timing.remainingLabel;
  etaEl.textContent = `Koniec: ${timing.endLabel}`;
  percentEl.textContent = `${timing.percent}%`;
  progressBar.style.width = `${timing.percent}%`;

  const isFinished = machine.status === STATUS.FINISHED;
  finishMessage.hidden = !isFinished;

  doneBtn.disabled = machine.status !== STATUS.RUNNING;

  startBtn.addEventListener('click', () => {
    const machineName = machineNameInput.value.trim();
    const partName = partNameInput.value.trim();
    const durationData = parseDuration(durationMinutesInput.value, durationSecondsInput.value);

    if (!durationData.ok) {
      alert(durationData.error);
      return;
    }

    machine.machineName = machineName || machine.machineName;
    machine.partName = partName;
    machine.durationSeconds = durationData.totalSeconds;
    machine.durationMinutes = Math.floor(durationData.totalSeconds / 60);
    machine.startTimestamp = Date.now();
    machine.endTimestamp = machine.startTimestamp + machine.durationSeconds * 1000;
    machine.status = STATUS.RUNNING;
    machine.completionNotified = false;
    machine.warningNotified = false;
    machine.notificationCycleId = createCycleId(machine);

    appState.editing[machine.id] = false;
    saveState();
    renderAll();
  });

  doneBtn.addEventListener('click', () => {
    machine.status = STATUS.READY;
    machine.startTimestamp = null;
    machine.endTimestamp = null;
    machine.completionNotified = false;
    machine.warningNotified = false;
    machine.notificationCycleId = null;
    saveState();
    renderAll();
  });

  editBtn.addEventListener('click', () => {
    if (!isEditing) {
      appState.editing[machine.id] = true;
      renderAll();
      return;
    }

    const durationData = parseDuration(durationMinutesInput.value, durationSecondsInput.value);
    if (!durationData.ok) {
      alert(durationData.error);
      return;
    }

    machine.machineName = machineNameInput.value.trim() || machine.machineName;
    machine.partName = partNameInput.value.trim();
    machine.durationSeconds = durationData.totalSeconds;
    machine.durationMinutes = Math.floor(durationData.totalSeconds / 60);

    if (machine.status === STATUS.RUNNING && machine.startTimestamp) {
      machine.endTimestamp = machine.startTimestamp + machine.durationSeconds * 1000;
      if (Date.now() >= machine.endTimestamp) {
        const shouldNotifyCompletion = !machine.completionNotified;
        machine.status = STATUS.FINISHED;
        if (shouldNotifyCompletion) {
          showGlobalMessage(`${machine.machineName}: obróbka zakończona.`);
        }
        machine.completionNotified = true;
        machine.warningNotified = true;
        if (shouldNotifyCompletion) {
          maybeNotifyCompletion(machine);
        }
      } else {
        machine.completionNotified = false;
        machine.warningNotified = false;
        machine.notificationCycleId = createCycleId(machine);
      }
    }

    appState.editing[machine.id] = false;
    saveState();
    renderAll();
  });

  resetBtn.addEventListener('click', () => {
    machine.status = STATUS.READY;
    machine.startTimestamp = null;
    machine.endTimestamp = null;
    machine.completionNotified = false;
    machine.warningNotified = false;
    machine.notificationCycleId = null;
    saveState();
    renderAll();
  });

  machineNameInput.addEventListener('keydown', stopSubmitBehavior);
  partNameInput.addEventListener('keydown', stopSubmitBehavior);
  durationMinutesInput.addEventListener('keydown', stopSubmitBehavior);
  durationSecondsInput.addEventListener('keydown', stopSubmitBehavior);

  return fragment;
}

function refreshLivePanels() {
  appState.machines.forEach((machine) => {
    const card = machinesRoot.querySelector(`[data-machine-id="${machine.id}"]`);
    if (!card) {
      return;
    }

    const statusBadge = card.querySelector('.status-badge');
    const remainingTimeEl = card.querySelector('.remaining-time');
    const etaEl = card.querySelector('.eta');
    const percentEl = card.querySelector('.percentage');
    const progressBar = card.querySelector('.progress-bar');
    const finishMessage = card.querySelector('.finish-message');
    const doneBtn = card.querySelector('.done-btn');

    if (!statusBadge || !remainingTimeEl || !etaEl || !percentEl || !progressBar || !finishMessage || !doneBtn) {
      return;
    }

    paintStatus(card, statusBadge, machine.status);

    const timing = getTiming(machine);
    remainingTimeEl.textContent = timing.remainingLabel;
    etaEl.textContent = `Koniec: ${timing.endLabel}`;
    percentEl.textContent = `${timing.percent}%`;
    progressBar.style.width = `${timing.percent}%`;

    finishMessage.hidden = machine.status !== STATUS.FINISHED;
    doneBtn.disabled = machine.status !== STATUS.RUNNING;
  });
}

function getTiming(machine) {
  if (machine.status === STATUS.RUNNING && machine.startTimestamp && machine.endTimestamp) {
    const now = Date.now();
    const totalMs = Math.max(machine.endTimestamp - machine.startTimestamp, 1);
    const remainingMs = Math.max(machine.endTimestamp - now, 0);
    const completedRatio = Math.min(1, (totalMs - remainingMs) / totalMs);

    return {
      remainingLabel: formatRemainingTime(remainingMs),
      endLabel: formatClock(machine.endTimestamp),
      percent: Math.round(completedRatio * 100)
    };
  }

  if (machine.status === STATUS.FINISHED) {
    return {
      remainingLabel: '00:00',
      endLabel: machine.endTimestamp ? formatClock(machine.endTimestamp) : '--:--',
      percent: 100
    };
  }

  return {
    remainingLabel: '00:00',
    endLabel: '--:--',
    percent: 0
  };
}

function paintStatus(card, badge, status) {
  badge.textContent = status;
  badge.className = 'status-badge';
  card.classList.remove('running', 'finished');

  if (status === STATUS.RUNNING) {
    badge.classList.add('status-running');
    card.classList.add('running');
    return;
  }

  if (status === STATUS.FINISHED) {
    badge.classList.add('status-finished');
    card.classList.add('finished');
    return;
  }

  badge.classList.add('status-ready');
}

function parseDuration(minutesRaw, secondsRaw) {
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw);

  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 1440) {
    return { ok: false, error: 'Podaj poprawne minuty (0-1440).' };
  }

  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 59) {
    return { ok: false, error: 'Sekundy muszą mieć wartość od 0 do 59.' };
  }

  const normalizedMinutes = Math.floor(minutes);
  const normalizedSeconds = Math.floor(seconds);
  const totalSeconds = normalizedMinutes * 60 + normalizedSeconds;

  if (totalSeconds <= 0) {
    return { ok: false, error: 'Czas obróbki musi być większy od 0.' };
  }

  return { ok: true, totalSeconds };
}

function splitDuration(totalSeconds) {
  const safeTotal = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const minutes = Math.floor(safeTotal / 60);
  const seconds = safeTotal % 60;

  return {
    minutes,
    seconds
  };
}

function formatRemainingTime(milliseconds) {
  const totalSec = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatClock(timestamp) {
  const d = new Date(timestamp);
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}

function stopSubmitBehavior(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
}

function showGlobalMessage(message) {
  if (!globalMessage) {
    return;
  }

  globalMessage.textContent = message;
  globalMessage.hidden = false;

  window.setTimeout(() => {
    globalMessage.hidden = true;
  }, 4500);
}

function createCycleId(machine) {
  return `${machine.id}-${machine.startTimestamp}-${machine.endTimestamp}`;
}

function maybeNotifyWarning(machine, now) {
  if (!appState.notifications.enabled || machine.warningNotified || !machine.endTimestamp) {
    return false;
  }

  const remainingMs = machine.endTimestamp - now;
  if (remainingMs > 120000 || remainingMs <= 0) {
    return false;
  }

  machine.warningNotified = true;
  void showSystemNotification(
    `${machine.machineName}: 2 minuty do końca`,
    'Zbliża się zakończenie obróbki.',
    `${machine.notificationCycleId || machine.id}-warning`
  );
  return true;
}

function maybeNotifyCompletion(machine) {
  if (!appState.notifications.enabled) {
    return;
  }

  void showSystemNotification(
    'Cykl zakończony',
    `${machine.machineName} zakończyła obróbkę`,
    `${machine.notificationCycleId || machine.id}-done`
  );
}

async function showSystemNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        tag,
        renotify: false,
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png'
      });
      return;
    }

    new Notification(title, { body, tag });
  } catch (error) {
    console.error('Błąd powiadomienia:', error);
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register('./service-worker.js');
  } catch (error) {
    console.error('Błąd rejestracji Service Workera:', error);
  }
}
