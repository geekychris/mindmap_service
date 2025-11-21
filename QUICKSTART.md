# Mind Controll - Quick Start Guide

## 🚀 Start Everything (Recommended)

```bash
./start-all.sh
```

**This starts:**
- Backend API → http://localhost:8080/api/v1
- Frontend UI → http://localhost:5173
- Demo data with 3 users and 3 mind maps

**To stop:**
```bash
./stop-all.sh
```

---

## 📊 Access Points

| What | Where |
|------|-------|
| **React UI** | http://localhost:5173 |
| **API Docs** | http://localhost:8080/api/v1/swagger-ui.html |
| **Database** | http://localhost:8080/api/v1/h2-console |

---

## 👥 Demo Users

- **alice** - alice@mindcontroll.com
- **bob** - bob@mindcontroll.com  
- **charlie** - charlie@mindcontroll.com

---

## 🛠️ Manual Start

### Backend Only
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

### Frontend Only
```bash
cd frontend
npm install  # first time only
npm run dev
```

---

## 🧪 Run Tests

```bash
# JUnit tests
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn test

# API tests (backend must be running)
./test-api.sh
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `README.md` | Full documentation |
| `frontend/README.md` | Frontend guide |
| `IMPLEMENTATION_SUMMARY.md` | Complete project details |
| `openapi.yaml` | API specification |
| `start-all.sh` | Start script |
| `stop-all.sh` | Stop script |

---

## 🔧 Common Commands

### Build Backend
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn clean install
```

### Build Frontend
```bash
cd frontend
npm run build
```

### View Logs
```bash
tail -f backend.log
tail -f frontend.log
```

### Kill Ports
```bash
lsof -ti:8080 | xargs kill
lsof -ti:5173 | xargs kill
```

---

## ⚠️ Requirements

- **Java 21** (not 25+)
- **Node.js 18+**
- **Maven 3.8+**

---

## 💡 What You Can Do

### In the UI
✅ View all mind maps  
✅ Create new mind maps  
✅ Delete mind maps  
✅ Edit mind map details  
✅ Share with other users  
✅ Manage participants  

### Via API
✅ All CRUD operations  
✅ Pagination & sorting  
✅ Participant management  
✅ Owner filtering  

---

## 🐛 Troubleshooting

**Nothing shows up?**
→ Make sure you started with `-Dspring-boot.run.profiles=demo`

**Connection errors?**
→ Check backend is running on port 8080

**Build fails?**
→ Verify Java 21 is active: `java --version`

**Port in use?**
→ Run `./stop-all.sh` or kill manually

---

## 📚 Learn More

- Read `IMPLEMENTATION_SUMMARY.md` for complete details
- Check `README.md` for full documentation
- Explore `openapi.yaml` for API specification
- See `frontend/README.md` for UI architecture

---

**Need help?** Check the troubleshooting section in README.md

**Want to contribute?** See IMPLEMENTATION_SUMMARY.md for architecture details
