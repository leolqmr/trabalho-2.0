import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessRole } from '@/common/auth/access-role.enum';
import type { CurrentUser } from '@/common/auth/current-user.interface';
import { GetCurrentUser } from '@/common/auth/decorators/current-user.decorator';
import { Roles } from '@/common/auth/decorators/roles.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ResetSenhaDto } from './dto/reset-senha.dto';
import { UsuarioService } from './usuario.service';

/** Criar logins é exclusivo do professor (ADMIN). */
@ApiTags('Usuários')
@ApiBearerAuth()
@Roles(AccessRole.ADMIN)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os logins cadastrados no Keycloak' })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria um login de professor ou aluno no Keycloak' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuarioService.create(dto);
  }

  @Put(':id/senha')
  @HttpCode(204)
  @ApiOperation({ summary: 'Define uma nova senha para o login (a atual não pode ser lida)' })
  resetPassword(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResetSenhaDto) {
    return this.usuarioService.resetPassword(id, dto.password);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Apaga o login (não apaga o aluno da turma nem as presenças)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetCurrentUser() user?: CurrentUser) {
    return this.usuarioService.remove(id, user?.userId);
  }
}
