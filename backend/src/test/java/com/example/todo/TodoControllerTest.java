package com.example.todo;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TodoController.class)
class TodoControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private TodoService service;

    @Test
    void listReturnsAllTodos() throws Exception {
        when(service.findAll()).thenReturn(List.of(new Todo("Buy milk"), new Todo("Walk dog")));

        mvc.perform(get("/api/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title").value("Buy milk"))
                .andExpect(jsonPath("$[1].done").value(false));
    }

    @Test
    void createReturns201() throws Exception {
        when(service.create(any())).thenReturn(new Todo("Write tests"));

        mvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Write tests\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Write tests"));
    }

    @Test
    void createRejectsBlankTitle() throws Exception {
        mvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"   \"}"))
                .andExpect(status().isBadRequest());

        verify(service, never()).create(any());
    }

    @Test
    void updateUnknownTodoReturns404() throws Exception {
        when(service.update(eq(42L), any())).thenThrow(new TodoNotFoundException(42L));

        mvc.perform(put("/api/todos/42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"x\",\"done\":true}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturns204() throws Exception {
        mvc.perform(delete("/api/todos/1")).andExpect(status().isNoContent());
        verify(service).delete(1L);
    }

    @Test
    void deleteUnknownTodoReturns404() throws Exception {
        doThrow(new TodoNotFoundException(7L)).when(service).delete(7L);
        mvc.perform(delete("/api/todos/7")).andExpect(status().isNotFound());
    }
}
