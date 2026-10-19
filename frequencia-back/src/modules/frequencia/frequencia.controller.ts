import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessRole } from '@/common/auth/access-role.enum';
import type { CurrentUser } from '@/common/auth/current-user.interface';
import { GetCurrentUser } from '@/common/auth/decorators/current-user.decorator';
import { Roles } from '@/common/auth/decorators/roles.decorator';
import { FrequenciaService } from './frequencia.service';

@ApiTags('Frequência')
@ApiBearerAuth()
@Controller()
export class FrequenciaController {
  constructor(private readonly frequenciaService: FrequenciaService) {}

  @Get('me/frequencia')
  @ApiOperation({
    summary: 'Frequência do usuário logado (aluno): faltas, percentual, nível e datas',
    description:
      'Liga o login ao cadastro de aluno pelo e-mail verificado do token. Qualquer usuário autenticado pode consultar, mas só vê os próprios dados.',
  })
  minha(@GetCurrentUser() user?: CurrentUser) {
    return this.frequenciaService.minhas(user?.email);
  }

  @Get('turmas/:turmaId/alunos/:alunoId/frequencia')
  @Roles(AccessRole.ADMIN)
  @ApiOperation({ summary: 'Frequência detalhada de um aluno da turma (ADMIN)' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado nesta turma' })
  detalhe(
    @Param('turmaId', ParseUUIDPipe) turmaId: string,
    @Param('alunoId', ParseUUIDPipe) alunoId: string,
  ) {
    return this.frequenciaService.detalhe(turmaId, alunoId);
  }
}
