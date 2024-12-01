export const selectUser = {
  user_id: true,
  full_name: true,
  email: true,
  phone: true,
  avatar_url: true,
};

export const selectDinary = {
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
    land_renter: selectUser,
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
      title: true,
      time_start: true,
      time_end: true,
      dinary_stage: {
        dinaries_link: true,
      },
    },
  },
};
