// OpenAI Realtime API client (speech-to-speech).
//
// Mic audio is captured via Web Audio, downsampled to 24kHz PCM16, and
// streamed over the Realtime WebSocket. Response audio deltas are queued and
// played back through the speakers. A `run_command` tool is registered so the
// agent can execute whitelisted commands on the home lab via the gateway.

const REALTIME_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview';
const SAMPLE_RATE = 24000;

function floatTo16BitPCM(float32) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function base64FromInt16(int16) {
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function int16FromBase64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

export class RealtimeVoice {
  /**
   * @param {object} opts
   * @param {string} opts.apiKey            OpenAI API key
   * @param {string} opts.instructions     System prompt for the active agent
   * @param {function} opts.onTranscript   ({ role, text, final })
   * @param {function} opts.onSpeaking     ({ user, agent }) voice activity flags
   * @param {function} opts.onCommand      async (command) => output string
   * @param {function} opts.onStatus       ('idle'|'connecting'|'live'|'error')
   */
  constructor(opts) {
    this.opts = opts;
    this.ws = null;
    this.audioCtx = null;
    this.playCursor = 0;
  }

  async start() {
    const { apiKey, onStatus } = this.opts;
    onStatus?.('connecting');

    this.audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Browser/Electron-renderer WebSocket cannot set headers; the Realtime API
    // accepts auth via subprotocols for browser clients.
    this.ws = new WebSocket(REALTIME_URL, [
      'realtime',
      `openai-insecure-api-key.${apiKey}`,
      'openai-beta.realtime-v1',
    ]);

    this.ws.onopen = () => {
      this.send({
        type: 'session.update',
        session: {
          modalities: ['audio', 'text'],
          instructions: this.opts.instructions || 'You are a helpful home-lab agent.',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: { model: 'whisper-1' },
          turn_detection: { type: 'server_vad' },
          tools: [
            {
              type: 'function',
              name: 'run_command',
              description:
                'Execute a whitelisted shell command on the home lab PC via the OpenClaw gateway. Returns stdout/stderr.',
              parameters: {
                type: 'object',
                properties: { command: { type: 'string', description: 'Shell command to run' } },
                required: ['command'],
              },
            },
          ],
        },
      });
      this.startMic();
      onStatus?.('live');
    };

    this.ws.onmessage = (ev) => this.handleEvent(JSON.parse(ev.data));
    this.ws.onerror = () => onStatus?.('error');
    this.ws.onclose = () => onStatus?.('idle');
  }

  startMic() {
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    // ScriptProcessor keeps the dependency surface small; buffer of 4096 at
    // 24kHz ≈ 170ms chunks, fine for server-side VAD.
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const rms = Math.sqrt(input.reduce((s, v) => s + v * v, 0) / input.length);
      this.opts.onSpeaking?.({ user: rms > 0.02 });
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'input_audio_buffer.append',
          audio: base64FromInt16(floatTo16BitPCM(input)),
        });
      }
    };
    source.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);
  }

  async handleEvent(event) {
    const { onTranscript, onSpeaking, onCommand } = this.opts;
    switch (event.type) {
      case 'response.audio.delta': {
        this.enqueueAudio(int16FromBase64(event.delta));
        onSpeaking?.({ agent: true });
        break;
      }
      case 'response.audio.done':
        onSpeaking?.({ agent: false });
        break;
      case 'response.audio_transcript.delta':
        onTranscript?.({ role: 'agent', text: event.delta, final: false });
        break;
      case 'response.audio_transcript.done':
        onTranscript?.({ role: 'agent', text: event.transcript, final: true });
        break;
      case 'conversation.item.input_audio_transcription.completed':
        onTranscript?.({ role: 'user', text: event.transcript, final: true });
        break;
      case 'response.function_call_arguments.done': {
        if (event.name === 'run_command' && onCommand) {
          let output;
          try {
            const { command } = JSON.parse(event.arguments);
            output = await onCommand(command);
          } catch (err) {
            output = `error: ${err.message}`;
          }
          this.send({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: event.call_id,
              output: String(output),
            },
          });
          this.send({ type: 'response.create' });
        }
        break;
      }
      default:
        break;
    }
  }

  enqueueAudio(int16) {
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;
    const buffer = this.audioCtx.createBuffer(1, float32.length, SAMPLE_RATE);
    buffer.getChannelData(0).set(float32);
    const src = this.audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.audioCtx.destination);
    const now = this.audioCtx.currentTime;
    this.playCursor = Math.max(this.playCursor, now);
    src.start(this.playCursor);
    this.playCursor += buffer.duration;
  }

  send(obj) {
    this.ws?.send(JSON.stringify(obj));
  }

  stop() {
    this.processor?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ws?.close();
    this.audioCtx?.close();
    this.opts.onStatus?.('idle');
  }
}
