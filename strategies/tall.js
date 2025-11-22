// Manually require strategies to avoid circular dependency
const acceptStrategy = require('./accept');
const defaultStrategy = require('./default');
const aggressiveStrategy = require('./aggressive');
const rejectStrategy = require('./reject');
const fastRejectStrategy = require('./fast-reject');

const cookieStrategies = {
  accept: acceptStrategy,
  default: defaultStrategy,
  aggressive: aggressiveStrategy,
  reject: rejectStrategy,
  'fast-reject': fastRejectStrategy
};

module.exports = async (page, strategyParams = '') => {
  console.log('  Using TALL strategy (flexible wrapper)');
  
  // Parse parameters - using whole numbers for percentages
  let cookieStrategy = 'accept';
  let scrollAmount = 0;    // as percentage (0-100)
  let leftCrop = 0;        // as percentage (0-100)
  let rightCrop = 0;       // as percentage (0-100)
  let heightMultiplier = 100; // as percentage (100 = normal height, 150 = 1.5x height, etc.)
  
  if (strategyParams) {
    const params = strategyParams.split('-');
    
    // First parameter: cookie strategy name
    if (params[0] && cookieStrategies[params[0]]) {
      cookieStrategy = params[0];
    } else if (params[0] && !isNaN(parseInt(params[0]))) {
      // It's a number (backward compatibility)
      scrollAmount = parseInt(params[0]);
      cookieStrategy = 'accept';
    }
    
    // Remaining parameters
    const startIndex = (cookieStrategy !== 'accept' && params[0] !== 'accept') ? 1 : 0;
    
    if (params[startIndex]) scrollAmount = parseInt(params[startIndex]) || scrollAmount;
    if (params[startIndex + 1]) leftCrop = parseInt(params[startIndex + 1]) || leftCrop;
    if (params[startIndex + 2]) rightCrop = parseInt(params[startIndex + 2]) || rightCrop;
    if (params[startIndex + 3]) heightMultiplier = parseInt(params[startIndex + 3]) || heightMultiplier;
  }
  
  // Convert to decimals for internal use
  const scrollDecimal = scrollAmount / 100;
  const leftCropDecimal = leftCrop / 100;
  const rightCropDecimal = rightCrop / 100;
  const heightMultiplierDecimal = heightMultiplier / 100;
  
  console.log(`    Cookie: ${cookieStrategy}, Scroll: ${scrollAmount}% down, Left: ${leftCrop}%, Right: ${rightCrop}%, Height: ${heightMultiplier}%`);
  
  // Use the specified cookie strategy
  await cookieStrategies[cookieStrategy](page);
  
  // Scroll and crop logic
  if (scrollAmount > 0) {
    await page.evaluate((scrollPos) => {
      window.scrollTo(0, window.innerHeight * scrollPos);
    }, scrollDecimal);
    await page.waitForTimeout(1000);
  }
  
  const viewport = await page.viewportSize();
  const enhancedHeight = Math.round(viewport.height * heightMultiplierDecimal);
  
  let clipOptions;
  
  if (leftCrop > 0 || rightCrop > 0) {
    const clipX = viewport.width * leftCropDecimal;
    const clipWidth = viewport.width * (1 - leftCropDecimal - rightCropDecimal);
    
    clipOptions = {
      clip: {
        x: Math.round(clipX),
        y: 0,
        width: Math.round(clipWidth),
        height: enhancedHeight
      }
    };
  } else {
    clipOptions = {
      clip: {
        x: 0,
        y: 0,
        width: viewport.width,
        height: enhancedHeight
      }
    };
  }
  
  return clipOptions;
};
