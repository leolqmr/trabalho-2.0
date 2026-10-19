import { Module } from '@nestjs/common';
import { AulaController } from './aula.controller';
import { AulaService } from './aula.service';

@Module({
  controllers: [AulaController],
  providers: [AulaService],
})
export class AulaModule {}
