<p align="center">
  <img src="assets/logo.png" alt="Mindmap Service logo" width="180">
</p>

# Mind Controll

A full-stack collaborative mind mapping application with a Spring Boot REST API backend and a React TypeScript frontend.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Building the Application](#building-the-application)
- [Running the Application](#running-the-application)
- [Accessing the Application](#accessing-the-application)
- [API Examples](#api-examples)
- [Testing](#testing)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Development](#development)

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

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           React 19 + TypeScript Frontend                  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Pages     │  │  Components  │  │   API Client    │  │  │
│  │  │ (Dashboard, │  │  (Layout,    │  │   (Axios)       │  │  │
│  │  │  MindMap)   │  │   Common)    │  │                 │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │         │                 │                    │          │  │
│  │         └─────────────────┴────────────────────┘          │  │
│  │                           │                                │  │
│  │                  TanStack Query (State)                    │  │
│  │                   Tailwind CSS (Styling)                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                         HTTP/REST                                │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Spring Boot 3.2.0 REST API                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │ Controllers  │  │   Services   │  │  Repositories  │  │  │
│  │  │              │  │              │  │                │  │  │
│  │  │ - MindMap    │→ │ - Business   │→ │ - Spring Data  │  │  │
│  │  │ - Node       │  │   Logic      │  │   JPA          │  │  │
│  │  │ - Link       │  │ - Validation │  │                │  │  │
│  │  │ - Comment    │  │ - TX Mgmt    │  │                │  │  │
│  │  │ - Attachment │  │              │  │                │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │  │
│  │         │                 │                    │          │  │
│  │         └─────────────────┴────────────────────┘          │  │
│  │                           │                                │  │
│  │                    JPA/Hibernate                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA TIER                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         H2 Database (Dev) / PostgreSQL (Prod)             │  │
│  │                                                            │  │
│  │  Tables: users, mindmaps, nodes, node_links,              │  │
│  │          comments, attachments, tags, participants        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              File System (Attachments)                    │  │
│  │                   ./uploads/                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Model Design

#### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ username    │
│ displayName │
│ email       │
└──────┬──────┘
       │
       │ owns (1:N)
       ▼
┌─────────────────┐           ┌──────────────┐
│    MindMap      │◄─────────►│ Participant  │
│─────────────────│  (1:N)    │──────────────│
│ id (PK)         │           │ id (PK)      │
│ name            │           │ mindmapId    │
│ description     │           │ userId       │
│ ownerId (FK)    │           │ role         │
│ layout config   │           │ permissions  │
│ visibility      │           └──────────────┘
└────────┬────────┘
         │
         │ contains (1:N, via mindmapId field)
         ▼
┌─────────────────┐
│      Node       │
│─────────────────│
│ id (PK)         │
│ mindmapId       │ ← Not JPA @ManyToOne, just String field
│ parentId        │ ← Parent-child via field, not JPA relation
│ title           │
│ description     │
│ color           │
│ position        │
│ tags[]          │
└────┬────┬───────┘
     │    │
     │    └─────────┐
     │              │
     │ (1:N)        │ (1:N)
     ▼              ▼
┌──────────┐   ┌────────────┐
│ Comment  │   │ Attachment │
│──────────│   │────────────│
│ id (PK)  │   │ id (PK)    │
│ nodeId   │   │ nodeId     │
│ text     │   │ filename   │
│ authorId │   │ filePath   │
└──────────┘   │ fileSize   │
               │ mimeType   │
               │ metadata   │
               └────────────┘

     Node ──────────► NodeLink ◄────────── Node
   (source)            │              (target)
                  ┌────┴─────┐
                  │ NodeLink │
                  │──────────│
                  │ id (PK)  │
                  │ sourceId │
                  │ targetId │
                  │ linkType │
                  │ label    │
                  └──────────┘
```

#### Key Design Decisions

1. **Loose Node-MindMap Coupling**: Nodes reference their mind map via `mindmapId` String field rather than JPA `@ManyToOne`. This provides:
   - Flexibility in graph traversal algorithms
   - Easier node migration between mind maps (future feature)
   - Simplified JSON serialization without circular references

2. **Parent-Child via Field**: Node hierarchy uses `parentId` String field instead of self-referential JPA relationship:
   - Avoids N+1 query problems in deep hierarchies
   - Simpler recursive algorithms for tree operations
   - No risk of LazyInitializationException

3. **Embedded Components**: `LayoutConfiguration` and `NodePosition` are `@Embeddable`:
   - Stored as columns in parent table (no JOIN needed)
   - Strongly typed configuration objects
   - Value object semantics

4. **Soft Links (NodeLink)**: Separate entity for node-to-node relationships:
   - Represents semantic connections ("depends-on", "relates-to")
   - Distinct from parent-child hierarchy
   - Enables graph algorithms (shortest path, cycles, etc.)

5. **UUID Primary Keys**: All entities use UUID via `@GeneratedValue(strategy = GenerationType.UUID)`:
   - Globally unique across distributed systems
   - No auto-increment conflicts in clustering
   - Safe to expose in URLs

### Backend Architecture (Layered)

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│                                                             │
│  REST Controllers (@RestController)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   MindMap    │  │     Node     │  │   Attachment    │   │
│  │  Controller  │  │  Controller  │  │   Controller    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                                                             │
│  - Request validation (@Valid)                              │
│  - DTO mapping                                              │
│  - HTTP status codes                                        │
│  - Exception handling (GlobalExceptionHandler)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                          │
│                                                             │
│  Business Logic (@Service, @Transactional)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   MindMap    │  │     Node     │  │   Attachment    │   │
│  │   Service    │  │   Service    │  │    Service      │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                                                             │
│  - Business rules enforcement                               │
│  - Transaction management                                   │
│  - Authorization checks                                     │
│  - Cross-entity operations                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                        │
│                                                             │
│  Spring Data JPA Repositories                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   MindMap    │  │     Node     │  │   Attachment    │   │
│  │  Repository  │  │  Repository  │  │   Repository    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                                                             │
│  - CRUD operations                                          │
│  - Custom query methods                                     │
│  - Pagination & sorting                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                          │
│                                                             │
│  JPA Entities (@Entity)                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   MindMap    │  │     Node     │  │   Attachment    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                                                             │
│  - Domain model                                             │
│  - Relationships & constraints                              │
│  - Audit fields (createdAt, updatedAt)                      │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture (Component-Based)

```
┌─────────────────────────────────────────────────────────────┐
│                       ROUTING LAYER                         │
│                   React Router v7                           │
│                                                             │
│  Routes:                                                    │
│    /                 → Dashboard                            │
│    /mindmap/:id      → MindMapView                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       PAGE LAYER                            │
│                                                             │
│  ┌──────────────┐              ┌─────────────────┐          │
│  │  Dashboard   │              │  MindMapView    │          │
│  │──────────────│              │─────────────────│          │
│  │ - List maps  │              │ - Map details   │          │
│  │ - Create map │              │ - Node list     │          │
│  │ - Delete map │              │ - Participants  │          │
│  └──────────────┘              └─────────────────┘          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Layout     │  │  MindMapCard │  │   NodeItem      │   │
│  │  (Header,    │  │              │  │                 │   │
│  │   Nav)       │  │              │  │                 │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                         │
│                                                             │
│  TanStack Query (React Query)                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ - Server state caching                               │   │
│  │ - Automatic refetching                               │   │
│  │ - Optimistic updates                                 │   │
│  │ - Query invalidation                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                             │
│                                                             │
│  Axios HTTP Client (src/api/client.ts)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ mindMapApi: { list, create, get, update, delete }    │   │
│  │ nodeApi: { list, create, get, update, delete }       │   │
│  │ nodeLinkApi: { list, create, delete }                │   │
│  │ attachmentApi: { upload, download }                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  TypeScript interfaces matching OpenAPI spec                │
└─────────────────────────────────────────────────────────────┘
```

## Building the Application

### Backend Build

The backend is built using Maven. **Java 21 is required** (Lombok compatibility issue with Java 25+).

#### Step 1: Set Java Version

```bash
# On macOS, set JAVA_HOME to Java 21
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Verify Java version
java --version
# Should output: openjdk 21.0.x
```

#### Step 2: Clean Build

```bash
# Clean and compile
mvn clean install

# Skip tests for faster build
mvn clean install -DskipTests
```

This produces `target/mindcontroll-1.0.0.jar`.

#### Step 3: Run Tests (Optional)

```bash
mvn test
```

### Frontend Build

The frontend is built with Vite.

#### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

#### Step 2: Build for Production

```bash
npm run build
```

This creates optimized bundles in `frontend/dist/`.

#### Step 3: Preview Production Build (Optional)

```bash
npm run preview
```

## Running the Application

### Option 1: Run Backend Only

#### Development Mode (Maven)

```bash
# Set Java 21
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Run with empty database
mvn spring-boot:run

# OR run with demo data (3 users, 3 mind maps, 35 nodes)
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

Backend starts at: `http://localhost:8080/api/v1`

**Demo data includes:**
- **Q1 2025 Project Planning** (9 nodes, 2 soft links, comments)
- **Microservices Architecture Design** (11 nodes, 5 soft links)
- **Full-Stack Developer Learning Path** (15 nodes, 5 soft links)

#### Production Mode (JAR)

```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/mindcontroll-1.0.0.jar

# Or with demo profile
java -jar target/mindcontroll-1.0.0.jar --spring.profiles.active=demo
```

### Option 2: Run Frontend Only (Development)

```bash
cd frontend

# Install dependencies (first time)
npm install

# Start dev server with hot reload
npm run dev
```

Frontend starts at: `http://localhost:5173`

**Note**: Frontend requires backend running at `http://localhost:8080/api/v1`

### Option 3: Run Full Stack (Backend + Frontend)

#### Automated Start (Recommended)

```bash
# Start both services with demo data
./start-all.sh
```

This script:
- Starts backend with demo profile on port 8080
- Starts frontend dev server on port 5173
- Displays all service URLs
- Shows logs in console

**To stop all services:**

```bash
./stop-all.sh
```

#### Manual Start (Two Terminals)

```bash
# Terminal 1: Backend
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run -Dspring-boot.run.profiles=demo

# Terminal 2: Frontend
cd frontend
npm run dev
```

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

## API Examples

### Complete Workflow Example

This section demonstrates a complete workflow from user creation through file upload.

#### 1. Create a User

First, create a user via H2 console (`http://localhost:8080/api/v1/h2-console`):

```sql
INSERT INTO users (id, username, display_name, email) 
VALUES ('user-123', 'john.doe', 'John Doe', 'john@example.com');
```

Or if using demo profile, use existing users:
- `user-1` (Alice Johnson, alice@example.com)
- `user-2` (Bob Smith, bob@example.com)
- `user-3` (Charlie Brown, charlie@example.com)

#### 2. Create a Mind Map

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Planning",
    "description": "Planning for Q1 2025",
    "ownerId": "user-123",
    "visibility": "PRIVATE",
    "layout": {
      "type": "AUTO",
      "defaultNodeColor": "#4A90E2",
      "defaultEdgeColor": "#95A5A6",
      "spacing": 100.0,
      "padding": 50.0
    }
  }'
```

**Response (201 Created):**
```json
{
  "id": "map-456",
  "name": "Project Planning",
  "description": "Planning for Q1 2025",
  "ownerId": "user-123",
  "visibility": "PRIVATE",
  "layout": {
    "type": "AUTO",
    "defaultNodeColor": "#4A90E2",
    "defaultEdgeColor": "#95A5A6",
    "spacing": 100.0,
    "padding": 50.0
  },
  "createdAt": "2025-01-21T12:00:00Z",
  "updatedAt": "2025-01-21T12:00:00Z"
}
```

Save the returned `id` (e.g., `map-456`) for subsequent requests.

#### 3. Create Root Node

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps/map-456/nodes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Requirements",
    "description": "## Overview\n\nGather and document all project requirements.\n\n- Functional requirements\n- Non-functional requirements\n- Constraints",
    "color": "#E74C3C",
    "position": {
      "x": 0.0,
      "y": 0.0
    },
    "tags": ["planning", "phase1", "critical"]
  }'
```

**Response (201 Created):**
```json
{
  "id": "node-789",
  "mindmapId": "map-456",
  "parentId": null,
  "title": "Project Requirements",
  "description": "## Overview\n\nGather and document all project requirements.\n\n- Functional requirements\n- Non-functional requirements\n- Constraints",
  "color": "#E74C3C",
  "position": {
    "x": 0.0,
    "y": 0.0
  },
  "tags": ["planning", "phase1", "critical"],
  "createdAt": "2025-01-21T12:05:00Z",
  "updatedAt": "2025-01-21T12:05:00Z"
}
```

#### 4. Create Child Node

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps/map-456/nodes \
  -H "Content-Type: application/json" \
  -d '{
    "parentId": "node-789",
    "title": "User Stories",
    "description": "Collect user stories from stakeholders",
    "color": "#3498DB",
    "position": {
      "x": 150.0,
      "y": 100.0
    },
    "tags": ["requirements", "agile"]
  }'
```

#### 5. Upload Attachment to Node

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps/map-456/nodes/node-789/attachments \
  -F "file=@/path/to/requirements.pdf" \
  -F "description=Requirements specification document"
```

**Response (201 Created):**
```json
{
  "id": "attach-101",
  "nodeId": "node-789",
  "filename": "requirements.pdf",
  "originalFilename": "requirements.pdf",
  "mimeType": "application/pdf",
  "fileSize": 245760,
  "filePath": "./uploads/attach-101_requirements.pdf",
  "description": "Requirements specification document",
  "createdAt": "2025-01-21T12:10:00Z"
}
```

#### 6. Upload Image with EXIF Metadata

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps/map-456/nodes/node-789/attachments \
  -F "file=@/path/to/diagram.jpg" \
  -F "description=System architecture diagram"
```

**Response includes EXIF metadata:**
```json
{
  "id": "attach-102",
  "nodeId": "node-789",
  "filename": "diagram.jpg",
  "originalFilename": "diagram.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 512000,
  "filePath": "./uploads/attach-102_diagram.jpg",
  "description": "System architecture diagram",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "camera": "Canon EOS 5D",
    "dateTaken": "2025-01-15T10:30:00Z",
    "gps": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "createdAt": "2025-01-21T12:15:00Z"
}
```

#### 7. Download Attachment

```bash
# Download file
curl -O http://localhost:8080/api/v1/mindmaps/map-456/nodes/node-789/attachments/attach-101/download

# Or with wget
wget http://localhost:8080/api/v1/mindmaps/map-456/nodes/node-789/attachments/attach-101/download
```

#### 8. Add Comment to Node

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps/map-456/nodes/node-789/comments \
  -H "Content-Type: application/json" \
  -d '{
    "text": "We need to prioritize the mobile app requirements first.",
    "authorId": "user-123"
  }'
```

#### 9. Create Soft Link Between Nodes

```bash
# First create another node
curl -X POST http://localhost:8080/api/v1/mindmaps/map-456/nodes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Technical Design",
    "description": "System architecture and design",
    "color": "#9B59B6",
    "position": {"x": -150.0, "y": 100.0}
  }'

# Response will include node ID, e.g., "node-790"

# Create link from Requirements to Design
curl -X POST http://localhost:8080/api/v1/mindmaps/map-456/links \
  -H "Content-Type: application/json" \
  -d '{
    "sourceNodeId": "node-789",
    "targetNodeId": "node-790",
    "linkType": "DEPENDS_ON",
    "label": "Design depends on finalized requirements"
  }'
```

#### 10. Add Participant to Mind Map

```bash
curl -X POST http://localhost:8080/api/v1/mindmaps/map-456/participants \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-2",
    "role": "EDITOR",
    "permissions": ["READ", "WRITE", "COMMENT"]
  }'
```

#### 11. Search Across Mind Maps

```bash
# Global search
curl "http://localhost:8080/api/v1/search?query=requirements"

# Search within specific mind map
curl "http://localhost:8080/api/v1/mindmaps/map-456/search?query=requirements"
```

#### 12. List All Nodes in Mind Map

```bash
curl "http://localhost:8080/api/v1/mindmaps/map-456/nodes"
```

#### 13. Update Node Content

```bash
curl -X PUT http://localhost:8080/api/v1/mindmaps/map-456/nodes/node-789 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Requirements (Updated)",
    "description": "## Updated Overview\n\nRevised requirements based on stakeholder feedback.",
    "color": "#E67E22",
    "position": {"x": 0.0, "y": 0.0},
    "tags": ["planning", "phase1", "critical", "revised"]
  }'
```

#### 14. Get Mind Map with Full Details

```bash
curl http://localhost:8080/api/v1/mindmaps/map-456
```

#### 15. Export Mind Map

```bash
# Export as JSON
curl "http://localhost:8080/api/v1/mindmaps/map-456/export?format=JSON" -o mindmap.json

# Export as XML
curl "http://localhost:8080/api/v1/mindmaps/map-456/export?format=XML" -o mindmap.xml

# Export with attachments (creates ZIP)
curl "http://localhost:8080/api/v1/mindmaps/map-456/export?format=JSON&includeAttachments=true" -o mindmap.zip
```

### Additional Examples

#### List Mind Maps with Pagination

```bash
# First page, 10 items
curl "http://localhost:8080/api/v1/mindmaps?page=0&size=10"

# Sort by creation date descending
curl "http://localhost:8080/api/v1/mindmaps?page=0&size=10&sort=createdAt,desc"

# Filter by owner
curl "http://localhost:8080/api/v1/mindmaps?ownerId=user-123"
```

#### Bulk Node Operations

```bash
# Create multiple nodes at once (send array)
curl -X POST http://localhost:8080/api/v1/mindmaps/map-456/nodes/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {
      "title": "Node 1",
      "description": "Description 1",
      "color": "#FF0000",
      "position": {"x": 0.0, "y": 0.0}
    },
    {
      "title": "Node 2",
      "description": "Description 2",
      "color": "#00FF00",
      "position": {"x": 100.0, "y": 0.0}
    }
  ]'
```

#### Delete Operations

```bash
# Delete a node
curl -X DELETE http://localhost:8080/api/v1/mindmaps/map-456/nodes/node-789

# Delete a link
curl -X DELETE http://localhost:8080/api/v1/mindmaps/map-456/links/link-101

# Delete a mind map (cascades to all nodes, links, etc.)
curl -X DELETE http://localhost:8080/api/v1/mindmaps/map-456
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
