import { Module } from '@nestjs/common';
import { KeycloakAdminService } from './keycloak-admin.service';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService, KeycloakAdminService],
})
export class UsuarioModule {}
