import { Test, TestingModule } from '@nestjs/testing';
import { KategoribarangController } from './kategoribarang.controller';

describe('KategoribarangController', () => {
  let controller: KategoribarangController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KategoribarangController],
    }).compile();

    controller = module.get<KategoribarangController>(KategoribarangController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
