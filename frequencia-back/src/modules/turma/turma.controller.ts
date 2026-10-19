import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessRole } from '@/common/auth/access-role.enum';
import { Roles } from '@/common/auth/decorators/roles.decorator';
import { PaginationQueryDto } from '@/common/pagination/pagination-query.dto';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { TurmaService } from './turma.service';

/**
 * Segurança: o AuthGuard global exige um JWT válido do Keycloak em todas as
 * rotas (exceto as marcadas com @Public). Leitura: qualquer usuário autenticado.
 * Escrita: `@Roles(AccessRole.ADMIN)`.
 */
@ApiTags('Turmas')
@ApiBearerAuth()
@Controller('turmas')
export class TurmaController {
  constructor(private readonly turmaService: TurmaService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as turmas (paginado)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.turmaService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma turma pelo id' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.turmaService.findOne(id);
  }

  @Get(':id/alunos')
  @ApiOperation({ summary: 'Lista os alunos de uma turma, com resumo de presenças' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  findAlunos(@Param('id', ParseUUIDPipe) id: string, @Query() query: PaginationQueryDto) {
    return this.turmaService.findAlunos(id, query);
  }

  @Post()
  @Roles(AccessRole.ADMIN)
  @ApiOperation({ summary: 'Cria uma turma (ADMIN)' })
  create(@Body() dto: CreateTurmaDto) {
    return this.turmaService.create(dto);
  }

  @Patch(':id')
  @Roles(AccessRole.ADMIN)
  @ApiOperation({ summary: 'Atualiza uma turma (ADMIN)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTurmaDto) {
    return this.turmaService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AccessRole.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove uma turma e suas aulas/presenças (ADMIN)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.turmaService.remove(id);
  }
}
