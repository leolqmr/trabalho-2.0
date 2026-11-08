import { Module } from '@nestjs/common';
import { ChamadaCodigoAlunoController, ChamadaCodigoProfessorController } from './chamada-codigo.controller';
import { ChamadaCodigoService } from './chamada-codigo.service';

@Module({
  controllers: [ChamadaCodigoProfessorController, ChamadaCodigoAlunoController],
  providers: [ChamadaCodigoService],
})
export class ChamadaCodigoModule {}
