/*
  Minimalistyczny timer CNC dla 3 maszyn.
  Kluczowa logika: czas liczony z timestampów, a nie z inkrementacji sekund.
*/

const STORAGE_KEY = 'cncTimerStateV1';
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
  editing: {}
};

const machinesRoot = document.getElementById('machines');
const machineTemplate = document.getElementById('machine-template');
const globalMessage = document.getElementById('global-message');

if (refreshStatusesFromTime()) {
  saveState();
}
renderAll();
startUiRefresh();
registerServiceWorker();

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    const changed = refreshStatusesFromTime();
    refreshLivePanels();
    if (changed) {
      saveState();
    }
  }
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
    durationMinutes: 30,
    status: STATUS.READY,
    startTimestamp: null,
    endTimestamp: null,
    completionNotified: false
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

    return parsed.map((machine, index) => ({
      ...createMachine(`m${index + 1}`, `Frezarka ${index + 1}`),
      ...machine
    }));
  } catch {
    return cloneDefaultMachines();
  }
}

function cloneDefaultMachines() {
  return DEFAULT_MACHINES.map((machine) => ({ ...machine }));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.machines));
}

function startUiRefresh() {
  setInterval(() => {
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

    if (now >= machine.endTimestamp) {
      machine.status = STATUS.FINISHED;
      if (!machine.completionNotified) {
        showGlobalMessage(`${machine.machineName}: obróbka zakończona.`);
      }
      machine.completionNotified = true;
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
  const durationInput = fragment.querySelector('.duration-input');
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
  durationInput.value = machine.durationMinutes;

  const isEditing = Boolean(appState.editing[machine.id]);
  machineNameInput.disabled = !isEditing;
  partNameInput.disabled = !isEditing;
  durationInput.disabled = !isEditing;
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
    const durationMinutes = Number(durationInput.value);

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      alert('Podaj poprawny czas obróbki w minutach.');
      return;
    }

    machine.machineName = machineName || machine.machineName;
    machine.partName = partName;
    machine.durationMinutes = Math.round(durationMinutes);
    machine.startTimestamp = Date.now();
    machine.endTimestamp = machine.startTimestamp + machine.durationMinutes * 60 * 1000;
    machine.status = STATUS.RUNNING;
    machine.completionNotified = false;

    appState.editing[machine.id] = false;
    saveState();
    renderAll();
  });

  doneBtn.addEventListener('click', () => {
    machine.status = STATUS.READY;
    machine.startTimestamp = null;
    machine.endTimestamp = null;
    machine.completionNotified = false;
    saveState();
    renderAll();
  });

  editBtn.addEventListener('click', () => {
    if (!isEditing) {
      appState.editing[machine.id] = true;
      renderAll();
      return;
    }

    const durationMinutes = Number(durationInput.value);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      alert('Czas obróbki musi być większy od 0.');
      return;
    }

    machine.machineName = machineNameInput.value.trim() || machine.machineName;
    machine.partName = partNameInput.value.trim();
    machine.durationMinutes = Math.round(durationMinutes);

    if (machine.status === STATUS.RUNNING && machine.startTimestamp) {
      machine.endTimestamp = machine.startTimestamp + machine.durationMinutes * 60 * 1000;
      if (Date.now() >= machine.endTimestamp) {
        machine.status = STATUS.FINISHED;
        showGlobalMessage(`${machine.machineName}: obróbka zakończona.`);
        machine.completionNotified = true;
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
    saveState();
    renderAll();
  });

  machineNameInput.addEventListener('keydown', stopSubmitBehavior);
  partNameInput.addEventListener('keydown', stopSubmitBehavior);
  durationInput.addEventListener('keydown', stopSubmitBehavior);

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
      remainingLabel: formatMsToMinSec(remainingMs),
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

function formatMsToMinSec(milliseconds) {
  const totalSec = Math.ceil(milliseconds / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
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
