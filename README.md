﻿# House Rent - Backend

A scalable and secure backend for the BasaFinder platform, providing user authentication, rental house management, payment integration, and seamless data handling.

## Features

- **User Authentication** – Secure registration, login, and session management using JWT and bcrypt.
- **Role-Based Access Control** – Custom dashboards and functionalities for Admin, Landlords, and Tenants.
- **Rental House Management** – Landlords can post, update, and manage rental listings.
- **Rental Requests** – Tenants can submit rental requests, and Landlords can approve or reject them.
- **Payment Integration** – Payment option,  ShurjoPay is enabled for approved rental requests.
- **Search & Filter** – Tenants can search for rental houses by location, price, and number of bedrooms.
- **Email Notifications** – Automatic email updates for rental requests and approvals.
- **Schema Validation** – Ensuring data integrity using **Zod**.

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose  
**Security & Authentication:** JWT, Bcrypt, Cookie-Parser  
**Validation & Data Handling:** Zod, HTTP-Status  
**Payment Integration:** ShurjoPay

## Links
[Demo Link](https://house-finder-rakibul.vercel.app)  
[Github Link (Client)](https://github.com/Rakibul-98/house-rent-client.git)  
[Live Server Link](https://house-rent-server-rakibul.vercel.app/api)  

## Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=<your_server_port>
DATABASE_URL=<your_mongodb_connection_string>
SALT_ROUNDS=<your_salt_rounds>
JWT_ACCESS_SECRET=<your_jwt_access_secret>
JWT_REFRESH_SECRET=<your_jwt_refresh_secret>

# Payment Integration (ShurjoPay)
SP_ENDPOINT=<shurjopay_endpoint>
SP_USERNAME=<your_sp_username>
SP_PASSWORD=<your_sp_password>
SP_PREFIX=<your_sp_prefix>
SP_RETURN_URL=<your_return_url>

```

## Installation & Setup

### Prerequisites
Ensure you have **Node.js** and **MongoDB** installed on your system.

### Clone the Repository

```bash
git clone https://github.com/Rakibul-98/house-rent-server.git
```

Navigate to the project directory:

```bash
cd house-rent-server
```

### Install Dependencies

```bash
npm install
```

### Run the Development Server

```bash
npm run start:dev
```

### Build for Production

```bash
npm run build
npm run start:prod
```

## Database Collections (MongoDB)

1. **Users Collection**  
   Fields: `name`, `email`, `phone`, `password` (hashed), `role` (`admin`, `landlord`, `tenant`), and other necessary details.

2. **Listings Collection (Rental Houses)**  
   Fields: `location`, `description`, `rentAmount`, `bedrooms`, `images`, `landlordId`, and other necessary details.

3. **Requests Collection (Rental Requests)**  
   Fields: `listingId`, `tenantId`, `status` (`pending`, `approved`, `rejected`), `landlordPhone`, `paymentStatus`, and `tenantMessage`.


## Contact & Support

For issues, feature requests, or contributions, feel free to open an issue or reach out. Let's build something amazing together! 🚀
