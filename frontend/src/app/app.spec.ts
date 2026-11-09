import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    http = TestBed.inject(HttpTestingController);
    el = fixture.nativeElement;
    fixture.detectChanges();
    http.expectOne('/api/todos').flush([
      { id: 1, title: 'Buy milk', done: false },
      { id: 2, title: 'Walk dog', done: true },
    ]);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('renders the todos loaded from the API', () => {
    const titles = Array.from(el.querySelectorAll('li .title')).map((e) => e.textContent);
    expect(titles).toEqual(['Buy milk', 'Walk dog']);
    expect(el.querySelector('li.done .title')?.textContent).toBe('Walk dog');
    expect(el.querySelector('.summary')?.textContent).toContain('1 of 2 remaining');
  });

  it('adds a todo via the form', async () => {
    const input = el.querySelector<HTMLInputElement>('form input')!;
    input.value = 'Write tests';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    el.querySelector<HTMLButtonElement>('form button')!.click();
    const req = http.expectOne('/api/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Write tests' });
    req.flush({ id: 3, title: 'Write tests', done: false });
    await fixture.whenStable();

    expect(el.querySelectorAll('li .title').length).toBe(3);
    expect(input.value).toBe('');
    expect(el.querySelector('.summary')?.textContent).toContain('2 of 3 remaining');
  });

  it('disables the add button for blank input', async () => {
    const input = el.querySelector<HTMLInputElement>('form input')!;
    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(el.querySelector<HTMLButtonElement>('form button')!.disabled).toBe(true);
  });

  it('toggles a todo', async () => {
    el.querySelector<HTMLInputElement>('li input[type=checkbox]')!.click();
    const req = http.expectOne('/api/todos/1');
    expect(req.request.body).toEqual({ title: 'Buy milk', done: true });
    req.flush({ id: 1, title: 'Buy milk', done: true });
    await fixture.whenStable();

    expect(el.querySelector('.summary')?.textContent).toContain('0 of 2 remaining');
  });

  it('deletes a todo', async () => {
    el.querySelector<HTMLButtonElement>('li .delete')!.click();
    http.expectOne('/api/todos/1').flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    const titles = Array.from(el.querySelectorAll('li .title')).map((e) => e.textContent);
    expect(titles).toEqual(['Walk dog']);
  });

  it('shows an error when the API fails', async () => {
    el.querySelector<HTMLButtonElement>('li .delete')!.click();
    http.expectOne('/api/todos/1').flush('boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(el.querySelector('[role=alert]')?.textContent).toContain('Could not delete todo');
  });
});
