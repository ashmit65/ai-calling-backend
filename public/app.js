const socket = io('ws://localhost:3000');
const startBtn = document.getElementById('start');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');
const orb = document.getElementById('orb');
const chatLog = document.getElementById('chat-log');

let isCallActive = false;

// Helpers
function appendBubble(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${sender}`;
  bubble.innerText = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function setStatus(text, color, orbState) {
  statusText.innerText = text;
  statusDot.style.background = color;
  
  orb.className = 'orb'; // reset
  if (orbState) {
    orb.classList.add(orbState);
  }
}

// Socket Events
socket.on('connect', () => {
  console.log('Connected to WebSocket server', socket.id);
  startBtn.disabled = false;
});

socket.on('disconnect', () => {
  setStatus('Disconnected from server', '#ef4444', null);
  startBtn.disabled = true;
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
  setStatus('AI Speaking...', '#3b82f6', 'speaking');
  
  const blob = new Blob([data], { type: 'audio/mpeg' });
  const audio = new Audio(URL.createObjectURL(blob));
  
  audio.onended = () => {
    setStatus('Ready', '#22c55e', null);
    startBtn.disabled = false;
    startBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg> Start Call';
    isCallActive = false;
  };
  
  audio.play().catch(e => console.error("Audio play blocked by browser", e));
});

socket.on('audio-error', error => {
  setStatus('Error processing audio', '#ef4444', null);
  startBtn.disabled = false;
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
      setStatus('Processing...', '#eab308', null);
      const blob = new Blob(chunks);
      blob.arrayBuffer().then(buffer => {
        socket.emit('audio', buffer);
      });
    };
    
    // Start recording UI
    setStatus('Listening... (5s)', '#ef4444', 'recording');
    startBtn.disabled = true;
    startBtn.innerHTML = 'Recording...';
    
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
    setStatus('Microphone access denied', '#ef4444', null);
    isCallActive = false;
  }
};
