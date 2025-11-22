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

// Enhanced get function that handles parameters
strategies.get = (strategyWithParams) => {
  const [strategyName, ...params] = strategyWithParams.split('-');
  const strategy = strategies[strategyName] || strategies.default;
  
  // Return a function that passes parameters to the strategy
  return (page) => strategy(page, params.join('-'));
};

module.exports = strategies;
