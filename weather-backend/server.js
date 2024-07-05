const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const cors = require('cors');

app.use(cors());


// Данные для подключения к базе данных
const dbConfig = {
  user: 'sys',
  password: '123',
  connectString: 'localhost:1521/XEPDB1',
  privilege: oracledb.SYSDBA
};

// GET запрос http://localhost:5000/api/weather
app.get('/api/weather', async (req, res) => {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(`SELECT * FROM weather_data`);
      const data = result.rows.map(row => ({
        id: row[0],
        city: row[1],
        temperature: row[2],
        pressure: row[3],
        humidity: row[4],
        timestamp: row[5]
      }));
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching data');
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  });  

// POST запрос http://localhost:5000/api/weather
app.post('/api/weather', async (req, res) => {
  const { id, city, temperature, pressure, humidity } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `UPDATE weather_data SET city = :city, temperature = :temperature, pressure = :pressure, humidity = :humidity WHERE id = :id`,
      [city, temperature, pressure, humidity, id],
      { autoCommit: true }
    );
    res.status(200).send('Data updated');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating data');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Обновление данных
setInterval(async () => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `UPDATE weather_data SET temperature = temperature + 1 WHERE city = 'City A'`,
      [],
      { autoCommit: true }
    );
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}, 30000); // 30 секунд

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
