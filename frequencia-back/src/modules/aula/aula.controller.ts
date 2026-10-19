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
import { AulaService } from './aula.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { ListAulasQueryDto } from './dto/list-aulas-query.dto';
import { RegistrarPresencasDto } from './dto/registrar-presencas.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

/**
 * Aulas e chamada são do professor: somente ADMIN (`@Roles` na classe),
 * validado pelo RolesGuard global.
 */
@ApiTags('Aulas')
@ApiBearerAuth()
@Roles(AccessRole.ADMIN)
@Controller('aulas')
export class AulaController {
  constructor(private readonly aulaService: AulaService) {}

  @Get()
  @ApiOperation({ summary: 'Lista aulas (paginado), opcionalmente de uma turma' })
  findAll(@Query() query: ListAulasQueryDto) {
    return this.aulaService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma aula pelo id' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.aulaService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma aula (ADMIN)' })
  create(@Body() dto: CreateAulaDto) {
    return this.aulaService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza a data de uma aula (ADMIN)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAulaDto) {
    return this.aulaService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove uma aula e suas presenças (ADMIN)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.aulaService.remove(id);
  }

  @Get(':id/presencas')
  @ApiOperation({
    summary: 'Chamada da aula: alunos da turma com presente/falta (ou null se não marcado)',
  })
  findPresencas(@Param('id', ParseUUIDPipe) id: string, @Query() query: PaginationQueryDto) {
    return this.aulaService.findPresencas(id, query);
  }

  @Post(':id/presencas')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registra a chamada da aula: presenças e faltas (ADMIN)',
    description:
      'Idempotente por aluno: se o aluno já foi marcado nesta aula, o valor de `present` é atualizado. Só aceita alunos da turma da aula.',
  })
  @ApiResponse({ status: 201, description: 'Chamada registrada' })
  @ApiResponse({ status: 400, description: 'Corpo inválido' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada' })
  registrarPresencas(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RegistrarPresencasDto) {
    return this.aulaService.registrarPresencas(id, dto);
  }
}
