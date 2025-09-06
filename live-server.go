package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type Server struct {
	templates map[string]*template.Template
	mu        sync.RWMutex
	watcher   *fsnotify.Watcher
	clients   map[*websocket.Conn]bool
	clientsMu sync.RWMutex
	upgrader  websocket.Upgrader
}

func NewServer() *Server {
	return &Server{
		templates: make(map[string]*template.Template),
		clients:   make(map[*websocket.Conn]bool),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins in development
			},
		},
	}
}

// Live reload script to inject into HTML pages
const liveReloadScript = `
<script>
(function() {
	console.log('🔄 Live reload connected');
	const ws = new WebSocket('ws://localhost:8080/ws');
	let reconnectInterval = null;
	
	ws.onopen = function() {
		console.log('✅ Live reload active');
		if (reconnectInterval) {
			clearInterval(reconnectInterval);
			reconnectInterval = null;
		}
	};
	
	ws.onmessage = function(event) {
		const data = JSON.parse(event.data);
		if (data.type === 'reload') {
			console.log('🔄 Reloading page...');
			window.location.reload();
		}
	};
	
	ws.onclose = function() {
		console.log('❌ Live reload disconnected, attempting to reconnect...');
		// Try to reconnect every 2 seconds
		if (!reconnectInterval) {
			reconnectInterval = setInterval(function() {
				window.location.reload();
			}, 2000);
		}
	};
	
	ws.onerror = function(error) {
		console.error('WebSocket error:', error);
	};
})();
</script>
`

func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()
	
	s.clientsMu.Lock()
	s.clients[conn] = true
	s.clientsMu.Unlock()
	
	log.Printf("👤 Client connected (Total: %d)", len(s.clients))
	
	// Keep connection alive
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			s.clientsMu.Lock()
			delete(s.clients, conn)
			s.clientsMu.Unlock()
			log.Printf("👤 Client disconnected (Total: %d)", len(s.clients))
			break
		}
	}
}

func (s *Server) notifyClients() {
	s.clientsMu.RLock()
	defer s.clientsMu.RUnlock()
	
	message := map[string]string{"type": "reload"}
	data, _ := json.Marshal(message)
	
	for client := range s.clients {
		err := client.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			log.Printf("Error sending reload message: %v", err)
			client.Close()
			delete(s.clients, client)
		}
	}
	
	if len(s.clients) > 0 {
		log.Printf("📨 Sent reload signal to %d clients", len(s.clients))
	}
}

