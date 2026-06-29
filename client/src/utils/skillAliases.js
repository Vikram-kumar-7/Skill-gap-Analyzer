// ============================================================
// MASTER ENGINEERING SKILL DICTIONARY
// Covers: Languages, Frontend, Backend, Databases, Cloud,
// DevOps, AI/ML, Mobile, Security, Systems, Data, QA, and more
// Usage: normalizeSkill("Amazon Web Services") → "aws"
// ============================================================

export const SKILL_GROUPS = {

  // ─────────────────────────────────────────
  // PROGRAMMING LANGUAGES
  // ─────────────────────────────────────────
  javascript: ['javascript', 'js', 'es6', 'es7', 'es8', 'es2015', 'es2017', 'es2020', 'es2022', 'vanilla js', 'vanilla javascript', 'ecmascript'],
  typescript: ['typescript', 'ts', 'type script', 'typed javascript'],
  python:     ['python', 'python2', 'python3', 'py', 'python 3', 'python 2'],
  java:       ['java', 'java8', 'java 8', 'java11', 'java 11', 'java17', 'java 17', 'java 21', 'core java', 'advanced java'],
  cpp:        ['c++', 'cpp', 'c plus plus', 'cplusplus', 'c++ 17', 'c++17', 'c++14', 'c++ 14', 'c++20'],
  c:          ['c', 'c language', 'c programming', 'ansi c'],
  csharp:     ['c#', 'csharp', 'c sharp', '.net', 'dotnet', 'dot net'],
  go:         ['go', 'golang', 'go lang', 'go language'],
  rust:       ['rust', 'rust lang', 'rustlang', 'rust language'],
  ruby:       ['ruby', 'ruby on rails', 'rails', 'ror'],
  php:        ['php', 'php7', 'php8', 'php 7', 'php 8', 'laravel', 'symfony', 'codeigniter'],
  swift:      ['swift', 'swift ui', 'swiftui', 'swift 5'],
  kotlin:     ['kotlin', 'kotlin android'],
  scala:      ['scala', 'scala lang', 'akka'],
  r:          ['r', 'r language', 'r programming', 'rlang'],
  matlab:     ['matlab', 'mat lab'],
  perl:       ['perl', 'perl5'],
  haskell:    ['haskell', 'haskell lang'],
  elixir:     ['elixir', 'phoenix', 'phoenix framework'],
  dart:       ['dart', 'dart lang'],
  lua:        ['lua', 'lua scripting'],
  shell:      ['bash', 'shell', 'shell scripting', 'bash scripting', 'sh', 'zsh', 'fish shell', 'powershell', 'power shell'],
  groovy:     ['groovy', 'groovy lang'],
  solidity:   ['solidity', 'smart contracts', 'ethereum solidity'],
  assembly:   ['assembly', 'asm', 'x86', 'x86-64', 'arm assembly'],
  cobol:      ['cobol'],
  fortran:    ['fortran'],
  vba:        ['vba', 'visual basic', 'visual basic for applications'],

  // ─────────────────────────────────────────
  // FRONTEND
  // ─────────────────────────────────────────
  react:        ['react', 'reactjs', 'react.js', 'react js', 'react 18', 'react 17', 'react 16', 'react hooks', 'react native web'],
  nextjs:       ['next', 'nextjs', 'next.js', 'next js', 'next 13', 'next 14', 'next 15'],
  vuejs:        ['vue', 'vuejs', 'vue.js', 'vue js', 'vue 3', 'vue 2', 'nuxt', 'nuxtjs', 'nuxt.js'],
  angular:      ['angular', 'angularjs', 'angular.js', 'angular 2', 'angular 14', 'angular 15', 'angular 16', 'angular 17', 'ng'],
  svelte:       ['svelte', 'sveltejs', 'svelte.js', 'sveltekit'],
  html:         ['html', 'html5', 'html 5', 'hypertext markup language'],
  css:          ['css', 'css3', 'css 3', 'cascading style sheets'],
  sass:         ['sass', 'scss', 'sass/scss'],
  tailwind:     ['tailwind', 'tailwindcss', 'tailwind css', 'tailwind ui'],
  bootstrap:    ['bootstrap', 'bootstrap 4', 'bootstrap 5', 'bootstrap4', 'bootstrap5'],
  materialui:   ['material ui', 'materialui', 'mui', 'material design', '@mui'],
  styledcomponents: ['styled components', 'styled-components', 'css in js'],
  redux:        ['redux', 'redux toolkit', 'rtk', 'react redux', 'zustand', 'recoil', 'jotai', 'mobx'],
  vite:         ['vite', 'vitejs', 'vite.js'],
  webpack:      ['webpack', 'webpack 5', 'webpack5'],
  babel:        ['babel', 'babeljs', 'babel.js'],
  jquery:       ['jquery', 'jquery ui'],
  threejs:      ['three.js', 'threejs', 'three js', 'webgl', 'web gl'],
  d3:           ['d3', 'd3.js', 'd3js', 'data visualization', 'data viz'],
  storybook:    ['storybook', 'storybook.js'],
  gatsby:       ['gatsby', 'gatsbyjs', 'gatsby.js'],
  remix:        ['remix', 'remix.run'],
  astro:        ['astro', 'astro.js', 'astrojs'],
  htmx:         ['htmx', 'htmx.js'],

  // ─────────────────────────────────────────
  // BACKEND / SERVER
  // ─────────────────────────────────────────
  nodejs:       ['node', 'nodejs', 'node.js', 'node js'],
  express:      ['express', 'expressjs', 'express.js', 'express js', 'express framework'],
  fastify:      ['fastify', 'fastify.js'],
  nestjs:       ['nest', 'nestjs', 'nest.js', 'nest js'],
  django:       ['django', 'django rest framework', 'drf', 'django framework'],
  flask:        ['flask', 'flask python', 'flask api'],
  fastapi:      ['fastapi', 'fast api', 'fastapi python'],
  springboot:   ['spring', 'spring boot', 'springboot', 'spring framework', 'spring mvc', 'spring cloud', 'spring security'],
  rails:        ['rails', 'ruby on rails', 'ror'],
  laravel:      ['laravel', 'laravel php'],
  graphql:      ['graphql', 'graph ql', 'gql', 'apollo', 'apollo graphql', 'apollo server', 'apollo client', 'hasura'],
  rest:         ['rest', 'rest api', 'restful', 'restful api', 'rest apis', 'rest services', 'restful services', 'http api'],
  grpc:         ['grpc', 'grpc api', 'protocol buffers', 'protobuf'],
  websocket:    ['websocket', 'websockets', 'ws', 'socket.io', 'socketio', 'real time', 'realtime'],
  trpc:         ['trpc', 'trpc.io'],

  // ─────────────────────────────────────────
  // DATABASES — SQL
  // ─────────────────────────────────────────
  postgresql:   ['postgresql', 'postgres', 'pg', 'psql', 'postgres sql', 'postgresdb'],
  mysql:        ['mysql', 'my sql', 'mysql 8', 'mariadb', 'maria db'],
  sqlite:       ['sqlite', 'sqlite3', 'sqlite 3'],
  mssql:        ['mssql', 'sql server', 'microsoft sql server', 'ms sql', 'azure sql'],
  oracle:       ['oracle', 'oracle db', 'oracle database', 'pl/sql', 'plsql'],
  sql:          ['sql', 'structured query language', 't-sql', 'tsql', 'ansi sql'],

  // ─────────────────────────────────────────
  // DATABASES — NOSQL
  // ─────────────────────────────────────────
  mongodb:      ['mongodb', 'mongo', 'mongoose', 'mongo db', 'atlas', 'mongodb atlas'],
  redis:        ['redis', 'redisdb', 'redis cache', 'redis labs', 'upstash', 'redis pub/sub', 'redis pubsub'],
  cassandra:    ['cassandra', 'apache cassandra', 'datastax'],
  dynamodb:     ['dynamodb', 'dynamo db', 'amazon dynamodb', 'aws dynamodb'],
  couchdb:      ['couchdb', 'couch db', 'apache couchdb'],
  couchbase:    ['couchbase'],
  neo4j:        ['neo4j', 'neo 4j', 'graph database', 'graph db'],
  influxdb:     ['influxdb', 'influx db', 'time series db', 'timeseries database'],
  elasticsearch:['elasticsearch', 'elastic search', 'elastic', 'elk', 'elk stack', 'opensearch', 'open search'],
  firebase:     ['firebase', 'firestore', 'firebase realtime database', 'firebase db', 'google firebase'],
  supabase:     ['supabase', 'supa base'],
  planetscale:  ['planetscale', 'planet scale'],
  cockroachdb:  ['cockroachdb', 'cockroach db'],

  // ─────────────────────────────────────────
  // CLOUD PLATFORMS
  // ─────────────────────────────────────────
  aws:          ['aws', 'amazon web services', 'amazon aws', 'amazon cloud', 'ec2', 's3', 'lambda', 'aws lambda', 'rds', 'aws rds', 'cloudfront', 'aws cloudfront', 'ecs', 'eks', 'aws ecs', 'aws eks', 'sqs', 'sns', 'aws sqs', 'aws sns', 'iam', 'aws iam', 'route53', 'route 53', 'api gateway', 'aws api gateway', 'cloudwatch', 'aws cloudwatch', 'elastic beanstalk', 'aws elastic beanstalk', 'fargate', 'aws fargate', 'cognito', 'aws cognito'],
  azure:        ['azure', 'microsoft azure', 'ms azure', 'azure devops', 'azure functions', 'azure blob', 'azure sql', 'azure ad', 'azure active directory', 'azure kubernetes', 'aks'],
  gcp:          ['gcp', 'google cloud', 'google cloud platform', 'google cloud services', 'gke', 'google kubernetes engine', 'cloud run', 'google cloud run', 'bigquery', 'big query', 'cloud functions', 'google cloud functions', 'firestore', 'cloud storage'],
  vercel:       ['vercel', 'vercel deployment'],
  netlify:      ['netlify', 'netlify deployment'],
  heroku:       ['heroku', 'heroku deployment'],
  digitalocean: ['digitalocean', 'digital ocean', 'do droplet', 'do spaces'],
  linode:       ['linode', 'akamai cloud'],
  cloudflare:   ['cloudflare', 'cloud flare', 'cloudflare workers', 'cloudflare pages'],
  render:       ['render', 'render.com'],
  fly:          ['fly.io', 'flyio', 'fly io'],

  // ─────────────────────────────────────────
  // DEVOPS & CI/CD
  // ─────────────────────────────────────────
  docker:       ['docker', 'dockerfile', 'docker compose', 'docker-compose', 'containerization', 'containers', 'docker hub', 'docker swarm'],
  kubernetes:   ['kubernetes', 'k8s', 'kubectl', 'k8', 'helm', 'helm charts'],
  terraform:    ['terraform', 'terraform iac', 'hashicorp terraform', 'infrastructure as code', 'iac'],
  ansible:      ['ansible', 'ansible playbook'],
  jenkins:      ['jenkins', 'jenkins ci', 'jenkins pipeline', 'jenkinsfile'],
  githubactions:['github actions', 'gh actions', 'github ci', 'github workflows'],
  gitlab:       ['gitlab', 'gitlab ci', 'gitlab cd', 'gitlab ci/cd', 'gitlab pipelines'],
  circleci:     ['circleci', 'circle ci'],
  travisci:     ['travis ci', 'travisci', 'travis'],
  argocd:       ['argocd', 'argo cd', 'argo'],
  cicd:         ['ci/cd', 'ci cd', 'continuous integration', 'continuous deployment', 'continuous delivery', 'devops pipeline'],
  nginx:        ['nginx', 'nginx server', 'nginx proxy', 'reverse proxy'],
  apache:       ['apache', 'apache http', 'apache server', 'apache2'],
  vagrant:      ['vagrant', 'hashicorp vagrant'],
  packer:       ['packer', 'hashicorp packer'],
  vault:        ['vault', 'hashicorp vault'],

  // ─────────────────────────────────────────
  // MESSAGE QUEUES & EVENT STREAMING
  // ─────────────────────────────────────────
  kafka:        ['kafka', 'apache kafka', 'confluent kafka', 'kafka streams', 'kafka connect'],
  rabbitmq:     ['rabbitmq', 'rabbit mq', 'amqp', 'rabbit'],
  sqs:          ['sqs', 'amazon sqs', 'aws sqs', 'simple queue service'],
  pubsub:       ['pubsub', 'pub/sub', 'google pubsub', 'google pub/sub', 'pub sub'],
  nats:         ['nats', 'nats.io', 'nats messaging'],
  zeromq:       ['zeromq', 'zmq', '0mq'],
  celery:       ['celery', 'celery python'],

  // ─────────────────────────────────────────
  // OBSERVABILITY & MONITORING
  // ─────────────────────────────────────────
  prometheus:   ['prometheus', 'prom', 'prometheus monitoring'],
  grafana:      ['grafana', 'grafana dashboard'],
  opentelemetry:['opentelemetry', 'otel', 'open telemetry'],
  datadog:      ['datadog', 'data dog', 'dd-trace'],
  newrelic:     ['new relic', 'newrelic'],
  sentry:       ['sentry', 'sentry.io', 'error tracking'],
  splunk:       ['splunk'],
  elk:          ['elk', 'elk stack', 'elasticsearch logstash kibana', 'logstash', 'kibana'],
  jaeger:       ['jaeger', 'distributed tracing', 'zipkin'],
  cloudwatch:   ['cloudwatch', 'aws cloudwatch'],
  pagerduty:    ['pagerduty', 'pager duty'],

  // ─────────────────────────────────────────
  // SECURITY
  // ─────────────────────────────────────────
  jwt:          ['jwt', 'json web token', 'json web tokens'],
  oauth:        ['oauth', 'oauth2', 'oauth 2.0', 'openid', 'openid connect', 'oidc'],
  saml:         ['saml', 'sso', 'single sign on', 'single sign-on'],
  ssl:          ['ssl', 'tls', 'ssl/tls', 'https', 'certificates'],
  bcrypt:       ['bcrypt', 'password hashing', 'argon2', 'scrypt'],
  rbac:         ['rbac', 'role based access control', 'role-based access control', 'acl', 'access control'],
  totp:         ['totp', '2fa', 'two factor', 'two-factor', 'mfa', 'multi factor auth', 'google authenticator'],
  csrf:         ['csrf', 'xss', 'sql injection', 'owasp', 'web security', 'penetration testing', 'pen testing', 'pentest'],
  hmac:         ['hmac', 'hmac-sha256', 'sha256', 'sha512', 'md5', 'cryptography'],
  vault:        ['vault', 'secrets management', 'hashicorp vault'],
  firewall:     ['firewall', 'network security', 'iptables', 'waf'],

  // ─────────────────────────────────────────
  // AI / ML / DATA SCIENCE
  // ─────────────────────────────────────────
  tensorflow:   ['tensorflow', 'tensor flow', 'tf', 'tensorflow 2', 'keras'],
  pytorch:      ['pytorch', 'torch', 'py torch'],
  sklearn:      ['sklearn', 'scikit-learn', 'scikit learn', 'scikit'],
  numpy:        ['numpy', 'num py', 'np'],
  pandas:       ['pandas', 'pd', 'dataframe'],
  matplotlib:   ['matplotlib', 'pyplot', 'seaborn', 'plotly'],
  opencv:       ['opencv', 'open cv', 'computer vision', 'cv2'],
  huggingface:  ['huggingface', 'hugging face', 'transformers', 'hf transformers'],
  langchain:    ['langchain', 'lang chain'],
  openai:       ['openai', 'open ai', 'chatgpt api', 'gpt', 'gpt-4', 'gpt4', 'gpt-3.5', 'gpt3', 'openai api'],
  gemini:       ['gemini', 'google gemini', 'bard', 'palm'],
  anthropic:    ['anthropic', 'claude api', 'claude'],
  llm:          ['llm', 'large language model', 'llms', 'rag', 'retrieval augmented generation', 'vector database', 'vector db', 'pinecone', 'weaviate', 'chroma'],
  mlops:        ['mlops', 'ml ops', 'mlflow', 'kubeflow', 'airflow', 'apache airflow'],
  jupyter:      ['jupyter', 'jupyter notebook', 'ipython', 'colab', 'google colab'],
  spark:        ['spark', 'apache spark', 'pyspark', 'spark sql'],
  hadoop:       ['hadoop', 'hdfs', 'mapreduce', 'hive', 'hbase', 'pig'],
  datascience:  ['data science', 'machine learning', 'ml', 'deep learning', 'dl', 'artificial intelligence', 'ai', 'nlp', 'natural language processing', 'computer vision'],

  // ─────────────────────────────────────────
  // MOBILE DEVELOPMENT
  // ─────────────────────────────────────────
  reactnative:  ['react native', 'reactnative', 'react-native', 'rn'],
  flutter:      ['flutter', 'flutter dart', 'flutter sdk'],
  android:      ['android', 'android studio', 'android sdk', 'android development'],
  ios:          ['ios', 'ios development', 'xcode', 'uikit', 'swiftui'],
  expo:         ['expo', 'expo go', 'expo sdk'],
  ionic:        ['ionic', 'ionic framework', 'capacitor'],
  xamarin:      ['xamarin', 'xamarin forms', 'maui', '.net maui'],
  pwa:          ['pwa', 'progressive web app', 'service worker'],

  // ─────────────────────────────────────────
  // TESTING & QA
  // ─────────────────────────────────────────
  jest:         ['jest', 'jestjs', 'jest testing'],
  mocha:        ['mocha', 'chai', 'mocha/chai'],
  vitest:       ['vitest', 'vite test'],
  cypress:      ['cypress', 'cypress testing', 'cypress e2e'],
  playwright:   ['playwright', 'playwright testing'],
  selenium:     ['selenium', 'selenium webdriver', 'selenium grid'],
  junit:        ['junit', 'junit 5', 'testng'],
  pytest:       ['pytest', 'py test', 'unittest'],
  postman:      ['postman', 'postman api'],
  k6:           ['k6', 'load testing', 'stress testing', 'performance testing', 'jmeter', 'gatling'],
  sonarqube:    ['sonarqube', 'sonar', 'code quality', 'code coverage'],
  testing:      ['unit testing', 'integration testing', 'e2e testing', 'end to end testing', 'tdd', 'test driven development', 'bdd', 'behavior driven development'],

  // ─────────────────────────────────────────
  // VERSION CONTROL & COLLABORATION
  // ─────────────────────────────────────────
  git:          ['git', 'git version control', 'version control'],
  github:       ['github', 'git hub', 'github.com'],
  gitlab:       ['gitlab', 'git lab', 'gitlab.com'],
  bitbucket:    ['bitbucket', 'bit bucket', 'atlassian bitbucket'],
  jira:         ['jira', 'atlassian jira', 'jira tickets'],
  confluence:   ['confluence', 'atlassian confluence'],
  notion:       ['notion', 'notion.so'],
  trello:       ['trello', 'atlassian trello'],
  slack:        ['slack', 'slack api'],
  linear:       ['linear', 'linear.app'],

  // ─────────────────────────────────────────
  // SYSTEM DESIGN & ARCHITECTURE
  // ─────────────────────────────────────────
  microservices:['microservices', 'micro services', 'service mesh', 'istio', 'envoy'],
  systemdesign: ['system design', 'distributed systems', 'scalability', 'high availability', 'fault tolerance'],
  ddd:          ['ddd', 'domain driven design', 'domain-driven design'],
  cqrs:         ['cqrs', 'command query responsibility segregation', 'event sourcing'],
  solid:        ['solid', 'solid principles', 'design patterns', 'clean architecture', 'clean code'],
  api:          ['api design', 'api gateway', 'api versioning', 'openapi', 'swagger', 'api documentation'],
  serverless:   ['serverless', 'serverless framework', 'faas', 'function as a service'],
  cdn:          ['cdn', 'content delivery network', 'edge computing', 'edge network'],
  loadbalancer: ['load balancer', 'load balancing', 'nginx load balancer', 'haproxy'],
  caching:      ['caching', 'cache', 'in-memory cache', 'distributed cache', 'memcached'],

  // ─────────────────────────────────────────
  // NETWORKING & PROTOCOLS
  // ─────────────────────────────────────────
  tcp:          ['tcp', 'tcp/ip', 'udp', 'networking', 'network protocols'],
  http:         ['http', 'https', 'http/2', 'http2', 'http/3', 'http3'],
  dns:          ['dns', 'domain name system'],
  ssh:          ['ssh', 'sftp', 'ftp'],
  mqtt:         ['mqtt', 'iot protocols'],
  osi:          ['osi model', 'osi', 'network layers'],

  // ─────────────────────────────────────────
  // OPERATING SYSTEMS & LINUX
  // ─────────────────────────────────────────
  linux:        ['linux', 'ubuntu', 'debian', 'centos', 'rhel', 'fedora', 'arch linux', 'linux administration', 'unix', 'unix/linux'],
  windows:      ['windows', 'windows server', 'windows administration'],
  macos:        ['macos', 'mac os', 'osx'],
  cli:          ['cli', 'command line', 'terminal', 'bash', 'shell'],

  // ─────────────────────────────────────────
  // EMBEDDED & LOW-LEVEL
  // ─────────────────────────────────────────
  embedded:     ['embedded', 'embedded systems', 'embedded c', 'rtos', 'real time os'],
  arduino:      ['arduino', 'arduino programming'],
  raspberrypi:  ['raspberry pi', 'raspberrypi', 'raspi'],
  fpga:         ['fpga', 'vhdl', 'verilog'],
  iot:          ['iot', 'internet of things', 'edge devices'],

  // ─────────────────────────────────────────
  // DATA ENGINEERING
  // ─────────────────────────────────────────
  etl:          ['etl', 'elt', 'data pipeline', 'data pipelines', 'data ingestion'],
  airflow:      ['airflow', 'apache airflow', 'workflow orchestration'],
  dbt:          ['dbt', 'data build tool'],
  snowflake:    ['snowflake', 'snow flake'],
  redshift:     ['redshift', 'amazon redshift', 'aws redshift'],
  bigquery:     ['bigquery', 'big query', 'google bigquery'],
  databricks:   ['databricks', 'data bricks'],
  flink:        ['flink', 'apache flink'],
  nifi:         ['nifi', 'apache nifi'],
  tableau:      ['tableau', 'tableau desktop'],
  powerbi:      ['power bi', 'powerbi', 'microsoft power bi'],

  // ─────────────────────────────────────────
  // BLOCKCHAIN & WEB3
  // ─────────────────────────────────────────
  blockchain:   ['blockchain', 'block chain', 'ethereum', 'web3', 'web 3', 'solana', 'bitcoin'],
  web3js:       ['web3.js', 'web3js', 'ethers.js', 'ethersjs'],
  hardhat:      ['hardhat', 'truffle', 'foundry'],
  ipfs:         ['ipfs', 'interplanetary file system'],

  // ─────────────────────────────────────────
  // GAME DEVELOPMENT
  // ─────────────────────────────────────────
  unity:        ['unity', 'unity 3d', 'unity game engine', 'unity engine'],
  unreal:       ['unreal', 'unreal engine', 'ue4', 'ue5'],
  godot:        ['godot', 'godot engine', 'gdscript'],
  opengl:       ['opengl', 'open gl', 'vulkan', 'directx'],

  // ─────────────────────────────────────────
  // TOOLS & MISCELLANEOUS
  // ─────────────────────────────────────────
  figma:        ['figma', 'figma design'],
  photoshop:    ['photoshop', 'adobe photoshop', 'ps'],
  vim:          ['vim', 'neovim', 'nvim'],
  vscode:       ['vscode', 'vs code', 'visual studio code'],
  excel:        ['excel', 'microsoft excel', 'spreadsheets'],
  regex:        ['regex', 'regular expressions', 'regexp'],
  latex:        ['latex', 'tex', 'latex typesetting'],
  meilisearch:  ['meilisearch', 'meilisearch api', 'search engine'],
  stripe:       ['stripe', 'stripe api', 'stripe payments', 'payment gateway'],
  razorpay:     ['razorpay', 'razorpay api'],
  twilio:       ['twilio', 'twilio api', 'sms api'],
  sendgrid:     ['sendgrid', 'send grid', 'email api'],
  cloudinary:   ['cloudinary', 'image upload', 'media storage'],
};

