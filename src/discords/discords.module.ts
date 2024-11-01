import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        token: process.env.DISCORD_BOT_TOKEN,
        intents: [GatewayIntentBits.GuildMessages],
        discordClientOptions: {
          intents: [GatewayIntentBits.GuildMessages], // Cấu hình các intent mà bot sẽ sử dụng
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DiscordsModule {}
