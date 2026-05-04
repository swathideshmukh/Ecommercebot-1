const User = require("../db/models/User");

async function addPreference(phone, category, subcategory) {
  const user = await User.findOne({ phone });

  if (!user) return;

  user.preferences = user.preferences || [];

  user.preferences.push({
    category,
    subcategory,
    viewedAt: new Date()
  });

  if (user.preferences.length > 30) {
    user.preferences = user.preferences.slice(-30);
  }

  await user.save();
}

async function getTopPreference(phone, fallbackCategory, fallbackSubcategory) {
  const user = await User.findOne({ phone }).lean();

  if (!user?.preferences?.length) {
    return {
      category: fallbackCategory,
      subcategory: fallbackSubcategory
    };
  }

  const score = {};

  for (const pref of user.preferences) {
    const key = `${pref.category}|${pref.subcategory}`;
    score[key] = (score[key] || 0) + 1;
  }

  const topKey = Object.keys(score).sort((a, b) => score[b] - score[a])[0];

  if (!topKey) {
    return {
      category: fallbackCategory,
      subcategory: fallbackSubcategory
    };
  }

  const [category, subcategory] = topKey.split("|");

  return { category, subcategory };
}

module.exports = {
  addPreference,
  getTopPreference
};