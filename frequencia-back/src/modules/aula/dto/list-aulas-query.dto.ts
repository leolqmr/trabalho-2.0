import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema } from '@/common/pagination/pagination-query.dto';

export const ListAulasQuerySchema = PaginationQuerySchema.extend({
  turma_id: z.string().uuid().optional().describe('Filtra as aulas de uma turma'),
});

export class ListAulasQueryDto extends createZodDto(ListAulasQuerySchema) {
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}
