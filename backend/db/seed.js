require('dotenv').config();
const mysql = require('mysql2/promise');

const seedDatabase = async () => {
  let connection;
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Create initial connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Create database using query instead of execute
    console.log('[DB] Creating database farmtrack...');
    await connection.query('CREATE DATABASE IF NOT EXISTS farmtrack');
    
    // Connect to the new database
    console.log('[DB] Connecting to farmtrack database...');
    await connection.changeUser({ database: 'farmtrack' });

    // Drop existing tables to start fresh
    console.log('[DB] Dropping existing tables...');
    const tables = [
      'alerts',
      'treatments',
      'medicines',
      'animals',
      'farms',
      'users',
    ];
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }

    // Create users table
    console.log('[DB] Creating users table...');
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        role ENUM('vet', 'farmer', 'authority') NOT NULL,
        language VARCHAR(20) DEFAULT 'en',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create farms table
    console.log('[DB] Creating farms table...');
    await connection.query(`
      CREATE TABLE farms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        farmer_id INT,
        vet_id INT,
        latitude DECIMAL(10,7),
        longitude DECIMAL(10,7),
        soil_type ENUM('clay', 'loam', 'sandy') DEFAULT 'loam',
        slope ENUM('flat', 'moderate', 'steep') DEFAULT 'flat',
        manure_storage ENUM('covered', 'open') DEFAULT 'open',
        district VARCHAR(100),
        country VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farmer_id) REFERENCES users(id),
        FOREIGN KEY (vet_id) REFERENCES users(id)
      )
    `);

    // Create animals table
    console.log('[DB] Creating animals table...');
    await connection.query(`
      CREATE TABLE animals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farm_id INT NOT NULL,
        tag_id VARCHAR(50),
        species ENUM('cattle','poultry','goat','swine','other'),
        breed VARCHAR(100),
        age_months INT,
        weight_kg DECIMAL(6,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farm_id) REFERENCES farms(id)
      )
    `);

    // Create medicines table
    console.log('[DB] Creating medicines table...');
    await connection.query(`
      CREATE TABLE medicines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        antibiotic_class VARCHAR(100),
        withdrawal_days_milk INT DEFAULT 0,
        withdrawal_days_meat INT DEFAULT 0,
        environmental_risk ENUM('low','medium','high') DEFAULT 'medium',
        leaching_risk ENUM('low','medium','high') DEFAULT 'medium'
      )
    `);

    // Create treatments table
    console.log('[DB] Creating treatments table...');
    await connection.query(`
      CREATE TABLE treatments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farm_id INT NOT NULL,
        animal_id INT,
        vet_id INT NOT NULL,
        medicine_id INT NOT NULL,
        dosage VARCHAR(100),
        route ENUM('oral','injection','topical','other'),
        duration_days INT,
        treatment_date DATE NOT NULL,
        withdrawal_end_date DATE,
        notes TEXT,
        runoff_risk_score DECIMAL(4,2),
        status ENUM('active','completed','flagged') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farm_id) REFERENCES farms(id),
        FOREIGN KEY (vet_id) REFERENCES users(id),
        FOREIGN KEY (medicine_id) REFERENCES medicines(id)
      )
    `);

    // Create alerts table
    console.log('[DB] Creating alerts table...');
    await connection.query(`
      CREATE TABLE alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farm_id INT NOT NULL,
        treatment_id INT,
        type ENUM('runoff_risk','withdrawal_reminder','weather_warning','general'),
        message TEXT,
        severity ENUM('low','medium','high','critical'),
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farm_id) REFERENCES farms(id)
      )
    `);

    // Insert users
    console.log('[DATA] Inserting users...');
    await connection.query(
      `INSERT INTO users (name, email, role) VALUES
        ('Dr. Arjun Sharma', 'vet@farmtrack.com', 'vet'),
        ('Ramu Patil', 'farmer1@farmtrack.com', 'farmer'),
        ('Nguyen Van A', 'farmer2@farmtrack.com', 'farmer'),
        ('Authority Admin', 'authority@farmtrack.com', 'authority')`
    );

    // Insert farms
    console.log('[DATA] Inserting farms...');
    await connection.query(
      `INSERT INTO farms (name, farmer_id, vet_id, latitude, longitude, soil_type, slope, manure_storage, district, country) VALUES
        ('Green Valley Farm', 2, 1, 18.5204, 73.8567, 'loam', 'moderate', 'open', 'Pune', 'India'),
        ('Mekong Livestock Farm', 3, 1, 10.5278, 105.1256, 'clay', 'flat', 'covered', 'An Giang', 'Vietnam')`
    );

    // Insert animals
    console.log('[DATA] Inserting animals...');
    await connection.query(
      `INSERT INTO animals (farm_id, tag_id, species, breed, age_months, weight_kg) VALUES
        (1, 'GVF-001', 'cattle', 'Holstein', 36, 450.5),
        (1, 'GVF-002', 'cattle', 'Holstein', 48, 480.0),
        (1, 'GVF-003', 'poultry', 'Broiler', 3, 2.5),
        (1, 'GVF-004', 'goat', 'Boer', 24, 35.0),
        (1, 'GVF-005', 'cattle', 'Jersey', 60, 400.0),
        (2, 'MLF-001', 'swine', 'Duroc', 12, 85.0),
        (2, 'MLF-002', 'cattle', 'Brahman', 30, 380.0),
        (2, 'MLF-003', 'poultry', 'Layer', 8, 1.8),
        (2, 'MLF-004', 'goat', 'Kiko', 18, 28.5),
        (2, 'MLF-005', 'swine', 'Landrace', 10, 75.0)`
    );

    // Insert medicines
    console.log('[DATA] Inserting medicines...');
    await connection.query(
      `INSERT INTO medicines (name, antibiotic_class, withdrawal_days_milk, withdrawal_days_meat, environmental_risk, leaching_risk) VALUES
        ('Oxytetracycline', 'Tetracycline', 7, 22, 'high', 'low'),
        ('Amoxicillin', 'Penicillin', 4, 10, 'medium', 'medium'),
        ('Enrofloxacin', 'Fluoroquinolone', 0, 14, 'high', 'high'),
        ('Sulfadiazine', 'Sulfonamide', 10, 28, 'high', 'high'),
        ('Tylosin', 'Macrolide', 2, 21, 'medium', 'medium'),
        ('Gentamicin', 'Aminoglycoside', 72, 18, 'low', 'low'),
        ('Penicillin G', 'Penicillin', 4, 10, 'low', 'low'),
        ('Doxycycline', 'Tetracycline', 0, 28, 'high', 'low'),
        ('Streptomycin', 'Aminoglycoside', 72, 30, 'medium', 'low'),
        ('Chlortetracycline', 'Tetracycline', 10, 28, 'high', 'low')`
    );

    // Insert treatments
    console.log('[DATA] Inserting treatments...');
    await connection.query(
      `INSERT INTO treatments (farm_id, animal_id, vet_id, medicine_id, dosage, route, duration_days, treatment_date, withdrawal_end_date, runoff_risk_score, status, notes) VALUES
        (1, 1, 1, 1, '10mg/kg', 'injection', 5, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 19 DAY), 8.2, 'active', 'Respiratory infection'),
        (1, 2, 1, 2, '15mg/kg', 'oral', 7, DATE_SUB(CURDATE(), INTERVAL 10 DAY), CURDATE(), 4.5, 'active', 'Routine treatment'),
        (2, 6, 1, 4, '20mg/kg', 'oral', 5, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 26 DAY), 7.8, 'active', 'Bacterial infection'),
        (1, 3, 1, 5, '5mg/kg', 'injection', 3, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 9 DAY), 3.2, 'completed', 'Routine'),
        (2, 7, 1, 3, '8mg/kg', 'injection', 4, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), 6.1, 'active', 'Wound infection')`
    );

    // Insert alerts
    console.log('[DATA] Inserting alerts...');
    await connection.query(
      `INSERT INTO alerts (farm_id, treatment_id, type, message, severity, is_read) VALUES
        (1, 1, 'runoff_risk', 'High runoff risk detected at Green Valley Farm. Risk Score: 8.2/10. Heavy rain forecast in 48 hours. Keep treated livestock in covered area and secure manure storage immediately.', 'critical', FALSE),
        (2, 3, 'runoff_risk', 'High runoff risk detected at Mekong Livestock Farm. Risk Score: 7.8/10. Rain expected. Secure open fields and cover manure storage.', 'high', FALSE),
        (1, 2, 'withdrawal_reminder', 'Withdrawal period ending in 0 days for GVF-002 (Amoxicillin). Clear for milk and meat production.', 'medium', TRUE),
        (2, 5, 'weather_warning', 'Moderate runoff risk at Mekong Farm. Risk Score: 6.1/10. Monitor weather conditions closely.', 'medium', FALSE)`
    );

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Tables created:');
    console.log('   - users (4 records)');
    console.log('   - farms (2 records)');
    console.log('   - animals (10 records)');
    console.log('   - medicines (10 records)');
    console.log('   - treatments (5 records)');
    console.log('   - alerts (4 records)\n');

    await connection.end();
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
