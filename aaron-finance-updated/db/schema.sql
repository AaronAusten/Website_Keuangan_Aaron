-- Aaron Austen Finance App - PostgreSQL Schema
-- Data lengkap dari mutasi rekening BCA 125-099-9239
-- Jan 2026: CR=4.319.864 | DB=3.084.764 | Saldo Akhir=1.265.100,73
-- Feb 2026: CR=10.276.303 | DB=11.346.403 | Saldo Akhir=195.000,73
-- Mar 2026 s/d tgl 3: Saldo=120.000

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) DEFAULT 'Aaron Austen',
    email VARCHAR(100),
    avatar_emoji VARCHAR(10) DEFAULT '🐱',
    created_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO users (name, email, avatar_emoji) VALUES ('Aaron Austen','aaron@example.com','🐱') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) DEFAULT 1,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    color VARCHAR(20) DEFAULT '#a8d8ea',
    emoji VARCHAR(10) DEFAULT '💳',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO accounts (name, type, balance, color, emoji) VALUES
('Bank BCA','bank',120000,'#a8d8ea','🏦'),
('Cash','cash',0,'#ffb7c5','💵'),
('E-Wallet','ewallet',0,'#c7ceea','📱'),
('Tabungan','bank',0,'#b5ead7','🐷');

CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) DEFAULT 1,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    purchase_amount DECIMAL(15,2) NOT NULL,
    purchase_date DATE NOT NULL,
    quantity DECIMAL(15,6) DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'unit',
    notes TEXT,
    emoji VARCHAR(10) DEFAULT '📈',
    color VARCHAR(20) DEFAULT '#ffd1dc',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO investments (name, type, purchase_amount, purchase_date, quantity, unit, emoji, color, notes) VALUES
('Emas Antam','emas',700000,'2026-01-01',0.5,'gram','🥇','#ffd700','Emas fisik / tabungan emas'),
('Reksa Dana Pasar Uang','reksadana',350000,'2026-01-01',350000,'unit','📊','#b5ead7','Reksa dana konservatif');

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    color VARCHAR(20) DEFAULT '#a8d8ea',
    created_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO categories (name, type, emoji, color) VALUES
('Makan','pengeluaran','🍜','#ffb7c5'),
('Bahan Makanan','pengeluaran','🛒','#ffd1dc'),
('Motor / BBM','pengeluaran','⛽','#c7ceea'),
('Parkir','pengeluaran','🅿️','#e2d9f3'),
('Jajan / Snack','pengeluaran','🧋','#ffb7c5'),
('Belanja Online','pengeluaran','📦','#a8d8ea'),
('Peralatan Mandi','pengeluaran','🧴','#b5ead7'),
('Cuci Baju','pengeluaran','👕','#c7ceea'),
('Kuliah / UKT','pengeluaran','📚','#ffd1dc'),
('Listrik','pengeluaran','⚡','#ffeaa7'),
('Kado','pengeluaran','🎁','#fd79a8'),
('Biaya Admin','pengeluaran','🏧','#dfe6e9'),
('Hewan Peliharaan','pengeluaran','🐾','#a29bfe'),
('Hiburan','pengeluaran','🎮','#74b9ff'),
('Persembahan','pengeluaran','🙏','#fdcb6e'),
('Lain-lain','pengeluaran','🔮','#b2bec3'),
('Topup E-Wallet','pengeluaran','📲','#c7ceea'),
('Elektronik','pengeluaran','💻','#74b9ff'),
('Tarikan ATM','pengeluaran','🏧','#dfe6e9'),
('Pegadaian','pengeluaran','🏛️','#fdcb6e'),
('Uang Papi','pemasukan','💝','#fd79a8'),
('Transfer Teman','pemasukan','💸','#55efc4'),
('Cashback / Refund','pemasukan','🎉','#fdcb6e'),
('Lain-lain (Masuk)','pemasukan','✨','#a8d8ea');

CREATE OR REPLACE FUNCTION set_month_year()
RETURNS TRIGGER LANGUAGE plpgsql AS
'BEGIN
    NEW.month = EXTRACT(MONTH FROM NEW.date);
    NEW.year = EXTRACT(YEAR FROM NEW.date);
    RETURN NEW;
