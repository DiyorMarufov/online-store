import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { initMeiliIndex } from './meili.init';

@Injectable()
export class MeiliInitService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await initMeiliIndex();
  }
}
