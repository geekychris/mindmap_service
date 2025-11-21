# Mind Controll

A full-stack collaborative mind mapping application with a Spring Boot REST API backend and a React TypeScript frontend.

## Features

- **Mind Map Management**: Create, update, delete, and organize mind maps
- **Hierarchical Nodes**: Tree-structured nodes with parent-child relationships
- **Soft Links**: Named relationships between nodes (e.g., "relates-to", "depends-on")
- **Rich Content**: HTML/Markdown support for node descriptions
- **Comments**: Threaded comments on nodes with author tracking
- **Attachments**: File uploads with EXIF metadata extraction for images
- **Tags**: Free-form and standard tags per mind map
- **Flexible Layouts**: AUTO, XY_FIXED, XY_HYBRID, RADIAL, and TREE layouts
- **Collaboration**: Multi-user support with participants and permissions
- **Search**: Full-text search across mind maps and nodes
- **Import/Export**: JSON/XML export with optional attachment packaging

## Technology Stack

### Backend
- **Java 21**
- **Spring Boot 3.2.0**
- **Spring Data JPA**
- **H2 Database** (development) / **PostgreSQL** (production)
- **Lombok**
- **Jakarta Validation**
- **SpringDoc OpenAPI** (Swagger UI)
- **Maven**

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **TanStack Query** for server state
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Flow** for mind map visualization

## Prerequisites

### Backend
- **Java 21** (Required - tested with OpenJDK 21.0.6)
- Maven 3.8+

**Important**: This application requires Java 21. Lombok may not work properly with Java 25 or newer versions.

### Frontend
- **Node.js 18+** and npm

## Quick Start

### Option 1: Backend Only

To run just the backend API:

#### 1. Set Java 21 as Active Version

If you have multiple Java versions installed:

```bash
# On macOS
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Verify
java --version
```

#### 2. Build the Project

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn clean install
```

#### 3. Run the Application

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api/v1`

#### 4. Run with Example Data (Optional)

Start with demo profile to auto-generate 3 example mind maps:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

This creates:
- **Q1 2025 Project Planning** (9 nodes, 2 soft links, comments)
- **Microservices Architecture Design** (11 nodes, 5 soft links)
- **Full-Stack Developer Learning Path** (15 nodes, 5 soft links)

### Option 2: Full Stack (Backend + Frontend)

To run both the backend API and the React frontend:

#### Easy Start (Recommended)

Use the convenient start script:

```bash
./start-all.sh
```

This will:
- Start the backend with demo data on port 8080
- Start the frontend on port 5173
- Display all service URLs
- Show logs in the console

To stop all services:

```bash
./stop-all.sh
```

#### Manual Start

If you prefer to run services manually:

```bash
# Terminal 1: Start backend with demo data
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run -Dspring-boot.run.profiles=demo

# Terminal 2: Start React dev server
cd frontend
npm install  # First time only
npm run dev
```

The frontend will be available at `http://localhost:5173`

See the [frontend README](frontend/README.md) for more details.

## Accessing the Application

### Frontend UI

```
http://localhost:5173
```

The React UI provides:
- Dashboard with all mind maps
- Create/delete mind maps
- View mind map details
- Share with other users
- Responsive design

### Swagger UI (API Documentation)

Open your browser and navigate to:
```
http://localhost:8080/api/v1/swagger-ui.html
```

### H2 Console (Development Database)

```
URL: http://localhost:8080/api/v1/h2-console
JDBC URL: jdbc:h2:mem:mindcontroll
Username: sa
Password: (leave blank)
```

## API Endpoints

### Mind Maps

- `GET /mindmaps` - List all mind maps (paginated)
- `POST /mindmaps` - Create a new mind map
- `GET /mindmaps/{mindmapId}` - Get a specific mind map
- `PUT /mindmaps/{mindmapId}` - Update a mind map
- `DELETE /mindmaps/{mindmapId}` - Delete a mind map

### Nodes

- `GET /mindmaps/{mindmapId}/nodes` - List nodes in a mind map
- `POST /mindmaps/{mindmapId}/nodes` - Create a new node
- `GET /mindmaps/{mindmapId}/nodes/{nodeId}` - Get a specific node
- `PUT /mindmaps/{mindmapId}/nodes/{nodeId}` - Update a node
- `DELETE /mindmaps/{mindmapId}/nodes/{nodeId}` - Delete a node

### Links

- `GET /mindmaps/{mindmapId}/links` - List all links
- `POST /mindmaps/{mindmapId}/links` - Create a link between nodes
- `GET /mindmaps/{mindmapId}/links/{linkId}` - Get a specific link
- `PUT /mindmaps/{mindmapId}/links/{linkId}` - Update a link
- `DELETE /mindmaps/{mindmapId}/links/{linkId}` - Delete a link

### Comments