func (s *Server) loadTemplates() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	s.templates = make(map[string]*template.Template)
	
	// Load layout template
	layoutPath := "app/internal/templates/layout.html"
	
	// Check if layout exists
	layoutContent := ""
	if content, err := os.ReadFile(layoutPath); err == nil {
		// Inject live reload script before </body>
		layoutStr := string(content)
		if strings.Contains(layoutStr, "</body>") {
			layoutStr = strings.Replace(layoutStr, "</body>", liveReloadScript+"</body>", 1)
			layoutContent = layoutStr
		} else {
			layoutContent = layoutStr + liveReloadScript
		}
	}
	
	// Load all page templates
	templateFiles, err := filepath.Glob("app/internal/templates/*.html")
	if err != nil {
		return fmt.Errorf("error globbing templates: %w", err)
	}
	
	for _, file := range templateFiles {
		fileName := filepath.Base(file)
		if fileName == "layout.html" {
			continue
		}
		
		var tmpl *template.Template
		
		if layoutContent != "" {
			// Parse with modified layout
			tmpl = template.New("layout.html")
			_, err = tmpl.Parse(layoutContent)
			if err != nil {
				log.Printf("Error parsing layout: %v", err)
				continue
			}
			_, err = tmpl.ParseFiles(file)
		} else {
			// Parse standalone with live reload script injection
			content, err := os.ReadFile(file)
			if err != nil {
				log.Printf("Error reading template %s: %v", file, err)
				continue
			}
			
			// Inject live reload script
			contentStr := string(content)
			if strings.Contains(contentStr, "</body>") {
				contentStr = strings.Replace(contentStr, "</body>", liveReloadScript+"</body>", 1)
			} else if strings.Contains(contentStr, "</html>") {
				contentStr = strings.Replace(contentStr, "</html>", liveReloadScript+"</html>", 1)
			} else {
				contentStr = contentStr + liveReloadScript
			}
			
			tmpl = template.New(fileName)
			_, err = tmpl.Parse(contentStr)
		}
		
		if err != nil {
			log.Printf("Error parsing template %s: %v", file, err)
			continue
		}
		
		templateName := strings.TrimSuffix(fileName, ".html")
		s.templates[templateName] = tmpl
		log.Printf("✅ Loaded template: %s", templateName)
	}
	
	// Load service templates
	serviceFiles, _ := filepath.Glob("app/internal/templates/services/*.html")
	for _, file := range serviceFiles {
		fileName := filepath.Base(file)
		
		var tmpl *template.Template
		if layoutContent != "" {
			tmpl = template.New("layout.html")
			_, err = tmpl.Parse(layoutContent)
			if err != nil {
				log.Printf("Error parsing layout for service: %v", err)
				continue
			}
			_, err = tmpl.ParseFiles(file)
		} else {
			content, err := os.ReadFile(file)
			if err != nil {
				continue
			}
			contentStr := string(content) + liveReloadScript
			tmpl = template.New(fileName)
			_, err = tmpl.Parse(contentStr)
		}
		
		if err != nil {
			log.Printf("Error parsing service template %s: %v", file, err)
			continue
		}
		
		templateName := "services/" + strings.TrimSuffix(fileName, ".html")
		s.templates[templateName] = tmpl
		log.Printf("✅ Loaded service template: %s", templateName)
	}
	
	return nil
}

func (s *Server) watchTemplates() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	s.watcher = watcher
	
	// Debounce mechanism
	var debounceTimer *time.Timer
	var mu sync.Mutex
	
	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Op&fsnotify.Write == fsnotify.Write || event.Op&fsnotify.Create == fsnotify.Create {
					if strings.HasSuffix(event.Name, ".html") || 
					   strings.HasSuffix(event.Name, ".css") || 
					   strings.HasSuffix(event.Name, ".js") ||
					   strings.Contains(event.Name, "/images/") {
						
						mu.Lock()
						if debounceTimer != nil {
							debounceTimer.Stop()
						}
						
						debounceTimer = time.AfterFunc(100*time.Millisecond, func() {
							log.Printf("🔄 File changed: %s", filepath.Base(event.Name))
							
							// Reload templates if HTML changed
							if strings.HasSuffix(event.Name, ".html") {
								if err := s.loadTemplates(); err != nil {
									log.Printf("Error reloading templates: %v", err)
								} else {
									log.Println("✨ Templates reloaded!")
								}
							}
							
							// Notify all connected clients to reload
							s.notifyClients()
						})
						mu.Unlock()
					}
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("Watcher error:", err)
			}
		}
	}()
	
	// Watch directories
	dirs := []string{
		"app/internal/templates",
		"app/internal/templates/services",
		"app/internal/static",
		"app/internal/static/css",
		"app/internal/static/js",
		"app/internal/static/images",
	}
	
	for _, dir := range dirs {
		if err := watcher.Add(dir); err != nil {
			log.Printf("Warning: Could not watch %s: %v", dir, err)
		} else {
			log.Printf("👁️  Watching: %s", dir)
		}
	}
}

func (s *Server) renderTemplate(w http.ResponseWriter, tmplName string, data interface{}) {
	s.mu.RLock()
	tmpl, ok := s.templates[tmplName]
	s.mu.RUnlock()
	
	if !ok {
		log.Printf("Template %s not found", tmplName)
		http.Error(w, "Page not found", http.StatusNotFound)
		return
	}
	
	// Try to execute with layout first
	err := tmpl.ExecuteTemplate(w, "layout.html", data)
	if err != nil {
		// If layout fails, try to execute the content directly
		err = tmpl.ExecuteTemplate(w, "content", data)
		if err != nil {
			// Finally, try to execute the template itself
			err = tmpl.Execute(w, data)
			if err != nil {
				log.Printf("Error executing template %s: %v", tmplName, err)
				http.Error(w, "Error rendering page", http.StatusInternalServerError)
			}
		}
	}
}

