import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccountRole } from 'src/interfaces/account.interface';
import { JwtAuthGuard } from 'src/modules/guards/jwtAuth.guard';
import { RolesGuard } from 'src/modules/guards/role.guard';
import { Roles } from './roles.decorator';

export const Auth = (...roles: AccountRole[]) =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
