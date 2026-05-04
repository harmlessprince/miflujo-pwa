export const permissions = Object.freeze({
  // Orders
  CAN_READ_ORDER: "can_read_order",
  CAN_UPDATE_ORDER: "can_update_order",
  CAN_CANCEL_ORDER: "can_cancel_order",
  CAN_REFUND_ORDER: "can_refund_order",
  CAN_EXPORT_ORDER: "can_export_order",

  // Products
  CAN_CREATE_PRODUCT: "can_create_product",
  CAN_READ_PRODUCT: "can_read_product",
  CAN_UPDATE_PRODUCT: "can_update_product",
  CAN_DELETE_PRODUCT: "can_delete_product",
  CAN_PUBLISH_PRODUCT: "can_publish_product",
  CAN_UPDATE_PRODUCT_STOCK: "can_update_product_stock",

  // Customers
  CAN_READ_CUSTOMER: "can_read_customer",
  CAN_UPDATE_CUSTOMER: "can_update_customer",
  CAN_EXPORT_CUSTOMER: "can_export_customer",
  CAN_BAN_CUSTOMER: "can_ban_customer",

  // Promotions
  CAN_READ_PROMOTION: "can_read_promotion",
  CAN_CREATE_PROMOTION: "can_create_promotion",
  CAN_UPDATE_PROMOTION: "can_update_promotion",
  CAN_DELETE_PROMOTION: "can_delete_promotion",

  // Reviews
  CAN_READ_REVIEW: "can_read_review",
  CAN_MANAGE_REVIEW: "can_manage_review",

  // Delivery
  CAN_READ_DELIVERY: "can_read_delivery",
  CAN_MANAGE_DELIVERY: "can_manage_delivery",

  // Analytics
  CAN_READ_ANALYTICS: "can_read_analytics",
  CAN_EXPORT_ANALYTICS: "can_export_analytics",

  // Payments
  CAN_READ_PAYMENT: "can_read_payment",
  CAN_MANAGE_PAYMENT: "can_manage_payment",
  CAN_CREATE_PAYMENT_LINK: "can_create_payment_link",
  CAN_MANAGE_PAYMENT_LINK: "can_manage_payment_link",

  // Settings
  CAN_READ_SETTINGS: "can_read_settings",
  CAN_MANAGE_SETTINGS: "can_manage_settings",

  // Notifications
  CAN_READ_NOTIFICATION: "can_read_notification",
  CAN_MANAGE_NOTIFICATION: "can_manage_notification",

  // Team Management
  CAN_READ_TEAM_MEMBER: "can_read_team_member",
  CAN_INVITE_TEAM_MEMBER: "can_invite_team_member",
  CAN_REMOVE_TEAM_MEMBER: "can_remove_team_member",
  CAN_MANAGE_TEAM: "can_manage_team",

  // Roles
  CAN_READ_ROLE: "can_read_role",
  CAN_CREATE_ROLE: "can_create_role",
  CAN_UPDATE_ROLE: "can_update_role",
  CAN_DELETE_ROLE: "can_delete_role",
  CAN_ASSIGN_ROLE: "can_assign_role",

  /**
   * Helper method to get the value via key
   * @param {string} key 
   * @returns {string|undefined}
   */
  get(key) {
    return this[key];
  }
});

// // Usage examples:
// console.log(permissions.CAN_READ_ORDER);    // "can_read_order"
// console.log(permissions.get("CAN_UPDATE_ORDER")); // "can_update_order"