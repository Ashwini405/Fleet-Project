const axios = require('axios');

async function main() {
  const base = 'http://localhost:5001/api/auth';
  try {
    const loginRes = await axios.post(`${base}/login`, { username: 'admin.test', password: 'Test@1234' });
    console.log('LOGIN_OK', loginRes.status);
    const token = loginRes.data.data.accessToken;
    const meRes = await axios.get(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('ME_OK', meRes.data.data.username);
    const permsRes = await axios.get(`${base}/permissions`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('PERMS_OK', permsRes.data.data.length);
    const sidebarRes = await axios.get(`${base}/sidebar`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('SIDEBAR_OK', sidebarRes.data.data.length);
    const logoutRes = await axios.post(`${base}/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('LOGOUT_OK', logoutRes.status);
  } catch (error) {
    console.error('AUTH_TEST_FAILED', error.response?.status, error.response?.data || error.message);
    process.exitCode = 1;
  }
}

main();