END';

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) DEFAULT 1,
    account_id INTEGER REFERENCES accounts(id),
    category_id INTEGER REFERENCES categories(id),
    type VARCHAR(20) NOT NULL,
    tipe_pengeluaran VARCHAR(20),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    is_flagged BOOLEAN DEFAULT false,
    notes TEXT,
    month INTEGER,
    year INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_month_year ON transactions;
CREATE TRIGGER trg_month_year
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION set_month_year();

-- ═══════════════════════════════════════════════════════════
-- JANUARI 2026 — PEMASUKAN (CR) Total: 4.319.864
-- ═══════════════════════════════════════════════════════════
INSERT INTO transactions (account_id,category_id,type,tipe_pengeluaran,amount,description,date) VALUES
(1,21,'pemasukan',NULL,150000,'WD BCA (Tabungan Aaron)','2026-01-01'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-01-03'),
(1,21,'pemasukan',NULL,150000,'WD BCA (Tabungan Aaron)','2026-01-04'),
(1,21,'pemasukan',NULL,48042,'WD BCA (Tabungan Aaron)','2026-01-08'),
(1,22,'pemasukan',NULL,28000,'Transfer Vivian Estrellita','2026-01-08'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-01-09'),
(1,22,'pemasukan',NULL,30000,'Transfer Vivian Estrellita','2026-01-09'),
(1,23,'pemasukan',NULL,24064,'Airpay International (cashback)','2026-01-10'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-01-10'),
(1,22,'pemasukan',NULL,30000,'Transfer Vivian Estrellita','2026-01-11'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-01-12'),
(1,21,'pemasukan',NULL,500000,'Transfer Dedy Hermanto','2026-01-16'),
(1,22,'pemasukan',NULL,17000,'Transfer Vivian Estrellita','2026-01-18'),
(1,22,'pemasukan',NULL,17000,'Espay Debit - Arneta Melga','2026-01-18'),
(1,22,'pemasukan',NULL,18000,'Transfer Winsen Tanjaya','2026-01-18'),
(1,22,'pemasukan',NULL,17000,'Transfer Alfonso Carlos','2026-01-18'),
(1,22,'pemasukan',NULL,17000,'Transfer Bryan Hoe','2026-01-18'),
(1,22,'pemasukan',NULL,17000,'Transfer Chellsy Wilian','2026-01-18'),
(1,22,'pemasukan',NULL,17000,'Transfer Reinhard Efraim','2026-01-18'),
(1,21,'pemasukan',NULL,150000,'Transfer Dedy (oli + shok beker)','2026-01-18'),
(1,22,'pemasukan',NULL,17000,'Transfer Cheryl Anggel','2026-01-18'),
(1,22,'pemasukan',NULL,17000,'Transfer Julius Poerwanto','2026-01-18'),
(1,22,'pemasukan',NULL,34000,'Transfer Astri Dewi Annisa','2026-01-24'),
(1,22,'pemasukan',NULL,15000,'Transfer Vivian Estrellita','2026-01-25'),
(1,22,'pemasukan',NULL,80000,'Espay Debit - Arneta Melga','2026-01-25'),
(1,22,'pemasukan',NULL,17000,'Transfer Vivian Estrellita','2026-01-26'),
(1,22,'pemasukan',NULL,17000,'Transfer Jocelyn Nathania','2026-01-26'),
(1,22,'pemasukan',NULL,17000,'Transfer Yosef Ferdinan','2026-01-26'),
(1,22,'pemasukan',NULL,1800,'Transfer Arneta Melga','2026-01-26'),
(1,22,'pemasukan',NULL,17000,'Transfer Chellsy Wilian','2026-01-26'),
(1,22,'pemasukan',NULL,16667,'Transfer Fincent Cruisetio','2026-01-26'),
(1,21,'pemasukan',NULL,500000,'Transfer Dedy Hermanto','2026-01-27'),
(1,22,'pemasukan',NULL,270000,'Transfer Vivian Estrellita','2026-01-28'),
(1,22,'pemasukan',NULL,17000,'Transfer Kenneth Nathanael','2026-01-29'),
(1,22,'pemasukan',NULL,16667,'Transfer Cheryl Anggel (parcel)','2026-01-29'),
(1,22,'pemasukan',NULL,17000,'Transfer Winsen Tanjaya','2026-01-30'),
(1,22,'pemasukan',NULL,23000,'Transfer Samuel Yudi Gunawa','2026-01-30'),
(1,22,'pemasukan',NULL,40000,'Transfer Vivian Estrellita','2026-01-30'),
(1,23,'pemasukan',NULL,202290,'Airpay International (cashback)','2026-01-30'),
(1,22,'pemasukan',NULL,33334,'Transfer Astri Dewi Annisa','2026-01-30'),
(1,21,'pemasukan',NULL,1200000,'Transfer Dedy Hermanto (uang kos)','2026-01-30'),
(1,22,'pemasukan',NULL,41000,'Transfer Vivian Estrellita','2026-01-31'),
(1,21,'pemasukan',NULL,200000,'Transfer Dedy Hermanto','2026-01-31'),
(1,22,'pemasukan',NULL,80000,'Transfer Jesslyn Susanto','2026-01-31'),

-- ═══════════════════════════════════════════════════════════
-- JANUARI 2026 — PENGELUARAN (DB) Total: 3.084.764
-- ═══════════════════════════════════════════════════════════
(1,1,'pengeluaran','keinginan',87500,'BBQ Akhir Tahun (Michael Alexander)','2026-01-01'),
(1,1,'pengeluaran','keinginan',32500,'Makan (Bryan Hoe)','2026-01-01'),
(1,15,'pengeluaran','kebutuhan',50000,'Perpuluhan (Gereja Misi Sejahtera)','2026-01-02'),
(1,1,'pengeluaran','keinginan',13500,'Salad (Bryan Hoe)','2026-01-03'),
(1,4,'pengeluaran','kebutuhan',5000,'Parkir (Astri Dewi)','2026-01-03'),
(1,3,'pengeluaran','kebutuhan',21500,'Bensin SPBU 34.40','2026-01-03'),
(1,2,'pengeluaran','kebutuhan',35200,'IDM Indoma (Minyak, Tepung)','2026-01-04'),
(1,19,'pengeluaran','kebutuhan',100000,'Tarikan ATM','2026-01-04'),
(1,17,'pengeluaran','kebutuhan',24800,'ShopeePay Topup','2026-01-05'),
(1,2,'pengeluaran','kebutuhan',34400,'IDM Indoma','2026-01-08'),
(1,2,'pengeluaran','keinginan',12900,'IDM Indoma (Keju Veve)','2026-01-08'),
(1,13,'pengeluaran','kebutuhan',14000,'ZC Petshop','2026-01-08'),
(1,19,'pengeluaran','kebutuhan',50000,'Tarikan ATM','2026-01-09'),
(1,16,'pengeluaran','kebutuhan',15000,'Transfer Vivian (balik)','2026-01-09'),
(1,1,'pengeluaran','kebutuhan',12000,'Warteg BAH','2026-01-09'),
(1,17,'pengeluaran','kebutuhan',17742,'ShopeePay Topup','2026-01-10'),
(1,2,'pengeluaran','kebutuhan',9000,'IDM Indoma','2026-01-10'),
(1,1,'pengeluaran','keinginan',29000,'Mako Cake','2026-01-10'),
(1,16,'pengeluaran','kebutuhan',30000,'Transfer Vivian (balik)','2026-01-11'),
(1,13,'pengeluaran','kebutuhan',15000,'ZC Petshop','2026-01-11'),
(1,16,'pengeluaran','kebutuhan',5000,'Transfer Yosef Ferdinan (patungan)','2026-01-12'),
(1,3,'pengeluaran','kebutuhan',20000,'Bensin SPBU 34-40','2026-01-12'),
(1,16,'pengeluaran','kebutuhan',5000,'Transfer Alfonso Carlos (patungan)','2026-01-13'),
(1,9,'pengeluaran','kebutuhan',23800,'OH SOME 23 (ATK Kuliah)','2026-01-13'),
(1,17,'pengeluaran','kebutuhan',17000,'GoPay Topup','2026-01-13'),
(1,16,'pengeluaran','kebutuhan',13000,'Transfer Reinhard (patungan)','2026-01-16'),
(1,16,'pengeluaran','kebutuhan',10000,'Transfer Vivian Estrellita','2026-01-16'),
(1,12,'pengeluaran','kebutuhan',10000,'Biaya Admin BCA','2026-01-16'),
(1,19,'pengeluaran','kebutuhan',50000,'Tarikan ATM','2026-01-17'),
(1,16,'pengeluaran','kebutuhan',17264,'Transfer Reinhard Efraim','2026-01-17'),
(1,17,'pengeluaran','kebutuhan',210000,'ShopeePay Topup','2026-01-18'),
(1,3,'pengeluaran','kebutuhan',28000,'Bensin SPBU 34.40','2026-01-18'),
(1,2,'pengeluaran','kebutuhan',17200,'IDM Indoma','2026-01-18'),
(1,8,'pengeluaran','kebutuhan',50000,'Laundry CO','2026-01-19'),
(1,1,'pengeluaran','kebutuhan',12000,'Warteg BAH','2026-01-19'),
(1,1,'pengeluaran','keinginan',49500,'PB Astana (QRIS)','2026-01-19'),
(1,1,'pengeluaran','keinginan',49500,'PB Jalan A (Kartu Debit)','2026-01-19'),
(1,16,'pengeluaran','kebutuhan',16500,'Transfer Vivian Estrellita','2026-01-20'),
(1,1,'pengeluaran','keinginan',45000,'Angkringan','2026-01-20'),
(1,1,'pengeluaran','keinginan',33000,'Martabak B','2026-01-20'),
(1,17,'pengeluaran','kebutuhan',15000,'GoPay Topup','2026-01-21'),
(1,16,'pengeluaran','kebutuhan',18300,'Transfer Reinhard Efraim','2026-01-22'),
(1,17,'pengeluaran','kebutuhan',10000,'ShopeePay Topup','2026-01-22'),
(1,16,'pengeluaran','kebutuhan',15000,'QRIS Asyah Rumita','2026-01-22'),
(1,2,'pengeluaran','kebutuhan',6000,'IDM Indoma','2026-01-23'),
(1,16,'pengeluaran','kebutuhan',29000,'Transfer Reinhard Efraim (balik)','2026-01-24'),
(1,5,'pengeluaran','keinginan',20000,'Kebab Bossmar','2026-01-24'),
(1,2,'pengeluaran','kebutuhan',7700,'Alfamart','2026-01-24'),
(1,16,'pengeluaran','kebutuhan',11300,'Transfer Arneta Melga','2026-01-25'),
(1,16,'pengeluaran','kebutuhan',13000,'Transfer Matthew Edbert','2026-01-25'),
(1,1,'pengeluaran','keinginan',15700,'Wizzmie Resto','2026-01-25'),
(1,2,'pengeluaran','kebutuhan',8300,'IDM Indoma','2026-01-27'),
(1,16,'pengeluaran','kebutuhan',10000,'QRIS Desi Andriani','2026-01-27'),
(1,2,'pengeluaran','kebutuhan',7500,'IDM Indoma','2026-01-28'),
(1,2,'pengeluaran','kebutuhan',7600,'Alfamart','2026-01-28'),
(1,16,'pengeluaran','kebutuhan',150000,'Transfer Bryan Hoe','2026-01-28'),
(1,16,'pengeluaran','kebutuhan',50000,'Transfer Reinhard Efraim','2026-01-28'),
(1,16,'pengeluaran','kebutuhan',15000,'Transfer Christian Devinchi','2026-01-28'),
(1,1,'pengeluaran','keinginan',20000,'Warung Makan','2026-01-28'),
(1,17,'pengeluaran','kebutuhan',11000,'GoPay Topup','2026-01-28'),
(1,18,'pengeluaran','keinginan',59900,'A469 Azko','2026-01-28'),
(1,16,'pengeluaran','kebutuhan',17328,'Fliptech Lentera I','2026-01-29'),
(1,3,'pengeluaran','kebutuhan',30000,'Bensin SPBU 34.40','2026-01-29'),
(1,1,'pengeluaran','kebutuhan',9000,'Warteg BAH','2026-01-29'),
(1,1,'pengeluaran','keinginan',56500,'ESB Restaurant','2026-01-29'),
(1,16,'pengeluaran','kebutuhan',15000,'Transfer Vivian Estrellita','2026-01-30'),
(1,16,'pengeluaran','kebutuhan',210000,'Transfer Vivian Estrellita','2026-01-30'),
(1,6,'pengeluaran','kebutuhan',202476,'SpayLater (Shopee)','2026-01-30'),
(1,16,'pengeluaran','kebutuhan',300000,'Transfer Aaron (sendiri/tabungan)','2026-01-30'),
(1,17,'pengeluaran','kebutuhan',20000,'GoPay Topup','2026-01-30'),
(1,1,'pengeluaran','keinginan',77000,'Spill And... (Resto)','2026-01-31'),
(1,16,'pengeluaran','kebutuhan',5000,'Transfer Vivian Estrellita','2026-01-31'),
(1,16,'pengeluaran','kebutuhan',6454,'Transfer Vivian Estrellita','2026-01-31'),
(1,9,'pengeluaran','kebutuhan',99900,'M&G Life (Asuransi)','2026-01-31'),
(1,5,'pengeluaran','keinginan',20000,'Kebab Bossmar','2026-01-31'),
(1,18,'pengeluaran','kebutuhan',167000,'Megatech Store','2026-01-31'),
(1,18,'pengeluaran','kebutuhan',58000,'Mako Istana BEC (Kartu Debit)','2026-01-31'),

-- ═══════════════════════════════════════════════════════════
-- FEBRUARI 2026 — PEMASUKAN (CR) Total: 10.276.303
-- ═══════════════════════════════════════════════════════════
(1,22,'pemasukan',NULL,15000,'Transfer Vivian Estrellita (kebab)','2026-02-01'),
(1,22,'pemasukan',NULL,16667,'Transfer Vanessa Cecilia','2026-02-01'),
(1,22,'pemasukan',NULL,19600,'Transfer Vivian Estrellita','2026-02-01'),
(1,22,'pemasukan',NULL,16000,'Transfer Vivian Estrellita','2026-02-01'),
(1,22,'pemasukan',NULL,16000,'Transfer Fincent Cruisetio','2026-02-01'),
(1,22,'pemasukan',NULL,16000,'Transfer Jane Lunetta (hadiah)','2026-02-01'),
(1,22,'pemasukan',NULL,16000,'Transfer Aireen Lee','2026-02-01'),
(1,21,'pemasukan',NULL,1200000,'WD BCA Aaron Austen (Dedy)','2026-02-02'),
(1,22,'pemasukan',NULL,19500,'Transfer Jovanka Natasha (ultah Devin)','2026-02-02'),
(1,22,'pemasukan',NULL,19500,'Transfer Julius Poerwanto (ultah Devin)','2026-02-02'),
(1,22,'pemasukan',NULL,19500,'Transfer Meinhard Christian','2026-02-02'),
(1,22,'pemasukan',NULL,19500,'Transfer Bryan Hoe (ultah Devin)','2026-02-02'),
(1,21,'pemasukan',NULL,75000,'WD BCA (Tabungan Aaron)','2026-02-03'),
(1,21,'pemasukan',NULL,500000,'Transfer Dedy Hermanto','2026-02-04'),
(1,22,'pemasukan',NULL,50000,'Transfer Vivian Estrellita','2026-02-04'),
(1,21,'pemasukan',NULL,20000,'WD BCA (Tabungan Aaron)','2026-02-04'),
(1,22,'pemasukan',NULL,30000,'Transfer Vivian Estrellita','2026-02-04'),
(1,22,'pemasukan',NULL,30000,'Transfer Vivian Estrellita','2026-02-04'),
(1,21,'pemasukan',NULL,3850000,'Transfer Dedy Hermanto (besar/UKT)','2026-02-04'),
(1,22,'pemasukan',NULL,20000,'Transfer Winsen Tanjaya','2026-02-04'),
(1,22,'pemasukan',NULL,19500,'Transfer Cheryl Anggel (ultah Devin)','2026-02-04'),
(1,22,'pemasukan',NULL,30000,'Transfer Vivian Estrellita','2026-02-05'),
(1,22,'pemasukan',NULL,72000,'Transfer Carroll Jonathan','2026-02-05'),
(1,22,'pemasukan',NULL,17000,'Transfer Winsen Tanjaya','2026-02-05'),
(1,22,'pemasukan',NULL,16000,'Transfer Michael Alexander','2026-02-05'),
(1,21,'pemasukan',NULL,20000,'WD BCA (Tabungan Aaron)','2026-02-05'),
(1,22,'pemasukan',NULL,19500,'Transfer Astri Dewi (kado Devin)','2026-02-06'),
(1,21,'pemasukan',NULL,10000,'WD BCA (Tabungan Aaron)','2026-02-06'),
(1,22,'pemasukan',NULL,52000,'Transfer Alfonso Carlos','2026-02-06'),
(1,21,'pemasukan',NULL,90000,'WD BCA (Tabungan Aaron)','2026-02-07'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-02-07'),
(1,21,'pemasukan',NULL,35000,'WD BCA (Tabungan Aaron)','2026-02-08'),
(1,21,'pemasukan',NULL,55000,'WD BCA (Tabungan Aaron)','2026-02-08'),
(1,22,'pemasukan',NULL,16500,'Transfer Jane Lunetta','2026-02-09'),
(1,22,'pemasukan',NULL,17000,'Transfer Christoper Justino','2026-02-09'),
(1,22,'pemasukan',NULL,8000,'GoPay Bank Transfer','2026-02-10'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-02-10'),
(1,21,'pemasukan',NULL,150000,'WD BCA (Tabungan Aaron)','2026-02-11'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-02-12'),
(1,21,'pemasukan',NULL,20000,'WD BCA (Tabungan Aaron)','2026-02-12'),
(1,21,'pemasukan',NULL,80000,'WD BCA (Tabungan Aaron)','2026-02-13'),
(1,21,'pemasukan',NULL,500000,'Transfer Dedy Hermanto','2026-02-15'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-02-17'),
(1,22,'pemasukan',NULL,50000,'Transfer Tjendekiawanita','2026-02-17'),
(1,21,'pemasukan',NULL,230000,'Transfer Dedy Hermanto','2026-02-17'),
(1,21,'pemasukan',NULL,300000,'WD BCA (Tabungan Aaron)','2026-02-18'),
(1,23,'pemasukan',NULL,49500,'KR Otomatis QRIS (Refund)','2026-02-18'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-02-19'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-02-21'),
(1,22,'pemasukan',NULL,20000,'Transfer Vivian Estrellita','2026-02-21'),
(1,21,'pemasukan',NULL,20000,'WD BCA (Tabungan Aaron)','2026-02-22'),
(1,21,'pemasukan',NULL,15000,'WD BCA (Tabungan Aaron)','2026-02-23'),
(1,22,'pemasukan',NULL,13500,'Transfer Witson Leviyanto','2026-02-23'),
(1,21,'pemasukan',NULL,95000,'WD BCA (Tabungan Aaron)','2026-02-24'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-02-25'),
(1,21,'pemasukan',NULL,502536,'WD BCA (Tabungan Aaron)','2026-02-26'),
(1,21,'pemasukan',NULL,50000,'WD BCA (Tabungan Aaron)','2026-02-26'),
(1,22,'pemasukan',NULL,70000,'Transfer Vivian Estrellita','2026-02-26'),
(1,22,'pemasukan',NULL,15000,'Transfer Vivian Estrellita','2026-02-28'),
(1,21,'pemasukan',NULL,1300000,'Transfer Dedy Hermanto','2026-02-28'),

-- ═══════════════════════════════════════════════════════════
-- FEBRUARI 2026 — PENGELUARAN (DB) Total: 11.346.403
-- ═══════════════════════════════════════════════════════════
(1,16,'pengeluaran','kebutuhan',15100,'Transfer Vivian Estrellita (balik)','2026-02-01'),
(1,2,'pengeluaran','kebutuhan',7300,'IDM Indoma (QRIS)','2026-02-01'),
(1,16,'pengeluaran','kebutuhan',1200000,'Transfer Aaron (sendiri/tabungan)','2026-02-01'),
(1,16,'pengeluaran','kebutuhan',1200000,'Transfer Yanto Anjar Sugiar','2026-02-02'),
(1,1,'pengeluaran','keinginan',45000,'Angkringan (QRIS)','2026-02-03'),
(1,9,'pengeluaran','kebutuhan',250405,'Fliptech Lentera (UKT Kuliah)','2026-02-03'),
(1,1,'pengeluaran','kebutuhan',9000,'Warteg BAH','2026-02-04'),
(1,19,'pengeluaran','kebutuhan',50000,'Tarikan ATM','2026-02-04'),
(1,2,'pengeluaran','kebutuhan',10100,'Alfamart','2026-02-04'),
(1,16,'pengeluaran','kebutuhan',30000,'Transfer Vivian Estrellita','2026-02-04'),
(1,16,'pengeluaran','kebutuhan',20000,'Transfer Aaron (sendiri)','2026-02-04'),
(1,16,'pengeluaran','kebutuhan',30000,'Transfer Vivian Estrellita','2026-02-04'),
(1,16,'pengeluaran','kebutuhan',30000,'Transfer Vivian Estrellita','2026-02-04'),
(1,9,'pengeluaran','kebutuhan',3850000,'ITKM Tuition (Uang Kuliah)','2026-02-04'),
(1,19,'pengeluaran','kebutuhan',50000,'Tarikan ATM','2026-02-05'),
(1,6,'pengeluaran','kebutuhan',72200,'Shopee (72.200)','2026-02-05'),
(1,6,'pengeluaran','kebutuhan',52600,'Shopee (52.600)','2026-02-05'),
(1,16,'pengeluaran','kebutuhan',20000,'Transfer Aaron (sendiri)','2026-02-06'),
(1,1,'pengeluaran','kebutuhan',8000,'Warteg BAH','2026-02-06'),
(1,16,'pengeluaran','kebutuhan',25000,'Transfer Matthew Edbert','2026-02-07'),
(1,6,'pengeluaran','kebutuhan',110654,'Shopee (110.654)','2026-02-07'),
(1,1,'pengeluaran','keinginan',16000,'Erni Sawar (QRIS)','2026-02-07'),
(1,16,'pengeluaran','kebutuhan',3000,'QRIS Michael Christiadi','2026-02-07'),
(1,16,'pengeluaran','kebutuhan',40000,'Transfer Aaron (sendiri)','2026-02-07'),
(1,16,'pengeluaran','kebutuhan',22000,'Transfer Vivian Estrellita','2026-02-08'),
(1,1,'pengeluaran','keinginan',7500,'Erni Sawar (QRIS)','2026-02-08'),
(1,11,'pengeluaran','keinginan',50000,'Captain Bandung (Kartu Debit)','2026-02-08'),
(1,16,'pengeluaran','kebutuhan',10000,'Transfer Reinhard Efraim','2026-02-09'),
(1,16,'pengeluaran','kebutuhan',25000,'Transfer Reinhard Efraim','2026-02-10'),
(1,16,'pengeluaran','kebutuhan',8000,'Transfer Albertus Januario','2026-02-10'),
(1,16,'pengeluaran','kebutuhan',39000,'Transfer Reinhard Efraim','2026-02-11'),
(1,8,'pengeluaran','kebutuhan',60000,'Laundry CO','2026-02-12'),
(1,1,'pengeluaran','keinginan',17000,'RM Ajo Pariaman (QRIS)','2026-02-12'),
(1,16,'pengeluaran','kebutuhan',5000,'Transfer Reinhard Efraim','2026-02-12'),
(1,16,'pengeluaran','kebutuhan',152000,'Transfer Jeremy Axel','2026-02-12'),
(1,1,'pengeluaran','keinginan',30000,'Angkringan (QRIS)','2026-02-13'),
(1,19,'pengeluaran','kebutuhan',50000,'Tarikan ATM','2026-02-13'),
(1,1,'pengeluaran','kebutuhan',6000,'Rumah Makan (QRIS)','2026-02-13'),
(1,3,'pengeluaran','kebutuhan',30000,'Bensin SPBU 34.40','2026-02-15'),
(1,16,'pengeluaran','kebutuhan',450000,'Transfer Aaron (sendiri)','2026-02-15'),
(1,1,'pengeluaran','keinginan',18000,'RM Jaso M (QRIS)','2026-02-16'),
(1,19,'pengeluaran','kebutuhan',50000,'Tarikan ATM','2026-02-17'),
(1,16,'pengeluaran','kebutuhan',250000,'Transfer Aaron (sendiri)','2026-02-17'),
(1,20,'pengeluaran','kebutuhan',302500,'Pegadaian (cicilan/tebus)','2026-02-18'),
(1,1,'pengeluaran','keinginan',13300,'Maple Board (QRIS)','2026-02-18'),
(1,16,'pengeluaran','kebutuhan',50000,'Transfer Aaron (sendiri)','2026-02-19'),
(1,1,'pengeluaran','kebutuhan',5000,'Warteg BAH','2026-02-19'),
(1,1,'pengeluaran','keinginan',45000,'Angkringan (QRIS)','2026-02-19'),
(1,12,'pengeluaran','kebutuhan',10000,'Biaya Admin BCA','2026-02-20'),
(1,1,'pengeluaran','kebutuhan',12000,'Warteg BAH','2026-02-21'),
(1,1,'pengeluaran','keinginan',5500,'Erni Sawar (QRIS)','2026-02-21'),
(1,16,'pengeluaran','kebutuhan',5000,'Transfer Vivian Estrellita','2026-02-21'),
(1,16,'pengeluaran','kebutuhan',3000,'Transfer Astri Dewi Annisa','2026-02-21'),
(1,1,'pengeluaran','keinginan',13000,'RM Jaso M (QRIS)','2026-02-21'),
(1,1,'pengeluaran','keinginan',50500,'QPON Angkringan','2026-02-22'),
(1,1,'pengeluaran','keinginan',5000,'Nasi Kuning','2026-02-22'),
(1,16,'pengeluaran','kebutuhan',30000,'Transfer Aaron (sendiri)','2026-02-23'),
(1,9,'pengeluaran','kebutuhan',42000,'MyTelkomsel (Pulsa/Kuota)','2026-02-24'),
(1,2,'pengeluaran','kebutuhan',35400,'MIDI Regular','2026-02-24'),
(1,1,'pengeluaran','keinginan',5000,'Gorengan (QRIS)','2026-02-24'),
(1,1,'pengeluaran','kebutuhan',11000,'Warteg BAH','2026-02-24'),
(1,19,'pengeluaran','kebutuhan',50000,'Tarikan ATM','2026-02-25'),
(1,20,'pengeluaran','kebutuhan',402500,'Pegadaian (cicilan/tebus)','2026-02-26'),
(1,1,'pengeluaran','keinginan',112700,'Arturo Coffee (Kartu Debit)','2026-02-26'),
(1,16,'pengeluaran','kebutuhan',9144,'Transfer Vivian Estrellita','2026-02-26'),
(1,16,'pengeluaran','kebutuhan',15000,'Transfer Vivian Estrellita','2026-02-28'),
(1,6,'pengeluaran','kebutuhan',1215000,'BCA VA / Shopee (1.215.000)','2026-02-28'),

-- ═══════════════════════════════════════════════════════════
-- MARET 2026 s/d tgl 3
-- ═══════════════════════════════════════════════════════════
(1,22,'pemasukan',NULL,120000,'Transfer Jesslyn Susanto','2026-03-01'),
(1,22,'pemasukan',NULL,15000,'Transfer Vivian Estrellita (Gojek)','2026-03-01'),
(1,19,'pengeluaran','kebutuhan',50000,'Tarikan ATM','2026-03-01'),
(1,19,'pengeluaran','kebutuhan',50000,'Tarikan ATM','2026-03-01'),
(1,17,'pengeluaran','kebutuhan',80000,'ShopeePay Topup','2026-03-01'),
(1,2,'pengeluaran','kebutuhan',4100,'IDM Trab Holis (Kartu Debit)','2026-03-03');

CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id),
    amount DECIMAL(15,2) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    UNIQUE(category_id, month, year)
);

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    emoji VARCHAR(10) DEFAULT '📝',
    color VARCHAR(20) DEFAULT '#ffd1dc',
    created_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO notes (title, content, emoji, color) VALUES
('Target Keuangan 2026 🎯','Tabung minimal 200/bulan, kurangi jajan, investasi rutin setiap bulan!','🎯','#a8d8ea'),
('Reminder Perpuluhan 💝','Bayar perpuluhan setiap awal bulan. Tuhan memberkati! 🙏','💝','#ffd1dc');

CREATE TABLE IF NOT EXISTS market_prices (
    id SERIAL PRIMARY KEY,
    asset_type VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(15,4) NOT NULL,
    unit VARCHAR(30),
    fetched_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO market_prices (asset_type, price_per_unit, unit) VALUES
('emas_per_gram', 1650000, 'IDR per gram'),
('reksadana_multiplier', 1.065, 'annual return rate');

CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_txn_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_txn_my ON transactions(month, year);

SELECT '🎀 Aaron Finance DB siap dipakai! Data lengkap Jan-Mar 2026' as status;
