import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Action } from '../action';

@Injectable()
class MyService {
    @Action()
    fetchItems() {
        return of(['item 1', 'item 2']);
    }
}

describe('forward-compatibility-action', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MyService]
        });
    });

    it("should call service's action without extends store", () => {
        const myService = TestBed.inject(MyService);
        let result: string[];
        myService.fetchItems().subscribe((data) => {
            result = data;
        });
        expect(result).toEqual(['item 1', 'item 2']);
    });
});
