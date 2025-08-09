package handlers

import (
	"html/template"
	"net/http"
	"path/filepath"
)

// TemplateData holds data for templates
type TemplateData struct {
	Title       string
	Description string
	Keywords    string
	PageName    string
	Content     interface{}
}

// renderTemplate renders a template with the given data
func renderTemplate(w http.ResponseWriter, templateName string, data TemplateData) {
	templatePath := filepath.Join("internal", "templates", templateName+".html")
	layoutPath := filepath.Join("internal", "templates", "layout.html")
	
	tmpl, err := template.ParseFiles(layoutPath, templatePath)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	
	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

// HomeHandler handles the home page
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "CraftAI.Solutions - AI-Powered Business Automation & Digital Transformation",
		Description: "Transform your business with cutting-edge AI automation, intelligent process optimization, and custom AI solutions. Reduce costs by 60%, boost efficiency by 80%.",
		Keywords:    "AI automation, business process automation, digital transformation, AI consulting, process optimization, RPA, machine learning solutions",
		PageName:    "home",
	}
	renderTemplate(w, "home", data)
}

// ServicesHandler handles the services page
func ServicesHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "AI & Automation Services - CraftAI.Solutions",
		Description: "Comprehensive AI and automation services including Agentic Process Automation, ML solutions, process optimization, and managed IT services for enterprise transformation.",
		Keywords:    "AI services, automation services, machine learning, process optimization, managed IT, business automation",
		PageName:    "services",
	}
	renderTemplate(w, "services", data)
}

// APAHandler handles the APA service page
func APAHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "Agentic Process Automation (APA) Services",
		Description: "Enterprise APA services that deploy intelligent AI agents to autonomously handle complex tasks. Reduce costs by 60%, improve accuracy to 99.9%, and scale operations 24/7.",
		Keywords:    "agentic process automation, APA services, AI agents, intelligent automation, autonomous agents, business process automation",
		PageName:    "apa",
	}
	renderTemplate(w, "apa", data)
}

// AIMLHandler handles the AI/ML service page
func AIMLHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "AI & Machine Learning Solutions",
		Description: "Custom AI and machine learning solutions for predictive analytics, computer vision, NLP, and intelligent automation. Transform your data into actionable insights.",
		Keywords:    "machine learning, AI solutions, predictive analytics, computer vision, natural language processing, deep learning",
		PageName:    "ai-ml",
	}
	renderTemplate(w, "services/ai-ml", data)
}

// ProcessOptimizationHandler handles the process optimization page
func ProcessOptimizationHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "Process Optimization & Automation Services",
		Description: "Streamline operations with intelligent process optimization and automation. Reduce operational costs by 50% and improve efficiency by 75% with our proven methodology.",
		Keywords:    "process optimization, business process improvement, operational efficiency, workflow automation, process mining",
		PageName:    "process-optimization",
	}
	renderTemplate(w, "services/process-optimization", data)
}

// ManagedITHandler handles the managed IT services page
func ManagedITHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "Managed IT Services",
		Description: "Comprehensive managed IT services including infrastructure management, cloud solutions, cybersecurity, and 24/7 support to keep your business running smoothly.",
		Keywords:    "managed IT services, IT support, cloud management, cybersecurity, infrastructure management",
		PageName:    "managed-it",
	}
	renderTemplate(w, "services/managed-it", data)
}

// AboutHandler handles the about page
func AboutHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "About CraftAI.Solutions - Leading AI Automation Experts",
		Description: "Learn about CraftAI.Solutions, your trusted partner in AI-powered digital transformation. Expert team, proven methodology, and commitment to your success.",
		Keywords:    "about CraftAI, AI automation company, digital transformation experts",
		PageName:    "about",
	}
	renderTemplate(w, "about", data)
}

// ContactHandler handles the contact page
func ContactHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "Contact CraftAI.Solutions - Get Your Free AI Assessment",
		Description: "Contact us for a free AI automation assessment. Our experts will analyze your processes and create a custom roadmap for digital transformation.",
		Keywords:    "contact CraftAI, AI consultation, free assessment, automation experts",
		PageName:    "contact",
	}
	renderTemplate(w, "contact", data)
}

