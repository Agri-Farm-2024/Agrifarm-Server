import { Injectable, Logger } from '@nestjs/common';
import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Client, Message } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from 'src/modules/transactions/transactions.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,

    private readonly configService: ConfigService,

    private readonly transactionService: TransactionsService,

    private readonly loggerService: LoggerService,
  ) {}

  @On('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);

    // Listent to message create event
    this.client.on('messageCreate', async (message: Message) => {
      try {
        // Check if the message is sent in the payment channel
        if (
          message.channelId === this.configService.get('DISCORD_PAYMENT_CHANNEL_ID') &&
          message.author.id !== '1302050576833450016'
        ) {
          let price = message.content.split('\n')[0].split(' ')[6];
          price = price.replace(/,/g, '');
          const message_price = message.content.split('\n')[0].split(' ')[5].trim();
          console.log(message_price);
          if (message_price === 'giảm') {
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
          } else if (message_price === 'tăng') {
            let transaction_code = message.content.split('\n')[1];
            transaction_code = transaction_code.split(':')[1].trim();
            // Condition user send by momo
            if (transaction_code.includes('MB')) {
              transaction_code = transaction_code.split(' ')[2].trim();
              // make transacition_code to 6 characters E4RDDT-
              transaction_code = transaction_code.slice(0, 6);

              // call service
              await this.transactionService.handleTransactionPayment(transaction_code, +price);
              // reply message
              message.reply('Success');
              return;
            }
            /**
             * 2. Condition user send by other bank
             */
            const hyphenCount = (transaction_code.match(/-/g) || []).length;
            if (hyphenCount > 1) {
              transaction_code = transaction_code.split('-')[1].trim();
              this.loggerService.log(
                `Payment by condition user send by other bank ${transaction_code}`,
              );
              // call service
              await this.transactionService.handleTransactionPayment(transaction_code, +price);
              // reply message
              message.reply('Success');

              return;
            }
            /**
             * 3. Condition user send by vcb bank
             */
            const dotCount = (transaction_code.match(/\./g) || []).length;
            if (dotCount > 1) {
              transaction_code = transaction_code.split('.')[3].trim();
              this.loggerService.log(
                `Payment by condition user send by other bank ${transaction_code}`,
              );
              // call service
              await this.transactionService.handleTransactionPayment(transaction_code, +price);
              // reply message
              message.reply('Success');
              return;
            }
            /**
             * 4. Normal case
             */
            transaction_code = transaction_code.split(' ')[0].trim();
            transaction_code = transaction_code.slice(0, 6);
            this.loggerService.log(
              `Payment by condition user send by other bank ${transaction_code}`,
            );
            // call service
            await this.transactionService.handleTransactionPayment(transaction_code, +price);
            // reply message
            message.reply('Success');
            return;
          }
        }
      } catch (error) {
        // reply error message
        message.reply(`Error: ${error.message}`);
      }
    });
  }
}
