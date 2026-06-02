const ids = [
  'photo-1550583724-b2692b85b150',
  'photo-1517048676732-d65bc937f952',
  'photo-1601924994987-69e26d50dc26',
  'photo-1580927751497-22b56271b157',
  'photo-1618005182384-a83a8bd57fbe',
  'photo-1542241647-9cbb2225278b',
  'photo-1527960659564-77b931d21f43',
  'photo-1523381210434-271e8be1f52b',
  'photo-1560179707-f14e90ef3623',
  'photo-1513151233558-d860c5398176'
];

async function run() {
  for (const id of ids) {
    const url = `https://images.unsplash.com/${id}?q=80&w=600&auto=format&fit=crop`;
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`${id}: ${res.status}`);
    } catch (e: any) {
      console.log(`${id} Error: ${e.message}`);
    }
  }
}
run();
