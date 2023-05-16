import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { VersionModule } from '../version/version.module';
import { AuthModule } from '../auth/auth.module';
import { SessionModule } from '../session/session.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      useFactory: (jwtService, configService) => {
        return {
          sortSchema: true,
          playground: false,
          autoSchemaFile: true,
          autoTransformHttpErrors: true,
          installSubscriptionHandlers: true,
          introspection: true,
          context: ({ req, connection }) => connection ? { req: connection.context } : { req },
          subscriptions: {
            'subscriptions-transport-ws': {
              onConnect: (headers) => {
                if ('Authorization' in headers || 'authorization' in headers) {
                  const secret = configService.get('JWT_SECRET');
                  const token = headers.Authorization || headers.authorization;
                  const user = jwtService.verify(token.replace(/Bearer\s+/gi, ''), { secret });
                  return { user };
                }
              },
            }
          },
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
        };
      },
      imports: [JwtModule, ConfigModule],
      inject: [JwtService, ConfigService],
    }),
    SessionModule,
    VersionModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
