import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';
import { BotGateway } from './bot.gateway';
import { TransactionsModule } from 'src/modules/transactions/transactions.module';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule, TransactionsModule],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('DISCORD_TOKEN'),
        discordClientOptions: {
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
        },
      }),
      inject: [ConfigService],
    }),
    TransactionsModule,
  ],
  providers: [BotGateway],
})
export class DiscordsModule {}