// PageData holds the SEO and meta information for each page
type PageData struct {
	Title       string
	Description string
	Keywords    string
	OGImage     string
	PageURL     string
}

// SEO data for each page
var pageMetadata = map[string]PageData{
	"home": {
		Title:       "CraftAI Solutions - AI Development Newport Beach",
		Description: "Newport Beach's premier AI development company. Custom machine learning solutions, intelligent automation, and enterprise AI consulting. Transform your business with cutting-edge artificial intelligence.",
		Keywords:    "AI development Newport Beach, machine learning Orange County, intelligent automation, AI consulting, custom AI solutions",
		OGImage:     "https://craftai.solutions/static/images/og-image.jpg",
		PageURL:     "https://craftai.solutions/",
	},
	"projects": {
		Title:       "Our AI Projects - CraftAI Solutions",
		Description: "Explore our portfolio of successful AI implementations including Crafted, Mind Lattice AI, and enterprise automation solutions. See how we transform businesses with intelligent systems.",
		Keywords:    "AI projects, machine learning portfolio, automation case studies, AI implementation examples",
		OGImage:     "https://craftai.solutions/static/images/og-projects.jpg",
		PageURL:     "https://craftai.solutions/projects",
	},
	"contact": {
		Title:       "Contact CraftAI Solutions - Get Started with AI",
		Description: "Ready to transform your business with AI? Contact CraftAI Solutions for a free consultation. Expert AI development and automation services in Newport Beach, serving clients nationwide.",
		Keywords:    "contact AI developers, AI consultation, machine learning experts Newport Beach",
		OGImage:     "https://craftai.solutions/static/images/og-contact.jpg",
		PageURL:     "https://craftai.solutions/contact",
	},
}

func (s *Server) homeHandler(w http.ResponseWriter, r *http.Request) {
	data := pageMetadata["home"]
	s.renderTemplate(w, "home", data)
}

func (s *Server) genericHandler(name string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data, exists := pageMetadata[name]
		if !exists {
			// Fallback data for pages without specific metadata
			data = PageData{
				Title:       "CraftAI Solutions - " + strings.Title(name),
				Description: "CraftAI Solutions - Leading AI development and automation company in Newport Beach, California.",
				Keywords:    "AI development, machine learning, automation, Newport Beach",
				OGImage:     "https://craftai.solutions/static/images/og-image.jpg",
				PageURL:     "https://craftai.solutions/" + name,
			}
		}
		s.renderTemplate(w, name, data)
	}
}

func (s *Server) projectHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectName := vars["project"]
	templateName := "project-" + projectName
	
	// Project-specific metadata
	projectData := map[string]PageData{
		"crafted": {
			Title:       "Crafted - AI-Enhanced Operations Platform",
			Description: "End-to-end operations platform for makers and manufacturers. Features inventory management, order processing, invoicing, production tracking with voice assistance.",
			Keywords:    "operations platform, manufacturing software, inventory management, voice AI",
			OGImage:     "https://craftai.solutions/static/images/og-crafted.jpg",
			PageURL:     "https://craftai.solutions/projects/crafted",
		},
		"mindlattice": {
			Title:       "Mind Lattice AI - Voice-First Memory Augmentation",
			Description: "Transform spoken thoughts into structured data with intelligent lattice connection discovery, fast recall, and context-driven suggestions on iOS.",
			Keywords:    "voice AI, memory augmentation, iOS app, thought organization",
			OGImage:     "https://craftai.solutions/static/images/og-mindlattice.jpg",
			PageURL:     "https://craftai.solutions/projects/mindlattice",
		},
		"emailagent": {
			Title:       "Email Agent - Intelligent Email Automation",
			Description: "Advanced email processing system that scans multiple inboxes for receipts, orders, and spam with parallel processing and smart classification.",
			Keywords:    "email automation, intelligent processing, receipt scanning, spam detection",
			OGImage:     "https://craftai.solutions/static/images/og-emailagent.jpg",
			PageURL:     "https://craftai.solutions/projects/emailagent",
		},
		"craftaidashboard": {
			Title:       "CraftAI Dashboard - Modern iOS Architecture",
			Description: "Production-grade iOS template using workspace + SPM modules, AI assistant rules, and modern Swift 6 patterns for rapid feature development.",
			Keywords:    "iOS template, Swift 6, SwiftUI, SPM, AI development",
			OGImage:     "https://craftai.solutions/static/images/og-dashboard.jpg",
			PageURL:     "https://craftai.solutions/projects/craftaidashboard",
		},
	}
	
	data, exists := projectData[projectName]
	if !exists {
		data = PageData{
			Title:       "Project - CraftAI Solutions",
			Description: "Innovative AI project by CraftAI Solutions. Custom machine learning and automation solutions.",
			Keywords:    "AI project, machine learning, automation",
			OGImage:     "https://craftai.solutions/static/images/og-image.jpg",
			PageURL:     "https://craftai.solutions/projects/" + projectName,
		}
	}
	
	s.renderTemplate(w, templateName, data)
}