// BlogHandler handles the blog page
func BlogHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "AI & Automation Blog - CraftAI.Solutions",
		Description: "Latest insights on AI, automation, and digital transformation. Learn best practices, industry trends, and success strategies from our experts.",
		Keywords:    "AI blog, automation insights, digital transformation articles",
		PageName:    "blog",
	}
	renderTemplate(w, "blog", data)
}

// CaseStudiesHandler handles the case studies page
func CaseStudiesHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "Case Studies - AI Automation Success Stories",
		Description: "Explore real-world success stories of businesses transformed through AI automation. See measurable results and ROI from our client implementations.",
		Keywords:    "AI case studies, automation success stories, client results, ROI examples",
		PageName:    "case-studies",
	}
	renderTemplate(w, "case-studies", data)
}

// ResourcesHandler handles the resources page
func ResourcesHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "AI & Automation Resources - CraftAI.Solutions",
		Description: "Free resources including whitepapers, guides, and tools to help you succeed with AI automation and digital transformation.",
		Keywords:    "AI resources, automation guides, whitepapers, free tools",
		PageName:    "resources",
	}
	renderTemplate(w, "resources", data)
}

// ProjectsHandler handles the projects page
func ProjectsHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "Featured Projects - CraftAI.Solutions",
		Description: "Explore our portfolio of cutting-edge AI, automation, and iOS development projects. From enterprise production management to voice-first memory augmentation.",
		Keywords:    "featured projects, AI projects, iOS development, automation systems, portfolio",
		PageName:    "projects",
	}
	renderTemplate(w, "projects", data)
}

// ProjectCraftedHandler handles the Crafted project page
func ProjectCraftedHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "Crafted - Enterprise Production Management System",
		Description: "A comprehensive iOS application for business production management featuring AI-powered voice commands, real-time PostgreSQL integration, and multi-user workflow management.",
		Keywords:    "Crafted, iOS app, production management, Swift 6, SwiftUI, PostgreSQL, AI voice commands",
		PageName:    "project-crafted",
	}
	renderTemplate(w, "project-crafted", data)
}

// ProjectMindLatticeHandler handles the Mind Lattice AI project page
func ProjectMindLatticeHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "Mind Lattice AI - Voice-First Memory Augmentation",
		Description: "An innovative iOS memory augmentation application that transforms spoken thoughts into structured, actionable data with intelligent Memory Lattice connection discovery.",
		Keywords:    "Mind Lattice AI, voice-first, memory augmentation, iOS app, AI enhancement, SwiftUI, speech recognition",
		PageName:    "project-mindlattice",
	}
	renderTemplate(w, "project-mindlattice", data)
}

// ProjectEmailAgentHandler handles the Email Agent project page
func ProjectEmailAgentHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "Email Agent - Intelligent Email Automation System",
		Description: "Advanced Python-based email automation system that intelligently processes multiple email accounts to find receipts, orders, and detect spam with parallel processing.",
		Keywords:    "Email Agent, Python automation, email processing, spam detection, receipt detection, IMAP, multi-account",
		PageName:    "project-emailagent",
	}
	renderTemplate(w, "project-emailagent", data)
}

// ProjectCraftAIDashboardHandler handles the CraftAI Dashboard project page
func ProjectCraftAIDashboardHandler(w http.ResponseWriter, r *http.Request) {
	data := TemplateData{
		Title:       "CraftAI Dashboard - Modern iOS Architecture Template",
		Description: "A cutting-edge iOS application template featuring workspace + SPM package architecture with AI assistant rules files and modern Swift 6+ development patterns.",
		Keywords:    "CraftAI Dashboard, iOS template, Swift 6, SwiftUI, architecture template, AI assistant rules, XcodeBuildMCP",
		PageName:    "project-craftaidashboard",
	}
	renderTemplate(w, "project-craftaidashboard", data)
}

