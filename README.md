# CraftAI Website - Local Development

This is your local development environment for the CraftAI Solutions website.

## 📁 Project Structure

```
craftai-website-copy/
├── app/
│   ├── craftai-server          # Compiled Go server (production)
│   └── internal/
│       ├── static/             # CSS, JavaScript, Images
│       │   ├── css/
│       │   ├── js/
│       │   └── images/
│       └── templates/          # HTML Templates
│           ├── layout.html     # Base layout
│           ├── home.html       # Homepage
│           ├── projects.html   # Projects page
│           ├── contact.html    # Contact page
│           ├── blog.html       # Blog page
│           ├── project-*.html  # Individual project pages
│           └── services/       # Service pages
├── dev-server.go              # Development server with hot reload
├── main.go                    # Simple development server
├── run-dev.sh                 # Script to run dev server
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Go 1.21 or later (install with `brew install go` on macOS)

### Running the Development Server

1. **Easy way (with hot reload):**
   ```bash
   ./run-dev.sh
   ```

2. **Manual way:**
   ```bash
   go mod init craftai-website
   go get github.com/gorilla/mux
   go get github.com/fsnotify/fsnotify
   go run dev-server.go
   ```

3. **Simple server (no hot reload):**
   ```bash
   go run main.go
   ```

The server will start on http://localhost:8080

## ✨ Features

### 🔄 Hot Reload
The development server automatically reloads when you change:
- HTML templates (`.html`)
- CSS files (`.css`) 
- JavaScript files (`.js`)

No need to restart the server!

### 📝 Editing Content

1. **HTML Templates**: Edit files in `app/internal/templates/`
   - `home.html` - Homepage content
   - `projects.html` - Projects listing
   - `contact.html` - Contact page
   - `project-*.html` - Individual project pages

2. **Styles**: Edit CSS in `app/internal/static/css/`

3. **JavaScript**: Edit JS in `app/internal/static/js/`

4. **Images**: Add/replace images in `app/internal/static/images/`

## 🎨 Template System

Templates use Go's template syntax with a layout system:

- `layout.html` - Contains the common header, footer, navigation
- Page templates define a `{{define "content"}}` block
- The content block is inserted into the layout

Example template structure:
```html
{{define "content"}}
<main>
    <h1>Page Title</h1>
    <p>Your content here...</p>
</main>
{{end}}
```

## 📍 Routes

- `/` - Homepage
- `/projects` - Projects listing
- `/project/{name}` - Individual project (e.g., `/project/craftaidashboard`)
- `/contact` - Contact page
- `/blog` - Blog page
- `/case-studies` - Case studies
- `/services/{name}` - Service pages
- `/static/*` - Static files (CSS, JS, images)
- `/admin/reload` - Manual template reload

## 🛠️ Making Changes

1. **Edit the template or static files** you want to change
2. **Save the file** - the server will auto-reload
3. **Refresh your browser** to see changes
4. **Check the terminal** for any error messages

## 📦 Deploying Changes

After making changes locally:

1. **Test thoroughly** in the local environment
2. **Commit your changes** to version control
3. **Deploy to production** (see deployment guide)

### Deployment to VPS

To deploy your changes back to the VPS server:

1. The website runs in a Docker container on Dokploy
2. You'll need to rebuild the Docker image with your changes
3. Contact your system administrator for deployment access

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill the process using port 8080
lsof -i :8080
kill -9 <PID>
```

### Templates not loading
- Check that files exist in `app/internal/templates/`
- Look for error messages in the terminal
- Verify template syntax is correct

### Changes not appearing
- Make sure hot reload is working (check terminal for reload messages)
- Try hard refresh in browser (Cmd+Shift+R on Mac)
- Manually reload templates: http://localhost:8080/admin/reload

## 📞 Support

For questions about the website structure or deployment, refer to the production server documentation or contact your system administrator.

---

**Development Server URLs:**
- Local: http://localhost:8080
- Admin Reload: http://localhost:8080/admin/reload

**Production Server:**
- Public: https://craftaisolutions.com
- VPS: 72.60.28.31 (Dokploy)
- Tailscale: 100.74.10.96