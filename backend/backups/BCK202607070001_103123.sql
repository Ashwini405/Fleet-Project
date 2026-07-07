-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: mysql-4641f39-panianu8-632.l.aivencloud.com    Database: fleet_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '278dfcc8-6b29-11f1-af92-d253d948684f:1-498,
7df4bda9-bed2-11f0-9fb5-3604dca5e753:1-27,
92d2947f-3715-11f1-8f7a-7a261c903600:1-32,
95428964-20fd-11f1-ba45-4ef9c31596a7:1-183,
9cc82329-37fc-11f1-88df-16ae26ae2505:1-1513';

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `module_name` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(100) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `performed_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module_name` (`module_name`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'User Management','CREATE','User ramu.kumar created successfully.',NULL,NULL,NULL,NULL,'Admin','2026-07-03 08:27:47'),(2,1,'User Management','UPDATE PERMISSIONS','User permissions updated.',NULL,NULL,NULL,NULL,'Admin','2026-07-03 09:03:44'),(3,1,'User Management','UPDATE PERMISSIONS','User permissions updated.',NULL,NULL,NULL,NULL,'Admin','2026-07-03 09:04:05'),(4,1,'User Management','UPDATE PERMISSIONS','User permissions updated.',NULL,NULL,NULL,NULL,'Admin','2026-07-03 09:08:35'),(5,1,'User Management','UPDATE PERMISSIONS','User permissions updated.',NULL,NULL,NULL,NULL,'Admin','2026-07-03 09:40:12'),(6,1,'User Management','UPDATE','User ramu.kumar updated successfully.',NULL,NULL,NULL,NULL,'Admin','2026-07-03 09:43:12');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_restore`
--

DROP TABLE IF EXISTS `backup_restore`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_restore` (
  `id` int NOT NULL AUTO_INCREMENT,
  `backup_code` varchar(30) NOT NULL,
  `backup_name` varchar(255) NOT NULL,
  `backup_type` enum('Manual','Automatic') NOT NULL,
  `backup_date` date NOT NULL,
  `backup_time` time NOT NULL,
  `backup_size` varchar(50) DEFAULT NULL,
  `backup_format` enum('SQL','ZIP') DEFAULT 'SQL',
  `storage_location` enum('Local','Cloud','Both') DEFAULT 'Local',
  `backup_path` text NOT NULL,
  `checksum` varchar(255) DEFAULT NULL,
  `status` enum('Running','Completed','Failed','Restored') DEFAULT 'Running',
  `created_by` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `backup_code` (`backup_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_restore`
--

LOCK TABLES `backup_restore` WRITE;
/*!40000 ALTER TABLE `backup_restore` DISABLE KEYS */;
/*!40000 ALTER TABLE `backup_restore` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_restore_logs`
--

DROP TABLE IF EXISTS `backup_restore_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_restore_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `backup_id` int NOT NULL,
  `activity_type` enum('Backup Created','Backup Downloaded','Backup Restored','Backup Deleted','Backup Failed','Backup Verified') NOT NULL,
  `description` text,
  `performed_by` varchar(100) DEFAULT NULL,
  `ip_address` varchar(100) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `status` enum('Completed','Failed') DEFAULT 'Completed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_backup_logs` (`backup_id`),
  CONSTRAINT `fk_backup_logs` FOREIGN KEY (`backup_id`) REFERENCES `backup_restore` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_restore_logs`
--

LOCK TABLES `backup_restore_logs` WRITE;
/*!40000 ALTER TABLE `backup_restore_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `backup_restore_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_restore_settings`
--

DROP TABLE IF EXISTS `backup_restore_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_restore_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `auto_backup` tinyint(1) DEFAULT '1',
  `frequency` enum('daily','weekly','monthly') DEFAULT 'daily',
  `backup_time` time DEFAULT '02:30:00',
  `retention_days` int DEFAULT '30',
  `storage` enum('local','cloud','both') DEFAULT 'local',
  `compression` tinyint(1) DEFAULT '1',
  `encryption` tinyint(1) DEFAULT '1',
  `backup_folder` varchar(500) DEFAULT NULL,
  `database_name` varchar(100) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_restore_settings`
--

LOCK TABLES `backup_restore_settings` WRITE;
/*!40000 ALTER TABLE `backup_restore_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `backup_restore_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batteries`
--

DROP TABLE IF EXISTS `batteries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batteries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `serial_number` varchar(100) NOT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `capacity_ah` decimal(8,2) DEFAULT NULL,
  `voltage` decimal(5,2) DEFAULT NULL,
  `battery_type` enum('Dry','Wet','Lithium','AGM','Gel') DEFAULT 'Dry',
  `purchase_date` date DEFAULT NULL,
  `warranty_period_months` int DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `vendor` varchar(150) DEFAULT NULL,
  `purchase_cost` decimal(10,2) DEFAULT '0.00',
  `status` enum('In Stock','Installed','Weak','Failed','Warranty Claim','Scrap','Return Vendor','Store') DEFAULT 'In Stock',
  `location` varchar(150) DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `compatible_vehicle_types` text,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `idx_status` (`status`),
  KEY `idx_vehicle` (`vehicle_id`),
  KEY `idx_warranty` (`warranty_expiry`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batteries`
--

LOCK TABLES `batteries` WRITE;
/*!40000 ALTER TABLE `batteries` DISABLE KEYS */;
INSERT INTO `batteries` VALUES (1,'sapd23234r',NULL,'asdfg','asdfg',150.00,12.00,'Wet','2026-05-13',23,'2028-04-13','asdf',1234567.00,'Failed','Workshop',NULL,'truck',NULL,'2026-05-20 06:19:06','2026-05-20 06:33:34'),(2,'asd2345frgh',NULL,'asdf','aasdf',127.00,12.00,'Wet','2026-05-20',23,'2028-04-20','asdf',23456.00,'Installed','Installed Vehicle',13,'asdfg',NULL,'2026-05-20 06:32:47','2026-05-20 06:33:35'),(3,'TRK-BAT-1001','TRKBATQR1001','Exide','Mileage HD 1500',150.00,12.00,'Dry','2026-05-21',24,'2028-05-21','Sai Truck Batteries',9000.00,'Installed','Installed Vehicle',23,'Truck',NULL,'2026-05-21 10:06:11','2026-05-21 10:06:39'),(4,'BAT-101',NULL,'Exide','Xpree',200.00,12.00,'Dry','2026-05-22',NULL,NULL,'prabu',8500.00,'Installed','Installed Vehicle',24,'Truck',NULL,'2026-05-22 10:40:45','2026-05-22 10:41:07'),(5,'EXHD24T15098471','EXD150HYD984712025','Exide','Xpress HD DIN150',150.00,12.00,'Dry','2026-05-22',24,'2028-05-22','Sri Balaji Truck Battery Distributors',18750.00,'In Stock','Hyderabad Central Fleet Workshop – Bay 3',NULL,'Heavy Truck',NULL,'2026-05-23 13:38:13','2026-05-23 13:38:13');
/*!40000 ALTER TABLE `batteries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `battery_history`
--

DROP TABLE IF EXISTS `battery_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battery_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `battery_id` int NOT NULL,
  `vehicle_id` int DEFAULT NULL,
  `event_type` enum('Installed','Removed','Status Changed','Warranty Claimed') NOT NULL,
  `event_date` date NOT NULL,
  `odometer` int DEFAULT '0',
  `technician` varchar(150) DEFAULT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `warranty_claim` tinyint(1) DEFAULT '0',
  `running_km` int DEFAULT '0',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_battery` (`battery_id`),
  KEY `idx_vehicle` (`vehicle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battery_history`
--

LOCK TABLES `battery_history` WRITE;
/*!40000 ALTER TABLE `battery_history` DISABLE KEYS */;
INSERT INTO `battery_history` VALUES (1,1,13,'Installed','2026-05-21',12345,'asd',NULL,0,0,'asdfbn','2026-05-20 06:19:44'),(2,1,13,'Removed','2026-05-20',12345,NULL,'qwer',0,0,NULL,'2026-05-20 06:33:34'),(3,2,13,'Installed','2026-05-20',12345,'wer',NULL,0,0,'Replacement','2026-05-20 06:33:35'),(4,3,23,'Installed','2026-05-21',760,'Raju',NULL,0,0,NULL,'2026-05-21 10:06:39'),(5,4,24,'Installed','2026-05-22',2000,'raghu',NULL,0,0,NULL,'2026-05-22 10:41:07');
/*!40000 ALTER TABLE `battery_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `battery_installations`
--

DROP TABLE IF EXISTS `battery_installations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battery_installations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `battery_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  `install_date` date NOT NULL,
  `install_odometer` int DEFAULT '0',
  `technician` varchar(150) DEFAULT NULL,
  `notes` text,
  `removed_date` date DEFAULT NULL,
  `removal_odometer` int DEFAULT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `warranty_claim` tinyint(1) DEFAULT '0',
  `old_battery_decision` enum('Scrap','Warranty Claim','Return Vendor','Store') DEFAULT 'Scrap',
  `running_km` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vehicle` (`vehicle_id`),
  KEY `idx_battery` (`battery_id`),
  KEY `idx_active` (`vehicle_id`,`removed_date`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battery_installations`
--

LOCK TABLES `battery_installations` WRITE;
/*!40000 ALTER TABLE `battery_installations` DISABLE KEYS */;
INSERT INTO `battery_installations` VALUES (1,1,13,'2026-05-21',12345,'asd','asdfbn','2026-05-20',12345,'qwer',0,'Store',0,'2026-05-20 06:19:44'),(2,2,13,'2026-05-20',12345,'wer','Replacement battery',NULL,NULL,NULL,0,'Scrap',0,'2026-05-20 06:33:35'),(3,3,23,'2026-05-21',760,'Raju',NULL,NULL,NULL,NULL,0,'Scrap',0,'2026-05-21 10:06:39'),(4,4,24,'2026-05-22',2000,'raghu',NULL,NULL,NULL,NULL,0,'Scrap',0,'2026-05-22 10:41:07');
/*!40000 ALTER TABLE `battery_installations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_profile`
--

DROP TABLE IF EXISTS `company_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_code` varchar(20) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `legal_name` varchar(255) DEFAULT NULL,
  `gst_number` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `cin_number` varchar(30) DEFAULT NULL,
  `industry_type` varchar(100) DEFAULT NULL,
  `company_status` enum('Active','Inactive','Suspended') DEFAULT 'Active',
  `website` varchar(255) DEFAULT NULL,
  `established_date` date DEFAULT NULL,
  `office_phone` varchar(30) DEFAULT NULL,
  `mobile_number` varchar(30) DEFAULT NULL,
  `primary_email` varchar(255) DEFAULT NULL,
  `support_email` varchar(255) DEFAULT NULL,
  `emergency_contact` varchar(30) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `maps_location` text,
  `financial_year` varchar(20) DEFAULT NULL,
  `currency` varchar(20) DEFAULT 'INR',
  `timezone` varchar(100) DEFAULT 'Asia/Kolkata',
  `date_format` varchar(50) DEFAULT 'DD-MMM-YYYY',
  `default_tax` decimal(5,2) DEFAULT '18.00',
  `invoice_prefix` varchar(20) DEFAULT NULL,
  `trip_prefix` varchar(20) DEFAULT NULL,
  `vehicle_prefix` varchar(20) DEFAULT NULL,
  `po_prefix` varchar(20) DEFAULT NULL,
  `settlement_prefix` varchar(20) DEFAULT NULL,
  `primary_color` varchar(20) DEFAULT NULL,
  `secondary_color` varchar(20) DEFAULT NULL,
  `report_header` text,
  `report_footer` text,
  `company_logo` varchar(500) DEFAULT NULL,
  `favicon_logo` varchar(500) DEFAULT NULL,
  `company_signature` varchar(500) DEFAULT NULL,
  `gst_certificate` varchar(500) DEFAULT NULL,
  `pan_card` varchar(500) DEFAULT NULL,
  `registration_certificate` varchar(500) DEFAULT NULL,
  `trade_license` varchar(500) DEFAULT NULL,
  `insurance_certificate` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_code` (`company_code`),
  UNIQUE KEY `gst_number` (`gst_number`),
  UNIQUE KEY `pan_number` (`pan_number`),
  UNIQUE KEY `cin_number` (`cin_number`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profile`
--

LOCK TABLES `company_profile` WRITE;
/*!40000 ALTER TABLE `company_profile` DISABLE KEYS */;
INSERT INTO `company_profile` VALUES (1,'COMP-0001','Fleet Management','Fleet','GST123456789','ABCED12345','U12345678990055','Logistics & Warehousing',NULL,'www.fleetlogistics.in','2026-07-02','7788997788','7755226633','admin@gmail.com','support@gmail.com','7755229966','12, Transport Nagar','Near NH-44 Highway','Bengaluru','Karnataka','India','500014',NULL,'2024-25',NULL,NULL,NULL,18.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Fleet Management','Thank you','1782970089017-668418151.png','1782968408359-566130597.png','1782968408359-944607757.png','1782970089019-908275255.pdf','1782970089056-988699763.pdf','1782970089081-865894053.pdf','1782970089109-60125492.pdf','1782970089120-636723810.pdf','2026-07-02 05:00:09','2026-07-02 05:28:09');
/*!40000 ALTER TABLE `company_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_settlements`
--

DROP TABLE IF EXISTS `driver_settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_settlements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `settlement_no` varchar(100) DEFAULT NULL,
  `plant_name` varchar(255) NOT NULL,
  `vehicle_id` int NOT NULL,
  `vehicle_no` varchar(100) NOT NULL,
  `driver_id` int NOT NULL,
  `driver_name` varchar(255) NOT NULL,
  `statement_month` varchar(20) NOT NULL,
  `fixed_salary` decimal(12,2) DEFAULT '0.00',
  `battha_rate` decimal(12,2) DEFAULT '0.00',
  `total_trips` int DEFAULT '0',
  `total_battha` decimal(12,2) DEFAULT '0.00',
  `total_earnings` decimal(12,2) DEFAULT '0.00',
  `loading_charges` decimal(12,2) DEFAULT '0.00',
  `unloading_charges` decimal(12,2) DEFAULT '0.00',
  `bonus` decimal(12,2) DEFAULT '0.00',
  `other_allowances` decimal(12,2) DEFAULT '0.00',
  `total_additions` decimal(12,2) DEFAULT '0.00',
  `driver_advance` decimal(12,2) DEFAULT '0.00',
  `penalty` decimal(12,2) DEFAULT '0.00',
  `penalty_reason` text,
  `other_deductions` decimal(12,2) DEFAULT '0.00',
  `other_deduction_reason` text,
  `total_deductions` decimal(12,2) DEFAULT '0.00',
  `net_payable` decimal(12,2) DEFAULT '0.00',
  `status` enum('Draft','Submitted','Approved','Rejected','Paid') DEFAULT 'Draft',
  `submitted_by` varchar(255) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `rejected_reason` text,
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settlement_no` (`settlement_no`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `driver_settlements_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `driver_settlements_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_settlements`
--

LOCK TABLES `driver_settlements` WRITE;
/*!40000 ALTER TABLE `driver_settlements` DISABLE KEYS */;
INSERT INTO `driver_settlements` VALUES (1,'','git hub',13,'AP 12 AP 6789',2,'yogi','2026-06',18000.00,300.00,1,300.00,18300.00,500.00,300.00,300.00,250.00,1350.00,5000.00,0.00,NULL,0.00,NULL,5000.00,14650.00,'Paid',NULL,NULL,'2026-06-24',NULL,NULL,NULL,'2026-06-24','Good','2026-06-24 05:08:04','2026-06-24 06:12:59'),(3,'SET-2026-002','HyderabadHUB',20,'TG 12 AP 1234',2,'yogi','2026-06',18000.00,300.00,1,300.00,18300.00,3000.00,1000.00,500.00,200.00,4700.00,5000.00,0.00,NULL,0.00,NULL,5000.00,18000.00,'Paid',NULL,NULL,'2026-06-24',NULL,'Bank Transfer',NULL,'2026-06-30',NULL,'2026-06-24 06:28:01','2026-06-30 10:53:29');
/*!40000 ALTER TABLE `driver_settlements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `id_card_number` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `address` text,
  `station_id` int DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_photo` varchar(255) DEFAULT NULL,
  `id_document` varchar(255) DEFAULT NULL,
  `bank_document` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  KEY `fk_driver_vehicle` (`vehicle_id`),
  CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`),
  CONSTRAINT `fk_driver_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,'raju','7788997788','789858987585','inactive','kairathabad',1,NULL,'HDFC','123456789789','HDFC0001234','2026-04-16 05:24:52',NULL,NULL,NULL),(2,'yogi','7897537539','123456789','active','kadapa',3,2,'SBI','123456789','SBI0012345','2026-04-20 05:31:29',NULL,NULL,NULL),(3,'mani','+917075850719','123asd','active','Suraram Colony\n3-121, sundar nagar, suraram , jeedimetla, Hyderabad, Telangana',3,13,'admin@galacticosnetwork.com','12345678','asdfghqw','2026-04-25 08:47:36',NULL,NULL,NULL),(4,'Vara Prasad','7799779979','123456789','active','Hyderabad',4,20,'HDFC','123456789','HDFC1234567','2026-04-27 05:41:31',NULL,NULL,NULL);
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(30) NOT NULL,
  `employee_name` varchar(150) NOT NULL,
  `department` varchar(100) NOT NULL,
  `plant` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_department` (`department`),
  KEY `idx_plant` (`plant`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'EMP001','Ramu Kumar','Operations','Hyderabad Plant','ramu.kumar@company.com','9876543210','Active','2026-07-03 08:23:21','2026-07-03 08:23:21'),(2,'EMP002','Ashwini Devi','Maintenance','Hyderabad Plant','ashwini.devi@company.com','9876543211','Active','2026-07-03 08:23:21','2026-07-03 08:23:21');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_entries`
--

DROP TABLE IF EXISTS `expense_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expense_number` varchar(100) DEFAULT NULL,
  `expense_category` varchar(100) NOT NULL,
  `vehicle_id` int NOT NULL,
  `vehicle_number` varchar(100) NOT NULL,
  `driver_id` int DEFAULT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `station_id` int DEFAULT NULL,
  `station_name` varchar(255) DEFAULT NULL,
  `trip_id` int DEFAULT NULL,
  `trip_number` varchar(100) DEFAULT NULL,
  `expense_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'Paid',
  `vendor_payee` varchar(255) DEFAULT NULL,
  `description` text,
  `attachment` json DEFAULT NULL,
  `fuel_station` varchar(255) DEFAULT NULL,
  `fuel_date` date DEFAULT NULL,
  `litres_filled` decimal(10,2) DEFAULT NULL,
  `fuel_cost` decimal(12,2) DEFAULT NULL,
  `fuel_receipt_number` varchar(255) DEFAULT NULL,
  `service_type` varchar(255) DEFAULT NULL,
  `workshop_name` varchar(255) DEFAULT NULL,
  `service_date` date DEFAULT NULL,
  `service_reference` varchar(255) DEFAULT NULL,
  `repair_notes` text,
  `tyre_brand` varchar(255) DEFAULT NULL,
  `tyre_position` varchar(255) DEFAULT NULL,
  `tyre_vendor` varchar(255) DEFAULT NULL,
  `tyre_invoice_number` varchar(255) DEFAULT NULL,
  `tyre_warranty` varchar(255) DEFAULT NULL,
  `battery_brand` varchar(255) DEFAULT NULL,
  `battery_vendor` varchar(255) DEFAULT NULL,
  `battery_invoice_number` varchar(255) DEFAULT NULL,
  `battery_warranty_period` varchar(255) DEFAULT NULL,
  `salary_month` varchar(50) DEFAULT NULL,
  `salary_type` varchar(100) DEFAULT NULL,
  `salary_payment_mode` varchar(100) DEFAULT NULL,
  `allowance_date` date DEFAULT NULL,
  `allowance_type` varchar(100) DEFAULT NULL,
  `toll_plaza` varchar(255) DEFAULT NULL,
  `toll_route` varchar(255) DEFAULT NULL,
  `toll_receipt_number` varchar(255) DEFAULT NULL,
  `expense_title` varchar(255) DEFAULT NULL,
  `entry_status` varchar(50) DEFAULT 'Active',
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `expense_number` (`expense_number`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `trip_id` (`trip_id`),
  KEY `driver_id` (`driver_id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `expense_entries_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expense_entries_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expense_entries_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expense_entries_ibfk_4` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expense_entries_ibfk_5` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_entries`
--

LOCK TABLES `expense_entries` WRITE;
/*!40000 ALTER TABLE `expense_entries` DISABLE KEYS */;
INSERT INTO `expense_entries` VALUES (1,'EXP-1780305205397','Fuel',23,'MG 28 AP 1234',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-01',500.00,'Cash','Paid','HP','good','[]','HP','2026-06-01',5.00,500.00,'RCPT-2025',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'RCPT-2025',NULL,'Active','Admin','2026-06-01 09:13:25','2026-06-01 09:13:25'),(2,'EXP-1780305304896','Maintenance',13,'AP 12 AP 6789',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-01',1000.00,'Cash','Paid','raghu','everything is ohk','[]',NULL,NULL,NULL,NULL,NULL,'General Service','Arjun Motors','2026-06-01','SRV-2025','Brake pads',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','Admin','2026-06-01 09:15:05','2026-06-01 09:15:05');
/*!40000 ALTER TABLE `expense_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fuel_entries`
--

DROP TABLE IF EXISTS `fuel_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fuel_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `vehicle_no` varchar(50) DEFAULT NULL,
  `trip_id` varchar(50) DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `station_name` varchar(255) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `previous_odo` int DEFAULT NULL,
  `expected_mileage` decimal(5,2) DEFAULT NULL,
  `tank_capacity` int DEFAULT NULL,
  `current_odo` int DEFAULT NULL,
  `distance` int DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `mileage` decimal(10,2) DEFAULT NULL,
  `bill_number` varchar(100) DEFAULT NULL,
  `full_tank` tinyint(1) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `vendor_type` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `filled_by` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `receipt_files` text,
  PRIMARY KEY (`id`),
  KEY `vehicle_id` (`vehicle_id`),
  CONSTRAINT `fuel_entries_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel_entries`
--

LOCK TABLES `fuel_entries` WRITE;
/*!40000 ALTER TABLE `fuel_entries` DISABLE KEYS */;
INSERT INTO `fuel_entries` VALUES (15,'2026-04-27',20,'TG 12 AP 1234','15','Diesel','HP','Cash','yogi',200,4.50,200,3000,2800,120.00,95.99,11518.80,23.33,'BILL -2024',0,'Indian Oil','Petrol Pump','Hyderabad','Driver',NULL,'2026-04-27 06:15:52',NULL),(16,'2026-05-21',23,'MG 28 AP 1234','16','Diesel','HP','Cash','Vara Prasad',50,4.50,200,60,10,200.00,90.00,18000.00,0.05,'BILL -2024',1,'Indian Oil','Internal','Hyderabad','Driver','Done','2026-05-21 09:40:59',NULL),(17,'2026-06-18',13,'AP 12 AP 6789','17','Diesel','Bharat Oil','Cash','yogi',12,4.50,200,13,1,10.00,90.00,900.00,0.10,'BILL -2026',0,'Bharat Oil','Internal','KPHB','Driver',NULL,'2026-06-18 08:23:02',NULL);
/*!40000 ALTER TABLE `fuel_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fuel_vendors`
--

DROP TABLE IF EXISTS `fuel_vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fuel_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address_location` text NOT NULL,
  `fuel_types` json NOT NULL,
  `gst_number` varchar(100) DEFAULT NULL,
  `opening_balance` decimal(12,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `bank_name` varchar(255) DEFAULT NULL,
  `custom_bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel_vendors`
--

LOCK TABLES `fuel_vendors` WRITE;
/*!40000 ALTER TABLE `fuel_vendors` DISABLE KEYS */;
INSERT INTO `fuel_vendors` VALUES (1,'Bharat Oil','Ram','9966337788','bharat@gmail.com','KPHB','[\"Diesel\"]','GST123456789',NULL,'Active','State Bank of India (SBI)',NULL,'778596327548','SBI12345678','bharat@upi','good','2026-06-16 04:48:46','2026-06-16 04:58:40');
/*!40000 ALTER TABLE `fuel_vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garages`
--

DROP TABLE IF EXISTS `garages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `contact` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garages`
--

LOCK TABLES `garages` WRITE;
/*!40000 ALTER TABLE `garages` DISABLE KEYS */;
INSERT INTO `garages` VALUES (1,'ABC Garage','Hyderabad','9876543210','2026-05-04 09:33:16'),(2,'XYZ Works','Vijayawada','9123456780','2026-05-04 09:33:16'),(3,'Prime Fleet Care','Vizag','9988776655','2026-05-04 09:33:16');
/*!40000 ALTER TABLE `garages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incident_files`
--

DROP TABLE IF EXISTS `incident_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incident_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `incident_id` int NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `incident_id` (`incident_id`),
  CONSTRAINT `incident_files_ibfk_1` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incident_files`
--

LOCK TABLES `incident_files` WRITE;
/*!40000 ALTER TABLE `incident_files` DISABLE KEYS */;
INSERT INTO `incident_files` VALUES (1,1,'blob:http://localhost:5173/1028647f-9c83-46ec-b4ce-6ef070573edd','image','2026-05-07 10:15:15'),(2,2,'blob:http://localhost:5173/712e8391-25f3-4dec-aca4-cc3225c3ea75','image','2026-05-07 10:18:03'),(3,3,'blob:http://localhost:5173/efbc074f-aba5-403c-b1d7-e874be6ef8a3','image','2026-05-07 10:42:12'),(4,4,'http://localhost:5001/uploads/1778226213837-741179920.png','image','2026-05-08 07:43:38'),(5,5,'http://localhost:5001/uploads/1778234629711-922201328.png','image','2026-05-08 10:04:22'),(6,6,'http://localhost:5001/uploads/1779358977775-931004606.png','image','2026-05-21 10:23:02'),(7,7,'http://localhost:5001/uploads/1779359192418-418466119.png','image','2026-05-21 10:26:36');
/*!40000 ALTER TABLE `incident_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidents`
--

DROP TABLE IF EXISTS `incidents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `incident_number` varchar(100) DEFAULT NULL,
  `incident_type` varchar(100) NOT NULL,
  `vehicle_id` int NOT NULL,
  `driver_id` int DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `station_id` int DEFAULT NULL,
  `vehicle_no` varchar(100) DEFAULT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `driver_phone` varchar(50) DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `station_name` varchar(255) DEFAULT NULL,
  `current_route` varchar(255) DEFAULT NULL,
  `incident_date` date DEFAULT NULL,
  `incident_time` time DEFAULT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `priority` varchar(50) DEFAULT NULL,
  `incident_status` varchar(50) DEFAULT 'Reported',
  `incident_location` text,
  `gps_coordinates` varchar(255) DEFAULT NULL,
  `description` text,
  `breakdown_category` varchar(100) DEFAULT NULL,
  `vehicle_movable` varchar(20) DEFAULT NULL,
  `emergency_required` varchar(20) DEFAULT NULL,
  `damage_type` varchar(100) DEFAULT NULL,
  `injury_reported` varchar(20) DEFAULT NULL,
  `police_complaint` varchar(20) DEFAULT NULL,
  `fuel_lost` decimal(10,2) DEFAULT NULL,
  `tank_seal_broken` varchar(20) DEFAULT NULL,
  `tyre_position` varchar(100) DEFAULT NULL,
  `spare_available` varchar(20) DEFAULT NULL,
  `engine_failure_type` varchar(100) DEFAULT NULL,
  `photos` json DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `incident_number` (`incident_number`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `incidents_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `incidents_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `incidents_ibfk_3` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `incidents_ibfk_4` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidents`
--

LOCK TABLES `incidents` WRITE;
/*!40000 ALTER TABLE `incidents` DISABLE KEYS */;
INSERT INTO `incidents` VALUES (1,'INC-1778148915100','Breakdown',20,2,5,3,'TG 12 AP 1234','yogi','7897537539','mani','HyderabadHUB','Hyderabad - Pune','2026-05-07','15:44:00','High','High','Closed','Hyderabad','12345678','Engine problem','Engine Failure','No','Yes','','No','No',0.00,'No','','No','','[\"blob:http://localhost:5173/1028647f-9c83-46ec-b4ce-6ef070573edd\"]','Admin','2026-05-07 10:15:15','2026-05-08 06:01:31'),(2,'INC-1778149083693','Fuel Theft',2,1,1,1,'AP 26 AP 4321','raju','7788997788','Raghu','central hub','Ashok nagar','2026-05-14','15:47:00','Low','Low','Closed','Chandanagar','123456','Fuel Lost','Engine Failure','No','Yes','','No','No',28.00,'No','','No','','[\"blob:http://localhost:5173/712e8391-25f3-4dec-aca4-cc3225c3ea75\"]','Admin','2026-05-07 10:18:03','2026-05-08 06:56:35'),(3,'INC-1778150532198','Accident',13,2,2,2,'AP 12 AP 6789','yogi','7897537539','Nayak','git hub','asdf-wert','2026-05-06','16:11:00','Low','Low','Assigned','Nagole','123456788','Accident were happend at Nagole','Engine Failure','No','Yes','Major Damage','No','No',0.00,'No','','No','','[\"blob:http://localhost:5173/efbc074f-aba5-403c-b1d7-e874be6ef8a3\"]','Admin','2026-05-07 10:42:12','2026-05-08 07:22:11'),(4,'INC-1778226218973','Other',20,2,5,3,'TG 12 AP 1234','yogi','7897537539','mani','','Hyderabad - Pune','2026-05-08','13:13:00','High','High','In Progress','Hyderabad','12345678','Other','Engine Failure','No','Yes','','No','No',0.00,'No','','No','','[\"http://localhost:5001/uploads/1778226213837-741179920.png\"]','Admin','2026-05-08 07:43:38','2026-05-20 11:32:00'),(5,'INC-1778234662178','Tyre Issue',13,2,2,2,'AP 12 AP 6789','yogi','7897537539','Nayak','git hub','asdf-wert','2026-05-08','15:32:00','High','High','Assigned','Hyderabad','789456','left tire puncher','Engine Failure','No','Yes','','No','No',0.00,'No','Front Left','No','','[\"http://localhost:5001/uploads/1778234629711-922201328.png\"]','Admin','2026-05-08 10:04:21','2026-05-21 07:52:50'),(6,'INC-1779358982922','Tyre Issue',23,4,6,4,'MG 28 AP 1234','Vara Prasad','7799779979','Raghu ram','Parameswara','Hyderabad-Tirupati','2026-05-21','15:49:00','Medium','High','Closed','Kakinada','123456','Tyre issue','Engine Failure','No','Yes','','No','No',0.00,'No','Front Left','No','','[\"http://localhost:5001/uploads/1779358977775-931004606.png\"]','Admin','2026-05-21 10:23:02','2026-05-21 11:13:24'),(7,'INC-1779359196511','Tyre Issue',2,1,1,1,'AP 26 AP 4321','raju','7788997788','Raghu','central hub','Ashok nagar','2026-05-21','15:55:00','High','High','Closed','HYD','','Tyres','Engine Failure','No','Yes','','No','No',0.00,'No','Front Left','No','','[\"http://localhost:5001/uploads/1779359192418-418466119.png\"]','Admin','2026-05-21 10:26:36','2026-05-21 11:10:02');
/*!40000 ALTER TABLE `incidents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `income_entries`
--

DROP TABLE IF EXISTS `income_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `income_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `income_number` varchar(100) DEFAULT NULL,
  `income_category` varchar(100) NOT NULL,
  `vehicle_id` int NOT NULL,
  `vehicle_number` varchar(100) NOT NULL,
  `driver_id` int DEFAULT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `station_id` int DEFAULT NULL,
  `station_name` varchar(255) DEFAULT NULL,
  `trip_id` int DEFAULT NULL,
  `trip_number` varchar(100) DEFAULT NULL,
  `route_from` varchar(255) DEFAULT NULL,
  `route_to` varchar(255) DEFAULT NULL,
  `place_of_running` varchar(255) DEFAULT NULL,
  `freight_start_date` date DEFAULT NULL,
  `freight_end_date` date DEFAULT NULL,
  `linked_invoice_no` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `rental_description` text,
  `rental_start_date` date DEFAULT NULL,
  `rental_end_date` date DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `received_amount` decimal(12,2) DEFAULT '0.00',
  `pending_amount` decimal(12,2) DEFAULT '0.00',
  `payment_status` varchar(50) DEFAULT NULL,
  `payment_received_date` date DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `bank_reference_number` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `description` text,
  `remarks` text,
  `attachments` json DEFAULT NULL,
  `entry_status` varchar(50) DEFAULT 'Active',
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `income_number` (`income_number`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `trip_id` (`trip_id`),
  KEY `driver_id` (`driver_id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `income_entries_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `income_entries_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE SET NULL,
  CONSTRAINT `income_entries_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `income_entries_ibfk_4` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `income_entries_ibfk_5` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `income_entries`
--

LOCK TABLES `income_entries` WRITE;
/*!40000 ALTER TABLE `income_entries` DISABLE KEYS */;
INSERT INTO `income_entries` VALUES (1,'INC-1779959596652','Freight',23,'MG 28 AP 1234',4,'Vara Prasad',6,'Raghu ram',NULL,NULL,16,'TRIP-4474','Hyderabad','Tirupati','Hyderabad - Tirupati','2026-05-21','2026-05-22',NULL,NULL,NULL,NULL,NULL,30000.00,30000.00,0.00,'Received','2026-05-28',NULL,'NEFT-12345',NULL,'Good',NULL,NULL,'Active','Admin','2026-05-28 09:13:17','2026-05-28 09:13:17');
/*!40000 ALTER TABLE `income_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspection_defects`
--

DROP TABLE IF EXISTS `inspection_defects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection_defects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inspection_id` varchar(100) NOT NULL,
  `vehicle_id` int NOT NULL,
  `vehicle_no` varchar(50) DEFAULT NULL,
  `issue_type` varchar(255) DEFAULT NULL,
  `severity` varchar(50) DEFAULT 'Warning',
  `breakdown_type` varchar(100) DEFAULT NULL,
  `priority` varchar(50) DEFAULT 'Medium',
  `description` text,
  `status` varchar(50) DEFAULT 'Open',
  `reported_by` varchar(100) DEFAULT NULL,
  `inspection_date` datetime DEFAULT NULL,
  `created_repair_id` int DEFAULT NULL,
  `created_service_id` int DEFAULT NULL,
  `evidence_files` text,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspection_defects`
--

LOCK TABLES `inspection_defects` WRITE;
/*!40000 ALTER TABLE `inspection_defects` DISABLE KEYS */;
INSERT INTO `inspection_defects` VALUES (2,'INS-1779261090852',13,'AP 12 AP 6789','Front left tier, Back left tier','Warning','Other','Medium','Inspection failed for: Front left tier, Back left tier','Open','Nayak','2026-05-20 01:41:30',NULL,NULL,NULL,NULL,'2026-05-20 07:34:40','2026-05-20 07:34:40'),(3,'INS-1779261090852',13,'AP 12 AP 6789','Front left tier, Back left tier','Warning','Other','Medium','Inspection failed for: Front left tier, Back left tier','Open','Nayak','2026-05-20 01:41:30',NULL,NULL,NULL,NULL,'2026-05-20 07:37:17','2026-05-20 07:37:17'),(4,'INS-1779261090852',13,'AP 12 AP 6789','Front left tier, Back left tier','Warning','Other','Medium','Inspection failed for: Front left tier, Back left tier','Resolved','Nayak','2026-05-20 01:41:30',4,NULL,NULL,'2026-05-20 07:47:01','2026-05-20 07:39:06','2026-05-20 13:17:01'),(5,'INS-1779261090852',13,'AP 12 AP 6789','Front left tier, Back left tier','Warning','Other','Medium','Inspection failed for: Front left tier, Back left tier','Open','Nayak','2026-05-20 01:41:30',NULL,NULL,NULL,NULL,'2026-05-20 07:48:36','2026-05-20 07:48:36'),(7,'INS-1779261090852',13,'AP 12 AP 6789','Front left tier, Back left tier','Warning','Other','Medium','Inspection failed for: Front left tier, Back left tier','Resolved','Nayak','2026-05-20 01:41:30',5,NULL,NULL,'2026-05-20 08:01:20','2026-05-20 08:00:48','2026-05-20 13:31:21');
/*!40000 ALTER TABLE `inspection_defects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspection_plans`
--

DROP TABLE IF EXISTS `inspection_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_number` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `plan_type` varchar(100) DEFAULT NULL,
  `description` text,
  `schedule_type` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `priority` varchar(50) DEFAULT NULL,
  `checklist_items` json DEFAULT NULL,
  `total_checkpoints` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_number` (`plan_number`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspection_plans`
--

LOCK TABLES `inspection_plans` WRITE;
/*!40000 ALTER TABLE `inspection_plans` DISABLE KEYS */;
INSERT INTO `inspection_plans` VALUES (1,'PLAN-1778750644901','Weekly tier','Safety','Weekly tier for safety','Time-Based','Weekly','Medium','[{\"id\": \"item-1\", \"desc\": \"Front left tier\", \"type\": \"Pass / Fail\", \"unit\": \"\", \"category\": \"General\", \"maxValue\": \"\", \"minValue\": \"\", \"required\": true, \"severity\": \"Medium\", \"requirePhoto\": false, \"expectedValue\": \"\", \"requireCommentOnFail\": false}, {\"id\": \"item-1778750615990\", \"desc\": \"Front right tier\", \"type\": \"Pass / Fail\", \"unit\": \"\", \"category\": \"General\", \"maxValue\": \"\", \"minValue\": \"\", \"required\": true, \"severity\": \"Medium\", \"requirePhoto\": false, \"expectedValue\": \"\", \"requireCommentOnFail\": false}, {\"id\": \"item-1778750625735\", \"desc\": \"Back right tier\", \"type\": \"Pass / Fail\", \"unit\": \"\", \"category\": \"General\", \"maxValue\": \"\", \"minValue\": \"\", \"required\": true, \"severity\": \"Medium\", \"requirePhoto\": false, \"expectedValue\": \"\", \"requireCommentOnFail\": false}, {\"id\": \"item-1778750635314\", \"desc\": \"Back left tier\", \"type\": \"Pass / Fail\", \"unit\": \"\", \"category\": \"General\", \"maxValue\": \"\", \"minValue\": \"\", \"required\": true, \"severity\": \"Medium\", \"requirePhoto\": false, \"expectedValue\": \"\", \"requireCommentOnFail\": false}]',4,'2026-05-14 09:24:05','2026-05-14 09:24:05'),(2,'PLAN-1778751041386','Engine','Operations','Engine for Operations','Engine Hours','Bi-Weekly','Medium','[{\"id\": \"item-1\", \"desc\": \"Engine Oil\", \"type\": \"Pass / Fail\", \"unit\": \"\", \"category\": \"General\", \"maxValue\": \"\", \"minValue\": \"\", \"required\": true, \"severity\": \"Medium\", \"requirePhoto\": false, \"expectedValue\": \"\", \"requireCommentOnFail\": false}]',1,'2026-05-14 09:30:41','2026-05-14 09:30:41'),(3,'PLAN-1779260197868','daily','Pre-Trip','zxcv\nqaswdef','Time-Based','Weekly','High','[{\"id\": \"item-1\", \"desc\": \"sdfghj\", \"type\": \"Pass / Fail\", \"unit\": \"\", \"category\": \"General\", \"maxValue\": \"\", \"minValue\": \"\", \"required\": true, \"severity\": \"Medium\", \"requirePhoto\": false, \"expectedValue\": \"\", \"requireCommentOnFail\": false}]',1,'2026-05-20 06:56:37','2026-05-21 07:51:26'),(4,'PLAN-1779358632475','Daily Truck Tyre & Brake Inspection','Maintenance','Routine inspection plan for checking truck tyres, brakes, air pressure, wheel alignment, and brake performance before vehicle operation.','Time-Based','Daily','Medium','[{\"id\": \"item-1\", \"desc\": \"Check front tyre pressure\", \"type\": \"Pass / Fail\", \"unit\": \"\", \"category\": \"General\", \"maxValue\": \"\", \"minValue\": \"\", \"required\": true, \"severity\": \"Medium\", \"requirePhoto\": false, \"expectedValue\": \"\", \"requireCommentOnFail\": false}, {\"id\": \"item-1779358614802\", \"desc\": \"Inspect rear tyre condition\", \"type\": \"Pass / Fail\", \"unit\": \"\", \"category\": \"General\", \"maxValue\": \"\", \"minValue\": \"\", \"required\": true, \"severity\": \"Medium\", \"requirePhoto\": false, \"expectedValue\": \"\", \"requireCommentOnFail\": false}]',2,'2026-05-21 10:17:12','2026-05-21 10:17:12');
/*!40000 ALTER TABLE `inspection_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspections`
--

DROP TABLE IF EXISTS `inspections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inspection_number` varchar(100) DEFAULT NULL,
  `plan_id` int DEFAULT NULL,
  `plan_title` varchar(255) DEFAULT NULL,
  `plan_type` varchar(100) DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `vehicle_number` varchar(100) DEFAULT NULL,
  `inspection_date` datetime DEFAULT NULL,
  `inspector_name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `gps_coordinates` varchar(255) DEFAULT NULL,
  `odometer` varchar(100) DEFAULT NULL,
  `pre_notes` text,
  `final_notes` text,
  `checklist_results` json DEFAULT NULL,
  `total_items` int DEFAULT '0',
  `passed_items` int DEFAULT '0',
  `failed_items` int DEFAULT '0',
  `pending_items` int DEFAULT '0',
  `na_items` int DEFAULT '0',
  `inspection_status` varchar(100) DEFAULT 'Pending',
  `auto_create_workorder` varchar(10) DEFAULT 'No',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `engine_hours` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inspection_number` (`inspection_number`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspections`
--

LOCK TABLES `inspections` WRITE;
/*!40000 ALTER TABLE `inspections` DISABLE KEYS */;
INSERT INTO `inspections` VALUES (1,'INS-1778759209198',2,'Engine','Operations',13,'AP 12 AP 6789','2026-05-14 11:46:49','Nayak','Mumbai Depot','19.0760° N, 72.8777° E',NULL,'','','[{\"result\": \"Pass\", \"item_id\": \"item-1\", \"required\": true, \"item_name\": \"Engine Oil\"}]',1,1,0,0,0,'Passed','No','2026-05-14 11:46:49','2026-05-14 11:46:49','24'),(2,'INS-1779261090852',1,'Weekly tier','Safety',13,'AP 12 AP 6789','2026-05-20 07:11:30','Nayak','Mumbai Depot','19.0760° N, 72.8777° E','123455','sdfgh','','[{\"result\": \"Fail\", \"item_id\": \"item-1\", \"required\": true, \"item_name\": \"Front left tier\"}, {\"result\": \"Pass\", \"item_id\": \"item-1778750615990\", \"required\": true, \"item_name\": \"Front right tier\"}, {\"result\": \"Pass\", \"item_id\": \"item-1778750625735\", \"required\": true, \"item_name\": \"Back right tier\"}, {\"result\": \"Fail\", \"item_id\": \"item-1778750635314\", \"required\": true, \"item_name\": \"Back left tier\"}]',4,2,2,0,0,'Failed','Yes','2026-05-20 07:11:30','2026-05-20 07:11:30',NULL),(3,'INS-1779358678326',4,'Daily Truck Tyre & Brake Inspection','Maintenance',23,'MG 28 AP 1234','2026-05-21 10:17:58','Raghu ram','Mumbai Depot','19.0760° N, 72.8777° E','760','Good','Good','[{\"result\": \"Pass\", \"item_id\": \"item-1\", \"required\": true, \"item_name\": \"Check front tyre pressure\"}, {\"result\": \"Pass\", \"item_id\": \"item-1779358614802\", \"required\": true, \"item_name\": \"Inspect rear tyre condition\"}]',2,2,0,0,0,'Passed','No','2026-05-21 10:17:58','2026-05-21 10:17:58',NULL);
/*!40000 ALTER TABLE `inspections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_issue_history`
--

DROP TABLE IF EXISTS `inventory_issue_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_issue_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `part_id` int NOT NULL,
  `vehicle_number` varchar(100) DEFAULT NULL,
  `service_id` varchar(100) DEFAULT NULL,
  `service_type` varchar(100) DEFAULT NULL,
  `odometer` int DEFAULT '0',
  `quantity` int DEFAULT '0',
  `cost_per_unit` decimal(10,2) DEFAULT '0.00',
  `vendor` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `part_id` (`part_id`),
  CONSTRAINT `inventory_issue_history_ibfk_1` FOREIGN KEY (`part_id`) REFERENCES `inventory_parts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_issue_history`
--

LOCK TABLES `inventory_issue_history` WRITE;
/*!40000 ALTER TABLE `inventory_issue_history` DISABLE KEYS */;
INSERT INTO `inventory_issue_history` VALUES (1,2,'AP 12 AP 6789','12345678','Repair',500,2,400.00,'Castrol Lubricants','2026-05-07','2026-05-07 08:30:07'),(2,1,'AP 12 AP 6789','','',12345,4,40.00,'','2026-05-19','2026-05-19 05:54:39'),(3,2,'AP 12 AP 6789','','',1234,10,30000.00,'','2026-05-19','2026-05-19 05:56:19'),(4,2,'AP 26 AP 4321','','General Check',0,2,400.00,'Castrol Lubricants','2026-05-18','2026-05-19 09:01:52'),(5,3,'AP 12 AP 6789','','Oil Change',1234,2,12.00,'erfghn','2026-05-19','2026-05-19 09:46:47'),(6,5,'AP 12 AP 6789','','',5890,20,30.00,'','2026-05-19','2026-05-19 10:12:38'),(7,1,'AP 12 AP 6789','4','Repair',123455,1,600.00,'Lucas Supplies','2026-05-18','2026-05-20 07:47:01'),(8,5,'AP 12 AP 6789','5','Repair',123455,1,12.00,'','2026-05-20','2026-05-20 08:01:21'),(9,1,'MG 28 AP 1234','7','Repair',760,1,600.00,'Lucas Supplies','2026-05-19','2026-05-21 09:57:50');
/*!40000 ALTER TABLE `inventory_issue_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_parts`
--

DROP TABLE IF EXISTS `inventory_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_parts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int DEFAULT NULL,
  `part_name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text,
  `brand` varchar(150) DEFAULT NULL,
  `opening_stock` int DEFAULT '0',
  `current_stock` int DEFAULT '0',
  `min_stock` int DEFAULT '0',
  `reorder_level` int DEFAULT '0',
  `unit` varchar(50) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT '0.00',
  `selling_price` decimal(10,2) DEFAULT '0.00',
  `inventory_value` decimal(12,2) DEFAULT '0.00',
  `vehicle_type` varchar(100) DEFAULT NULL,
  `compatible_vehicles` json DEFAULT NULL,
  `service_interval` varchar(100) DEFAULT NULL,
  `preferred_vendor` varchar(255) DEFAULT NULL,
  `gst_number` varchar(100) DEFAULT NULL,
  `vendor_contact` varchar(100) DEFAULT NULL,
  `warehouse` varchar(255) DEFAULT NULL,
  `rack_no` varchar(100) DEFAULT NULL,
  `bin_no` varchar(100) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `warranty` varchar(100) DEFAULT NULL,
  `part_image` varchar(255) DEFAULT NULL,
  `files` json DEFAULT NULL,
  `notes` text,
  `stock_status` varchar(50) DEFAULT 'In Stock',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `vehicle_id` (`vehicle_id`),
  CONSTRAINT `inventory_parts_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_parts`
--

LOCK TABLES `inventory_parts` WRITE;
/*!40000 ALTER TABLE `inventory_parts` DISABLE KEYS */;
INSERT INTO `inventory_parts` VALUES (1,20,'Brakes Pads','BOS-BRA-3469','Spares','Brakes Pads chnaging','Bosch',30,45,5,10,'pcs',600.00,799.00,21000.00,'Truck','[\"TG 12 AP 1234\"]','10000','Lucas Supplies','12345678','7889978899','Main Warehouse','A1','B1','2026-05-29','1','1778130097119-931498034.png','[]','ok','In Stock','Admin','2026-05-07 05:01:37','2026-06-10 06:18:57'),(2,13,'Lights','DEL-LIG-1118','Others','Lights','dell',30,16,4,15,'pcs',400.00,600.00,6400.00,'Truck','[\"AP 12 AP 6789\"]','20000','Castrol Lubricants','123456789','1223345566','Tyre Storage','A2','B2','2026-08-20','1','1778142063063-479775456.png','[]','everything is ohk','In Stock','Admin','2026-05-07 08:21:03','2026-05-19 09:01:52'),(3,NULL,'tube 1','1234','Tubes',NULL,'asdf',2,0,0,0,NULL,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-19',NULL,NULL,'[]',NULL,NULL,'Admin','2026-05-19 05:47:34','2026-05-19 09:46:47'),(4,NULL,'battery',NULL,'Others',NULL,NULL,0,32,0,0,NULL,0.00,0.00,0.00,NULL,NULL,NULL,'asd',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'In Stock','PO Auto','2026-05-19 10:10:58','2026-06-10 06:16:53'),(5,NULL,'engin oil','20','Others',NULL,'asdf',30,9,0,0,NULL,0.00,0.00,108.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-19',NULL,NULL,'[]',NULL,NULL,'Admin','2026-05-19 10:11:58','2026-05-20 08:01:21'),(6,NULL,'asderfg','123456','Tubes',NULL,'asdf',12,12,0,0,NULL,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-23',NULL,NULL,'[]',NULL,NULL,'Admin','2026-05-23 13:30:36','2026-05-23 13:30:36'),(8,NULL,'tube 1','123412345678','Tubes',NULL,'asdf',2,2,0,0,NULL,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-23',NULL,NULL,'[]',NULL,NULL,'Admin','2026-05-23 13:32:09','2026-05-23 13:32:09'),(9,NULL,'lub 1','23456789','Lubricants',NULL,'asdsdfghjk',3,3,0,0,NULL,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-23',NULL,NULL,'[]',NULL,NULL,'Admin','2026-05-23 13:32:48','2026-05-23 13:32:48'),(10,NULL,'Engine Oil 15W40',NULL,'Others',NULL,NULL,0,14,0,0,NULL,0.00,0.00,0.00,NULL,NULL,NULL,'Castrol Distributor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'In Stock','PO Auto','2026-06-12 06:18:59','2026-06-17 06:07:53'),(11,NULL,'Brake Pads',NULL,'Others',NULL,NULL,0,2,0,0,NULL,0.00,0.00,0.00,NULL,NULL,NULL,'Ashok Spares',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'In Stock','PO Auto','2026-06-16 05:26:28','2026-06-16 05:26:28');
/*!40000 ALTER TABLE `inventory_parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_purchase_orders`
--

DROP TABLE IF EXISTS `inventory_purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_purchase_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_number` varchar(100) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `expected_delivery` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `items` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `requested_by` varchar(255) DEFAULT NULL,
  `requested_date` date DEFAULT NULL,
  `approver_name` varchar(255) DEFAULT NULL,
  `approval_comment` text,
  `approval_date` datetime DEFAULT NULL,
  `ordered_at` datetime DEFAULT NULL,
  `status_id` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_number` (`po_number`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_purchase_orders`
--

LOCK TABLES `inventory_purchase_orders` WRITE;
/*!40000 ALTER TABLE `inventory_purchase_orders` DISABLE KEYS */;
INSERT INTO `inventory_purchase_orders` VALUES (1,'PO-20260519-6305','Test Vendor',0.00,NULL,'Received','[{\"qty\": 1, \"notes\": \"Test note\", \"part_id\": null, \"partName\": \"Test Part\"}]','2026-05-19 06:23:38',NULL,NULL,NULL,NULL,NULL,NULL,4),(2,'PO-20260519-2031','asd',0.00,'2026-05-19','Ordered','[{\"qty\": 10, \"notes\": \"\", \"part_id\": \"3\", \"partName\": \"tube 1\"}]','2026-05-19 06:27:16',NULL,NULL,NULL,NULL,NULL,NULL,3),(3,'PO-20260519-3056','ash',0.00,NULL,'Approved','[{\"qty\": 10, \"notes\": \"\", \"part_id\": \"2\", \"partName\": \"Lights\"}]','2026-05-19 06:56:18',NULL,NULL,NULL,NULL,NULL,NULL,1),(4,'PO-20260519-2662','asdf',0.00,'2026-05-20','Approved','[{\"qty\": 10, \"notes\": \"goood\", \"part_id\": \"1\", \"partName\": \"Brakes Pads\"}]','2026-05-19 07:01:22',NULL,NULL,NULL,NULL,NULL,NULL,1),(5,'PO-20260519-5936','asdfg',0.00,NULL,'Approved','[{\"qty\": 10, \"notes\": \"\", \"part_id\": \"3\", \"partName\": \"tube 1\"}]','2026-05-19 07:03:02',NULL,NULL,NULL,NULL,NULL,NULL,1),(6,'PO-20260519-6350','asd',0.00,NULL,'Approved','[{\"qty\": 10, \"notes\": \"\", \"part_id\": \"2\", \"partName\": \"Lights\"}]','2026-05-19 07:25:09','Amina Ahmed','2026-05-19','Amina Ahmed','wsedrfg','2026-05-19 09:55:00',NULL,1),(7,'PO-20260519-4250','asdf',0.00,NULL,'Approved','[{\"qty\": 2, \"notes\": \"\", \"part_id\": \"3\", \"partName\": \"tube 1\"}]','2026-05-19 07:29:16','Amina Ahmed','2026-05-19','Amina Ahmed','go','2026-05-19 07:41:58',NULL,1),(8,'PO-20260519-1774','sdfg',0.00,'2026-05-26','Approved','[{\"qty\": 20, \"notes\": \"\", \"part_id\": \"3\", \"partName\": \"tube 1\"}]','2026-05-19 09:48:14','Amina Ahmed','2026-05-19','Amina Ahmed','sdfg','2026-05-19 09:49:07',NULL,1),(9,'PO-20260519-5225','asdf',0.00,NULL,'Ordered','[{\"qty\": 10, \"notes\": \"\", \"part_id\": \"3\", \"partName\": \"tube 1\"}]','2026-05-19 09:49:36','Amina Ahmed','2026-05-19','Amina Ahmed','asdf','2026-05-19 09:54:56','2026-06-10 06:21:35',3),(10,'PO-20260519-9979','qwe',0.00,NULL,'Approved','[{\"qty\": 10, \"notes\": \"\", \"part_id\": \"3\", \"partName\": \"tube 1\"}]','2026-05-19 09:55:24','Amina Ahmed','2026-05-19','Amina Ahmed','sdfgh','2026-06-10 06:22:20',NULL,1),(11,'PO-20260519-6464','ashwini',0.00,'2026-05-19','Received','[{\"qty\": 10, \"notes\": \"asdf\", \"part_id\": \"1\", \"partName\": \"Brakes Pads\"}]','2026-05-19 10:03:10','Amina Ahmed','2026-05-19','Amina Ahmed','asxdcfvbnm','2026-05-22 07:16:00','2026-06-10 06:18:51',4),(12,'PO-20260519-8518','wsdfg',0.00,'2026-05-26','Received','[{\"qty\": 12, \"notes\": \"\", \"part_id\": null, \"partName\": \"battery\"}]','2026-05-19 10:05:40','Amina Ahmed','2026-05-19','Amina Ahmed','asdfg','2026-05-19 10:05:51','2026-05-22 07:16:04',4),(13,'PO-20260519-4465','asd',0.00,NULL,'Received','[{\"qty\": 20, \"notes\": \"sdf\", \"part_id\": null, \"partName\": \"battery\"}]','2026-05-19 10:08:27','Amina Ahmed','2026-05-19','Amina Ahmed','go','2026-05-19 10:08:35','2026-05-19 10:10:42',4),(14,'PO-20260612-7705','Castrol Distributor',0.00,'2026-06-12','Received','[{\"qty\": 2, \"notes\": \"testing1\", \"part_id\": null, \"partName\": \"Engine Oil 15W40\"}]','2026-06-12 06:18:34','Amina Ahmed','2026-06-12','Amina Ahmed','asd','2026-06-12 06:18:46','2026-06-12 06:18:53',4),(15,'PO-20260612-1355','Castrol Distributor',0.00,NULL,'Received','[{\"qty\": 11, \"notes\": \"\", \"part_id\": null, \"partName\": \"Engine Oil 15W40\"}]','2026-06-12 06:24:18','Amina Ahmed','2026-06-12','Amina Ahmed','qasdf','2026-06-12 06:24:45','2026-06-12 06:24:47',4),(16,'PO-20260616-4358','Ashok Spares',0.00,'2026-06-16','Received','[{\"qty\": 2, \"notes\": \"NA\", \"part_id\": null, \"partName\": \"Brake Pads\"}]','2026-06-16 05:23:27','Amina Ahmed','2026-06-16','Amina Ahmed','Brake pads approved','2026-06-16 05:25:21','2026-06-16 05:26:01',4),(17,'PO-20260617-4241','Castrol Oils',0.00,'2026-06-17','Received','[{\"qty\": 1, \"notes\": \"\", \"part_id\": null, \"partName\": \"Engine Oil 15W40\"}]','2026-06-17 06:04:47','Amina Ahmed','2026-06-17','Amina Ahmed','Approve the oil','2026-06-17 06:07:25','2026-06-17 06:07:49',4);
/*!40000 ALTER TABLE `inventory_purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_stock_movements`
--

DROP TABLE IF EXISTS `inventory_stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_stock_movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `part_id` int NOT NULL,
  `movement_type` varchar(50) NOT NULL,
  `quantity` int DEFAULT '0',
  `cost_per_unit` decimal(10,2) DEFAULT '0.00',
  `vendor` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(255) DEFAULT NULL,
  `movement_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `part_id` (`part_id`),
  CONSTRAINT `inventory_stock_movements_ibfk_1` FOREIGN KEY (`part_id`) REFERENCES `inventory_parts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_stock_movements`
--

LOCK TABLES `inventory_stock_movements` WRITE;
/*!40000 ALTER TABLE `inventory_stock_movements` DISABLE KEYS */;
INSERT INTO `inventory_stock_movements` VALUES (1,1,'Stock In',6,600.00,'Lucas Supplies','BILL-2026','2026-05-07','2026-05-07 08:22:55'),(2,2,'Stock Out',2,400.00,'Castrol Lubricants',NULL,'2026-05-07','2026-05-07 08:30:07'),(3,1,'Stock Out',4,40.00,'',NULL,'2026-05-19','2026-05-19 05:54:40'),(4,2,'Stock Out',10,30000.00,'',NULL,'2026-05-19','2026-05-19 05:56:19'),(5,2,'Stock Out',2,400.00,'Castrol Lubricants',NULL,'2026-05-18','2026-05-19 09:01:52'),(6,3,'Stock Out',2,12.00,'erfghn',NULL,'2026-05-19','2026-05-19 09:46:47'),(7,4,'Stock In',20,0.00,'asd',NULL,'2026-05-19','2026-05-19 10:10:58'),(8,5,'Stock Out',20,30.00,'',NULL,'2026-05-19','2026-05-19 10:12:38'),(9,1,'Stock Out',1,600.00,'Lucas Supplies',NULL,'2026-05-18','2026-05-20 07:47:02'),(10,5,'Stock Out',1,12.00,'',NULL,'2026-05-20','2026-05-20 08:01:21'),(11,1,'Stock Out',1,600.00,'Lucas Supplies',NULL,'2026-05-19','2026-05-21 09:57:50'),(12,4,'Stock In',12,0.00,'wsdfg',NULL,'2026-06-10','2026-06-10 06:16:53'),(13,1,'Stock In',10,0.00,'ashwini',NULL,'2026-06-10','2026-06-10 06:18:57'),(14,10,'Stock In',2,0.00,'Castrol Distributor',NULL,'2026-06-12','2026-06-12 06:18:59'),(15,10,'Stock In',11,0.00,'Castrol Distributor',NULL,'2026-06-12','2026-06-12 06:24:50'),(16,11,'Stock In',2,0.00,'Ashok Spares',NULL,'2026-06-16','2026-06-16 05:26:28'),(17,10,'Stock In',1,0.00,'Castrol Oils',NULL,'2026-06-17','2026-06-17 06:07:53');
/*!40000 ALTER TABLE `inventory_stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_vendors`
--

DROP TABLE IF EXISTS `inventory_vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(255) NOT NULL,
  `gst_number` varchar(100) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text,
  `status` varchar(50) DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_vendors`
--

LOCK TABLES `inventory_vendors` WRITE;
/*!40000 ALTER TABLE `inventory_vendors` DISABLE KEYS */;
INSERT INTO `inventory_vendors` VALUES (1,'Bosch India','GST001','Rahul','9876543210','bosch@gmail.com','Hyderabad','Active','2026-05-07 06:49:27'),(2,'TVS Motors','GST002','Kiran','9123456780','tvs@gmail.com','Bangalore','Active','2026-05-07 06:49:27'),(3,'Castrol Lubricants','GST003','Arjun','9988776655','castrol@gmail.com','Mumbai','Active','2026-05-07 06:49:27');
/*!40000 ALTER TABLE `inventory_vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_warehouses`
--

DROP TABLE IF EXISTS `inventory_warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_warehouses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warehouse_name` varchar(255) NOT NULL,
  `warehouse_code` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `manager_name` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_warehouses`
--

LOCK TABLES `inventory_warehouses` WRITE;
/*!40000 ALTER TABLE `inventory_warehouses` DISABLE KEYS */;
INSERT INTO `inventory_warehouses` VALUES (1,'Main Warehouse','WH001','Hyderabad','Ramesh','9876543210','Active','2026-05-07 06:59:14'),(2,'Lubricants Storage','WH002','Bangalore','Suresh','9123456789','Active','2026-05-07 06:59:14'),(3,'Tyre Storage','WH003','Chennai','Mahesh','9988776655','Active','2026-05-07 06:59:14');
/*!40000 ALTER TABLE `inventory_warehouses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oil_vendors`
--

DROP TABLE IF EXISTS `oil_vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oil_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(255) NOT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address_location` text,
  `gst_number` varchar(100) DEFAULT NULL,
  `opening_balance` decimal(12,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `bank_name` varchar(255) DEFAULT NULL,
  `custom_bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oil_vendors`
--

LOCK TABLES `oil_vendors` WRITE;
/*!40000 ALTER TABLE `oil_vendors` DISABLE KEYS */;
INSERT INTO `oil_vendors` VALUES (1,'Castrol Oils','7755226688','castrol@gmail.com','Hyderabad','GST12345678',500.00,'Active','State Bank of India (SBI)',NULL,'463259876342','SBI00412356','castrol@upi','2026-06-15 05:00:39','2026-06-15 05:00:39');
/*!40000 ALTER TABLE `oil_vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `old_tyres`
--

DROP TABLE IF EXISTS `old_tyres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `old_tyres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `old_tyre_number` varchar(100) DEFAULT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `tyre_size` varchar(100) NOT NULL,
  `material_type` varchar(100) DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `vehicle_number` varchar(100) DEFAULT NULL,
  `last_position` varchar(100) DEFAULT NULL,
  `removed_date` date NOT NULL,
  `removal_reason` varchar(255) DEFAULT NULL,
  `running_km` varchar(100) NOT NULL,
  `expected_life_km` varchar(100) DEFAULT NULL,
  `remaining_tread_percent` varchar(100) DEFAULT NULL,
  `tyre_status` varchar(100) DEFAULT 'OLD_STOCK',
  `store_location` varchar(255) NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `old_tyre_number` (`old_tyre_number`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `old_tyres`
--

LOCK TABLES `old_tyres` WRITE;
/*!40000 ALTER TABLE `old_tyres` DISABLE KEYS */;
INSERT INTO `old_tyres` VALUES (43,'TYR-1779443646816','Michelin','Agilis','12R22.5','Radial',NULL,'TS 12 AP 4567','FR','2026-05-22','Puncture','10','30000','100','RETREADING','Retreading Area','asdfg','2026-05-22 10:33:29','2026-06-16 07:49:53'),(44,'TYR-10002','MRF','EnduRace','295/90R20','Radial',13,'AP 12 AP 6789','FL','2026-06-16','Rotation','500','15000','95','SCRAPPED','Scrap Yard',NULL,'2026-06-16 08:35:05','2026-06-16 10:34:21');
/*!40000 ALTER TABLE `old_tyres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parts_vendors`
--

DROP TABLE IF EXISTS `parts_vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parts_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(255) NOT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address_location` text,
  `gst_number` varchar(100) DEFAULT NULL,
  `opening_balance` decimal(12,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `bank_name` varchar(255) DEFAULT NULL,
  `custom_bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parts_vendors`
--

LOCK TABLES `parts_vendors` WRITE;
/*!40000 ALTER TABLE `parts_vendors` DISABLE KEYS */;
INSERT INTO `parts_vendors` VALUES (1,'Ashok Spares','7788996958','ashok@gmail.com','Hyderabad','GST1234567',500.00,'Active','HDFC Bank','','12345678978','HDFC12345678','ashok@upi','2026-06-12 09:53:08','2026-06-12 09:53:08');
/*!40000 ALTER TABLE `parts_vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repair_services`
--

DROP TABLE IF EXISTS `repair_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repair_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `vehicle_no` varchar(50) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `previous_odometer` int DEFAULT NULL,
  `issue_description` text,
  `breakdown_type` varchar(50) DEFAULT NULL,
  `vehicle_condition` varchar(50) DEFAULT NULL,
  `breakdown_location` varchar(255) DEFAULT NULL,
  `reported_by` varchar(50) DEFAULT NULL,
  `priority` varchar(20) DEFAULT NULL,
  `service_date` date DEFAULT NULL,
  `odometer` int DEFAULT NULL,
  `garage` varchar(255) DEFAULT NULL,
  `repair_start_time` time DEFAULT NULL,
  `repair_end_time` time DEFAULT NULL,
  `downtime` varchar(50) DEFAULT NULL,
  `repair_notes` text,
  `status` varchar(50) DEFAULT 'Reported',
  `labour_cost` decimal(10,2) DEFAULT '0.00',
  `parts_total` decimal(10,2) DEFAULT '0.00',
  `total_cost` decimal(10,2) DEFAULT '0.00',
  `parts` json DEFAULT NULL,
  `files` json DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `inspection_id` varchar(100) DEFAULT NULL,
  `inspection_defect_id` int DEFAULT NULL,
  `completed_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicle_id` (`vehicle_id`),
  CONSTRAINT `repair_services_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repair_services`
--

LOCK TABLES `repair_services` WRITE;
/*!40000 ALTER TABLE `repair_services` DISABLE KEYS */;
INSERT INTO `repair_services` VALUES (1,20,'TG 12 AP 1234','Ashok','yogi',0,'Engine','Engine','Running','Hyderabad','Driver','Medium','2026-05-04',498,'ABC Garage','15:08:00','15:34:00','00h 26m','Done','Under Repair',99.00,120.00,219.00,'[{\"id\": 1777887578645, \"qty\": 2, \"name\": \"Lights\", \"vendor\": \"BBabu\", \"costPerUnit\": 60}]','[{\"name\": \"1776759988634-KENGUVA_ASHWINI-2-.pdf\", \"size\": 138921, \"type\": \"application/pdf\"}]',NULL,'2026-05-04 09:40:02',NULL,NULL,NULL),(2,13,'AP 12 AP 6789','tata','yogi',0,'asdf','Engine','Running','asd','Driver','Medium','2026-05-16',1234567,'XYZ Works','11:34:00','12:30:00','00h 56m','asdfgh','Completed',0.00,200.00,200.00,'[{\"id\": 1779084812525, \"qty\": 1, \"name\": \"1q2we\", \"vendor\": \"\", \"costPerUnit\": 200}]','[]',NULL,'2026-05-18 05:58:27',NULL,NULL,NULL),(4,13,'AP 12 AP 6789','tata','yogi',0,'asdfghj','Engine','Running','','Driver','Medium','2026-05-18',123455,'ABC Garage','13:09:00',NULL,'00h 00m','Created from failed inspection checkpoint(s)','Completed',0.00,600.00,600.00,'[{\"id\": 1779262761771, \"qty\": 1, \"name\": \"Brakes Pads\", \"vendor\": \"Lucas Supplies\", \"costPerUnit\": 600, \"inventoryId\": 1, \"availableStock\": 37}]','[]',NULL,'2026-05-20 07:43:29','INS-1779261090852',4,NULL),(5,13,'AP 12 AP 6789','tata','yogi',0,'Inspection failed for: Front left tier, Back left tier','Other','Running','','Nayak','Medium','2026-05-20',123455,'ABC Garage','13:30:00',NULL,'00h 00m','Created from failed inspection checkpoint(s)','Completed',0.00,12.00,12.00,'[{\"id\": 1779264076174, \"qty\": 1, \"name\": \"engin oil\", \"vendor\": \"\", \"costPerUnit\": 12, \"inventoryId\": 5, \"availableStock\": 10}]','[]',NULL,'2026-05-20 08:01:20','INS-1779261090852',7,NULL),(6,20,'TG 12 AP 1234','Ashok','yogi',NULL,'Tyre issue','Tyre','Running',NULL,'Driver','Medium','2026-05-21',NULL,NULL,'11:21:00',NULL,'00h 00m',NULL,'Reported',0.00,0.00,0.00,'[]','[]',NULL,'2026-05-21 05:53:38',NULL,NULL,NULL),(7,23,'MG 28 AP 1234','Suzuki','Vara Prasad',NULL,'Breaks','Engine','Running','','Driver','Medium','2026-05-19',760,'ABC Garage','15:25:00','21:32:00','06h 07m','good condition','Completed',50.00,600.00,650.00,'[{\"id\": 1779357420579, \"qty\": 1, \"name\": \"Brakes Pads\", \"vendor\": \"Lucas Supplies\", \"costPerUnit\": 600, \"inventoryId\": 1, \"availableStock\": 36}]','[{\"name\": \"1776759988634-KENGUVA_ASHWINI-2-.pdf\", \"size\": 138921, \"type\": \"application/pdf\"}]',NULL,'2026-05-21 09:55:22',NULL,NULL,'2026-05-21 15:27:50'),(8,24,'TS 12 AP 4567','Maruti','yogi',NULL,'sdfghjk','Tyre','Running',NULL,'Driver','Medium','2026-05-22',NULL,NULL,NULL,NULL,'00h 00m',NULL,'Reported',0.00,0.00,0.00,'[]','[]',NULL,'2026-05-22 10:36:49',NULL,NULL,NULL),(9,23,'MG 28 AP 1234','Suzuki','Vara Prasad',NULL,'Engine oil','Engine','Running','Hyderabad','Driver','Medium','2026-06-10',760,NULL,'11:20:00','11:36:00','00h 16m','Good','Under Repair',0.00,0.00,0.00,'[]','[{\"name\": \"KENGUVA_ASHWINI-2-.pdf\", \"size\": 138921, \"type\": \"application/pdf\"}]',NULL,'2026-06-10 05:51:44',NULL,NULL,NULL),(10,23,'MG 28 AP 1234','Suzuki','Vara Prasad',NULL,'Engine oil','Engine','Running','KPHB','Driver','Medium','2026-06-10',760,NULL,'11:23:00','11:38:00','00h 15m','good','Under Repair',500.00,0.00,500.00,'[]','[{\"name\": \"KENGUVA_ASHWINI-2-.pdf\", \"size\": 138921, \"type\": \"application/pdf\"}]',NULL,'2026-06-10 05:54:20',NULL,NULL,NULL),(11,23,'MG 28 AP 1234','Suzuki','Vara Prasad',NULL,'Engine oil','Engine','Running','Guntur','Driver','Medium','2026-06-10',760,NULL,'11:26:00','11:57:00','00h 31m','good','Under Repair',500.00,0.00,500.00,'[]','[{\"name\": \"KENGUVA_ASHWINI-2-.pdf\", \"size\": 138921, \"type\": \"application/pdf\"}]',NULL,'2026-06-10 05:57:07',NULL,NULL,NULL),(12,23,'MG 28 AP 1234','Suzuki','Vara Prasad',NULL,'Engine oil','Engine','Running','MH','Driver','Medium','2026-06-10',760,'Shiva Auto Mobiles','11:55:00','11:59:00','00h 04m','Good','Under Repair',500.00,0.00,500.00,'[]','[{\"name\": \"KENGUVA_ASHWINI-2-.pdf\", \"size\": 138921, \"type\": \"application/pdf\"}]',NULL,'2026-06-10 06:26:02',NULL,NULL,NULL);
/*!40000 ALTER TABLE `repair_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_audit_logs`
--

DROP TABLE IF EXISTS `role_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `action` varchar(100) DEFAULT NULL,
  `description` text,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(100) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `performed_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_role_audit_logs_role` (`role_id`),
  CONSTRAINT `fk_role_audit_logs_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_audit_logs`
--

LOCK TABLES `role_audit_logs` WRITE;
/*!40000 ALTER TABLE `role_audit_logs` DISABLE KEYS */;
INSERT INTO `role_audit_logs` VALUES (8,3,'CREATE','Role Manager created successfully.',NULL,NULL,NULL,NULL,'Admin','2026-07-06 08:09:47'),(9,3,'UPDATE PERMISSIONS','Role permissions updated.',NULL,NULL,NULL,NULL,'Admin','2026-07-06 08:09:48');
/*!40000 ALTER TABLE `role_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `can_view` tinyint(1) DEFAULT '0',
  `can_create` tinyint(1) DEFAULT '0',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `can_approve` tinyint(1) DEFAULT '0',
  `can_export` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_role_permissions_role` (`role_id`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (37,3,'Dashboard',1,1,1,1,1,1,'2026-07-06 08:09:47','2026-07-06 08:09:47'),(38,3,'Vehicle Master',1,1,1,1,1,1,'2026-07-06 08:09:47','2026-07-06 08:09:47'),(39,3,'Trip Master',1,1,1,1,1,1,'2026-07-06 08:09:47','2026-07-06 08:09:47'),(40,3,'Fuel Management',1,1,1,1,1,1,'2026-07-06 08:09:47','2026-07-06 08:09:47'),(41,3,'Service & Maintenance',1,1,1,1,1,1,'2026-07-06 08:09:47','2026-07-06 08:09:47'),(42,3,'Tyres Management',1,1,1,1,1,1,'2026-07-06 08:09:47','2026-07-06 08:09:47'),(43,3,'Parts & Inventory',1,1,1,1,1,1,'2026-07-06 08:09:47','2026-07-06 08:09:47'),(44,3,'Vehicle Inspection',1,1,1,1,1,1,'2026-07-06 08:09:47','2026-07-06 08:09:47'),(45,3,'Incidents',1,1,1,1,1,1,'2026-07-06 08:09:47','2026-07-06 08:09:47'),(46,3,'Warranties',1,1,1,1,1,1,'2026-07-06 08:09:48','2026-07-06 08:09:48'),(47,3,'Income & Expense',1,1,1,1,1,1,'2026-07-06 08:09:48','2026-07-06 08:09:48'),(48,3,'Vendor Ledgers',1,1,1,1,1,1,'2026-07-06 08:09:48','2026-07-06 08:09:48'),(49,3,'Operational Payments',1,1,1,1,1,1,'2026-07-06 08:09:48','2026-07-06 08:09:48'),(50,3,'P&L Reports',1,1,1,1,1,1,'2026-07-06 08:09:48','2026-07-06 08:09:48'),(51,3,'Staff Management',1,1,1,1,1,1,'2026-07-06 08:09:48','2026-07-06 08:09:48'),(52,3,'Documents',1,1,1,1,1,1,'2026-07-06 08:09:48','2026-07-06 08:09:48'),(53,3,'Administration',1,1,1,1,1,1,'2026-07-06 08:09:48','2026-07-06 08:09:48'),(54,3,'Audit Logs',1,1,1,1,1,1,'2026-07-06 08:09:48','2026-07-06 08:09:48');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_code` varchar(20) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `description` text,
  `department` varchar(100) DEFAULT NULL,
  `level` int DEFAULT '1',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `is_system_role` tinyint(1) DEFAULT '0',
  `color` varchar(20) DEFAULT '#6366F1',
  `icon` varchar(100) DEFAULT 'Shield',
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_code` (`role_code`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'ROLE0001','Manager','Good performance','General',1,'Active',0,'#6366F1','Shield','Admin','Admin','2026-07-06 08:09:47','2026-07-06 08:09:47');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rta_expenses`
--

DROP TABLE IF EXISTS `rta_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rta_expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `vehicle_no` varchar(100) NOT NULL,
  `expense_type` varchar(150) NOT NULL,
  `expense_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `rta_expenses_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `rta_vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rta_expenses`
--

LOCK TABLES `rta_expenses` WRITE;
/*!40000 ALTER TABLE `rta_expenses` DISABLE KEYS */;
INSERT INTO `rta_expenses` VALUES (1,1,'MG 28 AP 1234','Pollution Certificate','2026-06-22',500.00,'RF12345678','good','2026-06-22 06:21:29'),(2,1,'AP 26 AP 4321','Pollution Certificate','2026-06-22',500.00,'RF87654321','good','2026-06-22 06:26:36');
/*!40000 ALTER TABLE `rta_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rta_payments`
--

DROP TABLE IF EXISTS `rta_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rta_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(100) NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `rta_payments_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `rta_vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rta_payments`
--

LOCK TABLES `rta_payments` WRITE;
/*!40000 ALTER TABLE `rta_payments` DISABLE KEYS */;
INSERT INTO `rta_payments` VALUES (1,1,'2026-06-22',500.00,'Cash','RF24567823','Done','2026-06-22 06:39:00');
/*!40000 ALTER TABLE `rta_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rta_vendors`
--

DROP TABLE IF EXISTS `rta_vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rta_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(255) NOT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address_location` text,
  `agent_type` varchar(100) NOT NULL,
  `opening_balance` decimal(12,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `bank_name` varchar(255) DEFAULT NULL,
  `custom_bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rta_vendors`
--

LOCK TABLES `rta_vendors` WRITE;
/*!40000 ALTER TABLE `rta_vendors` DISABLE KEYS */;
INSERT INTO `rta_vendors` VALUES (1,'RTA Raghu','8855226699','raghu@gmail.com','Kondapur','RTO Office',500.00,'Active','State Bank of India (SBI)','','456897425896','SBI12345678','raghu@upi','NA','2026-06-18 09:23:15','2026-06-18 09:30:47');
/*!40000 ALTER TABLE `rta_vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_files`
--

DROP TABLE IF EXISTS `service_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_id` int DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `service_files_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `vehicle_services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_files`
--

LOCK TABLES `service_files` WRITE;
/*!40000 ALTER TABLE `service_files` DISABLE KEYS */;
INSERT INTO `service_files` VALUES (1,1,'1777444461890-172328687.pdf','application/pdf','2026-04-29 06:34:22'),(2,1,'1777444461901-961505825.png','image/png','2026-04-29 06:34:22'),(3,10,'1779357183704-722930394.pdf','application/pdf','2026-05-21 09:53:03'),(4,13,'1781003273449-621598938.pdf','application/pdf','2026-06-09 11:07:53'),(5,14,'1781069447636-768405557.pdf','application/pdf','2026-06-10 05:30:47'),(6,15,'1781070325094-710990792.pdf','application/pdf','2026-06-10 05:45:25'),(7,16,'1781070537381-149615923.pdf','application/pdf','2026-06-10 05:48:57'),(8,17,'1781070629745-368009521.pdf','application/pdf','2026-06-10 05:50:29');
/*!40000 ALTER TABLE `service_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_parts`
--

DROP TABLE IF EXISTS `service_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_parts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_id` int DEFAULT NULL,
  `part_name` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `service_parts_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `vehicle_services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_parts`
--

LOCK TABLES `service_parts` WRITE;
/*!40000 ALTER TABLE `service_parts` DISABLE KEYS */;
INSERT INTO `service_parts` VALUES (1,1,'Mirros',2,500.00,'param1','2026-04-29 06:34:22'),(2,2,'asd',2,100.00,'','2026-05-18 05:34:24'),(4,7,'Lights',3,400.00,'Castrol Lubricants','2026-05-19 08:56:12'),(5,8,'Lights',2,400.00,'Castrol Lubricants','2026-05-19 09:01:52'),(6,9,'tube 1',2,12.00,'erfghn','2026-05-19 09:46:47');
/*!40000 ALTER TABLE `service_parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `showrooms`
--

DROP TABLE IF EXISTS `showrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `showrooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `showroom_name` varchar(255) NOT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address_location` text,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `contact_person` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `custom_bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `opening_balance` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `showrooms`
--

LOCK TABLES `showrooms` WRITE;
/*!40000 ALTER TABLE `showrooms` DISABLE KEYS */;
INSERT INTO `showrooms` VALUES (1,'Arjun Toyota','9966334578','ramu@gmail.com','Hyderabad','Active','Ramesh ','Sales manager','HDFC Bank','','788799667894','HDFC12345678','arjun@upi',500.00,'2026-06-12 04:55:34','2026-06-12 05:14:05');
/*!40000 ALTER TABLE `showrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stations`
--

DROP TABLE IF EXISTS `stations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `station_name` varchar(255) DEFAULT NULL,
  `station_code` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `manager_name` varchar(255) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stations`
--

LOCK TABLES `stations` WRITE;
/*!40000 ALTER TABLE `stations` DISABLE KEYS */;
INSERT INTO `stations` VALUES (1,'central hub','STN - 001','Hyderabad','Ramu','1234578965','2026-04-15 10:18:35'),(2,'git hub','STN -666','hyedddd','kjhgfdsgh','8745623565','2026-04-15 10:48:48'),(3,'HyderabadHUB','STB - 003','Hyderabad','Raghava','7897889789','2026-04-20 05:29:23'),(4,'Parameswara','STN - 005','Gachibowli','Kiran Sai','9955995595','2026-04-27 05:37:31');
/*!40000 ALTER TABLE `stations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervisors`
--

DROP TABLE IF EXISTS `supervisors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervisors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `id_card_number` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `address` text,
  `station_id` int DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `id_document` varchar(255) DEFAULT NULL,
  `bank_document` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_card_file` varchar(255) DEFAULT NULL,
  `bank_doc_file` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `supervisors_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervisors`
--

LOCK TABLES `supervisors` WRITE;
/*!40000 ALTER TABLE `supervisors` DISABLE KEYS */;
INSERT INTO `supervisors` VALUES (1,'Raghu','7885587899','123454657897','active','hyderabad',2,'HDFC','12345678912','HDFC0001234',NULL,NULL,NULL,'2026-04-16 04:55:26',NULL,NULL),(2,'Nayak','7897897897','1234565788','active','Andra pradesh',3,'SBI','123456789','SBI0012345',NULL,NULL,NULL,'2026-04-20 05:30:30',NULL,NULL),(3,'Srinu','+917075850719','123asd','active','hyd',3,'admin@galacticosnetwork.com','12345678','sdfqwertyh',NULL,NULL,NULL,'2026-04-25 08:45:31',NULL,NULL),(5,'mani','+917075850719','123asd','active','Suraram Colony\r\n3-121, sundar nagar, suraram , jeedimetla, Hyderabad, Telangana',2,'admin@galacticosnetwork.com','12345678','2345asder','1777107517336.pdf','1777107517344.pdf','1777107517354.pdf','2026-04-25 08:58:38',NULL,NULL),(6,'Raghu ram','7788778878','123456789','active','Golconda, Hyderabad',4,'SBI','123456789','SBI0012345','1777268380854.pdf','1777268380858.pdf','1777268380861.pdf','2026-04-27 05:39:42',NULL,NULL);
/*!40000 ALTER TABLE `supervisors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trip_expenses`
--

DROP TABLE IF EXISTS `trip_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_expenses`
--

LOCK TABLES `trip_expenses` WRITE;
/*!40000 ALTER TABLE `trip_expenses` DISABLE KEYS */;
INSERT INTO `trip_expenses` VALUES (1,'TRIP-6933',500.00,'Toll','Nalagonda toll gate','2026-04-20 07:01:02'),(2,'TRIP-3782',500.00,'Maintenance','Water Wash','2026-04-22 07:21:47'),(3,'TRIP-5211',100.00,'Maintenance','toll','2026-04-23 05:33:07'),(4,'TRIP-5211',100.00,'Maintenance','food','2026-04-23 05:35:41'),(5,'TRIP-5211',100.00,'Maintenance','food r','2026-04-23 09:18:04'),(6,'TRIP-5211',12.00,'Maintenance','34asd','2026-04-23 09:49:49'),(7,'TRIP-7585',0.00,'Maintenance','toll','2026-04-24 06:43:52'),(8,'TRIP-9473',10.00,'Maintenance','food','2026-04-25 09:14:40'),(9,'TRIP-3159',500.00,'Toll','nallagonda','2026-04-27 05:57:55'),(10,'TRIP-7083',500.00,'Toll','','2026-04-27 06:22:11'),(11,'TRIP-4474',500.00,'Toll','toll 1','2026-05-21 09:41:31');
/*!40000 ALTER TABLE `trip_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trip_fuel`
--

DROP TABLE IF EXISTS `trip_fuel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_fuel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` varchar(50) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_fuel`
--

LOCK TABLES `trip_fuel` WRITE;
/*!40000 ALTER TABLE `trip_fuel` DISABLE KEYS */;
INSERT INTO `trip_fuel` VALUES (1,'TRIP-6933',25.00,90.00,'Bharat Petroleum','2026-04-20 07:01:26',NULL),(2,'TRIP-3782',9.00,95.00,'Bharat Petroleum','2026-04-22 07:22:18',NULL),(3,'TRIP-5211',2.00,56.00,'Indian Oil','2026-04-23 09:22:33',NULL);
/*!40000 ALTER TABLE `trip_fuel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trips` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` varchar(50) DEFAULT NULL,
  `trip_type` varchar(50) DEFAULT NULL,
  `trip_status` varchar(50) DEFAULT NULL,
  `trip_priority` varchar(50) DEFAULT NULL,
  `transport_type` varchar(50) DEFAULT NULL,
  `contract_order_id` varchar(100) DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `station_id` int DEFAULT NULL,
  `truck_no` varchar(50) DEFAULT NULL,
  `trip_date` date DEFAULT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `driver_contact` varchar(20) DEFAULT NULL,
  `co_driver` varchar(255) DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `source_plant` varchar(255) DEFAULT NULL,
  `truck_capacity` int DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `start_odometer` int DEFAULT NULL,
  `last_odometer` int DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `destination_state` varchar(255) DEFAULT NULL,
  `via_stops` text,
  `route_type` varchar(50) DEFAULT NULL,
  `est_distance` int DEFAULT NULL,
  `trip_duration` varchar(100) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `eta` datetime DEFAULT NULL,
  `loading_time` datetime DEFAULT NULL,
  `unloading_time` datetime DEFAULT NULL,
  `material_type` varchar(255) DEFAULT NULL,
  `load_weight` decimal(10,2) DEFAULT NULL,
  `load_type` varchar(50) DEFAULT NULL,
  `units` int DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `lr_number` varchar(100) DEFAULT NULL,
  `trip_budget` decimal(10,2) DEFAULT NULL,
  `expense_limit` decimal(10,2) DEFAULT NULL,
  `payment_mode` varchar(50) DEFAULT NULL,
  `freight_amount` decimal(10,2) DEFAULT NULL,
  `driver_advance` decimal(10,2) DEFAULT NULL,
  `hamali_advance` decimal(10,2) DEFAULT NULL,
  `other_advance` decimal(10,2) DEFAULT NULL,
  `expected_mileage` decimal(5,2) DEFAULT NULL,
  `diesel_rate` decimal(10,2) DEFAULT NULL,
  `diesel_qty` decimal(10,2) DEFAULT NULL,
  `fuel_vendor` varchar(255) DEFAULT NULL,
  `proof_files` text,
  `truck_warnings` text,
  `draft_saved` tinyint(1) DEFAULT NULL,
  `last_draft_time` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `eway_bill_file` varchar(255) DEFAULT NULL,
  `invoice_file` varchar(255) DEFAULT NULL,
  `pod_file` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trip_id` (`trip_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  CONSTRAINT `trips_ibfk_3` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`id`),
  CONSTRAINT `trips_ibfk_4` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (15,'TRIP-7083','Express','Closed','Urgent','Outbound','ORD-2026',20,2,5,3,'TG 12 AP 1234','2026-04-27','yogi','7897537539','Nayak Sab','mani','HyderabadHUB',300,'Diesel',300,200,'Lingampalli','Secundrabad','Telangana','Miyapur','City',26,NULL,'2026-04-27 06:13:00','2026-04-28 06:13:00','2026-04-26 06:13:00','2026-04-28 06:13:00','Rice',30.00,'Full',500,'Jaya','INV-2026','LR-2026',50000.00,10000.00,'Cash',45000.00,5000.00,2000.00,1000.00,9.00,95.00,2.00,NULL,'','[]',1,'2026-04-27 06:14:31','2026-04-27 06:14:33',0,NULL,'1777270943353.pdf','1777270948142.pdf','1777270952400.pdf'),(16,'TRIP-4474','Regular','Closed','Urgent','Outbound','ORD-2025',23,4,6,4,'MG 28 AP 1234','2026-05-21','Vara Prasad','7799779979','Ramu','Raghu ram','Parameswara',50,'Diesel',60,50,'Hyderabad','Tirupati','Andhra Pradesh','Vijayawada',NULL,700,NULL,'2026-05-21 09:36:00','2026-05-22 09:36:00','2026-05-20 09:37:00','2026-05-22 09:36:00','Petrol',50.00,'Full',500,'Ashwini','INV-2025','LR_2026',10000.00,5000.00,'Cash',50000.00,5000.00,2000.00,1000.00,8.00,95.00,50.00,NULL,'','[]',1,'2026-05-21 09:39:30','2026-05-21 09:39:30',0,NULL,'1779356525190-562959865.pdf','1779356530784-935615730.pdf','1779356536658-970217291.pdf'),(17,'TRIP-1035','Regular','Planned','Normal','Inbound','ORD-2026-1234',13,2,2,2,'AP 12 AP 6789','2026-06-18','yogi','7897537539','yash','Nayak','git hub',300,'Diesel',13,12,'Lingampalli','Secunderabad','telangana','miyapur','City',20,NULL,'2026-06-18 04:59:00','2026-06-19 04:59:00','2026-06-17 04:59:00','2026-06-19 04:59:00','Gas',50.00,'Full',880,'Yamini','INV-20260-1234','LR-2026-1234',50000.00,10000.00,'Cash',45000.00,5000.00,2000.00,1000.00,20.00,95.00,15.00,NULL,'','[\"⚠️ Vehicle not available\"]',1,'2026-06-18 06:25:54','2026-06-18 06:25:55',0,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tyre_activity_history`
--

DROP TABLE IF EXISTS `tyre_activity_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tyre_activity_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tyre_number` varchar(255) DEFAULT NULL,
  `vehicle_number` varchar(255) DEFAULT NULL,
  `activity_type` varchar(100) DEFAULT NULL,
  `tyre_position` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tyre_activity_history`
--

LOCK TABLES `tyre_activity_history` WRITE;
/*!40000 ALTER TABLE `tyre_activity_history` DISABLE KEYS */;
INSERT INTO `tyre_activity_history` VALUES (1,'TYR-1778831687410','MG 28 AP 1234','mounted','FR','Tyre mounted to vehicle','2026-05-22 05:11:51'),(2,'TYR-1779355979607','MG 28 AP 1234','removed','FL','Tyre removed from vehicle','2026-05-22 05:26:24'),(3,'TYR-1779355979607','MG 28 AP 1234','mounted','FL','Tyre mounted to vehicle','2026-05-22 05:27:15'),(4,'TYR-1779440797224','TS 12 AP 4567','mounted','FL','Tyre mounted to vehicle','2026-05-22 09:07:06'),(5,'TYR-1779440797224','','mounted','','Tyre mounted to vehicle','2026-05-22 09:14:09'),(6,'TYR-1779440063926','TS 12 AP 4567','mounted','FL','Tyre mounted to vehicle','2026-05-22 09:14:09'),(7,'TYR-1779440063926','','mounted','','Tyre mounted to vehicle','2026-05-22 09:27:12'),(8,'TYR-1779440797224','TS 12 AP 4567','mounted','FL','Tyre mounted to vehicle','2026-05-22 09:27:12'),(9,'TYR-1779440797224','','mounted','','Tyre mounted to vehicle','2026-05-22 09:37:02'),(10,'TYR-1779440063926','TS 12 AP 4567','mounted','FL','Tyre mounted to vehicle','2026-05-22 09:37:03'),(11,'TYR-1779440797224','TS 12 AP 4567','mounted','L1_OUTER','Tyre mounted to vehicle','2026-05-22 09:52:11'),(12,'TYR-1779440063926','','mounted','','Tyre mounted to vehicle','2026-05-22 09:54:55'),(13,'TYR-1779443646816','TS 12 AP 4567','mounted','FL','Tyre mounted to vehicle','2026-05-22 09:54:55'),(14,'TYR-1779440063926','TS 12 AP 4567','mounted','FR','Tyre mounted to vehicle','2026-05-22 10:11:36'),(15,'TYR-1779443646816','TS 12 AP 4567','removed','FL','Tyre removed from vehicle','2026-05-22 10:13:45'),(16,'TYR-1779443646816','TS 12 AP 4567','mounted','frontleft','Tyre mounted to vehicle','2026-05-22 10:16:12'),(17,'TYR-1779443646816','TS 12 AP 4567','removed','frontleft','Tyre removed from vehicle','2026-05-22 10:18:08'),(18,'TYR-1779440063926','','mounted','','Tyre mounted to vehicle','2026-05-22 10:19:09'),(19,'TYR-1779443646816','TS 12 AP 4567','mounted','FR','Tyre mounted to vehicle','2026-05-22 10:19:09'),(20,'TYR-1779440797224','TS 12 AP 4567','removed','L1_OUTER','Tyre removed from vehicle','2026-05-22 10:26:13'),(21,'TYR-1779443646816','TS 12 AP 4567','removed','FR','Tyre removed from vehicle','2026-05-22 10:33:29'),(22,'TYR-1779440797224','TS 12 AP 4567','mounted','FR','Tyre mounted to vehicle','2026-05-22 10:33:29');
/*!40000 ALTER TABLE `tyre_activity_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tyre_notifications`
--

DROP TABLE IF EXISTS `tyre_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tyre_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notification_id` varchar(60) NOT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `tyre_id` varchar(60) DEFAULT NULL,
  `axle_position` varchar(30) DEFAULT NULL,
  `incident_type` varchar(60) NOT NULL,
  `severity` enum('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
  `priority` enum('Low','Normal','High','Urgent') NOT NULL DEFAULT 'Normal',
  `message` text NOT NULL,
  `status` enum('Unread','Read') NOT NULL DEFAULT 'Unread',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_id` (`notification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tyre_notifications`
--

LOCK TABLES `tyre_notifications` WRITE;
/*!40000 ALTER TABLE `tyre_notifications` DISABLE KEYS */;
INSERT INTO `tyre_notifications` VALUES (1,'NOTIF-1779361745966-906','AP 12 AP 6789','INC-1778234662178','Front Left','Tyre Issue','High','High','Alert: Front Left Tyre Issue on Truck AP 12 AP 6789','Read','2026-05-21 11:09:05'),(2,'NOTIF-1779361746094-336','MG 28 AP 1234','INC-1779358982922','Front Left','Tyre Issue','Medium','Normal','Front Left Tyre Issue reported on Truck MG 28 AP 1234','Read','2026-05-21 11:09:06'),(3,'NOTIF-1779361746148-874','AP 26 AP 4321','INC-1779359196511','Front Left','Tyre Issue','High','High','Alert: Front Left Tyre Issue on Truck AP 26 AP 4321','Read','2026-05-21 11:09:06');
/*!40000 ALTER TABLE `tyre_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tyre_retreading`
--

DROP TABLE IF EXISTS `tyre_retreading`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tyre_retreading` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tyre_id` varchar(255) NOT NULL,
  `tyre_no` varchar(255) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `tyre_size` varchar(100) DEFAULT NULL,
  `vehicle_no` varchar(100) DEFAULT NULL,
  `last_position` varchar(100) DEFAULT NULL,
  `running_km` int DEFAULT '0',
  `remaining_tread` decimal(5,2) DEFAULT NULL,
  `vendor_id` int NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `sent_date` date NOT NULL,
  `expected_return_date` date NOT NULL,
  `expected_cost` decimal(12,2) NOT NULL,
  `actual_cost` decimal(12,2) DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `new_tread_percent` decimal(5,2) DEFAULT NULL,
  `tyre_condition` varchar(100) DEFAULT NULL,
  `notes` text,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tyre_retreading`
--

LOCK TABLES `tyre_retreading` WRITE;
/*!40000 ALTER TABLE `tyre_retreading` DISABLE KEYS */;
INSERT INTO `tyre_retreading` VALUES (3,'43','TYR-1779443646816','Michelin','Agilis','12R22.5','TS 12 AP 4567','FR',10,100.00,1,'Yogi Tyres Station','2026-06-16','2026-06-18',3500.00,NULL,NULL,NULL,NULL,'','IN_PROGRESS','2026-06-16 07:49:53','2026-06-16 07:49:53');
/*!40000 ALTER TABLE `tyre_retreading` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tyre_scrap_history`
--

DROP TABLE IF EXISTS `tyre_scrap_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tyre_scrap_history` (
  `id` varchar(50) NOT NULL,
  `txn_no` varchar(50) NOT NULL,
  `tyre_no` varchar(255) NOT NULL,
  `make` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `tyre_size` varchar(100) DEFAULT NULL,
  `vehicle_no` varchar(100) DEFAULT NULL,
  `running_km` int DEFAULT '0',
  `remaining_tread` decimal(5,2) DEFAULT NULL,
  `vendor_id` varchar(50) NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `scrap_date` date NOT NULL,
  `sale_amount` decimal(12,2) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tyre_scrap_history`
--

LOCK TABLES `tyre_scrap_history` WRITE;
/*!40000 ALTER TABLE `tyre_scrap_history` DISABLE KEYS */;
INSERT INTO `tyre_scrap_history` VALUES ('SCRAP-061401','SCRAP-061401','TYR-10002','MRF','EnduRace','295/90R20','AP 12 AP 6789',500,95.00,'2','Mahindra Scrapers','2026-06-16',2000.00,'Sidewall Damage','','2026-06-16 10:34:21');
/*!40000 ALTER TABLE `tyre_scrap_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tyre_service_history`
--

DROP TABLE IF EXISTS `tyre_service_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tyre_service_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repair_id` int DEFAULT NULL,
  `vehicle_id` int NOT NULL,
  `vehicle_no` varchar(50) DEFAULT NULL,
  `axle_position` varchar(30) DEFAULT NULL,
  `tyre_number` varchar(50) DEFAULT NULL,
  `issue_type` varchar(50) DEFAULT NULL,
  `action_taken` varchar(50) DEFAULT NULL,
  `tyre_health` varchar(20) DEFAULT NULL,
  `tread_percent` decimal(5,2) DEFAULT '0.00',
  `running_km` int DEFAULT '0',
  `replacement_tyre_number` varchar(50) DEFAULT NULL,
  `replacement_source` varchar(20) DEFAULT NULL,
  `tyre_repair_cost` decimal(10,2) DEFAULT '0.00',
  `tyre_replacement_cost` decimal(10,2) DEFAULT '0.00',
  `retreading_cost` decimal(10,2) DEFAULT '0.00',
  `service_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tyre_service_history`
--

LOCK TABLES `tyre_service_history` WRITE;
/*!40000 ALTER TABLE `tyre_service_history` DISABLE KEYS */;
INSERT INTO `tyre_service_history` VALUES (1,6,20,'TG 12 AP 1234','FL','TYR-1778831687410','Air Leakage','Remove From Vehicle','Critical',15.00,0,NULL,'Inventory',100.00,50.00,20.00,'2026-05-21','2026-05-21 05:53:39'),(2,8,24,'TS 12 AP 4567','FR','TYR-1779440797224','Pressure Issue','Repair Tyre','Good',80.00,0,NULL,'Inventory',500.00,1000.00,500.00,'2026-05-22','2026-05-22 10:36:49');
/*!40000 ALTER TABLE `tyre_service_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tyre_vendors`
--

DROP TABLE IF EXISTS `tyre_vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tyre_vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(255) NOT NULL,
  `vendor_type` varchar(100) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gst_number` varchar(100) DEFAULT NULL,
  `address_location` text,
  `services` json DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tyre_vendors`
--

LOCK TABLES `tyre_vendors` WRITE;
/*!40000 ALTER TABLE `tyre_vendors` DISABLE KEYS */;
INSERT INTO `tyre_vendors` VALUES (1,'Yogi Tyres Station','Tyre Dealer','Ram ','7788997788','yogi@gmail.com','GST123456','Hyderabad','[\"Tyre Supply\", \"Retreading\", \"Tyre Repair\", \"Wheel Alignment\", \"Wheel Balancing\"]','Active','2026-06-12 10:24:40','2026-06-12 10:24:40'),(2,'Mahindra Scrapers','Scrap Buyer','Vijay','8852367951','mahindra@gmail.com','GST123456789','Ashok Nagar','[]','Active','2026-06-16 10:33:40','2026-06-16 10:33:40');
/*!40000 ALTER TABLE `tyre_vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tyres`
--

DROP TABLE IF EXISTS `tyres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tyres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tyre_number` varchar(100) DEFAULT NULL,
  `serial_no` varchar(255) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `tyre_size` varchar(100) DEFAULT NULL,
  `material_type` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT 'In Stock',
  `vehicle_id` int DEFAULT NULL,
  `vehicle_number` varchar(100) DEFAULT NULL,
  `tyre_position` varchar(100) DEFAULT NULL,
  `date_of_issue` date DEFAULT NULL,
  `fitted_odometer` varchar(100) DEFAULT NULL,
  `expected_life_km` varchar(100) DEFAULT NULL,
  `running_km` varchar(100) DEFAULT '0',
  `remaining_life_km` varchar(100) DEFAULT NULL,
  `tyre_health` varchar(100) DEFAULT 'GOOD',
  `vendor_name` varchar(255) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `invoice_number` varchar(255) DEFAULT NULL,
  `tyre_cost` decimal(12,2) DEFAULT '0.00',
  `tyre_files` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tyre_number` (`tyre_number`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tyres`
--

LOCK TABLES `tyres` WRITE;
/*!40000 ALTER TABLE `tyres` DISABLE KEYS */;
INSERT INTO `tyres` VALUES (1,'TYR-1778831687410','TYR-100','Apollo','EnduRace','295/90R20','Radial','Mounted',NULL,'MG 28 AP 1234','FR','2026-05-22','760','15000','0','15000','Good','Tyre World','2026-05-15','INV-2025',1500.00,'[\"1778831687434-644846934.pdf\"]','2026-05-15 07:54:47','2026-05-22 05:21:39'),(2,'TYR-1778837559604','TYR-101','MRF','Milaze','295/90R20','Radial','Mounted',20,'TG 12 AP 1234','frontright','2026-05-19','500','25000','0','25000','Good','Apollo Dealer','2026-05-15','INV-2026',2500.00,'[\"1778837559652-213829987.pdf\"]','2026-05-15 09:32:39','2026-05-19 07:01:14'),(3,'TYR-98','TYR-98','MRF','Yamaha','1000x20','Radial Tubeless','Mounted',2,'AP 26 AP 4321','frontleft','2026-05-19','500','5000','0','56','Good',NULL,NULL,NULL,0.00,NULL,'2026-05-19 05:32:13','2026-05-19 10:30:30'),(5,'TYR-1779355641292','TYR-110','JK Tyre','Jet Xtra','295/90R20','Radial','Removed',NULL,'','',NULL,'0','20000','0','20000','Good','MRF Distributor','2026-05-21','INV-2026',5000.00,'[\"1779355641321-909208766.pdf\"]','2026-05-21 09:27:21','2026-05-22 04:57:56'),(6,'TYR-1779355979607','TYR-111','JK Tyre','UX Royale','315/80R22.5','Radial','Mounted',NULL,'MG 28 AP 1234','FL','2026-05-22','760','20000','0','20000','Good','MRF Distributor','2026-05-21','INV-2024',5500.00,'[\"1779355979633-903946071.pdf\"]','2026-05-21 09:32:59','2026-05-22 05:27:15'),(7,'TYR-1779440063926','TYR-8W-2025-002','JK Tyre','Jet Xtra','295/90R20','Radial','Removed',NULL,'','',NULL,'0','15000','0','15000','Removed','MRF Distributor','2026-05-22','INV-2025-TRK-001',5000.00,'[\"1779440063924-814330795.png\"]','2026-05-22 08:54:23','2026-05-22 10:19:09'),(8,'TYR-1779440797224','TYR-8W-2025-003','MRF','Zapper','12R22.5','Radial','Removed',NULL,NULL,NULL,'2026-05-22','10','20000','0','20000','Good','MRF Distributor','2026-05-17','',4000.00,'[\"1779440797248-745047556.png\"]','2026-05-22 09:06:37','2026-05-22 10:36:49'),(9,'TYR-1779443646816','TYR-200','Michelin','Agilis','12R22.5','Radial','Removed',NULL,'','',NULL,'0','30000','10','30000','Good','Apollo Dealer','2026-05-22','INV-2027',3500.00,'[\"1779443646837-785424473.png\"]','2026-05-22 09:54:06','2026-05-22 10:33:29'),(10,'TYR-1779543590769','TYR-2001','Bridgestone','M749','315/80R22.5','Radial','In Stock',NULL,'','','2026-05-20','','30000','0','30000','GOOD','Apollo Dealer','2026-05-20','INV-2028',2500.00,'[\"1779543590795-180727447.png\"]','2026-05-23 13:39:51','2026-05-23 13:39:51'),(11,'TYR-1781161851444','TY101','Apollo','EnduRace','295/90R20','Radial','In Stock',0,'','','2026-06-11','','100001','0','100001','GOOD','Apollo Tyres Distributor','2026-06-11','10111',1010.00,'[]','2026-06-11 07:10:52','2026-06-11 07:10:52'),(12,'TYR-1781593066174','TYR-10001','MRF','Zapper','12R22.5','Radial','In Stock',0,'','','2026-06-16','','150000','0','150000','GOOD','Yogi Tyres Station','2026-06-16','INV-2026-06',5000.00,'[\"1781593066226-623997257.png\"]','2026-06-16 06:57:46','2026-06-16 06:57:46');
/*!40000 ALTER TABLE `tyres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_login_history`
--

DROP TABLE IF EXISTS `user_login_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_login_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `login_time` datetime NOT NULL,
  `logout_time` datetime DEFAULT NULL,
  `ip_address` varchar(100) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `device` varchar(255) DEFAULT NULL,
  `operating_system` varchar(100) DEFAULT NULL,
  `login_type` enum('Web','Mobile') DEFAULT 'Web',
  `status` enum('Success','Failed') DEFAULT 'Success',
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_login` (`user_id`),
  KEY `idx_login_time` (`login_time`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_login_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_login_history`
--

LOCK TABLES `user_login_history` WRITE;
/*!40000 ALTER TABLE `user_login_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_login_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `can_view` tinyint(1) DEFAULT '0',
  `can_create` tinyint(1) DEFAULT '0',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `can_approve` tinyint(1) DEFAULT '0',
  `can_export` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_module` (`user_id`,`module_name`),
  KEY `idx_user_permission` (`user_id`),
  KEY `idx_module_name` (`module_name`),
  CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
INSERT INTO `user_permissions` VALUES (25,1,'Battery',1,1,1,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(26,1,'Company Profile',1,0,1,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(27,1,'Dashboard',1,0,1,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(28,1,'Driver Master',1,1,1,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(29,1,'Expense',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(30,1,'Fuel Management',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(31,1,'Garage Management',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(32,1,'Incidents',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(33,1,'Income',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(34,1,'Inspection',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(35,1,'Inventory',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(36,1,'Repair Management',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(37,1,'Reports',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(38,1,'Service Management',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(39,1,'Showroom',1,0,0,0,0,0,'2026-07-03 09:40:11','2026-07-03 09:40:11'),(40,1,'Station Master',1,0,0,0,0,0,'2026-07-03 09:40:12','2026-07-03 09:40:12'),(41,1,'Supervisor Master',1,0,0,0,0,0,'2026-07-03 09:40:12','2026-07-03 09:40:12'),(42,1,'Trip Management',1,0,0,0,0,0,'2026-07-03 09:40:12','2026-07-03 09:40:12'),(43,1,'Truck P&L',1,0,0,0,0,0,'2026-07-03 09:40:12','2026-07-03 09:40:12'),(44,1,'Tyres',1,0,0,0,0,0,'2026-07-03 09:40:12','2026-07-03 09:40:12'),(45,1,'User Management',1,0,0,0,0,0,'2026-07-03 09:40:12','2026-07-03 09:40:12'),(46,1,'Vehicle Master',1,0,0,0,0,0,'2026-07-03 09:40:12','2026-07-03 09:40:12'),(47,1,'Vendor',1,0,0,0,0,0,'2026-07-03 09:40:12','2026-07-03 09:40:12'),(48,1,'Warranty',1,0,0,0,0,0,'2026-07-03 09:40:12','2026-07-03 09:40:12');
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_code` varchar(20) NOT NULL,
  `employee_id` varchar(30) NOT NULL,
  `employee_name` varchar(150) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `plant` varchar(150) DEFAULT NULL,
  `role` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('Active','Disabled','Locked') DEFAULT 'Active',
  `allow_web` tinyint(1) DEFAULT '1',
  `allow_mobile` tinyint(1) DEFAULT '0',
  `force_password_reset` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_code` (`user_code`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_code` (`user_code`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department`),
  KEY `idx_plant` (`plant`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'USR001','EMP001','Ramu Kumar','ramu.kumar','ramu.kumar@company.com','9876543210','Operations','Hyderabad Plant','Finance Manager','$2b$10$FRUuvtq/KXwiNcYJ0y9O6ebbqKnKnC8UeoGiFJO0jo09g8W9CXVxe','Active',1,0,1,NULL,'Admin','Admin',NULL,NULL,0,'2026-07-03 08:27:47','2026-07-03 09:43:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_services`
--

DROP TABLE IF EXISTS `vehicle_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `service_date` date DEFAULT NULL,
  `odometer` int DEFAULT NULL,
  `interval_km` int DEFAULT NULL,
  `next_due` int DEFAULT NULL,
  `service_type` varchar(100) DEFAULT NULL,
  `mechanic` varchar(255) DEFAULT NULL,
  `labour_cost` decimal(10,2) DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Completed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `work_description` text,
  `completed_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicle_id` (`vehicle_id`),
  CONSTRAINT `vehicle_services_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_services`
--

LOCK TABLES `vehicle_services` WRITE;
/*!40000 ALTER TABLE `vehicle_services` DISABLE KEYS */;
INSERT INTO `vehicle_services` VALUES (1,20,'2026-04-29',5999,NULL,NULL,'Hub Greasing',NULL,300.00,1300.00,'In Progress','2026-04-29 06:34:22','vehicle oil change and water wash',NULL),(2,13,'2026-05-18',12345680,NULL,NULL,'Oil Change',NULL,101.00,301.00,'Completed','2026-05-18 05:34:24','',NULL),(3,13,'2026-05-10',12000,40000,52000,'Oil Change','ABC Garage',0.00,0.00,'In Progress','2026-05-18 07:20:49','srtghysdf',NULL),(4,13,'2026-05-18',12,40000,40012,'Oil Change','ABC Garage',0.00,0.00,'Reported','2026-05-18 07:29:12',NULL,NULL),(5,13,'2026-05-18',100,80000,80100,'Hub Greasing','ABC Garage',0.00,0.00,'Reported','2026-05-18 07:33:44',NULL,NULL),(6,13,'2026-05-18',199,80000,80199,'Hub Greasing',NULL,0.00,0.00,'Reported','2026-05-18 07:34:30',NULL,NULL),(7,13,'2026-05-18',12345,40000,52345,'Oil Change','ABC Garage',0.00,1200.00,'Completed','2026-05-19 08:54:27',NULL,'2026-05-18'),(8,2,'2026-05-18',NULL,NULL,NULL,'General Check','ABC Garage',0.00,800.00,'Completed','2026-05-19 09:01:52','asdfghj','2026-05-18'),(9,13,'2026-05-19',1234,40000,41234,'Oil Change','ABC Garage',0.00,24.00,'Completed','2026-05-19 09:46:46','werty','2026-05-19'),(10,23,'2026-05-19',760,40000,40760,'Oil Change','ABC Garage',500.00,500.00,'Completed','2026-05-21 09:46:00','Servicing','2026-05-19'),(11,24,'2026-05-20',10,40000,40010,'Oil Change','ABC Garage',500.00,500.00,'Completed','2026-05-22 10:35:05','sdfghjk','2026-05-20'),(12,13,'2026-06-08',-1,40000,39999,'Oil Change','ABC Garage',0.00,0.00,'Reported','2026-06-08 06:05:12',NULL,NULL),(13,23,'2026-06-09',760,40000,40760,'Oil Change',NULL,500.00,500.00,'In Progress','2026-06-09 11:07:53','Oil as to be change',NULL),(14,23,'2026-06-10',760,40000,40760,'Oil Change',NULL,500.00,500.00,'In Progress','2026-06-10 05:30:47','Good',NULL),(15,23,'2026-06-10',760,40000,40760,'Oil Change',NULL,500.00,500.00,'In Progress','2026-06-10 05:45:25','good',NULL),(16,23,'2026-06-10',760,40000,40760,'Oil Change',NULL,500.00,500.00,'In Progress','2026-06-10 05:48:57','good',NULL),(17,23,'2026-06-08',760,40000,40760,'Oil Change','Shakti Motors',500.00,500.00,'In Progress','2026-06-10 05:50:29','good',NULL);
/*!40000 ALTER TABLE `vehicle_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_no` varchar(50) NOT NULL,
  `registration_date` date DEFAULT NULL,
  `rta_name` varchar(255) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `vehicle_category` varchar(50) DEFAULT NULL,
  `make_brand` varchar(255) DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `model_year` int DEFAULT NULL,
  `tire_size` varchar(100) DEFAULT NULL,
  `gvw` int DEFAULT NULL,
  `ulw` int DEFAULT NULL,
  `engine_number` varchar(255) DEFAULT NULL,
  `chassis_number` varchar(255) DEFAULT NULL,
  `initial_odometer` int DEFAULT NULL,
  `insurance_validity` date DEFAULT NULL,
  `insurance_document` varchar(255) DEFAULT NULL,
  `fc_validity` date DEFAULT NULL,
  `permit_validity` date DEFAULT NULL,
  `permit_document` varchar(255) DEFAULT NULL,
  `tax_validity` date DEFAULT NULL,
  `pollution_validity` date DEFAULT NULL,
  `cll_validity` date DEFAULT NULL,
  `rc_document` varchar(255) DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `assigned_driver` int DEFAULT NULL,
  `station_id` int DEFAULT NULL,
  `default_route` varchar(255) DEFAULT NULL,
  `financier_name` varchar(255) DEFAULT NULL,
  `loan_account_number` varchar(255) DEFAULT NULL,
  `emi_amount` decimal(10,2) DEFAULT NULL,
  `emi_date` date DEFAULT NULL,
  `loan_tenure` int DEFAULT NULL,
  `gps_device_id` varchar(100) DEFAULT NULL,
  `fastag_id` varchar(100) DEFAULT NULL,
  `vehicle_status` varchar(50) DEFAULT NULL,
  `reminder_days` int DEFAULT NULL,
  `vehicle_color` varchar(100) DEFAULT NULL,
  `body_type` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `mileage` decimal(5,2) DEFAULT NULL,
  `fc_document` varchar(255) DEFAULT NULL,
  `tax_document` varchar(255) DEFAULT NULL,
  `pollution_document` varchar(255) DEFAULT NULL,
  `cll_document` varchar(255) DEFAULT NULL,
  `wheel_configuration` varchar(100) DEFAULT NULL,
  `total_tyres` int DEFAULT NULL,
  `axle_count` int DEFAULT NULL,
  `layout_type` varchar(100) DEFAULT NULL,
  `spare_tyre_count` int DEFAULT NULL,
  `default_tyre_size` varchar(100) DEFAULT NULL,
  `axle_positions` json DEFAULT NULL,
  `dealer_showroom` varchar(255) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_amount` decimal(12,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `assigned_driver` (`assigned_driver`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`id`),
  CONSTRAINT `vehicles_ibfk_2` FOREIGN KEY (`assigned_driver`) REFERENCES `drivers` (`id`),
  CONSTRAINT `vehicles_ibfk_3` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (2,'AP 26 AP 4321','2026-04-18','hyderabad','Raju ram','Tanker','Rented','Ashok','Diesel',2019,'295',300,199,'1234567','123456',298,'2026-04-18',NULL,'2026-04-18','2026-04-18',NULL,'2026-04-18','2026-04-18','2026-04-18',NULL,1,1,1,'Ashok nagar','HDFC','12345678',2000.00,'2026-04-18',60,'123456','123456','Active',6,'Red','Tanker','','2026-04-20 05:26:35',NULL,NULL,NULL,NULL,NULL,'12 Wheeler',12,5,'8x4',2,'315/80R22.5','[\"FL\", \"FR\", \"FL2\", \"FR2\", \"L1_OUTER\", \"L1_INNER\", \"R1_INNER\", \"R1_OUTER\", \"L2_OUTER\", \"L2_INNER\", \"R2_INNER\", \"R2_OUTER\"]','Arjun Toyota','2025-12-25',2500000000.00),(13,'AP 12 AP 6789','2026-04-06','Hyderabad','Ashwini','Tanker','Rented','tata','Diesel',2022,'256',300,27,'123456789','asdfg123456',12,'2026-04-06','1776844268351-LINGABHERI (1).pdf','2026-04-27','2026-04-27','1776844384553-LINGABHERI (1).pdf','2026-04-20','2026-04-19','2026-04-20','1776844268376-1776759988634-KENGUVA_ASHWINI-2-.pdf',2,2,2,'asdf-wert',NULL,NULL,NULL,NULL,NULL,'asd1234','asdf234','active',3,'qwd','Truck','sdfg','2026-04-22 07:51:08',20.00,'1776844268360-LINGABHERI (1).pdf','1776844268369-LINGABHERI (1).pdf','1776844268373-LINGABHERI.pdf','1776844268373-LINGABHERI (1).pdf','10 Wheeler',10,4,'10x4',2,'295/90R20','[\"FL\", \"FR\", \"L1_OUTER\", \"L1_INNER\", \"R1_INNER\", \"R1_OUTER\", \"L2_OUTER\", \"L2_INNER\", \"R2_INNER\", \"R2_OUTER\"]','Arjun Toyota','2026-04-22',300000000.00),(20,'TG 12 AP 1234','2026-04-23','Kondapur','Ramu Guru','Tanker','Rented','Ashok','Diesel',2016,'295',300,250,'ENG20XK9A123456','ENG14LM7B65432178',200,'2026-04-23','1777268119671.pdf','2026-04-26','2026-05-09','1777268119704.pdf','2026-04-26','2026-04-25','2026-06-20','1777268119714.pdf',5,2,3,'Hyderabad - Pune','HDFC','123456789',2000.00,'2026-05-24',1,'123456789','123456789','reported',2,'blue','Tanker',NULL,'2026-04-27 05:35:21',9.00,'1777268119689.pdf','1777268119706.pdf','1777268119708.pdf','1777268651370.pdf','6 Wheeler',6,2,'6x2',1,'295/80R22.5','[\"FL\", \"FR\", \"L1_OUTER\", \"L1_INNER\", \"R1_INNER\", \"R1_OUTER\"]','Arjun Toyota','2026-01-14',2800000000.00),(23,'MG 28 AP 1234','2026-05-20','Madhapur','Pandu','Tanker','Owned','Suzuki','Diesel',2025,'295',50,30,'AB12CD345678','MA3EJKD1S00987654',50,'2026-06-18','1779355272874-387524149.pdf','2026-05-20','2026-05-18','1779355272895-545137399.pdf','2026-07-14','2026-07-22','2026-05-21','1779355272901-190229590.pdf',6,4,4,'Hyderabad-Tirupati','HDFC','HDFC12345678',20000.00,'2026-12-22',4000,'GPS123456789','FASTTAG12345','under_repair',7,'Black','Tanker','Good','2026-05-21 09:21:12',8.00,'1779355272891-103279235.pdf','1779355272897-630047582.pdf','1779355272898-452668947.pdf','1779355272900-210618961.pdf','10 Wheeler',10,3,'6x4',1,'295/80R22.5','[\"FL\", \"FR\", \"L1_OUTER\", \"L1_INNER\", \"R1_INNER\", \"R1_OUTER\", \"L2_OUTER\", \"L2_INNER\", \"R2_INNER\", \"R2_OUTER\"]','Arjun Toyota','2025-11-19',2700000000.00),(24,'TS 12 AP 4567','2026-05-03','Attapur','Sai Kumar','Tanker','Owned','Maruti','Diesel',2026,'295/80R22.5',5000,2000,'TRKENG9087AB12','MB1FTZHG7LP654321',10,'2026-05-10','1779439877966-614430073.pdf','2026-05-24','2026-07-12','1779439877974-499161109.pdf','2026-05-10','2026-05-15','2026-07-18','1779439877985-550862210.pdf',6,2,4,'Hyderabad-vijayawada','SBI','SBI12345678',6000.00,'2026-08-18',3,'GPS_AXL_4509','FASTAG78965412','reported',7,'Brown','Tanker',NULL,'2026-05-22 08:51:17',9.00,'1779439877972-240708774.pdf','1779439877980-593167047.pdf','1779439877981-145526743.pdf','1779439877983-550268798.pdf','6 Wheeler',6,2,'4x2',1,'295/8022R.55','[\"FL\", \"FR\", \"L1_OUTER\", \"L1_INNER\", \"R1_INNER\", \"R1_OUTER\"]','Arjun Toyota','2026-01-05',2900000000.00);
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_payments`
--

DROP TABLE IF EXISTS `vendor_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_mode` varchar(50) NOT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `vendor_payments_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_payments`
--

LOCK TABLES `vendor_payments` WRITE;
/*!40000 ALTER TABLE `vendor_payments` DISABLE KEYS */;
INSERT INTO `vendor_payments` VALUES (1,2,'2026-06-11',1000.00,'Bank Transfer','TXN123456','payment done','2026-06-11 09:40:16');
/*!40000 ALTER TABLE `vendor_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_transactions`
--

DROP TABLE IF EXISTS `vendor_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `transaction_type` varchar(100) NOT NULL,
  `transaction_date` date NOT NULL,
  `debit` decimal(12,2) DEFAULT '0.00',
  `credit` decimal(12,2) DEFAULT '0.00',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `vendor_transactions_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_transactions`
--

LOCK TABLES `vendor_transactions` WRITE;
/*!40000 ALTER TABLE `vendor_transactions` DISABLE KEYS */;
INSERT INTO `vendor_transactions` VALUES (3,2,'Opening Balance','2026-06-11',0.00,1000.00,'1000 credited to garage','2026-06-11 08:39:58'),(4,2,'Opening Balance','2026-06-12',3000.00,0.00,NULL,'2026-06-11 09:42:01'),(5,2,'Opening Balance','2026-06-11',1.00,0.00,NULL,'2026-06-11 09:42:53');
/*!40000 ALTER TABLE `vendor_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(100) NOT NULL,
  `garage_name` varchar(255) NOT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `address_location` text NOT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `custom_bank_name` varchar(255) DEFAULT NULL,
  `account_number_or_upi` varchar(255) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email` varchar(255) DEFAULT NULL,
  `gst_number` varchar(100) DEFAULT NULL,
  `opening_balance` decimal(12,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `upi_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,'garages','Shiva Auto Mobiles','9876541238','Hyderabad','HDFC Bank',NULL,'789564327963','HDFC123456','2026-06-09 09:35:09','2026-06-11 07:31:29','shiva@gmail.com','GST111111111',500.00,'Active','shiva@upi'),(2,'garages','Shakti Motors','9988665574','Kondapur','State Bank of India (SBI)',NULL,'998877998878','SBI789456123','2026-06-09 10:28:57','2026-06-11 07:31:44','shakti@gmail.com','GST222222222',500.00,'Active','shakti@upi'),(3,'garages','Raja Auto Works','7788996655','Hyderabad','ICICI Bank',NULL,'789456123578','ICICI1123456','2026-06-11 06:23:19','2026-06-11 06:23:19','raja@gmail.com','GST123456789',500.00,'Active','raja@upi');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warranties`
--

DROP TABLE IF EXISTS `warranties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warranties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warranty_number` varchar(100) DEFAULT NULL,
  `item_title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_no` varchar(255) DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `vehicle_no` varchar(100) DEFAULT NULL,
  `odometer` int DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `warranty_period` varchar(100) DEFAULT NULL,
  `warranty_type` varchar(100) DEFAULT NULL,
  `warranty_status` varchar(100) DEFAULT NULL,
  `claim_available` varchar(20) DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `vendor_location` text,
  `purchase_cost` decimal(12,2) DEFAULT NULL,
  `claim_amount` decimal(12,2) DEFAULT NULL,
  `tax_included` varchar(10) DEFAULT NULL,
  `reminder_before` varchar(50) DEFAULT NULL,
  `notify_to` varchar(100) DEFAULT NULL,
  `notification_method` varchar(50) DEFAULT NULL,
  `item_description` text,
  `usage_notes` text,
  `terms_conditions` text,
  `warranty_card` text,
  `invoice_file` text,
  `additional_documents` json DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dealer_showroom` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `warranty_number` (`warranty_number`),
  KEY `vehicle_id` (`vehicle_id`),
  CONSTRAINT `warranties_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warranties`
--

LOCK TABLES `warranties` WRITE;
/*!40000 ALTER TABLE `warranties` DISABLE KEYS */;
INSERT INTO `warranties` VALUES (1,'WR-1778484049687','Battery','Battery','Amaron','SuperMax 200Ah','SN12345678',20,'TG 12 AP 1234',200,'2026-05-11','2026-05-09','2026-05-21','12','Manufacturer Warranty','Expired','Yes','Amaron Industries','7885575588','Hyderabad',100000.00,100000.00,'Yes','7 Days','Supervisor','Both','asdfghjkl','lkjhgfds','wefghnmkmnbvc','uploads\\1778484049730-164023850.pdf','uploads\\1778484049742-494989009.pdf','[\"uploads\\\\1778484049745-160620510.pdf\"]','Admin','2026-05-11 07:20:49','2026-06-12 06:59:00','Arjun Toyota'),(2,'WR-1779431777775','Engine Cummins','Engine','Cummins','Cummins X15','SN123456789',23,'MG 28 AP 1234',50,NULL,'2026-04-21','2026-05-21','1',NULL,'Expired',NULL,NULL,NULL,NULL,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'uploads\\1779431777786-470562393.pdf','uploads\\1779431777790-421349485.pdf','[]','Admin','2026-05-22 06:36:17','2026-06-12 06:58:48','Arjun Toyota'),(3,'WR-1779432041245','Engine Cummins','Engine','Cummins','Tata Turbo Engine','SN987654321',2,'AP 26 AP 4321',298,NULL,'2026-04-19','2026-05-19','1',NULL,'Expired',NULL,NULL,NULL,NULL,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'uploads\\1779432041267-835833138.pdf','uploads\\1779432041272-707634834.pdf','[]','Admin','2026-05-22 06:40:41','2026-06-12 06:58:34','Arjun Toyota');
/*!40000 ALTER TABLE `warranties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warranty_claims`
--

DROP TABLE IF EXISTS `warranty_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warranty_claims` (
  `id` int NOT NULL AUTO_INCREMENT,
  `claim_number` varchar(100) DEFAULT NULL,
  `warranty_id` int DEFAULT NULL,
  `warranty_number` varchar(100) DEFAULT NULL,
  `item_title` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_no` varchar(255) DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `vehicle_no` varchar(100) DEFAULT NULL,
  `warranty_type` varchar(100) DEFAULT NULL,
  `warranty_period` varchar(100) DEFAULT NULL,
  `warranty_start_date` date DEFAULT NULL,
  `warranty_end_date` date DEFAULT NULL,
  `warranty_status` varchar(100) DEFAULT NULL,
  `claim_available` varchar(20) DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `vendor_contact_number` varchar(50) DEFAULT NULL,
  `claim_available_amount` decimal(12,2) DEFAULT NULL,
  `claim_used_amount` decimal(12,2) DEFAULT NULL,
  `claim_date` date DEFAULT NULL,
  `issue_type` varchar(255) DEFAULT NULL,
  `priority` varchar(50) DEFAULT NULL,
  `complaint_number` varchar(255) DEFAULT NULL,
  `complaint_docket` varchar(255) DEFAULT NULL,
  `issue_description` text,
  `vendor_contact_person` varchar(255) DEFAULT NULL,
  `communication_contact_number` varchar(50) DEFAULT NULL,
  `date_sent_to_vendor` date DEFAULT NULL,
  `expected_resolution_date` date DEFAULT NULL,
  `vendor_remarks` text,
  `item_photos` json DEFAULT NULL,
  `invoice_copy` json DEFAULT NULL,
  `warranty_card_copy` json DEFAULT NULL,
  `complaint_report` json DEFAULT NULL,
  `additional_documents` json DEFAULT NULL,
  `claim_status` varchar(100) DEFAULT 'Draft',
  `assigned_to` varchar(255) DEFAULT NULL,
  `internal_notes` text,
  `resolution_summary` text,
  `approved_amount` decimal(12,2) DEFAULT NULL,
  `replacement_provided` varchar(20) DEFAULT NULL,
  `replacement_details` text,
  `claim_closed_date` date DEFAULT NULL,
  `rejection_reason` text,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `claim_number` (`claim_number`),
  KEY `warranty_id` (`warranty_id`),
  KEY `vehicle_id` (`vehicle_id`),
  CONSTRAINT `warranty_claims_ibfk_1` FOREIGN KEY (`warranty_id`) REFERENCES `warranties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `warranty_claims_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warranty_claims`
--

LOCK TABLES `warranty_claims` WRITE;
/*!40000 ALTER TABLE `warranty_claims` DISABLE KEYS */;
INSERT INTO `warranty_claims` VALUES (1,'CL-1778492597227',1,'WR-1778484049687','Battery','Battery','Amaron','HD Battery 150Ah','SN12345678',NULL,'TG 12 AP 1234','Manufacturer Warranty','12','2026-05-10','2027-05-10','Active','Yes','Amaron Industries','7885575588',100000.00,0.00,'2026-05-10','Other','Medium','CMP12','DOC12','everything is file','Rajesh Kiran','7885575588','2026-05-10','2026-05-10','good','[\"1778492597320-848892889.pdf\"]','[\"1778492597334-651326141.pdf\"]','[\"1778492597338-969625655.pdf\"]','[\"1778492597342-964276988.pdf\"]','[\"1778492597348-37336353.pdf\"]','Approved','Fleet Manager','fine',NULL,NULL,NULL,NULL,NULL,NULL,'Admin','2026-05-11 09:43:17','2026-05-12 05:07:54'),(2,'CL-1779433159239',2,'WR-1779431777775','Engine Cummins','Engine','Cummins','Cummins X15','SN123456789',23,'MG 28 AP 1234',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,NULL,NULL,NULL,'CMP-876','DOC-12345','good',NULL,NULL,'2026-05-22',NULL,NULL,'[\"1779433159275-513744579.png\"]','[]','[]','[]','[]','Rejected',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Admin','2026-05-22 06:59:19','2026-06-12 09:00:56'),(3,'CL-1779433546452',3,'WR-1779432041245','Engine Cummins','Engine','Cummins','Tata Turbo Engine','SN987654321',2,'AP 26 AP 4321',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,'2026-05-21',NULL,NULL,'sdfgh','asdfg','asdfg',NULL,NULL,'2026-05-22',NULL,NULL,'[\"1779433546469-171721520.png\"]','[]','[]','[]','[]','Approved',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Admin','2026-05-22 07:05:46','2026-06-12 09:00:41');
/*!40000 ALTER TABLE `warranty_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warranty_notifications`
--

DROP TABLE IF EXISTS `warranty_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warranty_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warranty_id` int NOT NULL,
  `warranty_number` varchar(60) DEFAULT NULL,
  `vehicle_no` varchar(50) DEFAULT NULL,
  `category` varchar(60) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `severity` enum('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
  `milestone_days` int NOT NULL DEFAULT '0',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warranty_notifications`
--

LOCK TABLES `warranty_notifications` WRITE;
/*!40000 ALTER TABLE `warranty_notifications` DISABLE KEYS */;
INSERT INTO `warranty_notifications` VALUES (1,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,1,'2026-05-22 06:39:42'),(2,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,1,'2026-05-22 07:03:13'),(3,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,1,'2026-05-22 07:03:13'),(4,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,1,'2026-05-23 13:11:20'),(5,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,1,'2026-05-23 13:11:20'),(6,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,1,'2026-05-23 13:11:20'),(7,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-05-25 04:49:20'),(8,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-05-25 04:49:21'),(9,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-05-25 04:49:21'),(10,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-05-26 09:27:12'),(11,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-05-26 09:27:12'),(12,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-05-26 09:27:12'),(13,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-05-28 04:49:51'),(14,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-05-28 04:49:51'),(15,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-05-28 04:49:51'),(16,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-05-29 05:03:52'),(17,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-05-29 05:03:53'),(18,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-05-29 05:03:53'),(19,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-01 04:39:50'),(20,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-01 04:39:50'),(21,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-01 04:39:50'),(22,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-03 05:46:32'),(23,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-03 05:46:32'),(24,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-03 05:46:32'),(25,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-04 05:55:49'),(26,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-04 05:55:50'),(27,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-04 05:55:50'),(28,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-05 05:55:47'),(29,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-05 05:55:47'),(30,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-05 05:55:47'),(31,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-08 05:31:50'),(32,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-08 05:31:50'),(33,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-08 05:31:50'),(34,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-09 06:13:53'),(35,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-09 06:13:54'),(36,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-09 06:13:54'),(37,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-10 05:06:59'),(38,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-10 05:06:59'),(39,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-10 05:06:59'),(40,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-11 04:43:53'),(41,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-11 04:43:53'),(42,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-11 04:43:53'),(43,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-12 04:53:35'),(44,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-12 04:53:36'),(45,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-12 04:53:36'),(46,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-15 04:52:36'),(47,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-15 04:52:36'),(48,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-15 04:52:36'),(49,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-16 04:44:13'),(50,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-16 04:44:14'),(51,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-16 04:44:14'),(52,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-17 03:55:07'),(53,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-17 03:55:10'),(54,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-17 03:55:13'),(55,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-18 06:28:31'),(56,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-18 06:28:31'),(57,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-18 06:28:32'),(58,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-22 04:32:40'),(59,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-22 04:32:41'),(60,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-22 04:32:41'),(61,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-23 05:31:44'),(62,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-23 05:31:44'),(63,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-23 05:31:44'),(64,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-24 05:07:37'),(65,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-24 05:07:37'),(66,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-24 05:07:37'),(67,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-25 05:01:27'),(68,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-25 05:01:27'),(69,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-25 05:01:27'),(70,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-26 04:36:20'),(71,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-26 04:36:20'),(72,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-26 04:36:20'),(73,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-29 05:01:19'),(74,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-29 05:01:21'),(75,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-29 05:01:23'),(76,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-06-30 05:24:21'),(77,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-06-30 05:24:21'),(78,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-06-30 05:24:21'),(79,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-07-01 04:53:12'),(80,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-07-01 04:53:12'),(81,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-07-01 04:53:12'),(82,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-07-02 04:44:43'),(83,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-07-02 04:44:43'),(84,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-07-02 04:44:43'),(85,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-07-03 05:08:02'),(86,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-07-03 05:08:02'),(87,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-07-03 05:08:02'),(88,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-07-06 05:53:51'),(89,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-07-06 05:53:51'),(90,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-07-06 05:53:51'),(91,1,'WR-1778484049687','TG 12 AP 1234','Battery','Warranty Expired — TG 12 AP 1234','Battery warranty for vehicle TG 12 AP 1234 has expired.','Critical',0,0,'2026-07-07 04:58:44'),(92,2,'WR-1779431777775','MG 28 AP 1234','Engine','Warranty Expired — MG 28 AP 1234','Engine warranty for vehicle MG 28 AP 1234 has expired.','Critical',0,0,'2026-07-07 04:58:44'),(93,3,'WR-1779432041245','AP 26 AP 4321','Engine','Warranty Expired — AP 26 AP 4321','Engine warranty for vehicle AP 26 AP 4321 has expired.','Critical',0,0,'2026-07-07 04:58:44');
/*!40000 ALTER TABLE `warranty_notifications` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07 10:32:14
