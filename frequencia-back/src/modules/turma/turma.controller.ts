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
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { TurmaService } from './turma.service';

/**
 * Segurança: o AuthGuard global exige um JWT válido do Keycloak em todas as
 * rotas (exceto as marcadas com @Public). Gestão de turmas e alunos é do
 * professor: `@Roles(AccessRole.ADMIN)` na classe. O aluno só enxerga os
 * próprios dados, em `GET /me/frequencia`.
 */
@ApiTags('Turmas')
@ApiBearerAuth()
@Roles(AccessRole.ADMIN)
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
  @ApiOperation({ summary: 'Lista os alunos matriculados na turma (paginado)' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  findAlunos(@Param('id', ParseUUIDPipe) id: string, @Query() query: PaginationQueryDto) {
    return this.turmaService.findAlunos(id, query);
  }

  @Post(':id/alunos')
  @ApiOperation({ summary: 'Cadastra um aluno na turma (ADMIN)' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado nesta turma' })
  createAluno(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateAlunoDto) {
    return this.turmaService.createAluno(id, dto);
  }

  @Patch(':id/alunos/:alunoId')
  @ApiOperation({ summary: 'Atualiza nome/e-mail de um aluno da turma (ADMIN)' })
  updateAluno(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('alunoId', ParseUUIDPipe) alunoId: string,
    @Body() dto: UpdateAlunoDto,
  ) {
    return this.turmaService.updateAluno(id, alunoId, dto);
  }

  @Delete(':id/alunos/:alunoId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um aluno da turma e suas presenças (ADMIN)' })
  removeAluno(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('alunoId', ParseUUIDPipe) alunoId: string,
  ) {
    return this.turmaService.removeAluno(id, alunoId);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma turma (ADMIN)' })
  create(@Body() dto: CreateTurmaDto) {
    return this.turmaService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma turma (ADMIN)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTurmaDto) {
    return this.turmaService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove uma turma e suas aulas/presenças (ADMIN)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.turmaService.remove(id);
  }
}
