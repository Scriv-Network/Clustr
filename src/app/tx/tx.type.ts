export type TTxFile = {
    "flag": string;                                         // Discord flag icon
    "language": string;                                     // Language name. i.e. for FR, value should be "Français"

    "command.error"?: string,                               // Error message when the user provides incompatible list of arguments to a command
                                                            // Parameters:  ${0}    =   Command prefix as per config file (Ex: '!')
                                                            //              ${1}    =   Command name (Ex: 'help', 'status', 'verify'...)

    "command.blockchain.title"?: string,                    // Title for [blockchain] command (Message displayed when '!blockchain' requested)
    "command.blockchain.welcome"?: string,                  // Top description of [blockchain] command (Ex: 'I'm the bot for community governance')
    "command.blockchain.help.short"?: string,               // Help message for the [help] command when `!help` lists all commands help
    "command.blockchain.help.long"?: string,                // Detailed help message for the [help] command when `'!help blockchain` is called

    "command.blockchain.status.coin"?: string               // Header of the coin wallet status (Ex: '${1} wallet info:')
                                                            // Parameters:  ${0}    =   Coin ticker (i.e. 'SCRIV')
                                                            // Parameters:  ${1}    =   Coin name (i.e. 'Scriv Network')
    "command.blockchain.status.version"?: string,           // Display the coin RPC wallet version
                                                            // Parameters:  ${0}    =   Version number
    "command.blockchain.status.protocolversion"?: string,   // Display the coin RPC wallet protocol version
                                                            // Parameters:  ${0}    =   Protocol version number
    "command.blockchain.status.walletversion"?: string,     // Display the coin RPC wallet wallet version
                                                            // Parameters:  ${0}    =   Wallet version number
    "command.blockchain.status.blocks"?: string,            // Display the coin RPC wallet current block height
                                                            // Parameters:  ${0}    =   The current block height
    "command.blockchain.status.bestblockhash"?: string,     // Display the coin RPC wallet last block hash
                                                            // Parameters:  ${0}    =   The last block hash

    "command.help.title"?: string,                          // Title for [help] command (Message displayed when '!help' requested)
    "command.help.welcome"?: string,                        // Top description of [help] command (Ex: 'I'm the bot for community governance')
    "command.help.help.short"?: string,                     // Help message for the [help] command when `!help` lists all commands help
    "command.help.help.long"?: string,                      // Help message for the [help] command when `'help help`
    "command.help.coins"?: string,                          // [help] text for each governance driven coins column 'Name'
    "command.help.coin"?: string,                           // [help] text for each governance driven coin name Normaly empty (Since equal to '${0}')
                                                            // Parameters:  ${0}    =   The coin name (Ex: 'Scriv')
    "command.help.icons"?: string,                          // [help] text for each governance driven coins column 'Icon'
    "command.help.icon"?: string,                           // [help] text for each governance driven coin icon Normaly empty (Since equal to '${0}')
                                                            // Parameters:  ${0}    =   The coin icon (Ex: ':scriv:')
    "command.help.tickers"?: string,                        // [help] text for each governance driven coins column 'Ticker'
    "command.help.ticker"?: string,                         // [help] text for each governance driven coins ticker Normaly empty (Since equal to '${0}')
                                                            // Parameters:  ${0}    =   The coin ticker (Ex: 'SCRIV')
    "command.help.communities"?: string,                    // [help] header text before listing governance driven coins (Ex: '**Currently I'm helping the following communities**')

    "command.help.commands"?: string,                       // [help] header text before listing short commands help (Ex: '**I support the following commands**')
    "command.help.command.short"?: string,                  // [help] text. Normaly empty (Since equal to '${0}')
                                                            // Parameters:  ${0}    =   The command short help message (See '[command].help.short')

    "command.help.links.doc"?: string;                      // [help] link to the documentation (Ex: '[Wiki](http:          //www.wikipedia.org)')
    "command.help.links.docs"?: string;                     // [help] link to the documentation column header
    "command.help.links.term"?: string;                     // [help] terms of service link (Ex: '[Termes](http:          //www.stackofstake.com)')
    "command.help.links.terms"?: string;                    // [help] terms of service column header
    "command.help.links.community"?: string;                // [help] community link (Ex: '[Join us](http:          //www.discord.com)')
    "command.help.links.communities"?: string;              // [help] community link header

    "command.help.command.name"?: string;                   // [help] command name when requesting a specific command help (Ex: '!help verify')
                                                            // Parameters:  ${0}    =   The name of the command in uppercase (i.e. 'VERIFY')
    "command.help.command.long"?: string;                   // [help] text. Normaly empty (Since equal to '${0}')
                                                            // Parameters:  ${0}    =   The command long help message (See '[command].help.long')

    "command.language.title"?: string,                      // Title for [language] command (Message displayed when '!language' requested)
    "command.language.welcome"?: string,                    // Top description of [language] command (Ex: 'I'm the bot for community governance')
    "command.language.help.short"?: string,                 // Help message for the [language] command when `!help` lists all commands help
    "command.language.help.long"?: string,                  // Help message for the [language] command when `!help languages`
    "command.language.current"?: string,                    // Message displayed when returning the current language
                                                            // Parameters:  ${0}    =   Short language (Ex: 'fr')
                                                            //              ${1}    =   Long language as taken from /language/ (Ex: 'Français')
                                                            //              ${2}    =   Flag as taken from /flag/ (Ex: ':flag_fr:')
    "command.language.updated"?: string,                    // Message displayed when language was properly changed
                                                            // Parameters:  ${0}    =   Short language (Ex: 'fr')
                                                            //              ${1}    =   Long language as taken from /language/ (Ex: 'Français')
                                                            //              ${2}    =   Flag as taken from /flag/ (Ex: ':flag_fr:')
    "command.language.identical"?: string,                  // Message displayed when language was not changed because language was already set to that one
                                                            // Parameters:  ${0}    =   Short language (Ex: 'fr')
                                                            //              ${1}    =   Long language as taken from /language/ (Ex: 'Français')
                                                            //              ${2}    =   Flag as taken from /flag/ (Ex: ':flag_fr:')

    "command.languages.title"?: string,                     // Title for [languages] command (Message displayed when '!languages' requested)
    "command.languages.welcome"?: string,                   // Top description of [languages] command (Ex: 'I'm the bot for community governance')
    "command.languages.help.short"?: string,                // Help message for the [languages] command when `!help` lists all commands help
    "command.languages.help.long"?: string,                 // Help message for the [languages] command when `!help languages`
    "command.languages.languages"?: string,                 // Bold header text before the list of languages
    "command.languages.language"?: string                   // Each language text. (Ex: '${2} ${1} [${0}]')
                                                            // Parameters:  ${0}    =   Short language (Ex: 'fr')
                                                            //              ${1}    =   Long language as taken from /language/ (Ex: 'Français')
                                                            //              ${2}    =   Flag as taken from /flag/ (Ex: ':flag_fr:')

    "command.unknown.title"?: string,                       // Title for [unknown] command (Message displayed when command is not recognize, i.e: '!barbatruk')
    "command.unknown.welcome"?: string,                     // Top description of [unknown] command (Ex: 'You entered an unknown command")
    "command.unknown.help.short"?: string,                  // Help message for the [unknown] command when `!help` lists all commands help [HIDDEN]
    "command.unknown.help.long"?: string,                   // Help message for the [unknown] command when `'help unknown` list only [unknown] command help [HIDDEN]
    "command.unknown.message"?: string,                     // Message explaining what happened. (Ex: 'I didn't understand your command [${0}]' )
                                                            // Parameters:  ${0}    = The unknown command the user entered (Ex: '!qskfd')

    "system.error.message"?: string;                        // General message for a system error, ex: "Message: ${0}"
                                                            // Parameters:  ${0}    =   The system error message (Ex: 'Heap overflow')
    "system.error.title"?: string;                          // Title for a system error, ex: "A system error occured!"
                                                            // Parameters:  ${0}    =   Embed message title for system error (Ex: ':x: System error!'
    "system.error.user.multiple"?: string;                  // Error message when user snowflake has multiple records in database
                                                            // Parameters:  ${0}    =   Discord's user snowflake (Ex: '802162343786500904')
}