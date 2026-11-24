// --- 1. Navigasi Tab ---
function bukaTab(namaTab, btn) {
  document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((el) => el.classList.remove('active'));

  document.getElementById('tab-' + namaTab).classList.add('active');
  btn.classList.add('active');
}

// --- 2. Fitur Kesehatan Ibu Hamil ---
const savedHpht = localStorage.getItem('hphtIbu');
if (savedHpht) {
  document.getElementById('hpht').value = savedHpht;
  hitungKehamilan();
}

function hitungKehamilan() {
  const hphtVal = document.getElementById('hpht').value;
  const hasilBox = document.getElementById('hasil-kehamilan');

  if (!hphtVal) {
    alert("Masukkan tanggal HPHT terlebih dahulu.");
    return;
  }

  localStorage.setItem('hphtIbu', hphtVal);

  const hphtDate = new Date(hphtVal);
  const hariIni = new Date();

  // Hitung selisih hari untuk usia kehamilan
  const selisihMs = hariIni - hphtDate;
  const totalHari = Math.floor(selisihMs / (1000 * 60 * 60 * 24));

  if (totalHari < 0) {
    hasilBox.style.display = "block";
    hasilBox.innerHTML = "Tanggal HPHT tidak boleh melebihi hari ini.";
    return;
  }

  const minggu = Math.floor(totalHari / 7);
  const sisaHari = totalHari % 7;

  let trimester = "Trimester 1";
  if (minggu >= 13 && minggu <= 27) trimester = "Trimester 2";
  else if (minggu >= 28) trimester = "Trimester 3";

  // Rumus Naegele (+280 hari dari HPHT)
  const hplDate = new Date(hphtDate);
  hplDate.setDate(hplDate.getDate() + 280);
  const hplText = hplDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  hasilBox.style.display = "block";
  hasilBox.innerHTML = `
    <strong>Usia Kehamilan:</strong> ${minggu} minggu ${sisaHari} hari (${trimester})<br>
    <strong>Perkiraan Hari Lahir (HPL):</strong> ${hplText}<br>
    <small>Jadwal kontrol ANC disarankan minimal 6 kali selama kehamilan.</small>
  `;
}

// Simpan & Muat Rutinitas Harian Ibu
const rutinitasIds = ['cek-ttd', 'cek-asam', 'cek-air'];
rutinitasIds.forEach((id) => {
  document.getElementById(id).checked = localStorage.getItem(id) === 'true';
});

function simpanRutinitasIbu() {
  rutinitasIds.forEach((id) => {
    localStorage.setItem(id, document.getElementById(id).checked);
  });
}

// --- 3. Fitur Tumbuh Kembang Anak ---
let dataPertumbuhan = JSON.parse(localStorage.getItem('pertumbuhanAnak')) || [];
tampilkanPertumbuhan();

function simpanPertumbuhan() {
  const nama = document.getElementById('nama-anak').value.trim();
  const usia = document.getElementById('usia-bulan').value;
  const bb = document.getElementById('bb-anak').value;
  const tb = document.getElementById('tb-anak').value;

  if (!nama || !usia || !bb || !tb) {
    alert("Lengkapi nama, usia, berat badan, dan tinggi badan anak.");
    return;
  }

  dataPertumbuhan.unshift({
    id: Date.now(),
    nama,
    usia,
    bb,
    tb,
    tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  });

  localStorage.setItem('pertumbuhanAnak', JSON.stringify(dataPertumbuhan));
  tampilkanPertumbuhan();

  document.getElementById('usia-bulan').value = "";
  document.getElementById('bb-anak').value = "";
  document.getElementById('tb-anak').value = "";
}

function tampilkanPertumbuhan() {
  const listEl = document.getElementById('riwayat-anak');
  listEl.innerHTML = "";

  if (dataPertumbuhan.length === 0) {
    listEl.innerHTML = `<p class="sub-text">Belum ada catatan pertumbuhan anak.</p>`;
    return;
  }

  dataPertumbuhan.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <div>
        <strong>${item.nama} (${item.usia} bln)</strong><br>
        BB: ${item.bb} kg | TB: ${item.tb} cm <small>(${item.tanggal})</small>
      </div>
      <button class="btn-hapus" onclick="hapusPertumbuhan(${item.id})">Hapus</button>
    `;
    listEl.appendChild(li);
  });
}

function hapusPertumbuhan(id) {
  dataPertumbuhan = dataPertumbuhan.filter((item) => item.id !== id);
  localStorage.setItem('pertumbuhanAnak', JSON.stringify(dataPertumbuhan));
  tampilkanPertumbuhan();
}

// --- 4. Daftar Imunisasi Dasar ---
const daftarVaksin = [
  { id: "hb0", nama: "HB-0 (Usia < 24 jam)" },
  { id: "bcg", nama: "BCG & Polio Tetes 1 (Usia 1 bulan)" },
  { id: "dpt1", nama: "DPT-HB-Hib 1, Polio 2, PCV 1 (Usia 2 bulan)" },
  { id: "dpt2", nama: "DPT-HB-Hib 2, Polio 3, PCV 2 (Usia 3 bulan)" },
  { id: "dpt3", nama: "DPT-HB-Hib 3, Polio 4, IPV (Usia 4 bulan)" },
  { id: "campak", nama: "Campak-Rubella (MR) (Usia 9 bulan)" }
];

const statusVaksin = JSON.parse(localStorage.getItem('statusImunisasi')) || {};
renderImunisasi();

function renderImunisasi() {
  const container = document.getElementById('daftar-imunisasi');
  container.innerHTML = "";

  daftarVaksin.forEach((v) => {
    const label = document.createElement('label');
    const checked = statusVaksin[v.id] ? "checked" : "";
    label.innerHTML = `
      <input type="checkbox" ${checked} onchange="toggleImunisasi('${v.id}', this.checked)">
      ${v.nama}
    `;
    container.appendChild(label);
  });
}

function toggleImunisasi(id, isChecked) {
  statusVaksin[id] = isChecked;
  localStorage.setItem('statusImunisasi', JSON.stringify(statusVaksin));
  if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
  }
}