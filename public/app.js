const socket = io('ws://localhost:3000');
const startBtn = document.getElementById('start');
const btnText = document.getElementById('btn-text');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');
const chatLog = document.getElementById('chat-log');

let isCallActive = false;

// UI Tab Navigation & Interaction Logic
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const consoleBody = document.getElementById('console-body');
const clearLogsBtn = document.getElementById('clear-logs-btn');

function addConsoleLog(message, type = 'info') {
  if (!consoleBody) return;
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  const now = new Date();
  const timeStr = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
  entry.innerHTML = `<span class="time">${timeStr}</span> ${message}`;
  consoleBody.appendChild(entry);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

// Tab Switching
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const tabName = item.getAttribute('data-tab');

    navItems.forEach(nav => nav.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));

    item.classList.add('active');
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
      targetTab.classList.add('active');
    }
  });
});

// Sidebar Toggle
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
}

// Clear Logs
if (clearLogsBtn && consoleBody) {
  clearLogsBtn.addEventListener('click', () => {
    consoleBody.innerHTML = '';
    addConsoleLog('Logs cleared by user.', 'info');
  });
}

// Helpers for Chat & Status
function appendBubble(text, sender) {
  const container = document.createElement('div');
  container.className = `bubble-container ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerText = text;
  
  const time = document.createElement('div');
  time.className = 'timestamp';
  const now = new Date();
  time.innerText = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  container.appendChild(bubble);
  container.appendChild(time);
  
  chatLog.appendChild(container);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function setStatus(text, dotClass = '') {
  if (statusText) statusText.innerText = text;
  if (statusDot) {
    statusDot.className = 'status-dot';
    if (dotClass) {
      statusDot.classList.add(dotClass);
    }
  }
}

function setBtnState(text, disabled) {
  if (btnText) btnText.innerText = text;
  if (startBtn) startBtn.disabled = disabled;
}

// Socket Events & Console Logging Integration
socket.on('connect', () => {
  console.log('Connected to WebSocket server', socket.id);
  setStatus('Online');
  setBtnState('Start Call', false);
  addConsoleLog(`Connected to WebSocket server ID: ${socket.id}`, 'success');
});

socket.on('disconnect', () => {
  setStatus('Offline', 'recording'); // red dot
  setBtnState('Disconnected', true);
  addConsoleLog('Disconnected from WebSocket server', 'info');
});

// Received transcription of what the user said
socket.on('user-text', text => {
  appendBubble(text, 'user');
  addConsoleLog(`User STT Transcribed: "${text}"`, 'info');
});

// Received AI's text response
socket.on('ai-text', text => {
  appendBubble(text, 'ai');
  addConsoleLog(`AI Response: "${text}"`, 'success');
});

// Received AI's audio response
socket.on('audio-echo', data => {
  setStatus('Speaking', 'speaking');
  addConsoleLog(`Received audio payload buffer (${data.byteLength || data.length} bytes), playing output...`, 'debug');
  
  const blob = new Blob([data], { type: 'audio/mpeg' });
  const audio = new Audio(URL.createObjectURL(blob));
  
  audio.onended = () => {
    setStatus('Online');
    setBtnState('Start Call', false);
    isCallActive = false;
    addConsoleLog('Audio playback completed.', 'info');
  };
  
  audio.play().catch(e => {
    console.error("Audio play blocked by browser", e);
    addConsoleLog(`Audio play error: ${e.message}`, 'debug');
  });
});

socket.on('audio-error', error => {
  setStatus('Error', 'recording');
  setBtnState('Start Call', false);
  isCallActive = false;
  addConsoleLog(`Server Audio Error: ${JSON.stringify(error)}`, 'debug');
});

// Start Call Logic (Option 2 Simulator behavior)
if (startBtn) {
  startBtn.onclick = async () => {
    if (isCallActive) return;
    isCallActive = true;

    try {
      addConsoleLog('Requesting microphone permissions...', 'info');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = e => chunks.push(e.data);
      
      recorder.onstop = () => {
        setStatus('Thinking', 'thinking');
        setBtnState('Processing...', true);
        addConsoleLog('Microphone recording stopped. Encoding audio buffer to server...', 'info');
        const blob = new Blob(chunks);
        blob.arrayBuffer().then(buffer => {
          socket.emit('audio', buffer);
          addConsoleLog(`Emitted 'audio' event with ${buffer.byteLength} bytes`, 'debug');
        });
      };
      
      // Start recording UI
      setStatus('Listening (5s)', 'recording');
      setBtnState('Recording...', true);
      addConsoleLog('Recording audio from user microphone for 5 seconds...', 'info');
      
      recorder.start();
      
      // 5 second mock recording window
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      }, 5000);

    } catch (err) {
      console.error('Error accessing microphone', err);
      setStatus('Mic Access Denied', 'recording');
      setBtnState('Start Call', false);
      isCallActive = false;
      addConsoleLog(`Microphone Error: ${err.message}`, 'debug');
    }
  };
}
