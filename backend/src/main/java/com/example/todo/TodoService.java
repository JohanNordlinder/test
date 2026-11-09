package com.example.todo;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TodoService {

    private final TodoRepository repository;

    public TodoService(TodoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Todo> findAll() {
        return repository.findAllByOrderByIdAsc();
    }

    public Todo create(TodoRequest request) {
        Todo todo = new Todo(request.title().trim());
        todo.setDone(Boolean.TRUE.equals(request.done()));
        return repository.save(todo);
    }

    public Todo update(Long id, TodoRequest request) {
        Todo todo = repository.findById(id).orElseThrow(() -> new TodoNotFoundException(id));
        todo.setTitle(request.title().trim());
        if (request.done() != null) {
            todo.setDone(request.done());
        }
        return todo;
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new TodoNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
