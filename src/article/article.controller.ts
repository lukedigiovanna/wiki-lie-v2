import { Controller, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ArticleService } from './article.service';

@Controller('api/article')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}
}
