package com.mindcontroll.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindcontroll.dto.MindMapDTO;
import com.mindcontroll.entity.User;
import com.mindcontroll.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MindMapControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create a test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setDisplayName("Test User");
        testUser.setEmail("test@example.com");
        testUser = userRepository.save(testUser);
    }

    @Test
    void shouldCreateMindMap() throws Exception {
        MindMapDTO.CreateRequest request = new MindMapDTO.CreateRequest();
        request.setName("Test Mind Map");
        request.setDescription("A test mind map");
        request.setOwnerId(testUser.getId());

        mockMvc.perform(post("/mindmaps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Test Mind Map"))
                .andExpect(jsonPath("$.description").value("A test mind map"))
                .andExpect(jsonPath("$.owner.id").value(testUser.getId()))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    void shouldGetAllMindMaps() throws Exception {
        // Create a mind map first
        MindMapDTO.CreateRequest request = new MindMapDTO.CreateRequest();
        request.setName("Test Mind Map");
        request.setOwnerId(testUser.getId());

        String response = mockMvc.perform(post("/mindmaps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();

        // Get all mind maps
        mockMvc.perform(get("/mindmaps"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.page").exists())
                .andExpect(jsonPath("$.size").exists())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    void shouldGetMindMapById() throws Exception {
        // Create a mind map
        MindMapDTO.CreateRequest request = new MindMapDTO.CreateRequest();
        request.setName("Test Mind Map");
        request.setOwnerId(testUser.getId());

        String createResponse = mockMvc.perform(post("/mindmaps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();

        String mindMapId = objectMapper.readTree(createResponse).get("id").asText();

        // Get the mind map by ID
        mockMvc.perform(get("/mindmaps/" + mindMapId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(mindMapId))
                .andExpect(jsonPath("$.name").value("Test Mind Map"));
    }

    @Test
    void shouldUpdateMindMap() throws Exception {
        // Create a mind map
        MindMapDTO.CreateRequest createRequest = new MindMapDTO.CreateRequest();
        createRequest.setName("Original Name");
        createRequest.setOwnerId(testUser.getId());

        String createResponse = mockMvc.perform(post("/mindmaps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        String mindMapId = objectMapper.readTree(createResponse).get("id").asText();

        // Update the mind map
        MindMapDTO.UpdateRequest updateRequest = new MindMapDTO.UpdateRequest();
        updateRequest.setName("Updated Name");
        updateRequest.setDescription("Updated description");

        mockMvc.perform(put("/mindmaps/" + mindMapId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(mindMapId))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.description").value("Updated description"));
    }

    @Test
    void shouldDeleteMindMap() throws Exception {
        // Create a mind map
        MindMapDTO.CreateRequest request = new MindMapDTO.CreateRequest();
        request.setName("To Delete");
        request.setOwnerId(testUser.getId());

        String createResponse = mockMvc.perform(post("/mindmaps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();

        String mindMapId = objectMapper.readTree(createResponse).get("id").asText();

        // Delete the mind map
        mockMvc.perform(delete("/mindmaps/" + mindMapId))
                .andExpect(status().isNoContent());

        // Verify it's deleted
        mockMvc.perform(get("/mindmaps/" + mindMapId))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldFilterMindMapsByOwner() throws Exception {
        // Create a mind map
        MindMapDTO.CreateRequest request = new MindMapDTO.CreateRequest();
        request.setName("Owner Test");
        request.setOwnerId(testUser.getId());

        mockMvc.perform(post("/mindmaps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Filter by owner
        mockMvc.perform(get("/mindmaps")
                .param("owner", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].owner.id").value(testUser.getId()));
    }

    @Test
    void shouldValidateRequiredFields() throws Exception {
        MindMapDTO.CreateRequest request = new MindMapDTO.CreateRequest();
        // Missing required fields

        mockMvc.perform(post("/mindmaps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnNotFoundForNonexistentMindMap() throws Exception {
        mockMvc.perform(get("/mindmaps/nonexistent-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldSupportPagination() throws Exception {
        // Create multiple mind maps
        for (int i = 0; i < 5; i++) {
            MindMapDTO.CreateRequest request = new MindMapDTO.CreateRequest();
            request.setName("Mind Map " + i);
            request.setOwnerId(testUser.getId());

            mockMvc.perform(post("/mindmaps")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)));
        }

        // Test pagination
        mockMvc.perform(get("/mindmaps")
                .param("page", "0")
                .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.totalElements").value(greaterThanOrEqualTo(5)));
    }

    @Test
    void shouldSupportSorting() throws Exception {
        // Create mind maps with different names
        String[] names = {"Zebra", "Apple", "Mango"};
        for (String name : names) {
            MindMapDTO.CreateRequest request = new MindMapDTO.CreateRequest();
            request.setName(name);
            request.setOwnerId(testUser.getId());

            mockMvc.perform(post("/mindmaps")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)));
        }

        // Test sorting by name ascending
        mockMvc.perform(get("/mindmaps")
                .param("sort", "name,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Apple"));
    }
}
