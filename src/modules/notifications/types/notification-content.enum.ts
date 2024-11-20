export const NotificationContentEnum = {
  create_report_land: (land_name: string) =>
    `Yêu cầu tạo báo cáo đất trên ${land_name} vừa được tạo vui lòng kiểm tra`,

  booking_completed: (land_name: string) =>
    `Thanh toán thành công cho yêu cầu thuê đất trên ${land_name}`,

  assigned_task: () => `Bạn vừa được giao nhiệm vụ mới`,
} as const;
