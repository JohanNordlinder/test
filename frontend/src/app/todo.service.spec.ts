import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TodoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists todos', () => {
    let result: unknown;
    service.list().subscribe((todos) => (result = todos));

    const req = http.expectOne('/api/todos');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, title: 'a', done: false }]);

    expect(result).toEqual([{ id: 1, title: 'a', done: false }]);
  });

  it('creates a todo', () => {
    service.create('new').subscribe();

    const req = http.expectOne('/api/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'new' });
    req.flush({ id: 2, title: 'new', done: false });
  });

  it('updates a todo', () => {
    service.update({ id: 3, title: 't', done: true }).subscribe();

    const req = http.expectOne('/api/todos/3');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 't', done: true });
    req.flush({ id: 3, title: 't', done: true });
  });

  it('deletes a todo', () => {
    service.remove(4).subscribe();

    const req = http.expectOne('/api/todos/4');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
