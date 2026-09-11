const socket = io('ws://localhost:3000');
const startBtn = document.getElementById('start');
const btnText = document.getElementById('btn-text');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');
const chatLog = document.getElementById('chat-log');

let isCallActive = false;

// Helpers
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
  statusText.innerText = text;
  statusDot.className = 'status-dot';
  if (dotClass) {
    statusDot.classList.add(dotClass);
  }
}

function setBtnState(text, disabled) {
  btnText.innerText = text;
  startBtn.disabled = disabled;
}

// Socket Events
socket.on('connect', () => {
  console.log('Connected to WebSocket server', socket.id);
  setStatus('Online');
  setBtnState('Start Call', false);
});

socket.on('disconnect', () => {
  setStatus('Offline', 'recording'); // red dot
  setBtnState('Disconnected', true);
});

// Received transcription of what the user said
socket.on('user-text', text => {
  appendBubble(text, 'user');
});

// Received AI's text response
socket.on('ai-text', text => {
  appendBubble(text, 'ai');
});

// Received AI's audio response
socket.on('audio-echo', data => {
  setStatus('Speaking', 'speaking');
  
  const blob = new Blob([data], { type: 'audio/mpeg' });
  const audio = new Audio(URL.createObjectURL(blob));
  
  audio.onended = () => {
    setStatus('Online');
    setBtnState('Start Call', false);
    isCallActive = false;
  };
  
  audio.play().catch(e => console.error("Audio play blocked by browser", e));
});

socket.on('audio-error', error => {
  setStatus('Error', 'recording');
  setBtnState('Start Call', false);
  isCallActive = false;
});

// Start Call Logic (Option 2 Simulator behavior)
startBtn.onclick = async () => {
  if (isCallActive) return;
  isCallActive = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    
    recorder.ondataavailable = e => chunks.push(e.data);
    
    recorder.onstop = () => {
      setStatus('Thinking', 'thinking');
      setBtnState('Processing...', true);
      const blob = new Blob(chunks);
      blob.arrayBuffer().then(buffer => {
        socket.emit('audio', buffer);
      });
    };
    
    // Start recording UI
    setStatus('Listening (5s)', 'recording');
    setBtnState('Recording...', true);
    
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
  }
};
