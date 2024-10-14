export interface PaginationParams {
  page_size: number;
  page_index: number;
  search: [
    {
      field: string;
      value: string;
    },
  ];
}
