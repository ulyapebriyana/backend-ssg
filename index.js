import express from "express";
import 'dotenv/config'
import bodyParser from "body-parser";
import sequelize from "./configs/db.js";
import router from "./routes.js";


// (async () => {
//     await sequelize.sync({ force: true });
//     // Code here
// })();

const app = express();

app.use(bodyParser.json())

app.use(router)

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

app.listen(8000, () => {
    console.log("app running in port 8000");
})