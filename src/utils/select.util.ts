export const selectUser = {
  user_id: true,
  full_name: true,
  email: true,
  phone: true,
  avatar_url: true,
};

export const selectDinary = {
  dinary_stage_id: true,
  content: true,
  quality_report: true,
  dinaries_link: true,
  created_at: true,
  updated_at: true,
  process_technical_specific_stage_content: {
    process_technical_specific_stage_content_id: true,
    title: true,
    content_numberic_order: true,
  },
};
