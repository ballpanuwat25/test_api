const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API information',
    },
    servers: [{ url: process.env.API_URL }],
  },
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /get-exercise:
 *   get:
 *     summary: Get exercise data based on category from the database
 *     description: Retrieves a list of exercises from the database filtered by a specified category and returns it in JSON format.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: The category to filter exercises by (e.g. 'graphical')
 *     responses:
 *       200:
 *         description: A list of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID:
 *                     type: integer
 *                     description: The unique identifier for the exercise
 *                   category:
 *                     type: string
 *                     description: The category of the exercise
 *                   exercise:
*                      type: object
*                      description: The exercise data in JSON format
 *       404:
 *         description: No exercises found for the given category
 *       500:
 *         description: Error retrieving data from the database
 */
app.get('/get-exercise', async (req, res) => {
  let params = req.query;
  let category = params.category;

  if(!category) {
    res.status(400).send('Missing required parameter: category');
    return;
  }

  try {
    // Query ข้อมูลจากฐานข้อมูล
    const [results] = await db.query('SELECT * FROM Numericalmethod WHERE category = ?', [category]);
    if(results.length === 0) {
      res.status(404).send('Not found');
      return;
    }
    
    // ส่งข้อมูลไปให้ client
    res.send(results);
  } catch (err) {
    console.error('Error querying the database:', err.message);
    res.status(500).send('Error retrieving data from the database');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
});