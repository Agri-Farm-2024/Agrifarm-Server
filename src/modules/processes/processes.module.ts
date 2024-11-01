import { forwardRef, Module } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { ProcessesController } from './processes.controller';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessStandard } from './entities/standards/processStandard.entity';
import { ProcessStandardStage } from './entities/standards/processStandardStage.entity';
import { ProcessStandardStageContent } from './entities/standards/processStandardStageContent.entity';
import { ProcessStandardStageMaterial } from './entities/standards/processStandardStageMaterial.entity';
import { ReportsModule } from '../reports/reports.module';
import { JwtModule } from '@nestjs/jwt';

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
    forwardRef(() => ReportsModule),
    JwtModule
  ],
  exports: [ProcessesService],
})
export class ProcessesModule {}
