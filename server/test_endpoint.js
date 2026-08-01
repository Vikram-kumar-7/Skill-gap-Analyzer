import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const openRouterKey = process.env.OPENROUTER_API_KEY;

async function testModel(model) {
  console.log(`Querying OpenRouter via Axios with model ${model}...`);
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [{ role: 'user', content: 'Say hello' }],
      },
      {
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      }
    );

    console.log(`HTTP Status: ${response.status}`);
    console.log(`Response Data:`, JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log(`Failed with status ${err.response.status}:`, JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('Axios Error:', err.message);
      if (err.code) console.log('Error Code:', err.code);
    }
  }
}

testModel('qwen/qwen3-coder:free');
