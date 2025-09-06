package main

import (
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
)

type Server struct {
	templates map[string]*template.Template
	mu        sync.RWMutex
	watcher   *fsnotify.Watcher
}

func NewServer() *Server {
	return &Server{
		templates: make(map[string]*template.Template),
	}
}

func (s *Server) loadTemplates() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	s.templates = make(map[string]*template.Template)
	
	// Load layout template
	layoutPath := "app/internal/templates/layout.html"
	
	// Check if layout exists
	if _, err := os.Stat(layoutPath); os.IsNotExist(err) {
		log.Println("Warning: layout.html not found, loading templates without layout")
		return s.loadTemplatesWithoutLayout()
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
		
		// Parse template with layout
		tmpl, err := template.ParseFiles(layoutPath, file)
		if err != nil {
			log.Printf("Error parsing template %s: %v", file, err)
			continue
		}
		
		// Store template with name (without .html extension)
		templateName := strings.TrimSuffix(fileName, ".html")
		s.templates[templateName] = tmpl
		log.Printf("✅ Loaded template: %s", templateName)
	}
	
	// Load service templates
	serviceFiles, _ := filepath.Glob("app/internal/templates/services/*.html")
	for _, file := range serviceFiles {
		fileName := filepath.Base(file)
		tmpl, err := template.ParseFiles(layoutPath, file)
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

func (s *Server) loadTemplatesWithoutLayout() error {
	// Load templates without layout (standalone)
	templateFiles, err := filepath.Glob("app/internal/templates/*.html")
	if err != nil {
		return fmt.Errorf("error globbing templates: %w", err)
	}
	
	for _, file := range templateFiles {
		fileName := filepath.Base(file)
		
		// Parse template standalone
		tmpl, err := template.ParseFiles(file)
		if err != nil {
			log.Printf("Error parsing template %s: %v", file, err)
			continue
		}
		
		// Store template with name (without .html extension)
		templateName := strings.TrimSuffix(fileName, ".html")
		s.templates[templateName] = tmpl
		log.Printf("✅ Loaded template (standalone): %s", templateName)
	}
	
	return nil
}

func (s *Server) watchTemplates() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	s.watcher = watcher
	
	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Op&fsnotify.Write == fsnotify.Write || event.Op&fsnotify.Create == fsnotify.Create {
					if strings.HasSuffix(event.Name, ".html") || strings.HasSuffix(event.Name, ".css") || strings.HasSuffix(event.Name, ".js") {
						log.Printf("🔄 File changed: %s", event.Name)
						time.Sleep(100 * time.Millisecond) // Debounce
						if err := s.loadTemplates(); err != nil {
							log.Printf("Error reloading templates: %v", err)
						} else {
							log.Println("✨ Templates reloaded successfully!")
						}
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
	
	// Watch template directories
	watcher.Add("app/internal/templates")
	watcher.Add("app/internal/templates/services")
	watcher.Add("app/internal/static")
	watcher.Add("app/internal/static/css")
	watcher.Add("app/internal/static/js")
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

func (s *Server) homeHandler(w http.ResponseWriter, r *http.Request) {
	s.renderTemplate(w, "home", nil)
}

func (s *Server) genericHandler(name string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		s.renderTemplate(w, name, nil)
	}
}

func (s *Server) projectHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectName := vars["project"]
	templateName := "project-" + projectName
	s.renderTemplate(w, templateName, nil)
}

func (s *Server) serviceHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	serviceName := vars["service"]
	templateName := "services/" + serviceName
	s.renderTemplate(w, templateName, nil)
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
	
	// Static files
	staticDir := "app/internal/static"
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(staticDir))))
	r.PathPrefix("/css/").Handler(http.StripPrefix("/css/", http.FileServer(http.Dir(staticDir+"/css"))))
	r.PathPrefix("/js/").Handler(http.StripPrefix("/js/", http.FileServer(http.Dir(staticDir+"/js"))))
	r.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.Dir(staticDir+"/images"))))
	
	// Page routes
	r.HandleFunc("/", server.homeHandler)
	r.HandleFunc("/projects", server.genericHandler("projects"))
	r.HandleFunc("/contact", server.genericHandler("contact"))
	r.HandleFunc("/blog", server.genericHandler("blog"))
	r.HandleFunc("/case-studies", server.genericHandler("case-studies"))
	r.HandleFunc("/apa", server.genericHandler("apa"))
	r.HandleFunc("/project/{project}", server.projectHandler)
	r.HandleFunc("/services/{service}", server.serviceHandler)
	
	// Admin reload endpoint
	r.HandleFunc("/admin/reload", func(w http.ResponseWriter, r *http.Request) {
		if err := server.loadTemplates(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Write([]byte("✅ Templates reloaded successfully!"))
	})
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	fmt.Printf("\n")
	fmt.Printf("🚀 CraftAI Website Development Server\n")
	fmt.Printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
	fmt.Printf("📍 URL:        http://localhost:%s\n", port)
	fmt.Printf("📁 Templates:  app/internal/templates/\n")
	fmt.Printf("📁 Static:     app/internal/static/\n")
	fmt.Printf("🔄 Hot Reload: Enabled (watching for changes)\n")
	fmt.Printf("🔧 Manual:     http://localhost:%s/admin/reload\n", port)
	fmt.Printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
	fmt.Printf("Press Ctrl+C to stop the server\n\n")
	
	log.Fatal(http.ListenAndServe(":"+port, r))
}