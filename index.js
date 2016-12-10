/* eslint no-process-env: 0 */

const TelegramBot = require('node-telegram-bot-api')
const gameClient = require('./game-socket')

const token = process.env.TELEGRAM_TOKEN
const bot = new TelegramBot(token, { polling: true })

const cmd = command => JSON.stringify({cmd: command})
const streamToBot = (chatId, data) => bot.sendMessage(chatId, data)

const stats = chatId => gameClient.command(
  cmd('stats'),
  streamToBot.bind(null, chatId)
)
const start = chatId => {
  gameClient.command(
    cmd('start'), null, (crashed) => {
      if (!crashed) {
        bot.sendMessage(chatId, 'started')
        stats(chatId)
      }
    }
  )

  bot.sendMessage(chatId, 'starting...')
}
const stop = chatId => {
  gameClient.command(cmd('stop'))
  bot.sendMessage(chatId, 'stopping...')
}

bot.onText(/^\/(start\sstart|help)$/, msg => {
  bot.sendMessage(msg.chat.id, `
/stats to see server statistics
/start to start server
/stop to stop server
/startv to start server and log process into the chat
/stopv to stop server and log process into the chat
/help to see this help message
  `)
})
bot.onText(/^\/stats$/, msg => stats(msg.chat.id))
bot.onText(/^\/start$/, msg => start(msg.chat.id))
bot.onText(/^\/stop$/, msg => stop(msg.chat.id))
bot.onText(/^\/startv$/, msg => {
  gameClient.command(cmd('start'), streamToBot.bind(null, msg.chat.id))
})
bot.onText(/^\/stopv$/, msg => {
  gameClient.command(cmd('stop'), streamToBot.bind(null, msg.chat.id))
})

// Secret commands
bot.onText(/^\/?создавай$/, msg => {
  const chatId = msg.chat.id

  gameClient.command(
    cmd('start'), null, error => {
      if (!error) {
        gameClient.command(cmd('stats'), data => {
          const ipMatch = data.toString().match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)

          if (ipMatch) {
            bot.sendMessage(chatId, `го я создал ${ipMatch[0]}`)
          } else {
            bot.sendMessage(chatId, 'чет не получилось')
          }
        })
      } else {
        bot.sendMessage(chatId, 'чет не получилось')
      }
    }
  )

  bot.sendMessage(chatId, 'щя погодь')
})
bot.onText(/^\/?ну\s?шо\s?там\??$/, msg => stats(msg.chat.id))
