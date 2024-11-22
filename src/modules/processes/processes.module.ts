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
import { ProcessSpecific } from './entities/specifics/processSpecific.entity';
import { ProcessSpecificStage } from './entities/specifics/processSpecificStage.entity';
import { ProcessSpecificStageContent } from './entities/specifics/processSpecificStageContent.entity';
import { ProcessSpecificStageMaterial } from './entities/specifics/processSpecificStageMaterial.entity';
import { ServicesModule } from '../servicesPackage/servicesPackage.module';
import { RequestsModule } from '../requests/requests.module';
import { DinariesModule } from '../dinaries/dinaries.module';

@Module({
  controllers: [ProcessesController],
  providers: [ProcessesService],
  imports: [
    TypeOrmModule.forFeature([
      ProcessStandard,
      ProcessStandardStage,
      ProcessStandardStageContent,
      ProcessStandardStageMaterial,
      ProcessSpecific,
      ProcessSpecificStage,
      ProcessSpecificStageContent,
      ProcessSpecificStageMaterial,
    ]),
    forwardRef(() => ReportsModule),
    forwardRef(() => ServicesModule),
    JwtModule,
    forwardRef(() => RequestsModule),
    forwardRef(() => DinariesModule),
  ],
  exports: [ProcessesService],
})
export class ProcessesModule {}
