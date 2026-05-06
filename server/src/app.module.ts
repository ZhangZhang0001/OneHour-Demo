import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TrainingModule } from '@/modules/training/training.module';
import { InspectionModule } from '@/modules/inspection/inspection.module';

@Module({
  imports: [TrainingModule, InspectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
