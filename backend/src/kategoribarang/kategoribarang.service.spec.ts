import { Test, TestingModule } from '@nestjs/testing';
import { KategoribarangService } from './kategoribarang.service';

describe('KategoribarangService', () => {
  let service: KategoribarangService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KategoribarangService],
    }).compile();

    service = module.get<KategoribarangService>(KategoribarangService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
