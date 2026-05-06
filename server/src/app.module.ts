import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TrainingModule } from '@/modules/training/training.module';
import { InspectionModule } from '@/modules/inspection/inspection.module';
import { FeedbackModule } from '@/modules/feedback/feedback.module';

@Module({
  imports: [TrainingModule, InspectionModule, FeedbackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
