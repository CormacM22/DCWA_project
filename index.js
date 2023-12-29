const express = require('express');
const mongoDAO = require('./MongoDAO');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Generates HTML header for all pages
function generateHeader(title) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        header {
          background-color: #333;
          color: #fff;
          padding: 1em;
          text-align: center;
        }
        nav {
          background-color: #eee;
          padding: 1em;
          text-align: center;
        }
        nav a {
          margin: 0 1em;
          color: #333;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>${title}</h1>
      </header>
      <nav>
        <a href="/">Home</a>
        <a href="/managers">Managers</a>
        <a href="/stores">Stores</a>
        <a href="/products">Products</a>
      </nav>
  `;
}

// Home page route
app.get('/', function (req, res) {
  const html = `
    ${generateHeader('Home Page')}
    <section>
      <h2>Welcome to the Home Page</h2>
      <p>Choose a section from the navigation bar above.</p>
    </section>
    </body>
    </html>
  `;

  res.send(html);
});

// Managers page route
app.get('/managers', async (req, res) => {
  try {
    const managers = await mongoDAO.findAll();

    const html = `
      ${generateHeader('Managers')}
      <!-- Styles for table -->
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
      <p><a href="/managers/add">Add Manager</a></p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Salary</th>
          </tr>
        </thead>
        <tbody>
        ${managers.map(manager => `
          <tr>
            <td>${manager._id}</td>
            <td>${manager.name}</td>
            <td>${manager.salary}</td>
          </tr>
        `).join('')}
        </tbody>
      </table>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.log("Error", error);
    res.status(500).send('Error');
  }
});

// Route to display form for adding a manager
app.get('/managers/add', (req, res) => {
  const html = `
    ${generateHeader('Add Manager')}
    <form action="/managers/add" method="post">
      <label for="managerId">Manager ID:</label><br>
      <input type="text" id="managerId" name="managerId" required><br>
      <label for="name">Name:</label><br>
      <input type="text" id="name" name="name" required><br>
      <label for="salary">Salary:</label><br>
      <input type="number" id="salary" name="salary" required><br><br>
      <input type="submit" value="Add Manager">
    </form>
    <p><a href="/managers">Back to Managers</a></p>
    </body>
    </html>
  `;

  res.send(html);
});

// Route to handle submission of manager addition form
app.post('/managers/add', async (req, res) => {
  try {
      const { managerId, name, salary } = req.body;

      // Manager ID must be unique and 4 characters in length
      if (managerId.length !== 4 || await mongoDAO.exists(managerId)) {
          return res.status(400).send('Manager ID must be unique and 4 characters in length.');
      }

      // Name must be > 5 characters
      if (name.length <= 5) {
          return res.status(400).send('Name must be more than 5 characters.');
      }

      // Salary must be between 30,000 and 70,000
      if (salary < 30000 || salary > 70000) {
          return res.status(400).send('Salary must be between 30,000 and 70,000.');
      }

      await mongoDAO.addManager({ _id: managerId, name, salary });
      res.redirect('/managers');
  } catch (error) {
      console.log("Error", error);
      res.status(500).send('Error in adding manager.');
  }
});




// Stores page route
app.get('/stores', async (req, res) => {
  try {
      const [rows] = await pool.query('SELECT sid, location, mgrid FROM store');

      const html = `
          ${generateHeader('Stores')}
          <style>
              table {
                  border-collapse: collapse;
                  width: 100%;
                  margin-top: 20px;
              }
              th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
              }
              th {
                  background-color: #f2f2f2;
              }
          </style>
          <table>
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Location</th>
                      <th>Manager ID</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
              ${rows.map(store => `
                  <tr>
                      <td>${store.sid}</td>
                      <td>${store.location}</td>
                      <td>${store.mgrid}</td>
                      <td><a href="/stores/edit/${store.sid}">Update</a></td>
                  </tr>
              `).join('')}
              </tbody>
          </table>
          </body>
          </html>
      `;

      res.send(html);
  } catch (error) {
      console.error("Error", error);
      res.status(500).send('Internal Server Error');
  }
});


// MySQL connection pool configuration
const pool = mysql.createPool({
  connectionLimit: 3,
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'proj2023',
});

