package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strings"
)

// ContactForm represents the contact form data
type ContactForm struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Company string `json:"company"`
	Phone   string `json:"phone"`
	Service string `json:"service"`
	Message string `json:"message"`
	Agree   string `json:"agree"`
}

// ContactResponse represents the API response
type ContactResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// ContactFormHandler handles contact form submissions
func ContactFormHandler(w http.ResponseWriter, r *http.Request) {
	// Set response header
	w.Header().Set("Content-Type", "application/json")
	
	// Parse form data
	err := r.ParseForm()
	if err != nil {
		sendJSONResponse(w, ContactResponse{
			Success: false,
			Message: "Failed to parse form data",
		}, http.StatusBadRequest)
		return
	}
	
	// Extract form data
	form := ContactForm{
		Name:    r.FormValue("name"),
		Email:   r.FormValue("email"),
		Company: r.FormValue("company"),
		Phone:   r.FormValue("phone"),
		Service: r.FormValue("service"),
		Message: r.FormValue("message"),
		Agree:   r.FormValue("agree"),
	}
	
	// Validate required fields
	if form.Name == "" || form.Email == "" || form.Message == "" {
		sendJSONResponse(w, ContactResponse{
			Success: false,
			Message: "Please fill in all required fields",
		}, http.StatusBadRequest)
		return
	}
	
	// Validate email format
	if !isValidEmail(form.Email) {
		sendJSONResponse(w, ContactResponse{
			Success: false,
			Message: "Please provide a valid email address",
		}, http.StatusBadRequest)
		return
	}
	
	// Send email notification
	err = sendContactEmail(form)
	if err != nil {
		log.Printf("Failed to send email: %v", err)
		sendJSONResponse(w, ContactResponse{
			Success: false,
			Message: "Failed to send message. Please try again later.",
		}, http.StatusInternalServerError)
		return
	}
	
	// Send success response
	sendJSONResponse(w, ContactResponse{
		Success: true,
		Message: "Thank you for your message! We'll get back to you within 24 hours.",
	}, http.StatusOK)
}

// sendJSONResponse sends a JSON response
func sendJSONResponse(w http.ResponseWriter, response ContactResponse, statusCode int) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

// isValidEmail validates email format
func isValidEmail(email string) bool {
	// Basic email validation
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// sendContactEmail sends the contact form email
func sendContactEmail(form ContactForm) error {
	// Get email configuration from environment
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	toEmail := os.Getenv("CONTACT_EMAIL")
	
	// Default values if not set
	if smtpHost == "" {
		smtpHost = "localhost"
	}
	if smtpPort == "" {
		smtpPort = "587"
	}
	if toEmail == "" {
		toEmail = "info@craftai.solutions"
	}
	
	// Create email message
	serviceName := "Not specified"
	if form.Service != "" {
		serviceName = form.Service
	}
	
	subject := fmt.Sprintf("New Contact Form Submission from %s", form.Name)
	body := fmt.Sprintf(`New Contact Form Submission

Name: %s
Email: %s
Company: %s
Phone: %s
Service Interest: %s

Message:
%s

---
This email was sent from the CraftAI.Solutions contact form.
`, form.Name, form.Email, form.Company, form.Phone, serviceName, form.Message)
	
	// Create email message
	message := fmt.Sprintf("From: %s\r\n"+
		"To: %s\r\n"+
		"Subject: %s\r\n"+
		"\r\n"+
		"%s", smtpUser, toEmail, subject, body)
	
	// If SMTP credentials are not set, just log the message (for development)
	if smtpUser == "" || smtpPass == "" {
		log.Printf("Contact form submission (email not sent - no SMTP config):\n%s", message)
		return nil
	}
	
	// Set up authentication
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	
	// Send email
	err := smtp.SendMail(
		smtpHost+":"+smtpPort,
		auth,
		smtpUser,
		[]string{toEmail},
		[]byte(message),
	)
	
	return err
}

// NewsletterHandler handles newsletter subscriptions
func NewsletterHandler(w http.ResponseWriter, r *http.Request) {
	// Set response header
	w.Header().Set("Content-Type", "application/json")
	
	// Parse form data
	err := r.ParseForm()
	if err != nil {
		sendJSONResponse(w, ContactResponse{
			Success: false,
			Message: "Failed to parse form data",
		}, http.StatusBadRequest)
		return
	}
	
	// Get email
	email := r.FormValue("email")
	
	// Validate email
	if email == "" || !isValidEmail(email) {
		sendJSONResponse(w, ContactResponse{
			Success: false,
			Message: "Please provide a valid email address",
		}, http.StatusBadRequest)
		return
	}
	
	// TODO: Add email to newsletter list (implement with your preferred email service)
	log.Printf("Newsletter subscription request: %s", email)
	
	// Send success response
	sendJSONResponse(w, ContactResponse{
		Success: true,
		Message: "Thank you for subscribing! Check your email for confirmation.",
	}, http.StatusOK)
}