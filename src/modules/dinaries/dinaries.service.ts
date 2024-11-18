import { Inject, Injectable } from '@nestjs/common';
import { CreateDinaryDto } from './dto/create-dinary.dto';
import { UpdateDinaryDto } from './dto/update-dinary.dto';
import { IDinariesService } from './interfaces/IDinariesService.interface';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DinaryStage } from './entities/dinaryStage.entity';
import { DinaryImage } from './entities/DinaryImange.entity';

@Injectable()
export class DinariesService implements IDinariesService {
  constructor(
    @InjectRepository(DinaryStage)
    private readonly dinariesStageRepo: Repository<DinaryStage>,

    @InjectRepository(DinaryImage)
    private readonly dinariesImageRepo: Repository<DinaryImage>,
  ) {}

//   async createDinary(data: CreateDinaryDto): Promise<any> {
//    //check if dinary stage exist
//    const dinary_stage_exist = await this.dinariesStageRepo.findOne({
//       where: { dinary_stage_id: data.dinary_stage_id },
//     });


// }
}