package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

var templates map[string]*template.Template

func init() {
	loadTemplates()
}

func loadTemplates() {
	templates = make(map[string]*template.Template)
	
	// Load layout template
	layoutPath := "app/internal/templates/layout.html"
	
	// Load all page templates
	templateFiles, err := filepath.Glob("app/internal/templates/*.html")
	if err != nil {
		log.Fatal("Error loading templates:", err)
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
		templates[templateName] = tmpl
		log.Printf("Loaded template: %s", templateName)
	}
	
	// Also load service templates
	serviceFiles, err := filepath.Glob("app/internal/templates/services/*.html")
	if err == nil {
		for _, file := range serviceFiles {
			fileName := filepath.Base(file)
			tmpl, err := template.ParseFiles(layoutPath, file)
			if err != nil {
				log.Printf("Error parsing service template %s: %v", file, err)
				continue
			}
			templateName := "services/" + strings.TrimSuffix(fileName, ".html")
			templates[templateName] = tmpl
			log.Printf("Loaded service template: %s", templateName)
		}
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "home", nil)
}

func projectsHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "projects", nil)
}

func contactHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "contact", nil)
}

func blogHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "blog", nil)
}

func caseStudiesHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "case-studies", nil)
}

func apaHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "apa", nil)
}

func projectHandler(w http.ResponseWriter, r *http.Request) {
	// Extract project name from URL
	projectName := strings.TrimPrefix(r.URL.Path, "/project/")
	templateName := "project-" + projectName
	
	if _, ok := templates[templateName]; ok {
		renderTemplate(w, templateName, nil)
	} else {
		http.NotFound(w, r)
	}
}

func renderTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
	t, ok := templates[tmpl]
	if !ok {
		log.Printf("Template %s not found", tmpl)
		http.Error(w, "Template not found", http.StatusInternalServerError)
		return
	}
	
	err := t.ExecuteTemplate(w, "layout.html", data)
	if err != nil {
		log.Printf("Error executing template %s: %v", tmpl, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func reloadHandler(w http.ResponseWriter, r *http.Request) {
	loadTemplates()
	w.Write([]byte("Templates reloaded successfully!"))
	log.Println("Templates reloaded")
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	// Serve static files
	fs := http.FileServer(http.Dir("app/internal/static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	
	// Route handlers
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/projects", projectsHandler)
	http.HandleFunc("/contact", contactHandler)
	http.HandleFunc("/blog", blogHandler)
	http.HandleFunc("/case-studies", caseStudiesHandler)
	http.HandleFunc("/apa", apaHandler)
	http.HandleFunc("/project/", projectHandler)
	
	// Admin route to reload templates
	http.HandleFunc("/admin/reload", reloadHandler)
	
	fmt.Printf("🚀 CraftAI Website Development Server\n")
	fmt.Printf("📍 Running on http://localhost:%s\n", port)
	fmt.Printf("📁 Serving templates from: app/internal/templates/\n")
	fmt.Printf("📁 Serving static files from: app/internal/static/\n")
	fmt.Printf("🔄 Reload templates: http://localhost:%s/admin/reload\n", port)
	fmt.Printf("\nPress Ctrl+C to stop the server\n")
	
	log.Fatal(http.ListenAndServe(":"+port, nil))
}