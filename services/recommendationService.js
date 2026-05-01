const recommendationRepository = require("../repositories/recommendationRepository");
const cartRepository = require("../repositories/cartRepository");

// Get personalized greeting for user
async function getPersonalisedGreeting(phone) {
  const topCategories = await recommendationRepository.getTopCategories(phone, 3);
  
  if (!topCategories || topCategories.length === 0) {
    return null; // New user
  }

  const topCategory = topCategories[0];
  
  return `👋 Welcome back! Based on your interests:\n⭐ Top pick for you: ${topCategory}\n\nWhat would you like to do?`;
}

// Track user browse (fire and forget, swallows errors)
async function trackUserBrowse(phone, category) {
  try {
    await recommendationRepository.trackBrowse(phone, category);
  } catch (error) {
    // Swallow errors - don't break the main flow
    console.error("trackUserBrowse error:", error.message);
  }
}

module.exports = {
  getPersonalisedGreeting,
  trackUserBrowse
};
