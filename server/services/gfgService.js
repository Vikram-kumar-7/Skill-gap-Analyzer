import axios from 'axios';
import { load } from 'cheerio';
import { logStructured } from '../utils/logger.js';

const GFG_CACHE = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const fetchGFGStats = async (username) => {
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid username provided');
  }

  const normalizedUsername = username.trim().toLowerCase();
  const cached = GFG_CACHE.get(normalizedUsername);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    logStructured('DSA_GFG_CACHE_HIT', {
      username: normalizedUsername,
      age_ms: Date.now() - cached.fetchedAt,
    });
    return cached.data;
  }

  const url = `https://www.geeksforgeeks.org/user/${normalizedUsername}/`;

  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html',
    },
    timeout: 10000,
  });

  const $ = load(html);

  const totalSolved = parseInt(
    $('.scoreCard_head_left--score__oSi_x').first().text().trim() || '0'
  );

  const institutionRank = $('.rankCard_head_left--rank__MZ4Oc').first().text().trim() || 'N/A';

  let school = 0,
    basic = 0,
    easy = 0,
    medium = 0,
    hard = 0;

  $('.problemCard_head_left--score__xBzui').each((i, el) => {
    const val = parseInt($(el).text().trim()) || 0;
    if (i === 0) school = val;
    else if (i === 1) basic = val;
    else if (i === 2) easy = val;
    else if (i === 3) medium = val;
    else if (i === 4) hard = val;
  });

  const result = {
    username: normalizedUsername,
    totalSolved,
    institutionRank,
    breakdown: { school, basic, easy, medium, hard },
    fetchedAt: Date.now(),
  };

  GFG_CACHE.set(normalizedUsername, { data: result, fetchedAt: Date.now() });
  return result;
};

/**
 * Manual GFG stats input (user provides their stats)
 */
export const importGFGStats = async (username, stats) => {
  const { easy = 0, medium = 0, hard = 0 } = stats;

  if (!username || !Number.isInteger(easy) || !Number.isInteger(medium) || !Number.isInteger(hard)) {
    throw new Error('Invalid GFG stats provided');
  }

  logStructured('DSA_GFG_MANUAL_IMPORT', {
    username: username.trim().toLowerCase(),
    stats: { easy, medium, hard },
  });

  return {
    easy,
    medium,
    hard,
    total: easy + medium + hard,
    source: 'gfg',
    importedAt: new Date(),
  };
};
