const TelegramApi = require('node-telegram-bot-api')
const axios = require('axios')

const token = '1911062640:AAFYcMbAcX5zMVP5eKzNvIcybikeuw8ejaU'

const bot = new TelegramApi(token, {polling: true})

const baseUrl = 'https://evilinsult.com/generate_insult.php?lang=en&type=text'

bot.setMyCommands([
    {command: '/start', description: 'Начало работы'},
    {command: '/game', description: 'Игра на угадывание числа'},
    {command: '/insult', description: 'Бесплатные оскорбления'},
])

const chats = {}

const gameOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: '1', callback_data: '1'},{text: '2', callback_data: '2'},{text: '3', callback_data: '3'}],
            [{text: '4', callback_data: '4'},{text: '5', callback_data: '5'},{text: '6', callback_data: '6'},],
            [{text: '7', callback_data: '7'},{text: '8', callback_data: '8'},{text: '9', callback_data: '9'},],
            [{text: '0', callback_data: '0'}],
        ]
    })
}

const againOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Играть еще раз', callback_data: '/again'}]
        ]
    })
}

 const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Бот загадал цифру от 0 до 9`)
    const rand = Math.floor(Math.random() * 10)
    chats[chatId] = rand
    await bot.sendMessage(chatId, `Отгадай! 😀`, gameOptions)
}

const start =() => {
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/2b7/ff8/2b7ff812-f294-4447-9145-95fd518167ca/2.webp')
            return await axios.get(baseUrl).then((res) => {
                return bot.sendMessage(chatId, msg.chat.first_name + ', ' + res.data)
            })
        }
        if (text === '/game') {
           return startGame(chatId)
        }
        if (text === '/insult') {
           return await axios.get(baseUrl).then((res) => {
                return bot.sendMessage(chatId, msg.chat.first_name + ', ' + res.data)
            })
        }
        return bot.sendMessage(chatId, 'Не знаю такой команды :c')
    })

    bot.on('callback_query', msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if(data === '/again') {
           return startGame(chatId)
        }
        if(data === chats[chatId]) {
            return bot.sendMessage(chatId, 'Угадал!', againOptions)
        } else {
            return bot.sendMessage(chatId, `Не угадал, бот загадал цифру ${chats[chatId]} !`, againOptions)
        }
    })
}

start()
