const ADMIN_TOKEN_KEY = 'companda-d2r-admin-token';
const WORKER_URL_KEY = 'companda-d2r-bnet-oauth-worker';
const DEFAULT_ADMIN_USER = 'youni2984';
const ADMIN_PASSWORD_MIN_LENGTH = 12;
const $ = (id) => document.getElementById(id);

function normalizeWorkerUrl(value = '') { return value.trim().replace(/\/+$/, ''); }
function getWorkerUrl() { return normalizeWorkerUrl(localStorage.getItem(WORKER_URL_KEY) || ''); }
function getToken() { return sessionStorage.getItem(ADMIN_TOKEN_KEY) || ''; }
function validAdminPassword(value = '') {
  return value.length >= ADMIN_PASSWORD_MIN_LENGTH && /[A-Za-z]/.test(value) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value);
}

function setStatus(message, state = '') {
  const el = $('adminStatus');
  el.textContent = message;
  el.className = `auth-status ${state}`.trim();
}

function setAuthenticated(user) {
  $('loginCard').hidden = true;
  $('adminPanel').hidden = false;
  $('adminIdentity').textContent = `${user} · 관리자`;
  setStatus('관리자 인증이 확인되었습니다.', 'success');
}

function setLoggedOut(message = '관리자 로그인이 필요합니다.') {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  $('loginCard').hidden = false;
  $('adminPanel').hidden = true;
  setStatus(message);
}

async function api(path, options = {}) {
  const base = getWorkerUrl();
  if (!base) throw new Error('먼저 Cloudflare Worker 주소를 입력해 저장하세요.');
  const headers = { 'content-type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(`${base}${path}`, { ...options, headers });
  let data = {};
  try { data = await response.json(); } catch {}
  if (!response.ok) throw new Error(data.error || `요청 실패 (${response.status})`);
  return data;
}

async function checkSession() {
  const token = getToken();
  if (!token) return setLoggedOut();
  try {
    const data = await api('/admin/session', { method: 'GET' });
    if (data.authenticated) setAuthenticated(data.username || DEFAULT_ADMIN_USER);
    else setLoggedOut();
  } catch {
    setLoggedOut('관리자 세션이 만료되었거나 서버 설정이 필요합니다.');
  }
}

async function checkServer() {
  const base = getWorkerUrl();
  if (!base) return setStatus('Worker 주소를 입력하세요.', 'error');
  setStatus('서버 상태 확인 중…');
  try {
    const response = await fetch(`${base}/health`, { headers: { accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!data.adminAuthConfigured) return setStatus('서버 연결 정상 · ADMIN_PASSWORD Secret 설정 필요', 'error');
    if (data.adminPasswordPolicyValid === false) return setStatus('서버 연결 정상 · 관리자 비밀번호 정책 미충족', 'error');
    setStatus('서버 연결 정상 · 관리자 인증 설정 완료', 'success');
  } catch (error) {
    setStatus(`Worker 연결 실패: ${error.message}`, 'error');
  }
}

async function login(event) {
  event.preventDefault();
  if (!getWorkerUrl()) return setStatus('먼저 Worker 주소를 저장하세요.', 'error');
  const username = $('adminUsername').value.trim();
  const password = $('adminPassword').value;
  if (!username || !password) return setStatus('관리자 아이디와 비밀번호를 입력하세요.', 'error');
  if (!validAdminPassword(password)) return setStatus('비밀번호는 영문 포함 12자리 이상이며 특수기호를 1개 이상 포함해야 합니다.', 'error');
  setStatus('관리자 인증 중…');
  try {
    const data = await api('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    $('adminPassword').value = '';
    setAuthenticated(data.username || username);
  } catch (error) {
    setLoggedOut(error.message);
    $('adminPassword').focus();
  }
}

function saveWorker() {
  const value = normalizeWorkerUrl($('adminWorkerUrl').value);
  if (!/^https:\/\//i.test(value)) return setStatus('https:// 로 시작하는 Worker 주소를 입력하세요.', 'error');
  localStorage.setItem(WORKER_URL_KEY, value);
  setStatus('Worker 주소를 저장했습니다.', 'success');
}

function logout() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  setLoggedOut('관리자 세션을 종료했습니다.');
}

function init() {
  $('adminWorkerUrl').value = getWorkerUrl();
  $('adminUsername').value = DEFAULT_ADMIN_USER;
  $('adminLoginForm').addEventListener('submit', login);
  $('saveWorker').addEventListener('click', saveWorker);
  $('checkServer').addEventListener('click', checkServer);
  $('adminLogout').addEventListener('click', logout);
  checkSession();
}

init();
