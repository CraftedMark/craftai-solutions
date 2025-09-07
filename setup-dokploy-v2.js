const puppeteer = require('puppeteer');

async function setupDokploy() {
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see what's happening
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    console.log('Navigating to Dokploy...');
    
    // Navigate to Dokploy
    await page.goto('http://72.60.28.31:3000', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a bit for page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if we're on login page or dashboard
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Take initial screenshot
    await page.screenshot({ path: 'dokploy-initial.png' });
    console.log('Initial screenshot saved');
    
    // If we see a login form, try to login
    const emailInput = await page.$('input[name="email"]');
    if (emailInput) {
      console.log('Found login form, logging in...');
      
      await page.type('input[name="email"]', 'marktnashed@icloud.com');
      await page.type('input[name="password"]', '12414301');
      
      // Find and click the login button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const loginButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('login') ||
          btn.textContent.toLowerCase().includes('sign in')
        );
        if (loginButton) {
          console.log('Clicking login button:', loginButton.textContent);
          loginButton.click();
        }
      });
      
      // Wait for navigation after login
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {
        console.log('Navigation timeout, continuing...');
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('After login URL:', page.url());
    }
    
    // Take screenshot after login
    await page.screenshot({ path: 'dokploy-after-login.png' });
    console.log('After login screenshot saved');
    
    // Check if we're now on the projects page
    if (page.url().includes('projects')) {
      console.log('On projects page, looking for Create Project button...');
      
      // Wait for the page to stabilize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to find and click Create Project button
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const createButton = buttons.find(btn => 
          btn.textContent.includes('Create Project') ||
          btn.textContent.includes('New Project') ||
          btn.textContent.includes('Add Project')
        );
        if (createButton) {
          console.log('Found Create Project button:', createButton.textContent);
          createButton.click();
          return true;
        }
        return false;
      });
      
      if (clicked) {
        console.log('Clicked Create Project button');
        
        // Wait for modal to appear
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Take screenshot of the create project modal
        await page.screenshot({ path: 'dokploy-create-modal.png' });
        console.log('Create modal screenshot saved');
        
        // Try to fill in the form
        // Look for any input fields in the modal
        const inputs = await page.$$eval('input', inputs => 
          inputs.map(input => ({
            name: input.name || '',
            placeholder: input.placeholder || '',
            type: input.type || '',
            id: input.id || ''
          }))
        );
        
        console.log('Found input fields:', JSON.stringify(inputs, null, 2));
        
        // Try different selectors for the project name
        const nameSelectors = [
          'input[name="name"]',
          'input[placeholder*="name"]',
          'input[placeholder*="Name"]',
          'input[id*="name"]',
          'input[type="text"]:first-of-type'
        ];
        
        for (const selector of nameSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            await page.type(selector, 'craftai-solutions');
            console.log(`Typed project name using selector: ${selector}`);
            break;
          } catch (e) {
            console.log(`Selector ${selector} not found`);
          }
        }
        
        // Look for repository URL field
        const repoSelectors = [
          'input[name="repository"]',
          'input[placeholder*="github"]',
          'input[placeholder*="repository"]',
          'input[placeholder*="git"]',
          'input[placeholder*="url"]',
          'input[placeholder*="URL"]'
        ];
        
        for (const selector of repoSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            await page.type(selector, 'https://github.com/CraftedMark/craftai-solutions');
            console.log(`Typed repository URL using selector: ${selector}`);
            break;
          } catch (e) {
            console.log(`Selector ${selector} not found`);
          }
        }
        
        // Try to set branch
        const branchSelectors = [
          'input[name="branch"]',
          'input[placeholder*="branch"]',
          'input[placeholder*="Branch"]'
        ];
        
        for (const selector of branchSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            await page.type(selector, 'master');
            console.log(`Typed branch using selector: ${selector}`);
            break;
          } catch (e) {
            console.log(`Selector ${selector} not found`);
          }
        }
        
        // Take screenshot before submitting
        await page.screenshot({ path: 'dokploy-form-filled.png' });
        console.log('Form filled screenshot saved');
        
        // Try to find and click the create/submit button
        const submitted = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const submitButton = buttons.find(btn => {
            const text = btn.textContent.toLowerCase();
            return text.includes('create') || 
                   text.includes('save') || 
                   text.includes('deploy') ||
                   text.includes('submit') ||
                   text.includes('add');
          });
          if (submitButton) {
            console.log('Found submit button:', submitButton.textContent);
            submitButton.click();
            return true;
          }
          return false;
        });
        
        if (submitted) {
          console.log('Submitted the form');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Take final screenshot
          await page.screenshot({ path: 'dokploy-final.png' });
          console.log('Final screenshot saved');
        }
      }
    }
    
  } catch (error) {
    console.error('Error during setup:', error);
    // Take error screenshot
    const pages = await browser.pages();
    if (pages.length > 0) {
      await pages[0].screenshot({ path: 'dokploy-error.png' });
      console.log('Error screenshot saved');
    }
  } finally {
    console.log('Setup complete. Check the screenshots to see what happened.');
    console.log('Browser will remain open for inspection. Press Ctrl+C to exit.');
    
    // Keep browser open for manual inspection
    await new Promise(() => {}); // This will keep the script running
  }
}

// Run the setup
setupDokploy().catch(console.error);