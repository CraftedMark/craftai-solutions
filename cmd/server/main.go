package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"craftai.solutions/internal/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	godotenv.Load()

	// Get port from environment or default
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Create router
	r := mux.NewRouter()

	// Static file server with cache control
	staticDir := filepath.Join(".", "internal", "static")
	fileServer := http.FileServer(http.Dir(staticDir))
	staticHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Strip query parameters for file serving (fixes production CSS loading)
		r.URL.RawQuery = ""
		
		// Set cache control headers
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		fileServer.ServeHTTP(w, r)
	})
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", staticHandler))

	// Routes
	r.HandleFunc("/", handlers.HomeHandler).Methods("GET")
	r.HandleFunc("/services", handlers.ServicesHandler).Methods("GET")
	r.HandleFunc("/services/apa", handlers.APAHandler).Methods("GET")
	r.HandleFunc("/services/ai-ml", handlers.AIMLHandler).Methods("GET")
	r.HandleFunc("/services/process-optimization", handlers.ProcessOptimizationHandler).Methods("GET")
	r.HandleFunc("/services/managed-it", handlers.ManagedITHandler).Methods("GET")
	r.HandleFunc("/about", handlers.AboutHandler).Methods("GET")
	r.HandleFunc("/contact", handlers.ContactHandler).Methods("GET")
	r.HandleFunc("/blog", handlers.BlogHandler).Methods("GET")
	r.HandleFunc("/case-studies", handlers.CaseStudiesHandler).Methods("GET")
	r.HandleFunc("/resources", handlers.ResourcesHandler).Methods("GET")
	r.HandleFunc("/projects", handlers.ProjectsHandler).Methods("GET")
	r.HandleFunc("/projects/crafted", handlers.ProjectCraftedHandler).Methods("GET")
	r.HandleFunc("/projects/mindlattice", handlers.ProjectMindLatticeHandler).Methods("GET")
	r.HandleFunc("/projects/emailagent", handlers.ProjectEmailAgentHandler).Methods("GET")
	r.HandleFunc("/projects/craftaidashboard", handlers.ProjectCraftAIDashboardHandler).Methods("GET")
	r.HandleFunc("/gravity", handlers.GravityDemoHandler).Methods("GET")

	// API routes
	r.HandleFunc("/api/contact", handlers.ContactFormHandler).Methods("POST")
	r.HandleFunc("/api/newsletter", handlers.NewsletterHandler).Methods("POST")

	// Health check endpoint
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "OK")
	}).Methods("GET")
	

	// Configure server
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}