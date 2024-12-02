export const NotificationContentEnum = {
  create_report_land: (land_name: string) =>
    `Yêu cầu tạo báo cáo đất trên ${land_name} vừa được tạo vui lòng kiểm tra`,

  booking_completed: (land_name: string) =>
    `Thanh toán thành công cho yêu cầu thuê đất trên ${land_name}`,

  assigned_task: () => `Bạn vừa được giao nhiệm vụ mới`,

  request_extend: (land_name: string) =>
    `Chúng tôi nhận được một yêu cầu thuê đất mới trên ${land_name}. Vui lòng xác nhận bạn có tiếp tục gia hạn hay không!`,

  pending_sign_extend: (land_name: string) =>
    `Yêu cầu gia hạn thuê đất trên ${land_name} đang chờ ký tên`,

  ready_process_stage: (stage_title: string, stage_numberic_order: number) =>
    `Hãy chuẩn bị cho Giai đoạn ${stage_numberic_order} : ${stage_title}`,

  create_chat: (description: string) =>
    `Cuộc trò chuyện mới đã được tạo với mô tả: ${description} `,

  create_report: (description: string) =>
    `Báo cáo cho công việc mới được tạo với mô tả: ${description}`,

  booking_refund: (land_name: string, price: string) =>
    `Yêu cầu hoàn tiền đã được tạo trên ${land_name} với số tiền ${price} `,

  create_extend: (land_name: string) =>
    `Yêu cầu gia hạn thuê đất trên ${land_name} vừa được tạo v`,

  pending_payment_extend: (land_name: string) =>
    `Yêu cầu gia hạn thuê đất trên ${land_name} đang chờ thanh toán`,

  extend_completed: (land_name: string) =>
    `Thanh toán gia hạn thuê đất trên ${land_name} thành công`,

  reject_extend: (land_name: string) =>
    `Yêu cầu gia hạn thuê đất trên ${land_name} của đã bị từ chối`,

  update_material_specific_stage: (
    stage_title: string,
    stage_numberic_order: number,
  ) => {
    return `Cập nhật vật liệu cho giai đoạn ${stage_numberic_order} : ${stage_title}`;
  },
} as const;
