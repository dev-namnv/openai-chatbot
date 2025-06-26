import { SetMetadata } from '@nestjs/common';
import { AccountRole } from 'src/interfaces/account.interface';

export const Roles = (...roles: AccountRole[]): any =>
  SetMetadata('roles', roles);
