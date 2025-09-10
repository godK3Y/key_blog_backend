import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigService, ConfigModule } from '@nestjs/config';

// AuthModule wires up auth services, controllers, and strategies
@Module({
  imports: [
    // Provide user data access for registration/validation
    UserModule,
    // Register Passport for strategies
    PassportModule,
    // Configure JWT with secret and expiration from env
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), // Use ConfigService to get the secret
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
  ],
  // Make strategies and AuthService available
  providers: [AuthService, JwtStrategy, LocalStrategy],
  // Expose the controller with auth endpoints
  controllers: [AuthController],
})
export class AuthModule {}
