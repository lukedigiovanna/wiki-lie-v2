import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { map, Observable } from 'rxjs';

@Injectable()
export class ArticleService {
    constructor(private readonly httpService: HttpService) {}

    getRandomArticleName(): string {
        const randomArticles = [
                'JavaScript',
                'TypeScript',
                'Angular',
                'NestJS',
                'Node.js',
                'MongoDB',
                'Mongoose',
                'Redis',
                'Binary code',
                'Computer science',
                'Computer graphics',
                'Artificial intelligence',
                'Machine learning',
                'Data science',
                'Data structure',
                'Algorithm',
                'C (programming language)',
                'C++',
                'C#',
        ]
        return randomArticles[Math.floor(Math.random() * randomArticles.length)];
    }
}
