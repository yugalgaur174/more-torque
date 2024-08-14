# More-Torque

An Organization & Vehicle Management API

### **Overview:**
It is a RESTful API service designed to manage organizational hierarchies and vehicle information. The system allows users to create, update, and retrieve details of organizations and vehicles, with specific functionality to handle organizational policies such as fuel reimbursement and speed limits, including policy inheritance across a hierarchical structure of organizations.

The project is built using **Node.js** and **Express.js** and includes several key features such as:
- **VIN (Vehicle Identification Number) Decoding**: An endpoint to decode VINs using an external API.
- **Organization Management**: Endpoints to create, update, and retrieve organizations with hierarchical policy inheritance.
- **Rate Limiting**: To prevent abuse by limiting the number of requests from an IP address.
- **Caching**: In-memory caching to improve performance by storing responses temporarily.
- **Swagger UI**: Integrated for API documentation and testing.

### **Technology Stack:**
- **Backend:** Node.js, Express.js
- **API Documentation:** Swagger UI
- **Data Caching:** Memory-cache
- **Rate Limiting:** Express-rate-limit
- **HTTP Client:** Axios

### **Key Features:**
1. **VIN Decoding:** An endpoint to decode vehicle information from a VIN.
2. **Organization Hierarchy:** Manage organizations with support for hierarchical policies that propagate to child organizations.
3. **API Documentation:** Interactive API documentation using Swagger UI.
4. **Performance Enhancements:** Includes rate limiting and caching for enhanced performance and security.

---
![image](https://github.com/user-attachments/assets/a5569b41-ec3c-46ee-8dce-94fda2a05754)

## **API Endpoints**

### **1. Base URL**
- **URL:** `/`
- **Method:** `GET`
- **Description:** A simple endpoint to check if the server is running. It returns a message indicating that the server is up and running.

### **2. Swagger API Documentation**
- **URL:** `/api-docs`
- **Method:** `GET`
- **Description:** Provides a UI for interacting with and testing the API endpoints. This is auto-generated using a `swagger.yaml` file.

### **3. Decode VIN**
- **URL:** `/vehicles/decode/:vin`
- **Method:** `GET`
- **Description:** Decodes a Vehicle Identification Number (VIN) using the external **NHTSA** (National Highway Traffic Safety Administration) API. The VIN must be a 17-character string.

### **4. Add a Vehicle**
- **URL:** `/vehicles`
- **Method:** `POST`
- **Description:** Adds a vehicle to the system using its VIN and associated organization ID.

### **5. Get Vehicle Details**
- **URL:** `/vehicles/:vin`
- **Method:** `GET`
- **Description:** Retrieves details of a vehicle by its VIN.

### **6. Create a New Organization**
- **URL:** `/orgs`
- **Method:** `POST`
- **Description:** Creates a new organization with details like name, account, website, and policies.

### **7. Update an Organization**
- **URL:** `/orgs/:id`
- **Method:** `PATCH`
- **Description:** Updates the details of an existing organization, including account, website, and policies. It also supports hierarchical policy updates, propagating changes to child organizations.

### **8. Get All Organizations**
- **URL:** `/orgs`
- **Method:** `GET`
- **Description:** Retrieves a list of all organizations, including their details and hierarchical relationships.
