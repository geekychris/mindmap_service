# Mind Controll - React Frontend

A modern React TypeScript application for managing collaborative mind maps.

## Features

- 📊 **Dashboard** - View all your mind maps in a grid layout
- ➕ **Create/Delete** - Easy mind map creation and management
- 👥 **Share & Collaborate** - Add participants with different permission levels
- 🎨 **Modern UI** - Built with Tailwind CSS for a clean, responsive design
- ⚡ **Fast & Responsive** - Powered by Vite and React Query

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **TanStack Query** for server state management
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Flow** (ready for mind map visualization)

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8080/api/v1`

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Start Backend (in another terminal)

```bash
# From the project root
cd ..
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts          # API client and type definitions
│   ├── components/
│   │   └── Layout.tsx          # Main layout with header
│   ├── pages/
│   │   ├── Dashboard.tsx       # Mind maps list page
│   │   └── MindMapView.tsx     # Individual mind map view
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles with Tailwind
├── public/                     # Static assets
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── vite.config.ts              # Vite configuration
└── tsconfig.json               # TypeScript configuration
```

## Available Scripts

### `npm run dev`
Starts the development server with hot module replacement.

### `npm run build`
Builds the app for production to the `dist` folder.

### `npm run preview`
Preview the production build locally.

### `npm run lint`
Lint the codebase with ESLint.

## Features

### Dashboard Page

- View all mind maps in a responsive grid
- Create new mind maps with name and description
- Delete mind maps with confirmation
- Shows owner, creation date, and layout type
- Click any card to view/edit the mind map

### Mind Map View Page

- View mind map details (name, description, owner)
- Share with other users
- Add/remove participants with permissions (VIEW, EDIT, ADMIN)
- Canvas placeholder for node visualization (coming soon)

### Sharing & Collaboration

To share a mind map:
1. Open the mind map
2. Click the "Share" button
3. Enter the user ID of the person you want to share with
4. Select permission level (VIEW, EDIT, or ADMIN)
5. Click "Add Participant"

Get user IDs from the H2 console or the dashboard (owner information).

## API Integration

The frontend communicates with the backend using the OpenAPI specification:

```typescript
// Get all mind maps
mindMapApi.getAll({ page: 0, size: 20 })

// Get specific mind map
mindMapApi.getById(id)

// Create mind map
mindMapApi.create({ name, description, ownerId })

// Update mind map
mindMapApi.update(id, { name, description })

// Delete mind map
mindMapApi.delete(id)

// Share with user
mindMapApi.addParticipant(mindmapId, { userId, permission })

// Remove participant
mindMapApi.removeParticipant(mindmapId, participantId)
```

## Configuration

### API Base URL

By default, the app connects to `http://localhost:8080/api/v1`.

To change this, create a `.env` file:

```bash
VITE_API_BASE_URL=http://your-api-url/api/v1
```

## Development Notes

### Current Status

✅ **Implemented:**
- Dashboard with mind map list
- Create/delete mind maps
- View mind map details
- Share functionality (add/remove participants)
- Responsive design
- Loading states and error handling

🚧 **Coming Soon:**
- Interactive node visualization canvas
- Drag-and-drop node editing
- Real-time collaboration
- Node creation/editing UI
- Link management between nodes
- Comments on nodes
- Attachment upload

### Backend Dependencies

The following backend endpoints are used:
- `GET /mindmaps` - List mind maps
- `POST /mindmaps` - Create mind map
- `GET /mindmaps/{id}` - Get mind map details
- `PUT /mindmaps/{id}` - Update mind map
- `DELETE /mindmaps/{id}` - Delete mind map
- `POST /mindmaps/{id}/participants` - Add participant
- `DELETE /mindmaps/{id}/participants/{participantId}` - Remove participant

**Note**: Node visualization requires the Node API endpoints to be implemented in the backend.

## Troubleshooting

### API Connection Errors

If you see connection errors:
1. Ensure the backend is running on `http://localhost:8080`
2. Check that demo data is loaded (use `-Dspring-boot.run.profiles=demo`)
3. Verify CORS is configured in the backend

### No Mind Maps Showing

If the dashboard is empty:
1. Start the backend with demo profile to generate sample data
2. Or create a user manually in H2 console and create a mind map

### Build Errors

If you get build errors:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Future Enhancements

1. **Node Canvas**
   - Integration with React Flow for interactive node visualization
   - Drag-and-drop node positioning
   - Visual connection drawing

2. **Rich Text Editor**
   - Markdown or WYSIWYG editor for node descriptions
   - Support for formatting, lists, links

3. **Real-time Collaboration**
   - WebSocket integration for live updates
   - Show who's currently viewing/editing
   - Live cursor positions

4. **Advanced Features**
   - Undo/redo functionality
   - Keyboard shortcuts
   - Export to PDF/image
   - Templates for common mind map types
   - Dark mode

## Contributing

The UI is built to match the OpenAPI specification. When backend endpoints are implemented, update the API client in `src/api/client.ts`.

## License

Part of the Mind Controll project.
