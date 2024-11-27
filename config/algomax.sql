-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2024 at 03:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `algomax`
--

-- --------------------------------------------------------

--
-- Table structure for table `bank_details`
--

CREATE TABLE `bank_details` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_holder_name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `verification_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_comment` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `organizer_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `event_date` datetime NOT NULL,
  `event_end_date` datetime NOT NULL,
  `category` enum('CONFERENCE','WORKSHOP','CONCERT','SPORTS','EXHIBITION','FESTIVAL','OTHER') NOT NULL DEFAULT 'OTHER',
  `ticket_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_tickets` int(11) NOT NULL DEFAULT 0,
  `available_tickets` int(11) NOT NULL DEFAULT 0,
  `STATUS` enum('DRAFT','PUBLISHED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'DRAFT',
  `age_restriction` enum('ALL','18+','21+') DEFAULT 'ALL',
  `online_event` tinyint(1) DEFAULT 0,
  `event_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `name` varchar(255) NOT NULL,
  `start_datetime` datetime DEFAULT NULL,
  `end_datetime` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`event_id`, `tenant_id`, `organizer_id`, `title`, `description`, `location`, `event_date`, `event_end_date`, `category`, `ticket_price`, `total_tickets`, `available_tickets`, `STATUS`, `age_restriction`, `online_event`, `event_link`, `created_at`, `updated_at`, `name`, `start_datetime`, `end_datetime`) VALUES
