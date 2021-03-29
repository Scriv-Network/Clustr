import { CBot } from './app/bot.class'

let bot = new CBot();
bot.listen().then(() => {
    console.log('Bot successfully started!');
}).catch((error) => {
    console.log('An error occured while starting bot', error)
});