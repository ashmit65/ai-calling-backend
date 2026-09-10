const axios = require('axios');

async function test() {
  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/ErXwobaYiN019PkySvjV?output_format=mp3_44100_128',
      {
        text: 'Testing',
        model_id: 'eleven_flash_v2_5',
      },
      {
        headers: {
          'xi-api-key': 'sk_4d6c4cf4e38b6e7ad58f84c1c53e793ebf02f36548e8f19d',
          'Content-Type': 'application/json',
        }
      }
    );
    console.log('Success!');
    const voices = response.data.voices.slice(0, 5).map(v => ({ id: v.voice_id, name: v.name, category: v.category }));
    console.log(voices);
  } catch (error) {
    console.error('Failed!', error.response?.status, error.response?.data);
  }
}
test();
