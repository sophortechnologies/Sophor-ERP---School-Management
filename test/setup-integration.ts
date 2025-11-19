import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});