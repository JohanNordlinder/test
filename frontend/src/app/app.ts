import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TodoService } from './todo.service';
import { Todo } from './todo';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly todoService = inject(TodoService);

  protected readonly todos = signal<Todo[]>([]);
  protected readonly newTitle = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly remaining = computed(() => this.todos().filter((t) => !t.done).length);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.todoService.list().subscribe({
      next: (todos) => this.todos.set(todos),
      error: () => this.error.set('Could not load todos'),
    });
  }

  add(): void {
    const title = this.newTitle().trim();
    if (!title) {
      return;
    }
    this.todoService.create(title).subscribe({
      next: (todo) => {
        this.todos.update((list) => [...list, todo]);
        this.newTitle.set('');
        this.error.set(null);
      },
      error: () => this.error.set('Could not add todo'),
    });
  }

  toggle(todo: Todo): void {
    this.todoService.update({ ...todo, done: !todo.done }).subscribe({
      next: (updated) => this.todos.update((list) => list.map((t) => (t.id === updated.id ? updated : t))),
      error: () => this.error.set('Could not update todo'),
    });
  }

  remove(todo: Todo): void {
    this.todoService.remove(todo.id).subscribe({
      next: () => this.todos.update((list) => list.filter((t) => t.id !== todo.id)),
      error: () => this.error.set('Could not delete todo'),
    });
  }
}
