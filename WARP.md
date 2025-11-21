# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Mind Controll is a full-stack collaborative mind mapping application consisting of:
- **Backend**: Spring Boot 3.2.0 REST API with JPA/Hibernate
- **Frontend**: React 18 + TypeScript with Vite
- **Database**: H2 (development) / PostgreSQL (production-ready)

The application manages hierarchical mind maps with nodes, soft links, comments, attachments, and collaboration features.

## Key Commands

### Backend Development

**IMPORTANT**: This project requires Java 21. Lombok compatibility issues exist with Java 25+. Always set JAVA_HOME before Maven commands:

```bash
# Set Java version (macOS)
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Verify Java version
java --version
```

**Build and Test:**
```bash
# Clean build
mvn clean install

# Run tests
mvn test

# Package JAR
mvn clean package
```

**Run Backend:**
```bash
# Development mode (empty database)
mvn spring-boot:run

# With demo data (3 users, 3 mind maps, 35 nodes)
mvn spring-boot:run -Dspring-boot.run.profiles=demo

# Run packaged JAR
java -jar target/mindcontroll-1.0.0.jar
```

**API Testing:**
```bash
# Automated test script (requires backend running)
./test-api.sh
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# TypeScript check
tsc -b
```

### Full Stack

```bash
# Start both backend and frontend with demo data
./start-all.sh

# Stop all services
./stop-all.sh
```

## Architecture

### Backend Structure

The backend follows standard Spring Boot layered architecture:

