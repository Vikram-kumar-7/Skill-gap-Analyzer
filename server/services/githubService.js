import axios from 'axios';
import { logStructured } from '../utils/logger.js';

// Heuristic mock data generator for fallback when rate-limited or unauthenticated
const generateMockGitHubAnalysis = (username) => {
  const usernameLower = username.toLowerCase();
  
  // Custom profiles for testing
  const mockProfiles = {
    'vikram-kumar-7': {
      languages: { 'JavaScript': 55, 'TypeScript': 25, 'CSS': 12, 'HTML': 8 },
      skills: { 'Node.js': 8.4, 'MongoDB': 7.1, 'React': 8.0, 'TypeScript': 7.5, 'JavaScript': 8.8, 'REST API': 8.5, 'Git': 9.0, 'HTML': 8.5, 'CSS': 7.8 },
      evidence: { commitsPerWeek: 4.2, testFilesFound: 2, reposAnalyzed: 6 },
      strengths: ['API Development', 'Database Design', 'Frontend State Management'],
      weaknesses: ['Testing', 'CI/CD'],
      testingPractice: 'Medium',
      documentationScore: 4,
      issuesClosed: 14,
      prsMerged: 18,
    },
    'microsoft-dev': {
      languages: { 'C#': 50, 'TypeScript': 30, 'Go': 20 },
      skills: { 'C#': 9.2, 'TypeScript': 8.5, 'Go': 7.8, 'Docker': 8.0, 'CI/CD': 8.2, 'SQL': 8.0 },
      evidence: { commitsPerWeek: 8.5, testFilesFound: 24, reposAnalyzed: 12 },
      strengths: ['Enterprise Architectures', 'Concurrency & Performance', 'Microservices'],
      weaknesses: ['AI-ML Integration'],
      testingPractice: 'High',
      documentationScore: 5,
      issuesClosed: 42,
      prsMerged: 65,
    }
  };

  const defaultProfile = {
    languages: { 'JavaScript': 60, 'HTML': 20, 'CSS': 20 },
    skills: { 'JavaScript': 7.5, 'HTML': 7.0, 'CSS': 6.5, 'Git': 8.0 },
    evidence: { commitsPerWeek: 1.8, testFilesFound: 0, reposAnalyzed: 3 },
    strengths: ['Frontend Basics', 'Responsive Layouts'],
    weaknesses: ['Database Design', 'Backend Architecture', 'Testing'],
    testingPractice: 'Low',
    documentationScore: 2,
    issuesClosed: 2,
    prsMerged: 4,
  };

  const selected = mockProfiles[usernameLower] || {
    ...defaultProfile,
    // Add some random variation based on username length to make it look unique
    evidence: {
      commitsPerWeek: parseFloat((1.5 + (username.length % 5) * 0.9).toFixed(1)),
      testFilesFound: username.length % 3,
      reposAnalyzed: Math.max(2, 3 + (username.length % 6)),
    },
    testingPractice: (username.length % 3 === 0) ? 'Low' : (username.length % 3 === 1) ? 'Medium' : 'High',
    documentationScore: Math.max(1, 2 + (username.length % 4)),
  };

  // Convert percentages of language
  return {
    username,
    strengths: selected.strengths || ['Problem Solving', 'Source Control'],
    weaknesses: selected.weaknesses || ['Testing', 'CI/CD'],
    skillConfidence: selected.skills,
    evidence: {
      commitsPerWeek: selected.evidence.commitsPerWeek,
      testFilesFound: selected.evidence.testFilesFound,
      reposAnalyzed: selected.evidence.reposAnalyzed,
      languages: selected.languages,
      testingPractice: selected.testingPractice,
      documentationScore: `${selected.documentationScore}/5`,
      issuesClosed: selected.issuesClosed || Math.max(1, username.length % 8),
      prsMerged: selected.prsMerged || Math.max(2, username.length % 12),
    },
    isMock: true,
  };
};

