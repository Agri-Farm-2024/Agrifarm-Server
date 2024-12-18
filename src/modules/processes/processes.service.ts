import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProcessStandardDTO } from './dto/create-process-standard.dto';
import { IProcessesService } from './interfaces/IProcessesService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcessStandard } from './entities/standards/processStandard.entity';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { ProcessStandardStage } from './entities/standards/processStandardStage.entity';
import { ProcessStandardStageContent } from './entities/standards/processStandardStageContent.entity';
import { CreateProcessStageDto } from './dto/create-process-standard-stage.dto';
import { CreateProcessStageContentDto } from './dto/create-process-standard-stage-content.dto';
import { CreateProcessStageMaterialDto } from './dto/create-process-standard-stage-material.dto';
import { ProcessStandardStageMaterial } from './entities/standards/processStandardStageMaterial.entity';
import { IUser } from '../auths/interfaces/IUser.interface';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ProcessTechnicalStandardStatus } from './types/status-processStandard.enum';
import { ServiceSpecific } from '../servicesPackage/entities/serviceSpecific.entity';
import { ProcessSpecific } from './entities/specifics/processSpecific.entity';
import { ProcessSpecificStage } from './entities/specifics/processSpecificStage.entity';
import { ProcessSpecificStageContent } from './entities/specifics/processSpecificStageContent.entity';
import { ProcessSpecificStageMaterial } from './entities/specifics/processSpecificStageMaterial.entity';
import { getTimeByPlusDays } from 'src/utils/time.utl';
import { RequestsService } from '../requests/requests.service';
import { Request } from '../requests/entities/request.entity';
import { RequestStatus } from '../requests/types/request-status.enum';
import { UpdateProcessStandardDto } from './dto/update-process-standard-status.dto';
import { UpdateProcessStandardsDto } from './dto/update-process-standard.dto';
import { ProcessSpecificStatus } from './types/processSpecific-status.enum';
import { UPdateProcessSpecificDto } from './dto/update-process-specific.dto';
import { UserRole } from '../users/types/user-role.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { NotificationTitleEnum } from '../notifications/types/notification-title.enum';
import { NotificationContentEnum } from '../notifications/types/notification-content.enum';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { selectUser } from 'src/utils/select.util';
import { MaterialsService } from '../materials/materials.service';
import { ServiceSpecificStatus } from '../servicesPackage/types/service-specific-status.enum';
import { RequestType } from '../requests/types/request-type.enum';

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

    @Inject(forwardRef(() => RequestsService))
    private readonly requestService: RequestsService,

    private readonly notificationService: NotificationsService,

    private readonly userService: UsersService,

    private readonly materialService: MaterialsService,
  ) {}

  async createProcessStandard(data: CreateProcessStandardDTO, expert: IUser): Promise<any> {
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
        for (let i = 0; i < data.stage.length; i++) {
          data.stage[i].stage_numberic_order = i + 1;
          await this.createProcessStage(data.stage[i], new_process.process_technical_standard_id);
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

  async createProcessStage(data: CreateProcessStageDto, process_id: string): Promise<any> {
    try {
      const new_process_stage = await this.processStandardStageRepo.save({
        ...data,
        process_technical_standard_id: process_id,
      });
      // create process stage content and material

      if (data.content) {
        for (let i = 0; i < data.content.length; i++) {
          data.content[i].content_numberic_order = i + 1;
          await this.createProcessStageContent(
            data.content[i],
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
    user: IUser,
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
            updated_at: 'DESC',
            status: 'ASC',
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
      // Checking for request can edit process standard
      for (const process of process_technical_standard as any) {
        process.can_edit = false;
        // get request by plant season id
        const request: Request = await this.requestService.getDetailRequestPrcocessStandard(
          process.plant_season_id,
        );
        // check status of request
        if (request.status === RequestStatus.in_progress) {
          process.can_edit = true;
        }
      }

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

  async updateProcessStandardStatus(id: string, updateDto: UpdateProcessStandardDto): Promise<any> {
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

  async updateStatusProcessTechnicalStandardByRequest(
    plant_season_id: string,
    status: ProcessTechnicalStandardStatus,
  ): Promise<any> {
    try {
      // check process standard exist
      const process_standard = await this.processStandardRepo.findOne({
        where: {
          plant_season_id,
        },
      });
      if (!process_standard) {
        throw new BadRequestException('Process standard not found');
      }
      // update status
      const updated_process_standard = await this.processStandardRepo.save({
        ...process_standard,
        status,
      });
      return updated_process_standard;
    } catch (error) {
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
   * Update process standard
   * @param process_technical_standard_id : string
   * @param data : UpdateProcessStandardsDto
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

      const data_process_standard = {
        name: data.name,
      };
      const update_process_standard = await this.processStandardRepo.save({
        ...process_standard,
        ...data_process_standard,
      });

      //update process stage
      if (data.stage) {
        for (let i = 0; i < data.stage.length; i++) {
          // Check is deleted stage
          if (data.stage[i].is_deleted) {
            // Delete stage
            await this.processStandardStageRepo.delete(
              data.stage[i].process_technical_standard_stage_id,
            );
          }
          // Check is exist id for stage
          if (!data.stage[i].process_technical_standard_stage_id) {
            //create new stage
            await this.processStandardStageRepo.save({
              process_technical_standard_id: process_technical_standard_id,
              stage_title: data.stage[i].stage_title,
              stage_numberic_order: i + 1,
              time_start: data.stage[i].time_start,
              time_end: data.stage[i].time_end,
            });
          } else {
            //update stage
            await this.processStandardStageRepo.update(
              data.stage[i].process_technical_standard_stage_id,
              {
                stage_title: data.stage[i].stage_title,
                stage_numberic_order: i + 1,
                time_start: data.stage[i].time_start,
                time_end: data.stage[i].time_end,
              },
            );
          }
          if (data.stage[i].content) {
            for (const content of data.stage[i].content) {
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
                    data.stage[i].process_technical_standard_stage_id,
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
          if (data.stage[i].material) {
            for (const material of data.stage[i].material) {
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
                    data.stage[i].process_technical_standard_stage_id,
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
      // get request create process standard
      const request_create_process_standard: Request =
        await this.requestService.getDetailRequestPrcocessStandard(
          process_standard.plant_season_id,
        );
      // check if status is reject update status to in progress
      if (update_process_standard.status === ProcessTechnicalStandardStatus.rejected) {
        // update request to in progress
        await this.requestService.updateRequestStatus(
          request_create_process_standard.request_id,
          RequestStatus.pending_approval,
        );
        // update process to pending
        await this.processStandardRepo.update(
          { process_technical_standard_id: process_technical_standard_id },
          {
            status: ProcessTechnicalStandardStatus.pending,
          },
        );
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
   * @param service_specific : ServiceSpecific
   * @description create process specific
   */

  async createProcessSpecific(service_specific: ServiceSpecific): Promise<any> {
    try {
      // get detail of process standard
      const process_technical_standard = await this.processStandardRepo.findOne({
        where: {
          plant_season_id: service_specific.plant_season_id,
        },
        relations: {
          process_standard_stage: {
            process_standard_stage_content: true,
            process_standard_stage_material: true,
          },
        },
      });
      // get list expert free time
      const list_expert_free_time: User[] =
        await this.userService.getListExpertByProcessSpecificFreeTime();
      // create new process specific
      const process_technical_specific = await this.processSpecificRepo.save({
        process_technical_standard_id: process_technical_standard.process_technical_standard_id,
        service_specific_id: service_specific.service_specific_id,
        time_start: service_specific.time_start,
        time_end: service_specific.time_end,
        qr_url: '',
        expert_id: list_expert_free_time[0].user_id,
      });
      // create process specific stage
      for (const stage of process_technical_standard.process_standard_stage) {
        // create process specific stage
        const process_specific_stage = await this.processSpecificStageRepo.save({
          process_technical_specific_id: process_technical_specific.process_technical_specific_id,
          stage_numberic_order: stage.stage_numberic_order,
          stage_title: stage.stage_title,
          time_start: getTimeByPlusDays(service_specific.time_start, stage.time_start),
          time_end: getTimeByPlusDays(service_specific.time_start, stage.time_end),
        });
        // create process specific stage content
        for (const content of stage.process_standard_stage_content) {
          await this.processSpecificStageContentRepo.save({
            process_technical_specific_stage_id:
              process_specific_stage.process_technical_specific_stage_id,
            content_numberic_order: content.content_numberic_order,
            title: content.title,
            content: content.content,
            time_start: getTimeByPlusDays(service_specific.time_start, content.time_start),
            time_end: getTimeByPlusDays(service_specific.time_start, content.time_end),
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
    user: IUser,
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
            expert: true,
            process_technical_standard: {
              plant_season: {
                plant: true,
              },
            },
            process_technical_specific_stage: {
              process_technical_specific_stage_content: {
                dinary_stage: {
                  dinaries_link: true,
                },
              },
              process_technical_specific_stage_material: {
                materialSpecific: true,
              },
            },
            service_specific: {
              land_renter: true,
              booking_land: {
                land: true,
              },
            },
          },
          order: {
            status: 'ASC',
            process_technical_specific_stage: {
              stage_numberic_order: 'ASC',
              process_technical_specific_stage_content: {
                content_numberic_order: 'ASC',
              },
            },
          },
          select: {
            expert: selectUser,
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
    user: IUser,
  ): Promise<any> {
    try {
      const process_specific = await this.processSpecificRepo.findOne({
        where: {
          process_technical_specific_id,
        },
      });
      if (!process_specific) {
        throw new BadRequestException('Process specific not found');
      }
      // check user
      if (user.user_id !== process_specific.expert_id) {
        throw new BadRequestException('You have no permission');
      }
      //update process Specific
      const update_process_specific = await this.processSpecificRepo.save({
        ...process_specific,
        time_start: data.time_start,
        time_end: data.time_end,
      });
      // update process specific stage

      if (data.stage.length > 0) {
        for (let i = 0; i < data.stage.length; i++) {
          //delete stage
          if (data.stage[i].is_deleted) {
            // delete all content
            await this.processSpecificStageContentRepo.delete({
              process_technical_specific_stage_id:
                data.stage[i].process_technical_specific_stage_id,
            });
            // delete all material
            await this.processSpecificStageMaterialRepo.delete({
              process_technical_specific_stage_id:
                data.stage[i].process_technical_specific_stage_id,
            });
            // delete stage
            await this.processSpecificStageRepo.delete(
              data.stage[i].process_technical_specific_stage_id,
            );
          }
          if (!data.stage[i].process_technical_specific_stage_id) {
            //create new stage
            await this.processSpecificStageRepo.save({
              process_technical_specific_id: process_technical_specific_id,
              stage_title: data.stage[i].stage_title,
              stage_numberic_order: i + 1,
              time_start: data.stage[i].time_start,
              time_end: data.stage[i].time_end,
            });
          } else {
            //update stage
            await this.processSpecificStageRepo.update(
              data.stage[i].process_technical_specific_stage_id,
              {
                stage_title: data.stage[i].stage_title,
                stage_numberic_order: i + 1,
                time_start: data.stage[i].time_start,
                time_end: data.stage[i].time_end,
              },
            );
          }
          if (data.stage[i].content.length > 0) {
            for (let j = 0; j < data.stage[i].content.length; j++) {
              // Check is deleted content
              if (data.stage[i].content[j].is_deleted) {
                await this.processSpecificStageContentRepo.delete(
                  data.stage[i].content[j].process_technical_specific_stage_content_id,
                );
              }
              // Check exist id for update or create new content
              if (!data.stage[i].content[j].process_technical_specific_stage_content_id) {
                //create new content
                await this.processSpecificStageContentRepo.save({
                  process_technical_specific_stage_id:
                    data.stage[i].process_technical_specific_stage_id,
                  title: data.stage[i].content[j].title,
                  content: data.stage[i].content[j].content,
                  content_numberic_order: j + 1,
                  time_start: data.stage[i].content[j].time_start,
                  time_end: data.stage[i].content[j].time_end,
                });
              } else {
                //update content
                await this.processSpecificStageContentRepo.update(
                  data.stage[i].content[j].process_technical_specific_stage_content_id,
                  {
                    title: data.stage[i].content[j].title,
                    content: data.stage[i].content[j].content,
                    content_numberic_order: j + 1,
                    time_start: data.stage[i].content[j].time_start,
                    time_end: data.stage[i].content[j].time_end,
                  },
                );
              }
            }
          }

          // Loop for material
          if (data.stage[i].material) {
            for (const material of data.stage[i].material) {
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
                    data.stage[i].process_technical_specific_stage_id,
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

  //get detail process specific
  async getDetailProcessSpecific(
    process_technical_specific_id: string,
    is_dinary?: boolean,
  ): Promise<any> {
    try {
      const process_specific: ProcessSpecific | any = await this.processSpecificRepo.findOne({
        where: {
          process_technical_specific_id,
        },
        relations: {
          service_specific: {
            land_renter: true,
            plant_season: {
              plant: true,
            },
            service_package: true,
          },
          expert: true,
          process_technical_specific_stage: {
            process_technical_specific_stage_content: {
              dinary_stage: {
                dinaries_link: true,
              },
              requests: true,
            },
            request: true,
            process_technical_specific_stage_material: {
              materialSpecific: true,
            },
          },
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
          created_at: true,
          process_technical_specific_id: true,
          time_start: true,
          time_end: true,
          is_public: true,
          status: true,
          service_specific: {
            service_specific_id: true,
            service_package: {
              service_package_id: true,
              name: true,
              description: true,
            },
            plant_season: {
              type: true,
              month_start: true,
              total_month: true,
              plant: {
                name: true,
              },
            },
          },
          expert: selectUser,
          process_technical_specific_stage: {
            process_technical_specific_stage_id: true,
            stage_title: true,
            stage_numberic_order: true,
            time_start: true,
            time_end: true,
            process_technical_specific_stage_content: {
              process_technical_specific_stage_content_id: true,
              content: is_dinary ? false : true,
              title: true,
              time_start: true,
              time_end: true,
              content_numberic_order: true,
              dinary_stage: {
                dinary_stage_id: true,
                content: true,
                quality_report: true,
                created_at: true,
                dinaries_link: {
                  url_link: true,
                  type: true,
                },
              },
            },
            request: {
              request_id: true,
              status: true,
              type: true,
            },
          },
        },
      });
      // loop to check is get material
      for (const stage of process_specific.process_technical_specific_stage) {
        stage.is_get_material = false;
        // loop to check request material
        for (const request of stage.request) {
          // check is get material
          if (
            request.type === RequestType.material_process_specfic_stage &&
            (request.status === RequestStatus.in_progress ||
              request.status === RequestStatus.completed)
          ) {
            stage.is_get_material = true;
          }
        }
        // check can write diary loop content
        for (const content of stage.process_technical_specific_stage_content) {
          content.can_write_dinary = false;
          // loop to check request material
          for (const request of content.requests) {
            // check is get material
            if (
              request.type === RequestType.cultivate_process_content &&
              request.status === RequestStatus.in_progress
            ) {
              content.can_write_dinary = true;
            }
          }
        }
      }
      return process_specific;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get detail process specific stage
   * @function getDetailProcessSpecificStage
   * @param process_technical_specific_stage_id
   * @returns
   */

  async getDetailProcessSpecificStage(process_technical_specific_stage_id: string): Promise<any> {
    try {
      return await this.processSpecificStageRepo.findOne({
        where: {
          process_technical_specific_stage_id,
        },
        relations: {
          process_technical_specific_stage_material: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Update status process specific
   * @function updateStatusProcessSpecific
   * @param process_technical_specific_id
   * @returns
   */

  async updateStatusProcessSpecificToACtive(process_technical_specific_id: string): Promise<any> {
    try {
      // Check process specific exist
      const process_specific_exist = await this.processSpecificRepo.findOne({
        where: {
          process_technical_specific_id,
        },
        relations: {
          process_technical_specific_stage: {
            process_technical_specific_stage_material: {
              materialSpecific: true,
            },
          },
        },
      });
      if (!process_specific_exist) {
        throw new BadRequestException('Process specific not found');
      }
      // Check all material is enough
      /**
       * Loop for all stage of process specific
       * Loop for all material of stage
       */
      // Loop for all stage of process specific
      for (const stage of process_specific_exist.process_technical_specific_stage) {
        // Loop for all material of stage
        for (const material of stage.process_technical_specific_stage_material) {
          // Check material is enough return error if not enough
          if (material.quantity > material.materialSpecific.total_quantity) {
            // Send notification for manager
            await this.notificationService.createNotification({
              user_id: process_specific_exist.expert_id,
              content: NotificationContentEnum.warning_material_specific_stage(
                material.materialSpecific.name,
                material.quantity,
                material.materialSpecific.name,
                material.quantity - material.materialSpecific.total_quantity,
              ),
              component_id: process_technical_specific_id,
              type: NotificationType.process,
              title: NotificationTitleEnum.warning_material_specific_stage,
            });
            // throw error if material is not enough

            throw new BadRequestException(
              `Vật tư ${material.materialSpecific.name} không đủ số lượng cần thêm ${material.quantity - material.materialSpecific.total_quantity}`,
            );
          }
        }
      }
      // Update quantity of material in stock
      for (const stage of process_specific_exist.process_technical_specific_stage) {
        // Loop for all material of stage
        for (const material of stage.process_technical_specific_stage_material) {
          // Update quantity of material in stock
          await this.materialService.updateQuantityMaterial(
            material.materialSpecific.material_id,
            -material.quantity,
          );
        }
      }
      // Update status to active
      process_specific_exist.status = ProcessSpecificStatus.active;
      const process_specific = await this.processSpecificRepo.update(
        {
          process_technical_specific_id,
        },
        {
          status: ProcessSpecificStatus.active,
        },
      );
      return process_specific;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkAndCreateTaskProcessContentForExpert(): Promise<any> {
    try {
      // get all process specific content
      const check_time = getTimeByPlusDays(new Date(), 1);
      const process_specific_stage_content = await this.processSpecificStageContentRepo.find({
        where: {
          time_start: Between(new Date(), check_time),
          process_technical_specific_stage: {
            process_technical_specific: {
              status: ProcessSpecificStatus.active,
              expert_id: Not(IsNull()),
            },
          },
        },
        relations: {
          process_technical_specific_stage: {
            process_technical_specific: true,
          },
        },
      });
      // create task for expert
      for (const content of process_specific_stage_content) {
        await this.requestService.createRequestCultivateProcessContent(content);
      }
    } catch (error) {
      this.logger.error(`Error when check every five pm  ${error.message}`);
    }
  }

  async CheckNewStageProcessSpecific(): Promise<any> {
    try {
      const time_by_plus_1_day = getTimeByPlusDays(new Date(), 1);
      // get all process specific stage
      const process_technical_specific_stage = await this.processSpecificStageRepo.find({
        where: {
          time_start: Between(new Date(), time_by_plus_1_day),
          process_technical_specific: {
            status: ProcessSpecificStatus.active,
            service_specific: {
              status: ServiceSpecificStatus.used,
            },
          },
        },
        relations: {
          process_technical_specific: {
            service_specific: true,
          },
          process_technical_specific_stage_material: true,
        },
      });
      // Send notification for land renter
      for (const stage of process_technical_specific_stage) {
        await this.notificationService.createNotification({
          user_id: stage.process_technical_specific.service_specific.landrenter_id,
          content: NotificationContentEnum.ready_process_stage(
            stage.stage_title,
            stage.stage_numberic_order,
          ),
          component_id: stage.process_technical_specific.process_technical_specific_id,
          type: NotificationType.process,
          title: NotificationTitleEnum.ready_process_stage,
        });
        // create request material stage for expert
        if (stage.process_technical_specific_stage_material.length > 0) {
          await this.requestService.createRequestMaterialByProcessStage(stage);
        }
      }
    } catch (error) {
      this.logger.error(`Error when check every five pm  ${error.message}`);
    }
  }

  /**
   * Update to public process specific to view dinary
   * @function updateProcessSpecificPublic
   * @param process_specific_id : string
   *
   */

  async updateProcessSpecificPublic(process_specific_id: string, is_public: boolean): Promise<any> {
    try {
      const process_specific = await this.processSpecificRepo.findOne({
        where: {
          process_technical_specific_id: process_specific_id,
        },
      });
      if (!process_specific) {
        throw new BadRequestException('Process specific not found');
      }
      process_specific.is_public = is_public;
      return await this.processSpecificRepo.save(process_specific);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *  Update material specific stage call when expert create report
   * @function updateMaterialSpecificStage
   * @param process_technical_specific_stage_id : string
   */

  async updateMaterialSpecificStage(process_technical_specific_stage_id: string): Promise<void> {
    // get detail of material specific stage
    const process_technical_specific_stage = await this.processSpecificStageRepo.findOne({
      where: {
        process_technical_specific_stage_id,
      },
      relations: {
        process_technical_specific_stage_material: true,
        process_technical_specific: {
          service_specific: true,
        },
      },
    });
    // update store material
    for (const material of process_technical_specific_stage.process_technical_specific_stage_material) {
      // update quantity of material in stock
      await this.materialService.updateQuantityMaterial(material.material_id, material.quantity);
    }
    // Send noti to user
    await this.notificationService.createNotification({
      user_id:
        process_technical_specific_stage.process_technical_specific.service_specific.landrenter_id,
      content: NotificationContentEnum.update_material_specific_stage(
        process_technical_specific_stage.stage_title,
        process_technical_specific_stage.stage_numberic_order,
      ),
      component_id: process_technical_specific_stage.process_technical_specific_stage_id,
      type: NotificationType.process,
      title: NotificationTitleEnum.update_material_specific_stage,
    });
  }

  // async updateProcessStandard()
}