func (s *Server) serviceHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	serviceName := vars["service"]
	templateName := "services/" + serviceName
	
	data := PageData{
		Title:       "APA Services - CraftAI Solutions",
		Description: "Advanced Process Automation services by CraftAI Solutions. Transform your business processes with intelligent automation.",
		Keywords:    "process automation, APA, business automation, workflow optimization",
		OGImage:     "https://craftai.solutions/static/images/og-services.jpg",
		PageURL:     "https://craftai.solutions/services/" + serviceName,
	}
	
	s.renderTemplate(w, templateName, data)
}

func main() {
	server := NewServer()
	
	// Load templates
	if err := server.loadTemplates(); err != nil {
		log.Fatal("Error loading templates:", err)
	}
	
	// Start watching for changes
	server.watchTemplates()
	defer server.watcher.Close()
	
	// Set up routes
	r := mux.NewRouter()
	
	// WebSocket for live reload
	r.HandleFunc("/ws", server.handleWebSocket)
	
	// Static files
	staticDir := "app/internal/static"
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(staticDir))))
	r.PathPrefix("/css/").Handler(http.StripPrefix("/css/", http.FileServer(http.Dir(staticDir+"/css"))))
	r.PathPrefix("/js/").Handler(http.StripPrefix("/js/", http.FileServer(http.Dir(staticDir+"/js"))))
	r.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.Dir(staticDir+"/images"))))
	
	// SEO files
	r.HandleFunc("/robots.txt", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, staticDir+"/robots.txt")
	})
	r.HandleFunc("/sitemap.xml", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/xml")
		http.ServeFile(w, r, staticDir+"/sitemap.xml")
	})
	r.HandleFunc("/llms.txt", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, staticDir+"/llms.txt")
	})
	
	// Page routes
	r.HandleFunc("/", server.homeHandler)
	r.HandleFunc("/projects", server.genericHandler("projects"))
	r.HandleFunc("/contact", server.genericHandler("contact"))
	r.HandleFunc("/blog", server.genericHandler("blog"))
	r.HandleFunc("/case-studies", server.genericHandler("case-studies"))
	r.HandleFunc("/apa", server.genericHandler("apa"))
	r.HandleFunc("/project/{project}", server.projectHandler)
	r.HandleFunc("/services/{service}", server.serviceHandler)
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	fmt.Printf("\n")
	fmt.Printf("🚀 CraftAI Website Live Development Server\n")
	fmt.Printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
	fmt.Printf("📍 URL:           http://localhost:%s\n", port)
	fmt.Printf("🔄 Live Reload:   ✅ ENABLED\n")
	fmt.Printf("👁️  Auto Refresh:  Changes instantly appear!\n")
	fmt.Printf("📁 Templates:     app/internal/templates/\n")
	fmt.Printf("📁 Static:        app/internal/static/\n")
	fmt.Printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
	fmt.Printf("✨ Edit files and watch browser auto-refresh!\n")
	fmt.Printf("Press Ctrl+C to stop the server\n\n")
	
	log.Fatal(http.ListenAndServe(":"+port, r))
}