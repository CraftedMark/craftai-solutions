# 🚀 Quick Deployment Reference

## For Claude (AI Assistant)

### MUST DO Before Every Deployment:

```bash
cd ~/Dev/craftai-temp
./scripts/pre-deploy-check.sh
```

❌ **NEVER skip this step**
✅ **Only proceed if all checks pass**

### If Checks Pass, Deploy:

```bash
./scripts/deploy.sh
```

### If Checks Fail:

1. **Read the error messages**
2. **Fix each error:**
   - Missing template? Copy to `internal/templates/`
   - Missing `</main>`? Add before `{{end}}`
   - Missing handler? Create in `internal/handlers/handlers.go`
   - Missing route? Add to `cmd/server/main.go`
3. **Re-run pre-deploy-check.sh**
4. **Repeat until all checks pass**

### When Adding New Pages:

```
1. Create: internal/templates/yourpage.html
   - Must have: {{define "content"}}
   - Must end with: </main> then {{end}}

2. Create: Handler in internal/handlers/handlers.go
   func YourPageHandler(w http.ResponseWriter, r *http.Request) {
       data := TemplateData{...}
       renderTemplate(w, "yourpage", data)
   }

3. Create: Route in cmd/server/main.go
   r.HandleFunc("/yourpage", handlers.YourPageHandler).Methods("GET")

4. Validate: ./scripts/pre-deploy-check.sh

5. Deploy: ./scripts/deploy.sh
```

### Common Mistakes to AVOID:

❌ Creating templates in `app/internal/templates/` (dev only)
✅ Always use `internal/templates/` (production)

❌ Forgetting `</main>` tag before `{{end}}`
✅ Always close `</main>` before `{{end}}`

❌ Creating route without handler
✅ Create handler first, then route

❌ Deploying without validation
✅ ALWAYS run pre-deploy-check.sh first

## For Mark (User)

Just ask Claude:
- "Deploy the changes"
- "Deploy to production"
- "Push to live site"

Claude will handle everything automatically and safely.

---

**See DEPLOYMENT.md for complete documentation**
