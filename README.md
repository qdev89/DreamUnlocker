# Dream Unlocker

**A Jungian Dream Analysis Web Application**

[![Version](https://img.shields.io/badge/version-1.0.0--alpha.1-blue.svg)](CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-production-success.svg)](https://dream-unlocker-mvp.web.app)
[![Firebase](https://img.shields.io/badge/firebase-ready-orange.svg)](https://firebase.google.com)

🌙 **Live App:** https://dream-unlocker-mvp.web.app
📋 **Complete Project Plan:** [PROJECT-PLAN.md](PROJECT-PLAN.md)
🔧 **Development Guide:** [CLAUDE.md](CLAUDE.md)
📝 **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

## 🎉 **Alpha 1.0 Release**

Dream Unlocker is now in **Alpha 1.0** - a fully functional web application for Jungian dream analysis, deployed to production and ready for user testing.

**What's Included:**
- ✅ Complete dream journaling system
- ✅ 21 Jungian archetypal symbols
- ✅ Dream interpretation engine
- ✅ Analytics dashboard
- ✅ Mobile-responsive design
- ✅ Production-ready deployment

---

## 🚀 **Quick Start**

### **Frontend Development**
```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

### **Firebase Deployment**
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

### **Testing**
```bash
cd tests
npm install
npm test        # Run comprehensive test suite
```

---

## 📊 **Alpha 1.0 Status**

```
████████████████████████████████████████ 100% Alpha 1.0 Complete
🟢 Production Ready | ✅ Core Features Complete | 🚀 Ready for User Testing
```

**✅ Core Features:**
- **Authentication**: Email/password with Firebase Auth
- **Dream Journaling**: Create, read, update, delete dreams
- **Symbol System**: 21 Jungian archetypal symbols with tooltips
- **Interpretation Engine**: Jungian analysis framework
- **Analytics**: Dashboard with symbol tracking and insights
- **Search**: Real-time dream search functionality
- **Auto-Save**: Draft saving every 2 seconds
- **Mobile Support**: Fully responsive design

**📈 Quality Metrics:**
- ✅ 43 tests passing
- ✅ Zero TypeScript errors
- ✅ Production build verified
- ✅ Security rules tested
- ✅ Code cleanup complete (-650 lines dead code)

**🔜 Next Phase:**
- OpenAI GPT-4 integration
- Rich text editor & voice recording
- Advanced analytics & export features

---

## 🏗️ **Architecture**

**Frontend:** React 19 + TypeScript + Vite + Tailwind CSS  
**Backend:** Firebase (Auth, Firestore, Functions, Hosting)  
**State:** TanStack React Query + React Context  
**Testing:** Vitest + Firebase Test Suite  

---

## 📂 **Key Files**

| File | Purpose |
|------|---------|
| `PROJECT-PLAN.md` | 📋 Complete project roadmap & status |
| `CLAUDE.md` | 🔧 Development instructions & commands |
| `frontend/src/services/firebase/` | 🔥 Firebase service layer |
| `tests/` | 🧪 Comprehensive test suite |
| `firestore.rules` | 🔒 Database security rules |

---

## 🎯 **Quick Links**

- **🌐 Live Application:** https://dream-unlocker-mvp.web.app
- **📊 Firebase Console:** https://console.firebase.google.com/project/dream-unlocker-mvp
- **📋 Detailed Project Plan:** [PROJECT-PLAN.md](PROJECT-PLAN.md)
- **🧪 Run Tests:** `cd tests && npm test`
- **🚀 Deploy:** `firebase deploy`

---

## 🔥 **What's Next?**

**Phase 2 Priority:** OpenAI GPT-4 integration for intelligent dream interpretation

See [PROJECT-PLAN.md](PROJECT-PLAN.md) for complete development roadmap, technical details, and implementation timeline.

---

**⭐ Dream Unlocker helps users explore their unconscious mind through Jungian dream analysis, combining modern web technology with timeless psychological insights.**