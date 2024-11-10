import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProcessDto } from './dto/create-process.dto';
import { IProcessesService } from './interfaces/IProcessesService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcessStandard } from './entities/standards/processStandard.entity';
import { Repository } from 'typeorm';
import { ProcessStandardStage } from './entities/standards/processStandardStage.entity';
import { ProcessStandardStageContent } from './entities/standards/processStandardStageContent.entity';
import { CreateProcessStageDto } from './dto/create-process-stage.dto';
import { CreateProcessStageContentDto } from './dto/create-process-stage-content.dto';
// import { PlantSeason } from '../plants/entities/plantSeason.entity';
import { CreateProcessStageMaterialDto } from './dto/create-process-stage-material.dto';
import { ProcessStandardStageMaterial } from './entities/standards/processStandardStageMaterial.entity';
import { ReportsService } from '../reports/reports.service';

import { Payload } from '../auths/types/payload.type';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ProcessTechnicalStandardStatus } from './types/status-processStandard.enum';

import { ServiceSpecific } from '../servicesPackage/entities/serviceSpecific.entity';
import { ProcessSpecific } from './entities/specifics/processSpecific.entity';
import { ProcessSpecificStage } from './entities/specifics/processSpecificStage.entity';
import { ProcessSpecificStageContent } from './entities/specifics/processSpecificStageContent.entity';
import { ProcessSpecificStageMaterial } from './entities/specifics/processSpecificStageMaterial.entity';
import { ServicesService } from '../servicesPackage/servicesPackage.service';
import { getTimeByPlusDays } from 'src/utils/time.utl';
import { RequestsService } from '../requests/requests.service';
import { request } from 'http';
import { Request } from '../requests/entities/request.entity';
import { RequestStatus } from '../requests/types/request-status.enum';
import { UpdateProcessStandardDto } from './dto/update-processStandardStatus.dto';
import { UpdateProcessStandardsDto } from './dto/update-process-standard.dto';
import { ProcessSpecificStatus } from './types/processSpecific-status.enum';
import { UPdateProcessSpecificDto } from './dto/update-process-specific.dto';
import { UserRole } from '../users/types/user-role.enum';

@Injectable()
export class ProcessesService implements IProcessesService {
  private readonly logger = new Logger(ProcessesService.name);

  constructor(
    @InjectRepository(ProcessStandard)
    private readonly processStandardRepo: Repository<ProcessStandard>,

    @InjectRepository(ProcessSpecific)
    private readonly processSpecificRepo: Repository<ProcessSpecific>,

    @InjectRepository(ProcessSpecificStage)
    private readonly processSpecificStageRepo: Repository<ProcessSpecificStage>,

    @InjectRepository(ProcessSpecificStageContent)
    private readonly processSpecificStageContentRepo: Repository<ProcessSpecificStageContent>,

    @InjectRepository(ProcessSpecificStageMaterial)
    private readonly processSpecificStageMaterialRepo: Repository<ProcessSpecificStageMaterial>,

    @InjectRepository(ProcessStandardStage)
    private readonly processStandardStageRepo: Repository<ProcessStandardStage>,

    @InjectRepository(ProcessStandardStageContent)
    private readonly processStandardStageContentRepo: Repository<ProcessStandardStageContent>,

    @InjectRepository(ProcessStandardStageMaterial)
    private readonly processStandardStageMaterialRepo: Repository<ProcessStandardStageMaterial>,

    @Inject(forwardRef(() => ReportsService))
    private readonly reportService: ReportsService,

    private readonly servicePackageService: ServicesService,

    private readonly requestService: RequestsService,
  ) {}

