import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { map, Observable } from 'rxjs';

@Injectable()
export class ArticleService {
    constructor(private readonly httpService: HttpService) {}

    getArticle(articleName: string): Observable<AxiosResponse<any>> {
        return this.httpService.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${articleName}&format=json`)
            .pipe(
                map(response => response.data)
            );
    }
}