// Products page route
app.get('/products', async (req, res) => {
  try {
      const query = `
          SELECT p.pid, p.productdesc, ps.sid, s.location, ps.price
          FROM product p
          LEFT JOIN product_store ps ON p.pid = ps.pid
          LEFT JOIN store s ON ps.sid = s.sid;
      `;

      const message = req.query.message;
      const [rows] = await pool.query(query);

      // Render the data in a styled HTML table
      const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Products</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                      background-color: #f4f4f4;
                  }
                  header {
                      background-color: #333;
                      color: #fff;
                      padding: 1em;
                      text-align: center;
                  }
                  nav {
                      background-color: #eee;
                      padding: 1em;
                      text-align: center;
                  }
                  nav a {
                      margin: 0 1em;
                      color: #333;
                      text-decoration: none;
                      font-weight: bold;
                  }
                  table {
                      border-collapse: collapse;
                      width: 100%;
                      margin-top: 20px;
                  }
                  th, td {
                      border: 1px solid #ddd;
                      padding: 8px;
                      text-align: left;
                  }
                  th {
                      background-color: #f2f2f2;
                  }
              </style>
          </head>
          <body>
              <header>
                  <h1>Products</h1>
              </header>
              <nav>
                  <a href="/">Home</a>
                  <a href="/managers">Managers</a>
                  <a href="/stores">Stores</a>
                  <a href="/products">Products</a>
              </nav>
              ${message ? `<p style="color: red;">${message}</p>` : ''}
              <table>
                  <thead>
                      <tr>
                          <th>Product ID</th>
                          <th>Description</th>
                          <th>Store ID</th>
                          <th>Location</th>
                          <th>Price</th>
                          <th>Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${rows.map(row => `
                          <tr>
                              <td>${row.pid}</td>
                              <td>${row.productdesc}</td>
                              <td>${row.sid || 'N/A'}</td>
                              <td>${row.location || 'N/A'}</td>
                              <td>${row.price || 'N/A'}</td>
                              <td><a href="/products/delete/${row.pid}">Delete</a></td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </body>
          </html>
      `;

      res.send(html);
  } catch (error) {
      console.error("Error", error);
      res.status(500).send('Internal Server Error');
  }
});


// Route to delete a product
app.get('/products/delete/:pid', async (req, res) => {
  const pid = req.params.pid;

  try {
      // Check if the product is sold in any store
      const [sales] = await pool.query('SELECT * FROM product_store WHERE pid = ?', [pid]);

      if (sales.length > 0) {
          // If the product is sold in any store, don't delete
          // Redirect back to products page with a message
          return res.redirect('/products?message=Cannot delete product ' + pid + ' as it is sold in a store');
      }

      // If the product is not sold in any store, delete it
      await pool.query('DELETE FROM product WHERE pid = ?', [pid]);

      // Redirect back to the products page
      res.redirect('/products');
  } catch (error) {
      console.error("Error", error);
      res.status(500).send('Internal Server Error');
  }
});



// Route to edit store details
app.get('/stores/edit/:sid', async (req, res) => {
  try {
    const sid = req.params.sid;
    const [rows] = await pool.query('SELECT * FROM store WHERE sid = ?', [sid]);

    if (rows.length > 0) {
      const store = rows[0];
      const html = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Edit Store</title>
                  <!-- Add additional head elements or CSS links here -->
              </head>
              <body>
                  <h1>Edit Store</h1>
                  <form action="/stores/edit/${sid}" method="POST">
                      Location: <input type="text" name="location" value="${store.location}" required><br>
                      Manager ID: <input type="text" name="mgrid" value="${store.mgrid}" required><br>
                      <input type="submit" value="Submit">
                  </form>
                  <a href="/stores">Back to Store List</a>
              </body>
              </html>
          `;

      res.send(html);
    } else {
      res.status(404).send('Store not found');
    }
  } catch (error) {
    console.error("Error", error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle submission of store edit form
app.post('/stores/edit/:sid', async (req, res) => {
  try {
    const { location, mgrid } = req.body;
    const sid = req.params.sid;

    // Validate Location length
    if (location.length < 1) {
      return res.status(400).send('Location must be at least 1 character long.');
    }

    // Validate Manager ID length
    if (mgrid.length !== 4) {
      return res.status(400).send('Manager ID must be 4 characters long.');
    }

    // Check if Manager ID exists in MongoDB
    const managerExists = await mongoDAO.exists(mgrid);
    if (!managerExists) {
      return res.status(400).send('Manager ID does not exist.');
    }

    // Check if Manager ID is assigned to another store
    const [existingAssignment] = await pool.query('SELECT * FROM store WHERE mgrid = ? AND sid != ?', [mgrid, sid]);
    if (existingAssignment.length > 0) {
      return res.status(400).send('Manager ID is assigned to another store.');
    }

    // Update the store if all validations pass
    await pool.query('UPDATE store SET location = ?, mgrid = ? WHERE sid = ?', [location, mgrid, sid]);
    res.redirect('/stores');
  } catch (error) {
    console.error("Error", error);
    res.status(500).send('Internal Server Error');
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
