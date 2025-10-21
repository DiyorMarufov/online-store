import { Module } from "@nestjs/common";
import { MeiliInitService } from "./meili.service";

@Module({
  providers: [MeiliInitService],
})
export class InfrastructureModule {}
