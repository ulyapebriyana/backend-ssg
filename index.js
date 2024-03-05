import express from "express";
import 'dotenv/config'
import bodyParser from "body-parser";
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import cron from 'node-cron';

import sequelize from "./configs/db.js";
import router from "./routes.js";
import User from "./models/user-model.js";

// (async () => {
//     await sequelize.sync({force: true});
//     // Code here
// })();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN)

app.use(bodyParser.json())

app.use(router)

bot.on(message('text'), async (ctx) => {
    // Explicit usage
    console.log(ctx.message);
    await ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.message.from.id}`)

    // await ctx.telegram.kickChatMember()

})



app.post("/", async (req, res) => {
    try {

        const { chat_id, user_id } = await req.body

        const data = await bot.telegram.banChatMember(chat_id, user_id)
        // console.log(data);
        return res.status(200).json({
            status: 200,
            message: "success",
            data: data
        })
    } catch (error) {
        console.log(error);
    }
})

app.post('/add', async (req, res) => {
    try {
        const {chat_id, user_id, name} = await req.body
        const expiredDate = Math.floor(Date.now() / 1000) + (1 * 60);
        const data = await bot.telegram.createChatInviteLink(chat_id, {
            name: name,
            expire_date: expiredDate,
            member_limit: 1
        })
        return res.status(200).json({
            status: 200,
            message: "user added succesfully",
            data: data
        })
    } catch (error) {
        console.log(error);
    }
})

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}


cron.schedule('* * * * *', async () => {
    try {
        console.log('running a task every minute');
        const users = await User.findAll()
        const chat_id = -4109977850
        users.map(async (user) => {
            if (user.membershipPeriod <= new Date()) {
                await bot.telegram.banChatMember(chat_id, user.telegramId)
                await user.destroy()
                // console.log(user);
            }
        })
    } catch (error) {
        console.log(error);
    }
});

// bot.launch()

app.listen(8000, () => {
    console.log("app running in port 8000");
})
