const fs = require('fs');
const path = require('path');

const strategies = {};

// Auto-load all strategy files
const strategyFiles = fs.readdirSync(__dirname).filter(file => 
  file.endsWith('.js') && file !== 'index.js'
);

for (const file of strategyFiles) {
  const strategyName = path.basename(file, '.js');
  strategies[strategyName] = require(`./${file}`);
}

// Fallback to default if strategy doesn't exist
strategies.get = (name) => {
  return strategies[name] || strategies.default;
};

module.exports = strategies;
