# Store Manager

This is a Node.js application built with Express, MongoDB, and MySQL. It provides a web interface to manage Managers, Stores, and Products.

## Features
- **Managers**: Add, view, and manage store managers (data stored in MongoDB).
- **Stores**: View and edit store details (data stored in MySQL).
- **Products**: View and delete products; validation ensures that products sold in stores cannot be deleted.

## Prerequisities
Before running the application, make sure you have the following installed:
- Node.js (version 14 or higher)
- MongoDB
- MySQL

## Setup Instructions
1. Clone the Repository: ```git clone https://github.com/CormacM22/ExpressJS-MongoDB-SQL```
2. Install Dependencies: ```npm install```
3. Setup MongoDD:
- Start your MongoDB server
- Ensure the collection for managers is created.
4. Setup MySQL:
- Create a database names proj2023.
- import or create tables ```store```, ```product```, and ```product_store```.
5. Environment Variables:
- Create a ```.env``` file in the project root and configure it:
  - ```PORT=3000 MONGO_URI=mongodb://localhost:27017/your_database_name MYSQL_HOST=localhost MYSQL_USER=root MYSQL_PASSWORD=root MYSQL_DATABASE=proj2023 MYSQL_CONNECTION_LIMIT=3 ```.

## Running the Application
1. Start the App:
- ```npm start```
2. Access in the browser: Open your browser and navigate to:
- ``` http://Localhost:3000```

## Routes and Features
**Home Page**
- Route: ```/```
- Provides navigation to all features of the application

**Managers**
- Route: ```/managers```
- View all managers stored in the MongoDB
- Add a new manager via a form
- Validations:
  - Manager ID must be unique and 4 characters long.
  - Name must be more than 5 characters.
  - Salary must be between 30,000 and 70,000.

**Stores**
- Route: ```/stores```
- View all stores stored in MySQL.
- Edit store details.
- Validations:
  - Location must have at least 1 character.
  - Manager ID must exist in MongoDB and not be assigned to another store.

**Products**
- Route: ```/products```
- View all products and their store associations.
- Delete a product if it is not sold in any store.

## Code Structure
- ```app.js```: Main entry point.
- ```MongoDAO.js```: Handles interactions with MongoDB.
- ```MySQL```: Configured using ```mysql2/promise``` for database interactions.
<img width="959" alt="Screenshot 2024-12-06 221530" src="https://github.com/user-attachments/assets/c31e2ba7-0d29-49ac-82c3-0d0f57faaa81">
