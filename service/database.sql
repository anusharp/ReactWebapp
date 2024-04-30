CREATE TABLE holiday (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(255),
    description TEXT
);

-- Create the 'location' table
CREATE TABLE location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    province VARCHAR(255),
    description TEXT
);

-- Create the 'photos' table
CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255) NOT NULL,
    location_id INT,
    holiday_id INT,
    description TEXT,
    FOREIGN KEY (location_id) REFERENCES location(id),
    FOREIGN KEY (holiday_id) REFERENCES holiday(id)
);
