import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessRole } from '@/common/auth/access-role.enum';
import type { CurrentUser } from '@/common/auth/current-user.interface';
import { GetCurrentUser } from '@/common/auth/decorators/current-user.decorator';
import { Roles } from '@/common/auth/decorators/roles.decorator';
import { ChamadaCodigoService } from './chamada-codigo.service';
import { AbrirChamadaCodigoDto } from './dto/abrir-chamada-codigo.dto';
import { RegistrarCodigoDto } from './dto/registrar-codigo.dto';

@ApiTags('Chamada por código — professor')
@ApiBearerAuth()
@Roles(AccessRole.ADMIN)
@Controller('aulas/:aulaId/chamada-codigo')
export class ChamadaCodigoProfessorController {
  constructor(private readonly service: ChamadaCodigoService) {}

  @Get()
  @ApiOperation({ summary: 'Estado da chamada por código, sem revelar a chave' })
  status(@Param('aulaId', ParseUUIDPipe) aulaId: string) {
    return this.service.status(aulaId);
  }

  @Post()
  @ApiOperation({ summary: 'Abre/reabre janela com nova chave temporária' })
  abrir(@Param('aulaId', ParseUUIDPipe) aulaId: string, @Body() dto: AbrirChamadaCodigoDto) {
    return this.service.abrir(aulaId, dto);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Encerra antecipadamente a janela de chamada' })
  encerrar(@Param('aulaId', ParseUUIDPipe) aulaId: string) {
    return this.service.encerrar(aulaId);
  }
}

@ApiTags('Chamada por código — aluno')
@ApiBearerAuth()
@Controller('me/chamadas-codigo')
export class ChamadaCodigoAlunoController {
  constructor(private readonly service: ChamadaCodigoService) {}

  @Get()
  @ApiOperation({ summary: 'Lista janelas abertas para as turmas do aluno autenticado' })
  listar(@GetCurrentUser() user?: CurrentUser) {
    return this.service.listarAtivas(user?.email);
  }

  @Post(':id/registrar')
  @ApiOperation({ summary: 'Registra a presença do usuário autenticado mediante código válido' })
  registrar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegistrarCodigoDto,
    @GetCurrentUser() user?: CurrentUser,
  ) {
    return this.service.registrar(id, user?.email, dto.codigo);
  }
}
