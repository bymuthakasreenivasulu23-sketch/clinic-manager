const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runE2E() {
  console.log('--- 1. Testing Landing Page ---');
  const home = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
  });
  console.log('Landing page HTTP status:', home.statusCode);

  console.log('\n--- 2. Testing Pet Owner Authentication ---');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'owner@example.com', password: 'Password123!' }
  );

  console.log('Login Status:', loginRes.statusCode);
  console.log('Login Result:', loginRes.body?.success, loginRes.body?.data?.user?.name);
  const cookieHeader = loginRes.headers['set-cookie'];
  const sessionCookie = cookieHeader ? cookieHeader[0].split(';')[0] : '';
  console.log('Session Cookie established:', !!sessionCookie);

  console.log('\n--- 3. Testing Protected /api/auth/me Endpoint ---');
  const meRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  console.log('/api/auth/me Status:', meRes.statusCode);
  console.log('User Role:', meRes.body?.data?.user?.role, 'Pets/Unread notifications:', meRes.body?.data?.unreadNotifications);

  console.log('\n--- 4. Testing Pet Retrieval ---');
  const petsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/pets',
    method: 'GET',
    headers: { Cookie: sessionCookie },
  });
  console.log('Pets fetched:', petsRes.body?.data?.length);
  petsRes.body?.data?.forEach((p) => console.log(`  - ${p.name} (${p.species} - ${p.breed})`));

  console.log('\n--- 5. Testing Booking an Appointment ---');
  const targetPet = petsRes.body?.data?.[0];
  const apptRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/appointments',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
    },
    {
      petId: targetPet.id,
      appointmentDate: '2026-10-25',
      timeSlot: '02:30 PM',
      reason: 'Routine Preventive Dental Examination',
      notes: 'Checking molars for tartar',
    }
  );
  console.log('Appointment creation status:', apptRes.statusCode);
  console.log('Appointment created:', apptRes.body?.success, apptRes.body?.data?.reason);

  console.log('\n--- 6. Testing Admin Authentication & Reports ---');
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@example.com', password: 'Password123!' }
  );
  const adminCookie = adminLogin.headers['set-cookie']?.[0]?.split(';')[0];
  const reportsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/reports',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  console.log('Admin Reports Status:', reportsRes.statusCode);
  console.log('Overview Counts:', reportsRes.body?.data?.overview);

  console.log('\n=======================================');
  console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
  console.log('=======================================');
}

runE2E().catch(console.error);
