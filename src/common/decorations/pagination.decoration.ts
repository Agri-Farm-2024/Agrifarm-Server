import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { PaginationParams } from './types/pagination.type';

export const Pagination = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const query = request.query;
  const pagination: PaginationParams = {
    page_size: 10,
    page_index: 1,
    search: [
      {
        field: '',
        value: '',
      },
    ],
  };

  if (query.page_size) {
    pagination.page_size = parseInt(query.page_size);
  }

  if (query.page_index) {
    pagination.page_index = parseInt(query.page_index);
  }
  if (query.search) {
    const searchArray = query.search.toString().split(',');
    pagination.search = searchArray.map((searchItem) => {
      const field = searchItem.split(':')[0];
      const value = searchItem.split(':')[1];
      return {
        field,
        value,
      };
    });
  }
  return pagination;
});

export function ApplyPaginationMetadata(target: any, key: string, descriptor: PropertyDescriptor) {
  ApiQuery({
    name: 'page_size',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })(target, key, descriptor);

  ApiQuery({
    name: 'page_index',
    required: false,
    type: Number,
    description: 'Page index to fetch',
    example: 1,
  })(target, key, descriptor);

  ApiQuery({
    name: 'search',
    required: false,
    type: String,
    isArray: true,
    description: 'Search query',
  })(target, key, descriptor);
}
