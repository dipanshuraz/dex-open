import { getTradesForToken } from './src/lib/tradeStore.js'; // Note: might need adjustment for TS/ESM
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const chain = 'ethereum';
  const token = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'; // USDC
  console.log(`Testing trades for ${token} on ${chain}...`);
  try {
    const trades = await getTradesForToken(chain, token);
    console.log(`Found ${trades.length} trades.`);
    if (trades.length > 0) {
      console.log('Sample trade:', JSON.stringify(trades[0], null, 2));
    }
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
