import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';
import { BotGateway } from './bot.gateway';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
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
  ],
  providers: [BotGateway],
})
export class DiscordsModule {}
