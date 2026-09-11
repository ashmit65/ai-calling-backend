const axios = require('axios');

async function test() {
  try {
    const response = await axios.get(
      'https://integrate.api.nvidia.com/v1/models',
      {
        headers: {
          'Authorization': 'Bearer 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'
        }
      }
    );
    console.log('Success!');
    const models = response.data.data.map(m => m.id).filter(id => id.includes('llama'));
    console.log(models);
  } catch (error) {
    console.error('Failed!', error.response?.status, error.response?.data);
  }
}
test();
