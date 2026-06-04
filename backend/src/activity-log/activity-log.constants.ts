export const ActivityEntityType = {
  CUSTOMER: 'customer',
  NOTE: 'note',
} as const;

export const ActivityAction = {
  CUSTOMER_CREATED: 'customer_created',
  CUSTOMER_UPDATED: 'customer_updated',
  CUSTOMER_DELETED: 'customer_deleted',
  CUSTOMER_RESTORED: 'customer_restored',
  CUSTOMER_ASSIGNED: 'customer_assigned',
  NOTE_ADDED: 'note_added',
} as const;