**Entity Layer** (`entity/`)
- JPA entities with Lombok annotations
- Bidirectional relationships with cascade operations
- UUID primary keys via `@GeneratedValue(strategy = GenerationType.UUID)`
- Embeddable components (e.g., `LayoutConfiguration`, `NodePosition`)
- Audit fields (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`)
- Key entities: `MindMap`, `Node`, `NodeLink`, `Comment`, `Attachment`, `Tag`, `User`, `Participant`

**Repository Layer** (`repository/`)
- Spring Data JPA repositories
- Custom query methods for filtering and search
- Pagination support via `PagingAndSortingRepository`

**Service Layer** (`service/`)
- Business logic and transaction management
- `MindMapService`: Core mind map operations
- `ExampleDataGenerator`: Demo data creation (activated by `@Profile("demo")`)

**Controller Layer** (`controller/`)
- REST endpoints following OpenAPI spec
- `@RestController` with `@RequestMapping("/api/v1")`
- Request validation via `@Valid` and Jakarta Validation
- Returns appropriate HTTP status codes (201 for created, 204 for deleted, etc.)

**Configuration** (`config/`)
- `GlobalExceptionHandler`: Centralized exception handling
- `WebConfig`: CORS and web configuration
- OpenAPI/Swagger integration via SpringDoc

### Frontend Structure

React application using modern patterns:

**API Layer** (`src/api/client.ts`)
- Axios-based client with TypeScript interfaces matching OpenAPI spec
- Base URL configurable via `VITE_API_BASE_URL` environment variable
- Organized API functions: `mindMapApi`, `nodeApi`, `nodeLinkApi`

**Components** (`src/components/`)
- `Layout.tsx`: Shared layout with header navigation

**Pages** (`src/pages/`)
- `Dashboard.tsx`: Mind map list with create/delete
- `MindMapView.tsx`: Individual mind map details and sharing

**State Management**
- TanStack Query (React Query) for server state
- React hooks for local UI state

**Styling**
- Tailwind CSS v4 for utility-first styling
- Responsive design patterns

### Data Model Relationships

```
User
  ├── owns many MindMaps (owner)
  └── participates in many MindMaps (via Participant)

MindMap
  ├── has one owner (User)
  ├── has many Participants
  ├── has embedded LayoutConfiguration
  └── contains many Nodes (via mindmapId field, not JPA relationship)

Node
  ├── belongs to one MindMap (via mindmapId)
  ├── has optional parent Node (via parentId)
  ├── has many ExternalLinks (@OneToMany)
  ├── has many tags (@ElementCollection)
  ├── can have many Comments (via nodeId)
  └── can have many Attachments (via nodeId)

NodeLink (soft links between nodes)
  ├── has source Node
  ├── has target Node
  └── has linkType and optional label
```

**Important Design Notes:**
- Node-to-MindMap relationship uses `mindmapId` field (String), not JPA `@ManyToOne`
- Parent-child node hierarchy uses `parentId` field (String), not JPA relationship
- This design choice optimizes for flexibility in node graph traversal

## Development Guidelines

### When Modifying Entities

1. **Always update DTOs** in `dto/` package to match entity changes
2. **Maintain audit fields**: Set `createdBy`/`updatedBy` in services (not auto-populated currently)
3. **Use Lombok carefully**: `@Data` can cause issues with bidirectional relationships; consider `@Getter`/`@Setter` + `@ToString(exclude=...)` for entities with cycles
4. **Cascade operations**: Understand cascade types before modifying `@OneToMany`/`@ManyToOne` relationships

### Testing Strategy

**Unit Tests:**
- Located in `src/test/java/com/mindcontroll/`
- Use `@SpringBootTest` for integration tests
- Mock external dependencies with `@MockBean`
- Test controller example: `MindMapControllerTest.java`

**API Tests:**
- Shell script `test-api.sh` tests live API endpoints
- Requires backend running with demo data
- Tests CRUD operations, pagination, filtering, error handling

**Running Tests:**
```bash
# Unit tests
mvn test

# API integration tests (start backend first)
./start-all.sh
# In another terminal:
./test-api.sh
```

### Database Configuration

**Development (H2):**
- In-memory database (data lost on restart)
- H2 Console: `http://localhost:8080/api/v1/h2-console`
- JDBC URL: `jdbc:h2:mem:mindcontroll`
- Username: `sa`, Password: (empty)
- Schema auto-created via `spring.jpa.hibernate.ddl-auto=create-drop`

**Production (PostgreSQL):**
Update `src/main/resources/application.yaml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mindcontroll
    username: postgres
    password: yourpassword
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

### API Documentation

**Swagger UI:** `http://localhost:8080/api/v1/swagger-ui.html`

The OpenAPI spec (`openapi.yaml`) is the source of truth for API design. When implementing new endpoints:
1. Ensure controller methods match OpenAPI operation IDs
2. Use DTOs that match OpenAPI schemas
3. Return correct HTTP status codes per spec
4. Test with Swagger UI before integration

### Common Issues and Solutions

**"Unsupported class file major version" error:**
- You're using wrong Java version
- Run: `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`

**Lombok not working:**
- Ensure IDE has Lombok plugin installed
- Verify annotation processing is enabled
- Check Java version (must be 21, not 25+)

**Frontend can't connect to backend:**
- Verify backend is running: `curl http://localhost:8080/api/v1/mindmaps`
- Check CORS configuration in `WebConfig.java`
- Ensure `VITE_API_BASE_URL` is correct if set

**Demo data not appearing:**
- Use `-Dspring-boot.run.profiles=demo` flag when starting backend
- Check logs for `ExampleDataGenerator` output

## URLs and Endpoints

**Frontend:** http://localhost:5173
**Backend API:** http://localhost:8080/api/v1
**Swagger UI:** http://localhost:8080/api/v1/swagger-ui.html
**H2 Console:** http://localhost:8080/api/v1/h2-console

**Key API Endpoints:**
- Mind Maps: `/mindmaps` (GET, POST), `/mindmaps/{id}` (GET, PUT, DELETE)
- Nodes: `/mindmaps/{mindmapId}/nodes` (GET, POST), `/mindmaps/{mindmapId}/nodes/{nodeId}` (GET, PUT, DELETE)
- Links: `/mindmaps/{mindmapId}/links` (GET, POST), `/mindmaps/{mindmapId}/links/{linkId}` (GET, PUT, DELETE)
- Participants: `/mindmaps/{mindmapId}/participants` (POST), `/mindmaps/{mindmapId}/participants/{participantId}` (DELETE)
- Comments: `/mindmaps/{mindmapId}/nodes/{nodeId}/comments`
- Attachments: `/mindmaps/{mindmapId}/nodes/{nodeId}/attachments`
- Search: `/search?query={query}`

## Technology Versions

**Backend:**
- Java: 21 (required)
- Spring Boot: 3.2.0
- Lombok: 1.18.34
- Maven: 3.8+

**Frontend:**
- Node.js: 18+
- React: 19.2.0
- TypeScript: 5.9.3
- Vite: 7.2.4
- React Router: 7.9.6
- TanStack Query: 5.90.10

## File Upload Configuration

**Current Settings:**
- Max file size: 50MB
- Storage location: `./uploads` (configurable in `application.yaml`)
- Supported image formats: jpg, jpeg, png, gif, bmp, tiff, webp
- EXIF metadata extraction: Via `metadata-extractor` library

**To Change Limits:**
Edit `src/main/resources/application.yaml`:
```yaml
spring.servlet.multipart.max-file-size: 100MB
mindcontroll.attachment.max-size: 104857600
```
