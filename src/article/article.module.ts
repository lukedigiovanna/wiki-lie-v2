import { HttpModule } from '@nestjs/axios';
import { Get, Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [HttpModule],
  controllers: [ArticleController],
  providers: [ArticleService]
})
export class ArticleModule {}
