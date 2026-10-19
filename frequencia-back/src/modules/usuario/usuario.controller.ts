import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessRole } from '@/common/auth/access-role.enum';
import { Roles } from '@/common/auth/decorators/roles.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioService } from './usuario.service';

/** Criar logins é exclusivo do professor (ADMIN). */
@ApiTags('Usuários')
@ApiBearerAuth()
@Roles(AccessRole.ADMIN)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um login de professor ou aluno no Keycloak' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuarioService.create(dto);
  }
}
