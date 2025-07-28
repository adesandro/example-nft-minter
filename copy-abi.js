const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'artifacts', 'contracts', 'SimpleNFT.sol', 'SimpleNFT.json');
const destDir = path.join(__dirname, 'frontend', 'abi');
const dest = path.join(destDir, 'SimpleNFT.json');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log(`Copied ABI to ${dest}`); 