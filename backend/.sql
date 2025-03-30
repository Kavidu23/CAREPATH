CREATE DATABASE MedicalSystem;
USE MedicalSystem;

-- Patient Table
CREATE TABLE Patient (
    Pid INT AUTO_INCREMENT PRIMARY KEY,
    Fname VARCHAR(50),
    Lname VARCHAR(50),
    Pnumber VARCHAR(15) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(255),
    Image VARCHAR(255),
    Location TEXT,
    Status boolean,
    Gender ENUM('Male', 'Female', 'Other')
);

-- Patient Details
CREATE TABLE Patient_Details (
    Pid INT PRIMARY KEY,
    Birthdate DATE,
    FOREIGN KEY (Pid) REFERENCES Patient(Pid) ON DELETE CASCADE
);

-- Doctor Table
CREATE TABLE Doctor (
    Did INT AUTO_INCREMENT PRIMARY KEY,
    Fname VARCHAR(50),
    Lname VARCHAR(50),
    Pnumber VARCHAR(15) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(255),
    Gender ENUM('Male', 'Female', 'Other'),
    ConsultationType VARCHAR(100),
    ConsultationFee DECIMAL(10,2),
    Availability TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Image VARCHAR(255),
    YearExperience INT,
    Ststus boolean,
    Location VARCHAR(200)
);

-- Doctor Degrees
CREATE TABLE Doctor_Degree (
    Did INT,
    Degree VARCHAR(255),
    PRIMARY KEY (Did, Degree),
    FOREIGN KEY (Did) REFERENCES Doctor(Did) ON DELETE CASCADE
);

-- Doctor Specialization
CREATE TABLE Doctor_Specialization (
    Did INT,
    Specialization VARCHAR(255),
    PRIMARY KEY (Did, Specialization),
    FOREIGN KEY (Did) REFERENCES Doctor(Did) ON DELETE CASCADE
);

-- Hospital Table
CREATE TABLE Hospital (
    HospitalId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Location TEXT
);

-- Doctor-Hospital Relationship
CREATE TABLE Doctor_Hospital (
    Did INT,
    HospitalId INT,
    PRIMARY KEY (Did, HospitalId),
    FOREIGN KEY (Did) REFERENCES Doctor(Did) ON DELETE CASCADE,
    FOREIGN KEY (HospitalId) REFERENCES Hospital(HospitalId) ON DELETE CASCADE
);

-- Appointment Table
CREATE TABLE Appointment (
    Aid INT AUTO_INCREMENT PRIMARY KEY,
    Pid INT,
    Did INT,
    Date DATE,
    Time TIME,
    Type VARCHAR(50),
    FOREIGN KEY (Pid) REFERENCES Patient(Pid) ON DELETE CASCADE,
    FOREIGN KEY (Did) REFERENCES Doctor(Did) ON DELETE CASCADE
);

-- Prescription Table
CREATE TABLE Prescription (
    Rid INT AUTO_INCREMENT PRIMARY KEY,
    Pid INT,
    Did INT,
    Duration VARCHAR(50),
    Frequency VARCHAR(50),
    Description TEXT,
    FOREIGN KEY (Pid) REFERENCES Patient(Pid) ON DELETE CASCADE,
    FOREIGN KEY (Did) REFERENCES Doctor(Did) ON DELETE CASCADE
);

-- Medicine Table
CREATE TABLE Medicine (
    Mid INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Type VARCHAR(100),
    Manufacturer VARCHAR(255)
);

-- Prescription-Medicine Relationship
CREATE TABLE Prescription_Medicine (
    Rid INT,
    Mid INT,
    Dosage VARCHAR(100),
    PRIMARY KEY (Rid, Mid),
    FOREIGN KEY (Rid) REFERENCES Prescription(Rid) ON DELETE CASCADE,
    FOREIGN KEY (Mid) REFERENCES Medicine(Mid) ON DELETE CASCADE
);

-- Medical Record Table
CREATE TABLE Record (
    Rid INT AUTO_INCREMENT PRIMARY KEY,
    Pid INT,
    Diagnosis TEXT,
    BloodType VARCHAR(5),
    MedicalHistory TEXT,
    Allergies TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Pid) REFERENCES Patient(Pid) ON DELETE CASCADE
);

-- Invoice Table
CREATE TABLE Invoice (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Pid INT,
    TotalAmount DECIMAL(10,2),
    Discount DECIMAL(10,2),
    FinalAmount DECIMAL(10,2),
    PaymentMethod VARCHAR(50),
    IssuedDate DATE,
    PaymentStatus VARCHAR(50),
    FOREIGN KEY (Pid) REFERENCES Patient(Pid) ON DELETE CASCADE
);

-- Clinic Table
CREATE TABLE Clinic (
    Cid INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Location TEXT,
    Email VARCHAR(100) UNIQUE,
    Pnumber VARCHAR(15) UNIQUE
);

-- Feedback Table
CREATE TABLE Feedback (
    Fid INT AUTO_INCREMENT PRIMARY KEY,
    Pid INT,
    Message TEXT,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Date DATE,
    FOREIGN KEY (Pid) REFERENCES Patient(Pid) ON DELETE CASCADE
);

-- Web Admin Table
CREATE TABLE WebAdmin (
    Username VARCHAR(50) PRIMARY KEY,
    Password VARCHAR(255)
);

-- Clinic Admin Table
CREATE TABLE ClinicAdmin (
    Username VARCHAR(50) PRIMARY KEY,
    Password VARCHAR(255),
    Email VARCHAR(100) UNIQUE
);

-- Medicine Supplier Table
CREATE TABLE MedicineSupplier (
    MsId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Location TEXT,
    Description TEXT,
    WLink VARCHAR(255)
);

-- HomeCare Table
CREATE TABLE HomeCare (
    Hid INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Location TEXT,
    Description TEXT
);

-- Accounts Table
CREATE TABLE Accounts (
    Aid INT AUTO_INCREMENT PRIMARY KEY,
    BankName VARCHAR(255),
    BNumber VARCHAR(50),
    Location TEXT,
    Total DECIMAL(15,2)
);


CREATE TABLE clinic_doctor (
    CCid int PRIMARY key AUTO_INCREMENT,
    Cid INT REFERENCES clinic(Cid) ON DELETE CASCADE,
    Did INT REFERENCES doctor(Did) ON DELETE CASCADE,
);


CREATE TABLE PasswordReset (
    Email VARCHAR(255) PRIMARY KEY,
    Token VARCHAR(64) NOT NULL,
    Expiry DATETIME NOT NULL
);
