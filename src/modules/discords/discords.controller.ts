import { Controller } from '@nestjs/common';
import { DiscordsService } from './discords.service';

@Controller('discords')
export class DiscordsController {
  constructor(private readonly discordsService: DiscordsService) {}
}
