import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import configuration from 'src/config/configuration';
import { AuthService } from '../auth.service';

interface JwtPayload {
  accountId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration().jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.accountId) {
      throw new UnauthorizedException('Unauthenticated');
    }
    const account = await this.authenticationService.find(payload.accountId);
    if (!account) {
      throw new UnauthorizedException('Unauthenticated');
    }
    return account;
  }
}
