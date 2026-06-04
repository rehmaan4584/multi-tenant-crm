import { IsUUID } from 'class-validator';

export class AssignCustomerDto {
  @IsUUID()
  assignedToId: string;
}
