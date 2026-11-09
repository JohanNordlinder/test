package com.example.todo;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

@DataJpaTest
class TodoRepositoryTest {

    @Autowired
    private TodoRepository repository;

    @Test
    void findsAllInInsertionOrderAndCountsOpenTodos() {
        Todo first = repository.save(new Todo("first"));
        Todo second = new Todo("second");
        second.setDone(true);
        repository.save(second);
        repository.save(new Todo("third"));

        assertThat(repository.findAllByOrderByIdAsc())
                .extracting(Todo::getTitle)
                .containsExactly("first", "second", "third");
        assertThat(repository.countByDoneFalse()).isEqualTo(2);
        assertThat(first.getId()).isNotNull();
    }
}
