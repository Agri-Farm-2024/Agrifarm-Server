import { Injectable, Logger } from '@nestjs/common';
import { InjectDiscordClient, Once } from '@discord-nestjs/core';
import { Client, Message } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,

    private readonly configService: ConfigService,
  ) {}

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);

    // Listent to message create event
    this.client.on('messageCreate', async (message: Message) => {
      try {
        // Check if the message is sent in the payment channel
        if (
          message.channelId ===
          this.configService.get('DISCORD_PAYMENT_CHANNEL_ID')
        ) {
        }
      } catch (error) {}
    });
  }
}
// try {
//     // 1252932322697678900
//     // ninh 1269661297272950929
//     // test 1269271299142717565
//     if (
//         message.channelId === '1252932322697678900' ||
//         message.channelId === '1269661297272950929'
//     ) {
//         let row_mess = message.content.split('\n')
//         let price = row_mess[0]
//         price = price.split(' ')[5].trim()
//         if (price === 'giảm') {
//             let transaction_code = message.content.split('\n')[1]
//             transaction_code = transaction_code.split(':')[1].trim()
//             transaction_code = transaction_code.split(' ')[0].trim()
//             // Call service
//             if (transaction_code) {
//                 await PaymentService.handleSuccessWithdrawPaymentBank(
//                     transaction_code
//                 )
//             } else {
//                 return
//             }
//         } else if (price === 'tăng') {
//             let transaction_code = message.content.split('\n')[1]
//             transaction_code = transaction_code.split(':')[1].trim()
//             /**
//              * 1. Condition user send by momo
//              */
//             if (transaction_code.includes('MB')) {
//                 transaction_code = transaction_code.split(' ')[2].trim()
//                 // make transacition_code to 6 characters E4RDDT-
//                 transaction_code = transaction_code.slice(0, 6)
//                 global.logger.info(
//                     `Payment by condition user send by momo includes MB ${transaction_code}`
//                 )
//                 await PaymentService.handleSuccessDepositPaymentBank(
//                     transaction_code
//                 )
//                 return
//             }
//             /**
//              * 2. Condition user send by other bank
//              */
//             const hyphenCount = (transaction_code.match(/-/g) || []).length

//             if (hyphenCount > 1) {
//                 transaction_code = transaction_code.split('-')[1].trim()
//                 global.logger.info(
//                     `Payment by condition user send by momo ${transaction_code}`
//                 )
//                 await PaymentService.handleSuccessDepositPaymentBank(
//                     transaction_code
//                 )
//                 return
//             }
//             /**
//              * 3. Condition user send by vcb bank
//              */
//             const dotCount = (transaction_code.match(/\./g) || []).length
//             if (dotCount > 1) {
//                 transaction_code = transaction_code.split('.')[3].trim()
//                 global.logger.info(
//                     `Payment by condition user send by vcb ${transaction_code}`
//                 )
//                 await PaymentService.handleSuccessDepositPaymentBank(
//                     transaction_code
//                 )
//                 return
//             }
//             /**
//              * 4. Normal case
//              */
//             transaction_code = transaction_code.split(' ')[0].trim()
//             transaction_code = transaction_code.slice(0, 6)

//             global.logger.info(
//                 `Payment by condition normal case ${transaction_code}`
//             )
//             await PaymentService.handleSuccessDepositPaymentBank(transaction_code)

//             return
//         } else {
//             return
//         }
//     } else {
//         return
//     }
// } catch (error) {
//     global.logger.error(error.message)
// }