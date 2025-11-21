package com.mindcontroll.service;

import com.mindcontroll.entity.*;
import com.mindcontroll.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@Profile("demo")
@RequiredArgsConstructor
@Slf4j
public class ExampleDataGenerator implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final MindMapRepository mindMapRepository;
    private final NodeRepository nodeRepository;
    private final NodeLinkRepository nodeLinkRepository;
    private final CommentRepository commentRepository;
    private final TagRepository tagRepository;
    
    @Override
    public void run(String... args) {
        log.info("Generating example mind maps...");
        
        // Create users
        User alice = createUser("alice", "Alice Johnson", "alice@example.com");
        User bob = createUser("bob", "Bob Smith", "bob@example.com");
        User charlie = createUser("charlie", "Charlie Brown", "charlie@example.com");
        
        // Generate example mind maps
        generateProjectPlanningMindMap(alice);
        generateSoftwareArchitectureMindMap(bob);
        generateLearningPathMindMap(charlie);
        
        log.info("Example mind maps generated successfully!");
    }
    
    private User createUser(String username, String displayName, String email) {
        User user = new User();
        user.setUsername(username);
        user.setDisplayName(displayName);
        user.setEmail(email);
        return userRepository.save(user);
    }
    
    private void generateProjectPlanningMindMap(User owner) {
        log.info("Creating Project Planning mind map...");
        
        // Create mind map
        MindMap mindMap = new MindMap();
        mindMap.setName("Q1 2025 Project Planning");
        mindMap.setDescription("Strategic planning for Q1 2025 initiatives");
        mindMap.setOwner(owner);
        mindMap.setCreatedBy(owner.getId());
        
        LayoutConfiguration layout = new LayoutConfiguration();
        layout.setLayoutType(LayoutConfiguration.LayoutType.TREE);
        layout.setTreeOrientation(LayoutConfiguration.TreeOrientation.TOP_DOWN);
        layout.setZoom(1.0f);
        mindMap.setLayoutConfiguration(layout);
        
        mindMap = mindMapRepository.save(mindMap);
        
        // Create root node
        Node root = createNode(mindMap.getId(), null, "Q1 2025 Goals", 
            "## Quarterly Objectives\n\n- Increase market share\n- Launch new products\n- Improve customer satisfaction", 
            "#4A90E2", Arrays.asList("strategic", "planning"), owner.getId());
        
        // Phase 1: Research
        Node research = createNode(mindMap.getId(), root.getId(), "Phase 1: Research", 
            "### Research Activities\n\n1. Market analysis\n2. Competitor research\n3. Customer surveys", 
            "#7ED321", Arrays.asList("phase1", "research"), owner.getId());
        
        Node marketAnalysis = createNode(mindMap.getId(), research.getId(), "Market Analysis", 
            "Analyze current market trends and opportunities", 
            "#F5A623", Arrays.asList("research", "analysis"), owner.getId());
        
        Node competitorResearch = createNode(mindMap.getId(), research.getId(), "Competitor Research", 
            "Study competitor strategies and positioning", 
            "#F5A623", Arrays.asList("research", "competitive"), owner.getId());
        
        // Phase 2: Development
        Node development = createNode(mindMap.getId(), root.getId(), "Phase 2: Development", 
            "### Development Sprint\n\n- Feature development\n- Testing\n- Documentation", 
            "#BD10E0", Arrays.asList("phase2", "development"), owner.getId());
        
        Node featureDev = createNode(mindMap.getId(), development.getId(), "Feature Development", 
            "Implement core features based on research findings", 
            "#9013FE", Arrays.asList("development", "features"), owner.getId());
        
        Node testing = createNode(mindMap.getId(), development.getId(), "Testing & QA", 
            "Comprehensive testing strategy:\n- Unit tests\n- Integration tests\n- User acceptance testing", 
            "#9013FE", Arrays.asList("development", "testing"), owner.getId());
        
        // Phase 3: Launch
        Node launch = createNode(mindMap.getId(), root.getId(), "Phase 3: Launch", 
            "### Launch Strategy\n\n- Marketing campaign\n- Product release\n- Customer onboarding", 
            "#FF6B6B", Arrays.asList("phase3", "launch"), owner.getId());
        
        Node marketing = createNode(mindMap.getId(), launch.getId(), "Marketing Campaign", 
            "Multi-channel marketing approach", 
            "#FF5555", Arrays.asList("launch", "marketing"), owner.getId());
        
        // Create soft links between related nodes
        createLink(mindMap.getId(), marketAnalysis.getId(), featureDev.getId(), 
            "informs", "Research informs development", false, owner.getId());
        
        createLink(mindMap.getId(), testing.getId(), launch.getId(), 
            "prerequisite", "Must complete testing before launch", false, owner.getId());
        
        // Add comments
        createComment(research.getId(), null, owner, 
            "We should prioritize customer surveys in week 1");
        
        Comment parentComment = createComment(featureDev.getId(), null, owner, 
            "Breaking this into 3 sprints");
        createComment(featureDev.getId(), parentComment.getId(), owner, 
            "Agreed, let's review sprint planning next Monday");
        
        log.info("Project Planning mind map created with ID: {}", mindMap.getId());
    }
    
    private void generateSoftwareArchitectureMindMap(User owner) {
        log.info("Creating Software Architecture mind map...");
        
        MindMap mindMap = new MindMap();
        mindMap.setName("Microservices Architecture Design");
        mindMap.setDescription("System architecture for our new microservices platform");
        mindMap.setOwner(owner);
        mindMap.setCreatedBy(owner.getId());
        
        LayoutConfiguration layout = new LayoutConfiguration();
        layout.setLayoutType(LayoutConfiguration.LayoutType.RADIAL);
        layout.setZoom(0.9f);
        mindMap.setLayoutConfiguration(layout);
        
        mindMap = mindMapRepository.save(mindMap);
        
        // Create architecture components
        Node root = createNode(mindMap.getId(), null, "Microservices Platform", 
            "# Architecture Overview\n\nCloud-native microservices platform with event-driven architecture", 
            "#2C3E50", Arrays.asList("architecture", "microservices"), owner.getId());
        
        // Frontend Layer
        Node frontend = createNode(mindMap.getId(), root.getId(), "Frontend Layer", 
            "### Frontend Technologies\n- React.js\n- TypeScript\n- Redux\n- Material-UI", 
            "#3498DB", Arrays.asList("frontend", "ui"), owner.getId());
        
        Node webApp = createNode(mindMap.getId(), frontend.getId(), "Web Application", 
            "Single Page Application (SPA) for desktop users", 
            "#5DADE2", Arrays.asList("frontend", "web"), owner.getId());
        
        Node mobileApp = createNode(mindMap.getId(), frontend.getId(), "Mobile App", 
            "React Native mobile application for iOS and Android", 
            "#5DADE2", Arrays.asList("frontend", "mobile"), owner.getId());
        
        // API Gateway
        Node apiGateway = createNode(mindMap.getId(), root.getId(), "API Gateway", 
            "### Gateway Features\n- Authentication\n- Rate limiting\n- Load balancing\n- Request routing", 
            "#E74C3C", Arrays.asList("infrastructure", "gateway"), owner.getId());
        
        // Microservices
        Node services = createNode(mindMap.getId(), root.getId(), "Core Services", 
            "Independent, deployable services", 
            "#9B59B6", Arrays.asList("backend", "services"), owner.getId());
        
        Node userService = createNode(mindMap.getId(), services.getId(), "User Service", 
            "Handles authentication, authorization, and user management", 
            "#BB8FCE", Arrays.asList("backend", "authentication"), owner.getId());
        
        Node orderService = createNode(mindMap.getId(), services.getId(), "Order Service", 
            "Manages order lifecycle and processing", 
            "#BB8FCE", Arrays.asList("backend", "business-logic"), owner.getId());
        
        Node paymentService = createNode(mindMap.getId(), services.getId(), "Payment Service", 
            "Integrates with payment gateways and handles transactions", 
            "#BB8FCE", Arrays.asList("backend", "payments"), owner.getId());
        
        // Data Layer
        Node dataLayer = createNode(mindMap.getId(), root.getId(), "Data Layer", 
            "### Data Storage\n- PostgreSQL\n- MongoDB\n- Redis Cache\n- Elasticsearch", 
            "#27AE60", Arrays.asList("data", "storage"), owner.getId());
        
        // Message Queue
        Node messaging = createNode(mindMap.getId(), root.getId(), "Message Queue", 
            "Apache Kafka for event streaming and async communication", 
            "#F39C12", Arrays.asList("infrastructure", "messaging"), owner.getId());
        
        // Create architectural relationships
        createLink(mindMap.getId(), frontend.getId(), apiGateway.getId(), 
            "connects-to", "Frontend communicates through API Gateway", false, owner.getId());
        
        createLink(mindMap.getId(), apiGateway.getId(), services.getId(), 
            "routes-to", "Gateway routes requests to services", false, owner.getId());
        
        createLink(mindMap.getId(), orderService.getId(), paymentService.getId(), 
            "depends-on", "Order service depends on payment service", false, owner.getId());
        
        createLink(mindMap.getId(), services.getId(), messaging.getId(), 
            "publishes-to", "Services publish events to message queue", true, owner.getId());
        
        createLink(mindMap.getId(), services.getId(), dataLayer.getId(), 
            "persists-to", "Services persist data to storage", false, owner.getId());
        
        // Add technical comments
        createComment(apiGateway.getId(), null, owner, 
            "Consider Kong or AWS API Gateway for production");
        
        createComment(userService.getId(), null, owner, 
            "Implement OAuth 2.0 with JWT tokens for authentication");
        
        log.info("Software Architecture mind map created with ID: {}", mindMap.getId());
    }
    
    private void generateLearningPathMindMap(User owner) {
        log.info("Creating Learning Path mind map...");
        
        MindMap mindMap = new MindMap();
        mindMap.setName("Full-Stack Developer Learning Path");
        mindMap.setDescription("Comprehensive learning roadmap for becoming a full-stack developer");
        mindMap.setOwner(owner);
        mindMap.setCreatedBy(owner.getId());
        
        LayoutConfiguration layout = new LayoutConfiguration();
        layout.setLayoutType(LayoutConfiguration.LayoutType.XY_HYBRID);
        layout.setZoom(1.0f);
        mindMap.setLayoutConfiguration(layout);
        
        mindMap = mindMapRepository.save(mindMap);
        
        // Create learning path
        Node root = createNode(mindMap.getId(), null, "Full-Stack Developer", 
            "# Learning Path\n\nBecome proficient in both frontend and backend development", 
            "#E67E22", Arrays.asList("learning", "career"), owner.getId());
        
        // Fundamentals
        Node fundamentals = createNode(mindMap.getId(), root.getId(), "Programming Fundamentals", 
            "### Core Concepts\n- Data structures\n- Algorithms\n- Object-oriented programming\n- Design patterns", 
            "#3498DB", Arrays.asList("fundamentals", "basics"), owner.getId());
        
        Node dataStructures = createNode(mindMap.getId(), fundamentals.getId(), "Data Structures", 
            "Arrays, Lists, Trees, Graphs, Hash Tables", 
            "#5DADE2", Arrays.asList("fundamentals", "algorithms"), owner.getId());
        
        Node algorithms = createNode(mindMap.getId(), fundamentals.getId(), "Algorithms", 
            "Sorting, Searching, Dynamic Programming, Recursion", 
            "#5DADE2", Arrays.asList("fundamentals", "algorithms"), owner.getId());
        
        // Frontend
        Node frontendPath = createNode(mindMap.getId(), root.getId(), "Frontend Development", 
            "### Frontend Stack\n- HTML/CSS\n- JavaScript\n- Modern Frameworks\n- State Management", 
            "#E74C3C", Arrays.asList("frontend", "web"), owner.getId());
        
        Node htmlCss = createNode(mindMap.getId(), frontendPath.getId(), "HTML & CSS", 
            "**Beginner Level**\n- Semantic HTML\n- CSS Grid & Flexbox\n- Responsive Design\n- CSS Preprocessors (SASS)", 
            "#EC7063", Arrays.asList("frontend", "beginner"), owner.getId());
        
        Node javascript = createNode(mindMap.getId(), frontendPath.getId(), "JavaScript", 
            "**Intermediate Level**\n- ES6+ Features\n- Async Programming\n- DOM Manipulation\n- Fetch API", 
            "#EC7063", Arrays.asList("frontend", "javascript"), owner.getId());
        
        Node react = createNode(mindMap.getId(), frontendPath.getId(), "React.js", 
            "**Advanced Level**\n- Components & Props\n- Hooks\n- Context API\n- React Router", 
            "#EC7063", Arrays.asList("frontend", "react"), owner.getId());
        
        // Backend
        Node backendPath = createNode(mindMap.getId(), root.getId(), "Backend Development", 
            "### Backend Stack\n- Server-side languages\n- Databases\n- APIs\n- Authentication", 
            "#9B59B6", Arrays.asList("backend", "server"), owner.getId());
        
        Node nodejs = createNode(mindMap.getId(), backendPath.getId(), "Node.js & Express", 
            "Build RESTful APIs with Node.js and Express framework", 
            "#BB8FCE", Arrays.asList("backend", "nodejs"), owner.getId());
        
        Node databases = createNode(mindMap.getId(), backendPath.getId(), "Databases", 
            "**SQL**: PostgreSQL, MySQL\n**NoSQL**: MongoDB, Redis", 
            "#BB8FCE", Arrays.asList("backend", "database"), owner.getId());
        
        Node apis = createNode(mindMap.getId(), backendPath.getId(), "API Design", 
            "RESTful APIs, GraphQL, WebSockets, API Security", 
            "#BB8FCE", Arrays.asList("backend", "api"), owner.getId());
        
        // DevOps
        Node devops = createNode(mindMap.getId(), root.getId(), "DevOps & Tools", 
            "### Essential Tools\n- Git & GitHub\n- Docker\n- CI/CD\n- Cloud Platforms", 
            "#27AE60", Arrays.asList("devops", "tools"), owner.getId());
        
        Node git = createNode(mindMap.getId(), devops.getId(), "Version Control (Git)", 
            "Master Git commands, branching strategies, and collaboration workflows", 
            "#52BE80", Arrays.asList("devops", "git"), owner.getId());
        
        Node docker = createNode(mindMap.getId(), devops.getId(), "Containerization", 
            "Docker, Docker Compose, Kubernetes basics", 
            "#52BE80", Arrays.asList("devops", "containers"), owner.getId());
        
        // Create learning sequence links
        createLink(mindMap.getId(), dataStructures.getId(), algorithms.getId(), 
            "leads-to", "Understanding data structures helps with algorithms", false, owner.getId());
        
        createLink(mindMap.getId(), htmlCss.getId(), javascript.getId(), 
            "prerequisite", "Learn HTML/CSS before JavaScript", false, owner.getId());
        
        createLink(mindMap.getId(), javascript.getId(), react.getId(), 
            "prerequisite", "JavaScript knowledge required for React", false, owner.getId());
        
        createLink(mindMap.getId(), nodejs.getId(), databases.getId(), 
            "relates-to", "Backend services need database knowledge", true, owner.getId());
        
        createLink(mindMap.getId(), frontendPath.getId(), backendPath.getId(), 
            "complements", "Frontend and backend skills complement each other", true, owner.getId());
        
        // Add learning tips as comments
        createComment(htmlCss.getId(), null, owner, 
            "Recommended course: MDN Web Docs and freeCodeCamp");
        
        createComment(react.getId(), null, owner, 
            "Build at least 3 projects to solidify React concepts");
        
        Comment learningTip = createComment(databases.getId(), null, owner, 
            "Start with SQL databases, then explore NoSQL");
        createComment(databases.getId(), learningTip.getId(), owner, 
            "PostgreSQL is a great choice for learning SQL");
        
        log.info("Learning Path mind map created with ID: {}", mindMap.getId());
    }
    
    private Node createNode(String mindmapId, String parentId, String title, 
                           String description, String color, List<String> tags, String createdBy) {
        Node node = new Node();
        node.setMindmapId(mindmapId);
        node.setParentId(parentId);
        node.setTitle(title);
        node.setDescription(description);
        node.setColor(color);
        node.setTags(new ArrayList<>(tags));
        node.setCreatedBy(createdBy);
        
        // Add external links for some nodes
        if (title.contains("React")) {
            ExternalLink link = new ExternalLink();
            link.setUrl("https://react.dev");
            link.setTitle("React Official Documentation");
            link.setDescription("Official React documentation and tutorials");
            node.setExternalLinks(Arrays.asList(link));
        }
        
        return nodeRepository.save(node);
    }
    
    private void createLink(String mindmapId, String sourceId, String targetId, 
                           String linkType, String label, boolean bidirectional, String createdBy) {
        NodeLink link = new NodeLink();
        link.setMindmapId(mindmapId);
        link.setSourceNodeId(sourceId);
        link.setTargetNodeId(targetId);
        link.setLinkType(linkType);
        link.setLabel(label);
        link.setBidirectional(bidirectional);
        link.setCreatedBy(createdBy);
        nodeLinkRepository.save(link);
    }
    
    private Comment createComment(String nodeId, String parentCommentId, User author, String content) {
        Comment comment = new Comment();
        comment.setNodeId(nodeId);
        comment.setParentCommentId(parentCommentId);
        comment.setContent(content);
        comment.setAuthor(author);
        return commentRepository.save(comment);
    }
}
