// import { Controller, Get } from '@nestjs/common';
// import { Counter } from 'prom-client';

// @Controller('metrics')
// export class MetricsController {
//   private requestCount = new Counter({
//     name: 'nestjs_app_requests_total',
//     help: 'Number of requests to the NestJS application',
//   });

//   @Get('request')
//   incrementRequestCount() {
//     this.requestCount.inc();
//     return 'Request count incremented';
//   }
// }
