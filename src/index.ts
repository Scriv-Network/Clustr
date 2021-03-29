// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import { CBot } from './app/bot.class'

let bot = new CBot();
bot.listen().then(() => {
    console.log('Bot successfully started!');
}).catch((error) => {
    console.log('An error occured while starting bot', error)
});