  async createProcessStandard(
    data: CreateProcessDto,
    expert: Payload,
  ): Promise<any> {
    try {
      //check if plant id and type process name is already exist
      const process = await this.processStandardRepo.findOne({
        where: {
          plant_season_id: data.plant_season_id,
        },
      });
      if (process) {
        throw new BadRequestException('plant season for process is exist');
      }
      //create new process
      const new_process = await this.processStandardRepo.save({
        ...data,
        expert_id: expert.user_id,
        name: data.name,
        plant_season_id: data.plant_season_id,
      });
      // create process stage
      if (data.stage) {
        const sortedStage = data.stage.sort(
          (a, b) => a.stage_numberic_order - b.stage_numberic_order,
        );
        for (const stage of sortedStage) {
          await this.createProcessStage(
            stage,
            new_process.process_technical_standard_id,
          );
        }
      }

      return new_process;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createProcessStage(
    data: CreateProcessStageDto,
    process_id: string,
  ): Promise<any> {
    try {
      const new_process_stage = await this.processStandardStageRepo.save({
        ...data,
        process_technical_standard_id: process_id,
      });
      // create process stage content and material

      if (data.content) {
        const sortedContent = data.content.sort(
          (a, b) => a.content_numberic_order - b.content_numberic_order,
        );
        for (const content of sortedContent) {
          await this.createProcessStageContent(
            content,
            new_process_stage.process_technical_standard_stage_id,
          );
        }
        if (data.material) {
          for (const material of data.material) {
            await this.createProcessStageMaterial(
              material,
              new_process_stage.process_technical_standard_stage_id,
            );
          }
        }
      }
      return new_process_stage;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createProcessStageContent(
    data: CreateProcessStageContentDto,
    process_stage_id: string,
  ): Promise<any> {
    try {
      return await this.processStandardStageContentRepo.save({
        ...data,
        process_technical_standard_stage_id: process_stage_id,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createProcessStageMaterial(
    data: CreateProcessStageMaterialDto,
    process_stage_id: string,
  ): Promise<any> {
    try {
      //create process stage material
      return await this.processStandardStageMaterialRepo.save({
        ...data,
        process_technical_standard_stage_id: process_stage_id,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getListProcessStandard(
    pagination: PaginationParams,
    status: ProcessTechnicalStandardStatus,
    plant_id: string,
  ): Promise<any> {
    try {
      // filter conditon by status and plant id
      const filter_condition: any = {};
      if (status) {
        filter_condition.status = status;
      }
      if (plant_id) {
        filter_condition.plant_season = {
          plant_id: plant_id,
        };
      }

      const [process_technical_standard, total_count] = await Promise.all([
        this.processStandardRepo.find({
          where: filter_condition,
          relations: {
            plant_season: {
              plant: true,
            },
            process_standard_stage: {
              process_standard_stage_content: true,
              process_standard_stage_material: {
                material: true,
              },
            },
            expert: true,
          },
          order: {
            process_standard_stage: {
              stage_numberic_order: 'ASC',
              process_standard_stage_content: {
                content_numberic_order: 'ASC',
              },
            },
          },
          select: {
            expert: {
              full_name: true,
              email: true,
              role: true,
              user_id: true,
            },
          },
          take: pagination.page_size,
          skip: (pagination.page_index - 1) * pagination.page_size,
        }),
        this.processStandardRepo.count({
          where: filter_condition,
        }),
      ]);
      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        process_technical_standard,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      console.error('Error fetching process standards:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  //update status of process

  async updateProcessStandardStatus(
    id: string,
    updateDto: UpdateProcessStandardDto,
  ): Promise<any> {
    try {
      // get process standard by id
      const process_standard = await this.processStandardRepo.findOne({
        where: {
          process_technical_standard_id: id,
        },
      });
      if (!process_standard) {
        throw new BadRequestException('Process standard not found!');
      }
      // get request by plant season id
      const request_create_process_standard: Request =
        await this.requestService.getDetailRequestPrcocessStandard(
          process_standard.plant_season_id,
        );
      // check reason of reject to update status
      if (!updateDto.reason_of_reject) {
        // update status to accepted
        await this.processStandardRepo.update(
          { process_technical_standard_id: id },
          {
            status: ProcessTechnicalStandardStatus.accepted,
          },
        );
        // update request to completed
        await this.requestService.updateRequestStatus(
          request_create_process_standard.request_id,
          RequestStatus.completed,
        );
        return `Process standard ${id} is accepted`;
      } else {
        // update status to rejected
        await this.processStandardRepo.update(
          { process_technical_standard_id: id },
          {
            status: ProcessTechnicalStandardStatus.rejected,
            reason_of_reject: updateDto.reason_of_reject,
          },
        );
        // update request to rejected
        await this.requestService.updateRequestStatus(
          request_create_process_standard.request_id,
          RequestStatus.rejected,
        );
        return `Process standard ${id} is rejected`;
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  //delete process
  async removeProcessStandard(id: string): Promise<any> {
    try {
      const process = await this.processStandardRepo.findOne({
        where: {
          process_technical_standard_id: id,
        },
      });
      if (!process) {
        throw new BadRequestException('process not found');
      }
      if (process.status === ProcessTechnicalStandardStatus.in_active) {
        throw new BadRequestException('process is in active');
      } else {
        process.status = ProcessTechnicalStandardStatus.in_active;
      }
      return await this.processStandardRepo.save(process);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function updateProcessStandard
   */
  async updateProcessStandard(
    process_technical_standard_id: string,
    data: UpdateProcessStandardsDto,
  ): Promise<any> {
    try {
      // get process standard by id
      const process_standard = await this.processStandardRepo.findOne({
        where: {
          process_technical_standard_id,
        },
      });
      if (!process_standard) {
        throw new BadRequestException('Process standard not found!');
      }
      //check if process standard is in active
      if (
        process_standard.status === ProcessTechnicalStandardStatus.in_active
      ) {
        throw new BadRequestException('Process standard is in active');
      }

      const data_process_standard = {
        name: data.name,
      };
      const update_process_standard = await this.processStandardRepo.save({
        ...process_standard,
        ...data_process_standard,
      });

      //update process stage
      if (data.stage) {
        for (const stage of data.stage) {
          //delete stage
          if (stage.is_deleted) {
            await this.processStandardStageRepo.delete(
              stage.process_technical_standard_stage_id,
            );
          }
          if (!stage.process_technical_standard_stage_id) {
            //create new stage
            await this.processStandardStageRepo.save({
              process_technical_standard_id: process_technical_standard_id,
              stage_title: stage.stage_title,
              stage_numberic_order: stage.stage_numberic_order,
              time_start: stage.time_start,
              time_end: stage.time_end,
            });
          } else {
            //update stage
            await this.processStandardStageRepo.update(
              stage.process_technical_standard_stage_id,
              {
                stage_title: stage.stage_title,
                stage_numberic_order: stage.stage_numberic_order,
                time_start: stage.time_start,
                time_end: stage.time_end,
              },
            );
          }
          if (stage.content) {
            for (const content of stage.content) {
              //delete content
              if (content.is_deleted) {
                await this.processStandardStageContentRepo.delete(
                  content.process_technical_standard_stage_content_id,
                );
              }
              if (!content.process_technical_standard_stage_content_id) {
                //create new content
                await this.processStandardStageContentRepo.save({
                  process_technical_standard_stage_id:
                    stage.process_technical_standard_stage_id,
                  title: content.title,
                  content: content.content,
                  content_numberic_order: content.content_numberic_order,
                  time_start: content.time_start,
                  time_end: content.time_end,
                });
              } else {
                //update content
                await this.processStandardStageContentRepo.update(
                  content.process_technical_standard_stage_content_id,
                  {
                    title: content.title,
                    content: content.content,
                    content_numberic_order: content.content_numberic_order,
                    time_start: content.time_start,
                    time_end: content.time_end,
                  },
                );
              }
            }
          }

          // Loop for material
          if (stage.material) {
            for (const material of stage.material) {
              //delete material
              if (material.is_deleted) {
                await this.processStandardStageMaterialRepo.delete(
                  material.process_technical_standard_stage_material_id,
                );
              }

              if (!material.process_technical_standard_stage_material_id) {
                //create new material
                await this.processStandardStageMaterialRepo.save({
                  process_technical_standard_stage_id:
                    stage.process_technical_standard_stage_id,
                  material_id: material.material_id,
                  quantity: material.quantity,
                });
              } else {
                //update material
                await this.processStandardStageMaterialRepo.update(
                  material.process_technical_standard_stage_material_id,
                  {
                    material_id: material.material_id,
                    quantity: material.quantity,
                  },
                );
              }
            }
          }
        }
      }
      return update_process_standard;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function createProcessSpecific
   */

  async createProcessSpecific(service_specific: ServiceSpecific): Promise<any> {
    try {
      // get detail of process standard
      const process_technical_standard = await this.processStandardRepo.findOne(
        {
          where: {
            plant_season_id: service_specific.plant_season_id,
          },
          relations: {
            process_standard_stage: {
              process_standard_stage_content: true,
              process_standard_stage_material: true,
            },
          },
        },
      );
      // create new process specific
      const process_technical_specific = await this.processSpecificRepo.save({
        process_technical_standard_id:
          process_technical_standard.process_technical_standard_id,
        service_specific_id: service_specific.service_specific_id,
        time_start: service_specific.time_start,
        time_end: service_specific.time_end,
        qr_url: '',
        expert_id: process_technical_standard.expert_id,
      });
      // create process specific stage
      for (const stage of process_technical_standard.process_standard_stage) {
        // create process specific stage
        const process_specific_stage = await this.processSpecificStageRepo.save(
          {
            process_technical_specific_id:
              process_technical_specific.process_technical_specific_id,
            stage_numberic_order: stage.stage_numberic_order,
            stage_title: stage.stage_title,
            time_start: getTimeByPlusDays(
              service_specific.time_start,
              stage.time_start,
            ),
            time_end: getTimeByPlusDays(
              service_specific.time_start,
              stage.time_end,
            ),
          },
        );
        // create process specific stage content
        for (const content of stage.process_standard_stage_content) {
          await this.processSpecificStageContentRepo.save({
            process_technical_specific_stage_id:
              process_specific_stage.process_technical_specific_stage_id,
            content_numberic_order: content.content_numberic_order,
            title: content.title,
            content: content.content,
            time_start: getTimeByPlusDays(
              service_specific.time_start,
              content.time_start,
            ),
            time_end: getTimeByPlusDays(
              service_specific.time_start,
              content.time_end,
            ),
          });
        }
        // create process specific stage material
        for (const material of stage.process_standard_stage_material) {
          await this.processSpecificStageMaterialRepo.save({
            process_technical_specific_stage_id:
              process_specific_stage.process_technical_specific_stage_id,
            material_id: material.material_id,
            quantity: material.quantity,
          });
        }
      }
      return process_technical_specific;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //getlist process specific by status and plant id
  async getListProcessSpecific(
    pagination: PaginationParams,
    status: ProcessSpecificStatus,
    plant_id: string,
    user: Payload,
  ): Promise<any> {
    try {
      // filter conditon by status and plant id
      const filter_condition: any = {};
      if (status) {
        filter_condition.status = status;
      }
      if (plant_id) {
        filter_condition.plant_season = {
          plant_id: plant_id,
        };
      }
      if (user.role === UserRole.expert) {
        filter_condition.expert_id = user.user_id;
      }
      if (user.role === UserRole.land_renter) {
        filter_condition.service_specific = {
          landrenter_id: user.user_id,
        };
      }

      const [process_technical_specific, total_count] = await Promise.all([
        this.processSpecificRepo.find({
          where: filter_condition,
          relations: {
            process_technical_standard: {
              plant_season: {
                plant: true,
              },
            },
            process_technical_specific_stage: {
              process_technical_specific_stage_content: true,
              process_technical_specific_stage_material: {
                materialSpecific: true,
              },
            },
            service_specific: true,
          },
          order: {
            process_technical_specific_stage: {
              stage_numberic_order: 'ASC',
              process_technical_specific_stage_content: {
                content_numberic_order: 'ASC',
              },
            },
          },
          select: {
            expert: {
              full_name: true,
              email: true,
              role: true,
              user_id: true,
            },
          },
          take: pagination.page_size,
          skip: (pagination.page_index - 1) * pagination.page_size,
        }),
        this.processSpecificRepo.count({
          where: filter_condition,
        }),
      ]);
      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        process_technical_specific,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      console.error('Error fetching process standards:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  //update process specific
  async updateProcessSpecific(
    process_technical_specific_id: string,
    data: UPdateProcessSpecificDto,
  ): Promise<any> {
    try {
      const process_specific = await this.processSpecificRepo.findOne({
        where: {
          process_technical_specific_id,
        },
      });
      if (!process_specific) {
        throw new BadRequestException('Process standard not found!');
      }
      //check if process  is in active
      if (process_specific.status === ProcessSpecificStatus.pending) {
        throw new BadRequestException('Process standard is in active');
      }
      //update process Specific
      const data_process_specific = {
        time_start: data.time_start,
        time_end: data.time_end,
        qr_url: data.qr_url,
      };
      const update_process_specific = await this.processSpecificRepo.save({
        ...process_specific,
        ...data_process_specific,
      });
      // update process specific stage

      if (data.stage) {
        for (const stage of data.stage) {
          //delete stage
          if (stage.is_deleted) {
            await this.processSpecificStageRepo.delete(
              stage.process_technical_specific_stage_id,
            );
          }
          if (!stage.process_technical_specific_stage_id) {
            //create new stage
            await this.processSpecificStageRepo.save({
              process_technical_specific_id: process_technical_specific_id,
              stage_title: stage.stage_title,
              stage_numberic_order: stage.stage_numberic_order,
              time_start: stage.time_start,
              time_end: stage.time_end,
            });
          } else {
            //update stage
            await this.processSpecificStageRepo.update(
              stage.process_technical_specific_stage_id,
              {
                stage_title: stage.stage_title,
                stage_numberic_order: stage.stage_numberic_order,
                time_start: stage.time_start,
                time_end: stage.time_end,
              },
            );
          }
          if (stage.content) {
            for (const content of stage.content) {
              //delete content
              if (content.is_deleted) {
                await this.processSpecificStageContentRepo.delete(
                  content.process_technical_specific_stage_content_id,
                );
              }
              if (!content.process_technical_specific_stage_content_id) {
                //create new content
                await this.processSpecificStageContentRepo.save({
                  process_technical_specific_stage_id:
                    stage.process_technical_specific_stage_id,
                  title: content.title,
                  content: content.content,
                  content_numberic_order: content.content_numberic_order,
                  time_start: content.time_start,
                  time_end: content.time_end,
                });
              } else {
                //update content
                await this.processSpecificStageContentRepo.update(
                  content.process_technical_specific_stage_content_id,
                  {
                    title: content.title,
                    content: content.content,
                    content_numberic_order: content.content_numberic_order,
                    time_start: content.time_start,
                    time_end: content.time_end,
                  },
                );
              }
            }
          }

          // Loop for material
          if (stage.material) {
            for (const material of stage.material) {
              //delete material
              if (material.is_deleted) {
                await this.processSpecificStageMaterialRepo.delete(
                  material.process_technical_specific_stage_material_id,
                );
              }

              if (!material.process_technical_specific_stage_material_id) {
                //create new material
                await this.processSpecificStageMaterialRepo.save({
                  process_technical_specific_stage_id:
                    stage.process_technical_specific_stage_id,
                  material_id: material.material_id,
                  quantity: material.quantity,
                });
              } else {
                //update material
                await this.processSpecificStageMaterialRepo.update(
                  material.process_technical_specific_stage_material_id,
                  {
                    material_id: material.material_id,
                    quantity: material.quantity,
                  },
                );
              }
            }
          }
        }
      }
      return update_process_specific;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
