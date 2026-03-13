const { JsonRpcProvider, id } = require('ethers');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const alchemyKey = envContent.match(/ALCHEMY_API_KEY=(.*)/)?.[1]?.trim();

async function main() {
  const provider = new JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`);
  
  const poolAddress = "0x3416cF6C708Da44DB2624D63ea0AAef7113527C6"; // USDC/USDT V3
  const topic0 = id("Swap(address,address,int256,int256,uint160,uint128,int24)");
  
  console.log(`Fetching logs for pool: ${poolAddress}`);
  const head = await provider.getBlockNumber();
  
  const logs = await provider.getLogs({
    address: poolAddress,
    topics: [topic0],
    fromBlock: head - 9,
    toBlock: head
  });
  
  console.log(`Found ${logs.length} logs in the last 100 blocks.`);
  if (logs.length > 0) {
    console.log("First log sample:", logs[0]);
  }
}

main().catch(console.error);