(3, 1, NULL, '', 'A conference about the latest in tech.', 'Tech Park, Silicon Valley', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '', 0.00, 0, 0, 'DRAFT', 'ALL', 0, NULL, '2024-11-26 10:42:23', '2024-11-26 10:42:23', 'Tech Conference', '2024-12-10 09:00:00', '2024-12-10 17:00:00'),
(4, 1, NULL, '', 'A conference about the latest in tech.', 'Tech Park, Silicon Valley', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '', 0.00, 0, 0, 'DRAFT', 'ALL', 0, NULL, '2024-11-26 10:57:47', '2024-11-26 10:57:47', 'Tech Conference', '2024-12-10 09:00:00', '2024-12-10 17:00:00'),
(5, 1, NULL, 'Sample Event', 'This is a description for the sample event.', 'Online', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '', 25.00, 100, 97, 'DRAFT', '', 1, 'https://eventlink.com', '2024-11-26 12:46:21', '2024-11-26 13:37:17', '', '2024-12-01 10:00:00', '2024-12-01 12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `event_analytics`
--

CREATE TABLE `event_analytics` (
  `analytics_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `total_tickets_sold` int(11) DEFAULT 0,
  `total_revenue` decimal(10,2) DEFAULT 0.00,
  `unique_attendees` int(11) DEFAULT 0,
  `average_ticket_price` decimal(10,2) DEFAULT 0.00,
  `cancellation_rate` decimal(5,2) DEFAULT 0.00,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kyc_documents`
--

CREATE TABLE `kyc_documents` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `document_type` enum('passport','driver_license','national_id','other') NOT NULL,
  `document_front_url` varchar(255) NOT NULL,
  `document_back_url` varchar(255) DEFAULT NULL,
  `document_number` varchar(50) NOT NULL,
  `verification_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_comment` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `notification_type` enum('EVENT_UPDATE','TICKET_AVAILABILITY','BOOKING_CONFIRMATION','SYSTEM_ALERT') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `transaction_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_gateway` varchar(50) NOT NULL,
  `gateway_transaction_id` varchar(100) DEFAULT NULL,
  `STATUS` enum('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `payment_method` enum('CREDIT_CARD','DEBIT_CARD','NET_BANKING','UPI','WALLET') NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `duration` varchar(50) NOT NULL,
  `max_events` int(11) DEFAULT 10,
  `max_users` int(11) DEFAULT 5,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `NAME`, `description`, `price`, `duration`, `max_events`, `max_users`, `created_at`, `updated_at`) VALUES
(1, 'Trial', 'Default trial subscription', 0.00, '14 Days', 10, 5, '2024-11-26 10:13:45', '2024-11-26 10:13:45');

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `business_email` varchar(255) NOT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `contact_person_name` varchar(100) DEFAULT NULL,
  `contact_person_phone` varchar(20) DEFAULT NULL,
  `business_registration_number` varchar(50) DEFAULT NULL,
  `verification_code` varchar(6) DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verification_attempts` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 0,
  `subscription_plan_id` int(11) DEFAULT NULL,
  `subscription_status` enum('trial','active','expired','suspended') DEFAULT 'trial',
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `brand_logo_url` varchar(255) DEFAULT NULL,
  `brand_primary_color` varchar(7) DEFAULT '#000000',
  `brand_secondary_color` varchar(7) DEFAULT '#FFFFFF',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `admin_verification_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_verified_by` int(11) DEFAULT NULL,
  `admin_verified_at` timestamp NULL DEFAULT NULL,
  `kyc_status` enum('not_uploaded','pending','approved','rejected') DEFAULT 'not_uploaded',
  `max_verification_attempts` int(11) DEFAULT 3,
  `last_verification_attempt` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `NAME`, `business_email`, `domain`, `contact_person_name`, `contact_person_phone`, `business_registration_number`, `verification_code`, `verification_status`, `verification_attempts`, `active`, `subscription_plan_id`, `subscription_status`, `trial_ends_at`, `brand_logo_url`, `brand_primary_color`, `brand_secondary_color`, `created_by`, `created_at`, `updated_at`, `admin_verification_status`, `admin_verified_by`, `admin_verified_at`, `kyc_status`, `max_verification_attempts`, `last_verification_attempt`) VALUES
(1, 'Tenant Name', 'contact@tenant.com', 'tenant.com', 'John Doe', '1234567890', 'REG123456', '471060', 'verified', 1, 1, NULL, 'trial', '2024-12-10 10:20:39', 'https://example.com/logo.png', '#FF5733', '#C70039', NULL, '2024-11-26 10:20:39', '2024-11-26 10:26:09', 'pending', NULL, NULL, 'not_uploaded', 3, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `ticket_type` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `event_id`, `ticket_type`, `quantity`, `price`, `created_at`, `updated_at`) VALUES
(1, 5, 'VIP', 100, 25.00, '2024-11-26 12:46:21', '2024-11-26 12:46:21');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_bookings`
--

CREATE TABLE `ticket_bookings` (
  `booking_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `num_tickets` int(11) NOT NULL DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `booking_status` enum('PENDING','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `payment_status` enum('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `booking_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `ticket_bookings`
--

INSERT INTO `ticket_bookings` (`booking_id`, `event_id`, `user_id`, `num_tickets`, `total_price`, `booking_status`, `payment_status`, `booking_timestamp`, `updated_at`) VALUES
(2, 5, 1, 3, 75.00, 'PENDING', 'PENDING', '2024-11-26 13:37:17', '2024-11-26 13:37:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','ORGANIZER','ATTENDEE') NOT NULL DEFAULT 'ATTENDEE',
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `verification_status` enum('UNVERIFIED','VERIFIED','SUSPENDED') DEFAULT 'UNVERIFIED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `role`, `first_name`, `last_name`, `profile_picture_url`, `phone_number`, `address`, `created_at`, `updated_at`, `last_login`, `is_active`, `verification_status`) VALUES
(1, 'your_username', 'your_email@example.com', 'hashed_password', '', 'Your', 'Name', 'https://example.com/profile_pic.jpg', '+1234567890', 'Your Address', '2024-11-26 13:37:12', '2024-11-26 13:37:12', '2024-11-26 13:37:12', 1, 'VERIFIED');

-- --------------------------------------------------------

--
-- Table structure for table `user_wishlist`
--

CREATE TABLE `user_wishlist` (
  `wishlist_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bank_details`
--
ALTER TABLE `bank_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_events_tenant` (`tenant_id`),
  ADD KEY `idx_events_organizer` (`organizer_id`),
  ADD KEY `idx_events_date` (`event_date`);

--
-- Indexes for table `event_analytics`
--
ALTER TABLE `event_analytics`
  ADD PRIMARY KEY (`analytics_id`),
  ADD KEY `fk_analytics_event` (`event_id`);

--
-- Indexes for table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `fk_notification_event` (`event_id`),
  ADD KEY `idx_notifications_user` (`user_id`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD UNIQUE KEY `gateway_transaction_id` (`gateway_transaction_id`),
  ADD KEY `fk_transaction_booking` (`booking_id`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `NAME` (`NAME`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `business_email` (`business_email`),
  ADD UNIQUE KEY `domain` (`domain`),
  ADD KEY `fk_tenant_subscription_plan` (`subscription_plan_id`),
  ADD KEY `fk_tenant_creator` (`created_by`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ticket_bookings`
--
ALTER TABLE `ticket_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `idx_bookings_event` (`event_id`),
  ADD KEY `idx_bookings_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`);

--
-- Indexes for table `user_wishlist`
--
ALTER TABLE `user_wishlist`
  ADD PRIMARY KEY (`wishlist_id`),
  ADD UNIQUE KEY `uk_user_event` (`user_id`,`event_id`),
  ADD KEY `fk_wishlist_event` (`event_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bank_details`
--
ALTER TABLE `bank_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_analytics`
--
ALTER TABLE `event_analytics`
  MODIFY `analytics_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ticket_bookings`
--
ALTER TABLE `ticket_bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_wishlist`
--
ALTER TABLE `user_wishlist`
  MODIFY `wishlist_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bank_details`
--
ALTER TABLE `bank_details`
  ADD CONSTRAINT `bank_details_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_event_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_event_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `event_analytics`
--
ALTER TABLE `event_analytics`
  ADD CONSTRAINT `fk_analytics_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE;

--
-- Constraints for table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  ADD CONSTRAINT `kyc_documents_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `fk_transaction_booking` FOREIGN KEY (`booking_id`) REFERENCES `ticket_bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `tenants`
--
ALTER TABLE `tenants`
  ADD CONSTRAINT `fk_tenant_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tenant_subscription_plan` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ticket_bookings`
--
ALTER TABLE `ticket_bookings`
  ADD CONSTRAINT `fk_booking_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_wishlist`
--
ALTER TABLE `user_wishlist`
  ADD CONSTRAINT `fk_wishlist_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