export const runGitHubAnalysis = async (username, onProgress = () => {}) => {
  const token = process.env.GITHUB_TOKEN || process.env.OPENROUTER_API_KEY; // can use GITHUB_TOKEN if configured
  const hasToken = token && token !== 'your_github_token_here' && !token.startsWith('sk-');
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SkillGap-Analyzer',
  };
  
  if (hasToken) {
    headers['Authorization'] = `token ${token}`;
  }

  const client = axios.create({
    baseURL: 'https://api.github.com',
    headers,
    timeout: 1500,
  });

  try {
    onProgress(10);
    // 1. Fetch user profile and repos
    const userRes = await client.get(`/users/${username}`);
    const reposRes = await client.get(`/users/${username}/repos?per_page=100&sort=updated`);
    
    onProgress(30);

    const publicRepos = reposRes.data || [];
    if (publicRepos.length === 0) {
      throw new Error('No public repositories found for this user.');
    }

    // Filter out forks and analyze top N repos (up to 5)
    const originalRepos = publicRepos.filter(r => !r.fork).slice(0, 5);
    const reposToAnalyze = originalRepos.length > 0 ? originalRepos : publicRepos.slice(0, 5);

    let totalCommits = 0;
    const languageBytes = {};
    let totalTestFiles = 0;
    let totalPrs = 0;
    let totalClosedIssues = 0;
    let totalOpenIssues = 0;
    let documentationSum = 0;
    
    // Skill scanning variables
    const detectedFiles = new Set();
    const readmeLengths = [];
    const readmeSections = { installation: 0, usage: 0, screenshots: 0 };

    const sinceDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(); // 6 months ago

    const stepSize = 50 / reposToAnalyze.length;
    let currentProgress = 30;

    for (const repo of reposToAnalyze) {
      const owner = repo.owner.login;
      const repoName = repo.name;
      const defaultBranch = repo.default_branch || 'main';

      // A. Languages
      try {
        const langRes = await client.get(`/repos/${owner}/${repoName}/languages`);
        const langs = langRes.data || {};
        for (const [lang, bytes] of Object.entries(langs)) {
          languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
        }
      } catch (err) {
        console.warn(`Could not fetch languages for ${repoName}:`, err.message);
      }

      // B. Commits (last 6 months)
      try {
        const commitsRes = await client.get(`/repos/${owner}/${repoName}/commits?since=${sinceDate}&per_page=100`);
        const commits = commitsRes.data || [];
        totalCommits += commits.length;
      } catch (err) {
        console.warn(`Could not fetch commits for ${repoName}:`, err.message);
      }

      // C. Issues & PRs
      try {
        const issuesRes = await client.get(`/repos/${owner}/${repoName}/issues?state=all&per_page=100`);
        const issuesAndPrs = issuesRes.data || [];
        for (const item of issuesAndPrs) {
          if (item.pull_request) {
            totalPrs++;
          } else {
            if (item.state === 'closed') totalClosedIssues++;
            else totalOpenIssues++;
          }
        }
      } catch (err) {
        console.warn(`Could not fetch issues for ${repoName}:`, err.message);
      }

      // D. Git Tree (Recursive for Test Files detection)
      try {
        const treeRes = await client.get(`/repos/${owner}/${repoName}/git/trees/${defaultBranch}?recursive=1`);
        const tree = treeRes.data?.tree || [];
        
        for (const item of tree) {
          const path = item.path;
          const pathLower = path.toLowerCase();
          const pathParts = pathLower.split('/');

          // Ignore files in dependency, build, or virtual environment directories
          const ignoreDirs = [
            'node_modules',
            'bower_components',
            'vendor',
            'dist',
            'build',
            'out',
            'target',
            '.next',
            '.nuxt',
            '.cache',
            '__pycache__',
            'venv',
            '.venv',
            'env',
            '.env'
          ];
          if (pathParts.some(part => ignoreDirs.includes(part))) {
            continue;
          }

          const filename = pathParts[pathParts.length - 1];

          // Testing files detection
          if (
            pathLower.includes('__tests__') ||
            pathLower.includes('/tests/') ||
            pathLower.includes('/test/') ||
            filename.endsWith('.test.js') ||
            filename.endsWith('.test.ts') ||
            filename.endsWith('.test.jsx') ||
            filename.endsWith('.test.tsx') ||
            filename.endsWith('.spec.js') ||
            filename.endsWith('.spec.ts') ||
            filename.startsWith('jest.config') ||
            filename.startsWith('vitest.config') ||
            filename.startsWith('cypress.config')
          ) {
            totalTestFiles++;
          }

          // Technology files detection
          if (filename === 'dockerfile' || filename === 'docker-compose.yml') detectedFiles.add('docker');
          if (pathLower.includes('.github/workflows')) detectedFiles.add('github-actions');
          if (filename === 'tailwind.config.js' || filename === 'tailwind.config.ts') detectedFiles.add('tailwind');
          if (filename === 'package.json') detectedFiles.add('nodejs');
          if (filename === 'tsconfig.json') detectedFiles.add('typescript');
          if (filename === 'requirements.txt') detectedFiles.add('python-reqs');
          if (filename === 'go.mod') detectedFiles.add('go');
          if (filename === 'cargo.toml') detectedFiles.add('rust');
        }
      } catch (err) {
        console.warn(`Could not fetch tree for ${repoName}:`, err.message);
      }

      // E. README analysis
      try {
        const readmeRes = await client.get(`/repos/${owner}/${repoName}/readme`);
        if (readmeRes.data && readmeRes.data.content) {
          const text = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8');
          readmeLengths.push(text.length);

          if (/install|getting started|scaffold|setup/i.test(text)) readmeSections.installation++;
          if (/usage|api|endpoint|docs|method/i.test(text)) readmeSections.usage++;
          if (/screenshot|demo|gif|visual/i.test(text)) readmeSections.screenshots++;
        }
      } catch (err) {
        console.warn(`Could not fetch README for ${repoName}:`, err.message);
      }

      currentProgress += stepSize;
      onProgress(Math.min(90, Math.round(currentProgress)));
    }

    // 3. Compute detailed scores & metrics
    // Language percentage
    const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
    const languagesPct = {};
    if (totalBytes > 0) {
      for (const [lang, bytes] of Object.entries(languageBytes)) {
        const pct = parseFloat(((bytes / totalBytes) * 100).toFixed(1));
        if (pct >= 1.0) { // filter out minor langs
          languagesPct[lang] = pct;
        }
      }
    } else {
      languagesPct['JavaScript'] = 100;
    }

    // Commits per week (over 6 months ~26 weeks)
    const commitsPerWeek = parseFloat((totalCommits / 26).toFixed(1));
    const commitFreqScore = Math.min(10, parseFloat(((commitsPerWeek / 4) * 10).toFixed(1))); // 4 commits/week = 10/10

    // Testing signal
    const testingPractice = totalTestFiles >= 5 ? 'High' : totalTestFiles >= 1 ? 'Medium' : 'Low';

    // Documentation Quality checklist (max 5 points)
    let docPoints = 0;
    const avgReadmeLength = readmeLengths.length > 0 ? readmeLengths.reduce((a, b) => a + b, 0) / readmeLengths.length : 0;
    if (readmeLengths.length > 0) docPoints += 1; // README exists
    if (avgReadmeLength > 1000) docPoints += 1; // README is detailed
    if (readmeSections.installation > 0) docPoints += 1; // Installation docs
    if (readmeSections.usage > 0) docPoints += 1; // Usage docs
    if (readmeSections.screenshots > 0) docPoints += 1; // Visual screenshots/gifs

    // Confidence skill calculations
    const skillConfidence = {};
    
    // Base scores by language mix
    for (const [lang, pct] of Object.entries(languagesPct)) {
      const baseConfidence = 3.0 + (pct / 100) * 5.0; // scale 3.0 to 8.0
      if (lang === 'JavaScript') {
        skillConfidence['JavaScript'] = parseFloat(baseConfidence.toFixed(1));
        if (detectedFiles.has('nodejs')) skillConfidence['Node.js'] = parseFloat((baseConfidence * 0.95).toFixed(1));
      } else if (lang === 'TypeScript') {
        skillConfidence['TypeScript'] = parseFloat(baseConfidence.toFixed(1));
      } else if (lang === 'Python') {
        skillConfidence['Python'] = parseFloat(baseConfidence.toFixed(1));
      } else if (lang === 'Go') {
        skillConfidence['Go'] = parseFloat(baseConfidence.toFixed(1));
      } else if (lang === 'Rust') {
        skillConfidence['Rust'] = parseFloat(baseConfidence.toFixed(1));
      } else if (lang === 'Java') {
        skillConfidence['Java'] = parseFloat(baseConfidence.toFixed(1));
      } else if (lang === 'C#') {
        skillConfidence['C#'] = parseFloat(baseConfidence.toFixed(1));
      } else if (lang === 'HTML') {
        skillConfidence['HTML'] = parseFloat(baseConfidence.toFixed(1));
      } else if (lang === 'CSS') {
        skillConfidence['CSS'] = parseFloat(baseConfidence.toFixed(1));
      }
    }

    // Technology file additions
    if (detectedFiles.has('docker')) skillConfidence['Docker'] = 8.2;
    if (detectedFiles.has('github-actions')) {
      skillConfidence['CI/CD'] = 8.0;
      skillConfidence['GitHub Actions'] = 8.5;
    }
    if (detectedFiles.has('tailwind')) skillConfidence['Tailwind CSS'] = 8.0;
    if (totalTestFiles > 0) skillConfidence['Testing'] = parseFloat((3.0 + Math.min(5.0, totalTestFiles * 0.8)).toFixed(1));

    // Git / REST API default confidence
    skillConfidence['Git'] = parseFloat((6.0 + commitFreqScore * 0.4).toFixed(1));
    skillConfidence['REST API'] = 7.5;

    // Strengths & Weaknesses heuristic
    const strengths = [];
    const weaknesses = [];

    if (commitFreqScore >= 7) strengths.push('Active Development');
    if (languagesPct['TypeScript'] >= 20 || languagesPct['JavaScript'] >= 25) strengths.push('API Development');
    if (detectedFiles.has('docker') || detectedFiles.has('github-actions')) strengths.push('CI/CD & Containers');
    if (docPoints >= 4) strengths.push('System Documentation');
    if (totalTestFiles >= 5) strengths.push('Automated Testing');

    if (strengths.length === 0) strengths.push('Basic Scripting', 'Git Workflow');

    if (totalTestFiles === 0) weaknesses.push('Testing');
    if (!detectedFiles.has('github-actions')) weaknesses.push('CI/CD');
    if (docPoints <= 2) weaknesses.push('Documentation');
    if (Object.keys(languagesPct).length <= 1) weaknesses.push('Multi-Language Versatility');

    if (weaknesses.length === 0) weaknesses.push('System Design Deep Dives');

    onProgress(100);

    return {
      username,
      strengths,
      weaknesses: weaknesses.slice(0, 2), // Keep weaknesses compact
      skillConfidence,
      evidence: {
        commitsPerWeek,
        testFilesFound: totalTestFiles,
        reposAnalyzed: reposToAnalyze.length,
        languages: languagesPct,
        testingPractice,
        documentationScore: `${docPoints}/5`,
        issuesClosed: totalClosedIssues,
        prsMerged: totalPrs,
      },
      isMock: false,
    };
  } catch (error) {
    logStructured({
      event: 'github_analysis_error',
      username,
      error: error.message,
    });

    const is404 = error.response?.status === 404;
    const isRateLimit = error.response?.status === 403 || error.response?.status === 429;
    const allowMock = process.env.ALLOW_MOCK_FALLBACK === 'true';

    if (is404) {
      throw new Error(`GitHub user "${username}" not found.`);
    }

    if (allowMock) {
      console.warn(`⚠️ GitHub API call failed for ${username}: ${error.message}. Generating heuristic mock profile (Fallback allowed).`);
      onProgress(100);
      return generateMockGitHubAnalysis(username);
    }

    if (isRateLimit) {
      throw new Error('GitHub API rate limit exceeded. Please configure GITHUB_TOKEN or try again later.');
    }

    throw new Error(`GitHub API request failed: ${error.message}`);
  }
};
