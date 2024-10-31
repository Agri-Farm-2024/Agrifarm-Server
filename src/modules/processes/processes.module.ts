import { Module } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { ProcessesController } from './processes.controller';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessStandard } from './entities/standards/processStandard.entity';
import { ProcessStandardStage } from './entities/standards/processStandardStage.entity';
import { ProcessStandardStageContent } from './entities/standards/processStandardStageContent.entity';
import { ProcessStandardStageMaterial } from './entities/standards/processStandardStageMaterial.entity';

@Module({
  controllers: [ProcessesController],
  providers: [ProcessesService],
  imports: [
    TypeOrmModule.forFeature([
      ProcessStandard,
      ProcessStandardStage,
      ProcessStandardStageContent,
      ProcessStandardStageMaterial,
    ]),
  ],
})
export class ProcessesModule {}
