import { Injectable, Logger } from '@nestjs/common';
import { InjectDiscordClient, Once } from '@discord-nestjs/core';
import { Client, Message } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from 'src/modules/transactions/transactions.service';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,

    private readonly configService: ConfigService,

    private readonly transactionService: TransactionsService,
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
          const price = message.content.split('\n')[0].split(' ')[5].trim();
          console.log(price);
          if (price === 'giảm') {
            const transaction_code = message.content
              .split('\n')[1]
              .split(' ')[1]
              .trim()
              .split(' ')[0]
              .trim();
            console.log(transaction_code);
            // Call service
            if (transaction_code) {
              // await PaymentService.handleSuccessWithdrawPaymentBank(
              //     transaction_code
              // )
            } else {
              return;
            }
          } else if (price === 'tăng') {
            let transaction_code = message.content.split('\n')[1];
            transaction_code = transaction_code.split(':')[1].trim();
            // Condition user send by momo
            if (transaction_code.includes('MB')) {
              transaction_code = transaction_code.split(' ')[2].trim();
              // make transacition_code to 6 characters E4RDDT-
              transaction_code = transaction_code.slice(0, 6);
              global.logger.info(
                `Payment by condition user send by momo includes MB ${transaction_code}`,
              );
              // call service
              await this.transactionService.handleTransactionPayment(
                transaction_code,
                +price,
              );
              return;
            }
            /**
             * 2. Condition user send by other bank
             */
            const hyphenCount = (transaction_code.match(/-/g) || []).length;
            if (hyphenCount > 1) {
              transaction_code = transaction_code.split('-')[1].trim();
              global.logger.info(
                `Payment by condition user send by momo ${transaction_code}`,
              );
              // call service
              await this.transactionService.handleTransactionPayment(
                transaction_code,
                +price,
              );
              return;
            }
            /**
             * 3. Condition user send by vcb bank
             */
            const dotCount = (transaction_code.match(/\./g) || []).length;
            if (dotCount > 1) {
              transaction_code = transaction_code.split('.')[3].trim();
              global.logger.info(
                `Payment by condition user send by vcb ${transaction_code}`,
              );
              // call service
              await this.transactionService.handleTransactionPayment(
                transaction_code,
                +price,
              );
              return;
            }
            /**
             * 4. Normal case
             */
            transaction_code = transaction_code.split(' ')[0].trim();
            transaction_code = transaction_code.slice(0, 6);
            global.logger.info(
              `Payment by condition normal case ${transaction_code}`,
            );
            // call service
            await this.transactionService.handleTransactionPayment(
              transaction_code,
              +price,
            );
            return;
          }
        }
      } catch (error) {}
    });
  }
}
