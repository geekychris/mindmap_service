# Mind Controll - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start the Application with Example Data

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

### Step 2: Open Swagger UI

Visit: **http://localhost:8080/api/v1/swagger-ui.html**

### Step 3: Try the API

```bash
# In another terminal
./test-api.sh
```

## 📊 Example Mind Maps

The demo profile creates 3 ready-to-use mind maps:

| Mind Map | Nodes | Links | Features |
|----------|-------|-------|----------|
| **Q1 2025 Project Planning** | 9 | 2 | Phases, tasks, comments |
| **Microservices Architecture** | 11 | 5 | System design, dependencies |
| **Full-Stack Learning Path** | 15 | 5 | Skills, prerequisites |

## 🔗 Quick Links

- **API**: http://localhost:8080/api/v1
- **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html  
- **H2 Console**: http://localhost:8080/api/v1/h2-console
  - JDBC URL: `jdbc:h2:mem:mindcontroll`
  - Username: `sa`
  - Password: _(blank)_

## 🧪 Test Commands

```bash
# Get all mind maps
curl http://localhost:8080/api/v1/mindmaps | jq '.'

# Get specific mind map
curl http://localhost:8080/api/v1/mindmaps/{id} | jq '.'

# Create mind map
curl -X POST http://localhost:8080/api/v1/mindmaps \
  -H "Content-Type: application/json" \
  -d '{"name":"My Map","ownerId":"<user-id>"}'

# Run all tests
./test-api.sh
```

## 📝 Demo Users

| Username | Display Name | Email |
|----------|--------------|-------|
| alice | Alice Johnson | alice@example.com |
| bob | Bob Smith | bob@example.com |
| charlie | Charlie Brown | charlie@example.com |

## 🔍 View Example Data

### In H2 Console

```sql
-- View all mind maps
SELECT id, name, owner_id FROM mindmaps;

-- View nodes in a mind map
SELECT id, title, parent_id, color 
FROM nodes 
WHERE mindmap_id = 'your-mindmap-id';

-- View links between nodes
SELECT link_type, label, source_node_id, target_node_id 
FROM node_links 
WHERE mindmap_id = 'your-mindmap-id';

-- View comments
SELECT c.content, u.username, c.created_at
FROM comments c
JOIN users u ON c.author_id = u.id
WHERE c.node_id = 'your-node-id';
```

### Via API (once Node controller is implemented)

```bash
# Get nodes in a mind map
curl "http://localhost:8080/api/v1/mindmaps/{id}/nodes" | jq '.'

# Get links
curl "http://localhost:8080/api/v1/mindmaps/{id}/links" | jq '.'

# Get comments on a node
curl "http://localhost:8080/api/v1/mindmaps/{mid}/nodes/{nid}/comments" | jq '.'
```

## 🎯 Common Tasks

### Create Your First Mind Map

1. Get a user ID from existing users:
   ```bash
   USER_ID=$(curl -s http://localhost:8080/api/v1/mindmaps | jq -r '.content[0].owner.id')
   ```

2. Create the mind map:
   ```bash
   curl -X POST http://localhost:8080/api/v1/mindmaps \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"My First Map\",\"description\":\"Test\",\"ownerId\":\"$USER_ID\"}"
   ```

### Filter Mind Maps

```bash
# By owner
curl "http://localhost:8080/api/v1/mindmaps?owner=$USER_ID"

# With pagination
curl "http://localhost:8080/api/v1/mindmaps?page=0&size=5"

# With sorting
curl "http://localhost:8080/api/v1/mindmaps?sort=name,asc"
```

## 📚 More Information

- **Full Documentation**: `README.md`
- **Testing Guide**: `TESTING.md`
- **Project Summary**: `SUMMARY.md`
- **OpenAPI Spec**: `openapi.yaml`

## 🐛 Troubleshooting

### Application won't start?

```bash
# Check Java version
java --version  # Should be 21

# Set Java 21
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Try again
./run.sh
```

### Tests failing?

```bash
# Make sure app is running in one terminal
./run.sh

# Run tests in another terminal
./test-api.sh
```

### Need to reset database?

```bash
# Restart the application (H2 is in-memory)
# Press Ctrl+C in the terminal running ./run.sh
# Then start again
./run.sh
```

---

**Happy Mind Mapping! 🧠✨**
