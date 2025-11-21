# Testing Guide for Mind Controll API

This document describes how to test the Mind Controll REST API using various methods.

## Prerequisites

- Application running on http://localhost:8080/api/v1
- `curl` installed (for shell script tests)
- `jq` installed (optional, for pretty JSON output): `brew install jq`
- Java 21 and Maven (for unit tests)

## Quick Start

### 1. Run with Example Data

Start the application with the `demo` profile to automatically generate 3 example mind maps:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

This will create:
- **Q1 2025 Project Planning** - A project planning mind map with phases, tasks, and dependencies
- **Microservices Architecture Design** - A software architecture mind map showing system components
- **Full-Stack Developer Learning Path** - A learning roadmap with prerequisites and relationships

### 2. Run API Tests

Execute the test script:

```bash
./test-api.sh
```

This will test:
- ✅ Mind map CRUD operations
- ✅ Pagination and sorting
- ✅ Filtering by owner
- ✅ Error handling (404, 400)
- ✅ Delete operations
- ✅ Swagger UI availability

## Testing Methods

### Method 1: Automated Tests (JUnit)

Run the unit and integration tests:

```bash
# Run all tests
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn test

# Run specific test class
mvn test -Dtest=MindMapControllerTest

# Run with verbose output
mvn test -X
```

**Test Coverage:**
- `MindMapControllerTest` - 11 test cases covering all CRUD operations

### Method 2: Shell Script (curl)

Use the provided test script:

```bash
./test-api.sh
```

**What it tests:**
1. API availability check
2. Mind map creation (POST)
3. Mind map retrieval (GET)
4. Mind map update (PUT)
5. Mind map deletion (DELETE)
6. Pagination (GET with params)
7. Sorting (GET with sort param)
8. Filtering (GET with filter param)
9. Error handling (404, 400)
10. Swagger UI accessibility

### Method 3: Interactive Testing (Swagger UI)

1. Start the application
2. Open http://localhost:8080/api/v1/swagger-ui.html
3. Use the interactive UI to:
   - View all endpoints
   - See request/response schemas
   - Execute API calls directly
   - Test different parameter combinations

### Method 4: Manual curl Commands

#### Create a User (via H2 Console)

1. Go to http://localhost:8080/api/v1/h2-console
2. Use JDBC URL: `jdbc:h2:mem:mindcontroll`
3. Execute:

```sql
INSERT INTO users (id, username, display_name, email) 
VALUES ('user-123', 'testuser', 'Test User', 'test@example.com');
```

#### Create a Mind Map

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Mind Map",
    "description": "A test mind map",
    "ownerId": "user-123"
  }'
```

#### Get All Mind Maps

```bash
curl http://localhost:8080/api/v1/mindmaps | jq '.'
```

#### Get Specific Mind Map

```bash
curl http://localhost:8080/api/v1/mindmaps/{mindmapId} | jq '.'
```

#### Update Mind Map

```bash
curl -X PUT http://localhost:8080/api/v1/mindmaps/{mindmapId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'
```

#### Delete Mind Map

```bash
curl -X DELETE http://localhost:8080/api/v1/mindmaps/{mindmapId}
```

#### Pagination

```bash
# Get first page with 5 items
curl "http://localhost:8080/api/v1/mindmaps?page=0&size=5" | jq '.'

# Get second page
curl "http://localhost:8080/api/v1/mindmaps?page=1&size=5" | jq '.'
```

#### Sorting

```bash
# Sort by name ascending
curl "http://localhost:8080/api/v1/mindmaps?sort=name,asc" | jq '.'

# Sort by creation date descending
curl "http://localhost:8080/api/v1/mindmaps?sort=createdAt,desc" | jq '.'
```

#### Filtering

```bash
# Filter by owner
curl "http://localhost:8080/api/v1/mindmaps?owner=user-123" | jq '.'

