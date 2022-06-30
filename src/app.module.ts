import { Module } from '@nestjs/common';
import { ArticleController } from './article/article.controller';
import { ArticleModule } from './article/article.module';
import { GameModule } from './game/game.module';
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public_html')
    }),
    ArticleModule, 
    GameModule
  ]
})
export class AppModule {}