- `GET /mindmaps/{mindmapId}/nodes/{nodeId}/comments` - List comments
- `POST /mindmaps/{mindmapId}/nodes/{nodeId}/comments` - Add a comment
- `GET /mindmaps/{mindmapId}/nodes/{nodeId}/comments/{commentId}` - Get a comment
- `PUT /mindmaps/{mindmapId}/nodes/{nodeId}/comments/{commentId}` - Update a comment
- `DELETE /mindmaps/{mindmapId}/nodes/{nodeId}/comments/{commentId}` - Delete a comment

### Attachments

- `GET /mindmaps/{mindmapId}/nodes/{nodeId}/attachments` - List attachments
- `POST /mindmaps/{mindmapId}/nodes/{nodeId}/attachments` - Upload an attachment
- `GET /mindmaps/{mindmapId}/nodes/{nodeId}/attachments/{attachmentId}/download` - Download attachment

### Tags

- `GET /mindmaps/{mindmapId}/tags` - List tags in a mind map
- `POST /mindmaps/{mindmapId}/tags` - Create a standard tag
- `GET /tags` - List all tags across mind maps

### Search

- `GET /search?query={query}` - Search across all mind maps
- `GET /mindmaps/{mindmapId}/search?query={query}` - Search within a mind map

## Example Usage

### Create a User (for testing)

First, you'll need to create a user directly in the H2 console or via SQL:

```sql
INSERT INTO users (id, username, display_name, email) 
VALUES ('user-1', 'john.doe', 'John Doe', 'john@example.com');
```

### Create a Mind Map

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Planning",
    "description": "Planning for Q1 2025",
    "ownerId": "user-1"
  }'
```

### Create a Node

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps/{mindmapId}/nodes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Requirements",
    "description": "Gather all requirements",
    "color": "#FF5733",
    "tags": ["planning", "phase1"]
  }'
```

## Testing

### Run Automated Tests

```bash
# Run JUnit tests
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn test
```

### Run API Test Script

```bash
# Start the application first
./run.sh

# In another terminal, run the test script
./test-api.sh
```

The test script will:
- ✅ Test all CRUD operations
- ✅ Verify pagination and sorting
- ✅ Test error handling
- ✅ Check Swagger UI accessibility

See `TESTING.md` for detailed testing documentation.

## Configuration

### Database

The application uses H2 in-memory database by default. To use PostgreSQL:

1. Update `src/main/resources/application.yaml`:

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

### File Upload

Maximum file size can be configured in `application.yaml`:

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB

mindcontroll:
  attachment:
    max-size: 52428800  # 50MB in bytes
```

## Project Structure

```
mindcontroll/
├── src/main/java/com/mindcontroll/     # Backend source code
│   ├── entity/                         # JPA entities
│   ├── repository/                     # Spring Data repositories
│   ├── service/                        # Business logic
│   ├── controller/                     # REST controllers
│   ├── dto/                            # Data Transfer Objects
│   ├── config/                         # Configuration classes
│   └── MindControllApplication.java
├── src/main/resources/
│   └── application.yaml                # Application configuration
├── frontend/                           # React frontend
│   ├── src/
│   │   ├── api/                        # API client
│   │   ├── components/                 # React components
│   │   ├── pages/                      # Page components
│   │   ├── App.tsx                     # Main app
│   │   └── main.tsx                    # Entry point
│   ├── package.json                    # Frontend dependencies
│   └── README.md                       # Frontend documentation
├── pom.xml                             # Maven dependencies
├── openapi.yaml                        # OpenAPI 3.0 specification
└── README.md                           # This file
```

## Development

### Running Tests

```bash
mvn test
```

### Packaging

```bash
mvn clean package
```

The JAR file will be created in the `target/` directory.

### Running the JAR

```bash
java -jar target/mindcontroll-1.0.0.jar
```

## API Documentation

The complete OpenAPI 3.0 specification is available in `openapi.yaml`. The interactive Swagger UI provides:

- API endpoint documentation
- Request/response examples
- Try-it-out functionality
- Schema definitions

## Future Enhancements

The current implementation provides a foundation. To complete the full API spec:

1. **Additional Controllers**: Node, Link, Comment, Attachment, Tag controllers
2. **Additional Services**: Corresponding service classes for each domain
3. **File Storage**: Implement actual file storage service for attachments
4. **EXIF Extraction**: Implement image metadata extraction service
5. **Import/Export**: Implement JSON/XML export and import with ZIP support
6. **Security**: Add Spring Security with JWT authentication
7. **Search**: Implement full-text search with Elasticsearch or Lucene
8. **Testing**: Add comprehensive unit and integration tests
9. **Docker**: Create Dockerfile and docker-compose for easy deployment

## License

Copyright © 2025 Mind Controll

## Contributing

This is a demonstration project. Contributions and suggestions are welcome!
