// src/modules/filters/filters.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class FiltersService {
  applyFilters<T extends Record<string, any>>(data: T[], filters: Partial<T>): T[] {
    return data.filter(item =>
      (Object.entries(filters) as [keyof T, any][]).every(
        ([key, value]) => item[key] === value,
      ),
    );
  }
}