// ─────────────────────────────────────────
// BUILD REVERSE LOOKUP MAP
// alias → canonical
// e.g. "amazon web services" → "aws"
// ─────────────────────────────────────────
const ALIAS_TO_CANONICAL = {};
for (const [canonical, aliases] of Object.entries(SKILL_GROUPS)) {
  for (const alias of aliases) {
    ALIAS_TO_CANONICAL[alias.toLowerCase().trim()] = canonical;
  }
}

// ─────────────────────────────────────────
// CORE UTILITY FUNCTIONS
// ─────────────────────────────────────────

/** Normalize any skill string to its canonical key */
export function normalizeSkill(skill) {
  if (!skill) return '';
  const lower = skill.toLowerCase().trim();
  return ALIAS_TO_CANONICAL[lower] || lower;
}

/** Normalize an array, removing duplicates */
export function normalizeSkills(skills = []) {
  return [...new Set(skills.map(normalizeSkill).filter(Boolean))];
}

/** Check if two skill strings refer to the same skill */
export function skillsMatch(a, b) {
  return normalizeSkill(a) === normalizeSkill(b);
}

/**
 * Find skill gaps
 * @param {string[]} resumeSkills - skills from resume
 * @param {string[]} jdSkills - skills from job description
 * @returns {string[]} canonical names of missing skills
 */
export function findGaps(resumeSkills = [], jdSkills = []) {
  const normalizedResume = normalizeSkills(resumeSkills);
  return normalizeSkills(jdSkills).filter(s => !normalizedResume.includes(s));
}

/**
 * Find matching skills between resume and JD
 * @returns {string[]} canonical names of matched skills
 */
export function findMatches(resumeSkills = [], jdSkills = []) {
  const normalizedResume = normalizeSkills(resumeSkills);
  return normalizeSkills(jdSkills).filter(s => normalizedResume.includes(s));
}

/**
 * Calculate match percentage
 * @returns {number} 0–100
 */
export function matchScore(resumeSkills = [], jdSkills = []) {
  if (!jdSkills.length) return 0;
  const matches = findMatches(resumeSkills, jdSkills);
  return Math.round((matches.length / normalizeSkills(jdSkills).length) * 100);
}