# Filter by participant
curl "http://localhost:8080/api/v1/mindmaps?participant=user-456" | jq '.'
```

## Example Mind Maps

When running with `demo` profile, the application generates 3 comprehensive example mind maps:

### 1. Project Planning Mind Map

**Structure:**
- Q1 2025 Goals (root)
  - Phase 1: Research
    - Market Analysis
    - Competitor Research
  - Phase 2: Development
    - Feature Development
    - Testing & QA
  - Phase 3: Launch
    - Marketing Campaign

**Features:**
- 9 nodes with hierarchical structure
- Soft links showing dependencies (e.g., "Testing" → "Launch")
- Threaded comments
- Color-coded phases
- Tags: strategic, planning, phase1, research, etc.

### 2. Software Architecture Mind Map

**Structure:**
- Microservices Platform (root)
  - Frontend Layer
    - Web Application
    - Mobile App
  - API Gateway
  - Core Services
    - User Service
    - Order Service
    - Payment Service
  - Data Layer
  - Message Queue

**Features:**
- 11 nodes showing system architecture
- Multiple soft links showing relationships (connects-to, depends-on, publishes-to)
- Technical comments with recommendations
- Radial layout configuration
- Tags: architecture, microservices, frontend, backend, etc.

### 3. Learning Path Mind Map

**Structure:**
- Full-Stack Developer (root)
  - Programming Fundamentals
    - Data Structures
    - Algorithms
  - Frontend Development
    - HTML & CSS
    - JavaScript
    - React.js
  - Backend Development
    - Node.js & Express
    - Databases
    - API Design
  - DevOps & Tools
    - Version Control (Git)
    - Containerization

**Features:**
- 15 nodes with learning progression
- Prerequisite links (e.g., "JavaScript" → "React")
- External links to resources
- Rich markdown descriptions
- Learning tips as comments
- XY_HYBRID layout
- Tags: learning, career, frontend, backend, etc.

## Querying Example Data

### Get all mind maps

```bash
curl "http://localhost:8080/api/v1/mindmaps" | jq '.content[] | {id, name, owner: .owner.username}'
```

### Get mind maps by specific owner

```bash
# Get Alice's mind maps
curl "http://localhost:8080/api/v1/mindmaps?owner=<alice-user-id>" | jq '.'
```

### View nodes in a mind map

Currently requires accessing the database directly or implementing the Node controller.

```sql
-- In H2 Console
SELECT id, title, parent_id, color 
FROM nodes 
WHERE mindmap_id = 'your-mindmap-id'
ORDER BY created_at;
```

### View links between nodes

```sql
-- In H2 Console
SELECT 
    nl.id,
    nl.link_type,
    nl.label,
    ns.title as source,
    nt.title as target
FROM node_links nl
JOIN nodes ns ON nl.source_node_id = ns.id
JOIN nodes nt ON nl.target_node_id = nt.id
WHERE nl.mindmap_id = 'your-mindmap-id';
```

## Expected Test Results

### Successful Operations

- **POST /mindmaps** → 201 Created
- **GET /mindmaps/{id}** → 200 OK
- **PUT /mindmaps/{id}** → 200 OK
- **DELETE /mindmaps/{id}** → 204 No Content
- **GET /mindmaps** → 200 OK (with pagination)

### Error Cases

- **GET /mindmaps/invalid-id** → 404 Not Found
- **POST /mindmaps** (missing required fields) → 400 Bad Request
- **GET /mindmaps/deleted-id** → 404 Not Found

## Troubleshooting

### Issue: Tests fail with connection refused

**Solution:**
```bash
# Make sure the application is running
./run.sh
# In another terminal, run tests
./test-api.sh
```

### Issue: "jq: command not found"

**Solution:**
```bash
# Install jq for pretty JSON output
brew install jq

# Or run without jq (output will be unformatted)
curl http://localhost:8080/api/v1/mindmaps
```

### Issue: User ID not found

**Solution:**
```bash
# Run with demo profile to auto-generate users
mvn spring-boot:run -Dspring-boot.run.profiles=demo

# Or create a user manually via H2 Console
# Visit http://localhost:8080/api/v1/h2-console
```

### Issue: Java version error

**Solution:**
```bash
# Ensure Java 21 is active
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
java --version  # Should show Java 21
```

## Next Steps

1. Implement remaining controllers (Node, Link, Comment, Attachment, Tag)
2. Add more comprehensive test coverage
3. Create Postman collection for API testing
4. Add performance tests
5. Add security tests (once authentication is implemented)
6. Create end-to-end tests for complete workflows

## Resources

- **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html
- **H2 Console**: http://localhost:8080/api/v1/h2-console
- **API Base**: http://localhost:8080/api/v1
- **OpenAPI Spec**: `openapi.yaml` in project root
