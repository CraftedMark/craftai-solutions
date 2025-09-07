const puppeteer = require('puppeteer');

async function configureDokployProject() {
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
    
    // Check if we need to login
    const emailInput = await page.$('input[name="email"]');
    if (emailInput) {
      console.log('Logging in...');
      await page.type('input[name="email"]', 'marktnashed@icloud.com');
      await page.type('input[name="password"]', '12414301');
      
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const loginButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('login') ||
          btn.textContent.toLowerCase().includes('sign in')
        );
        if (loginButton) loginButton.click();
      });
      
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('Looking for CraftaiSolutions project...');
    
    // Click on the CraftaiSolutions project
    await page.evaluate(() => {
      const projectCards = Array.from(document.querySelectorAll('div'));
      const craftaiCard = projectCards.find(div => 
        div.textContent.includes('CraftaiSolutions') || 
        div.textContent.includes('craftai-solutions')
      );
      if (craftaiCard) {
        // Find the closest clickable parent or the card itself
        const clickable = craftaiCard.closest('a') || craftaiCard.closest('[role="button"]') || craftaiCard;
        clickable.click();
        return true;
      }
      // Alternative: look for links
      const links = Array.from(document.querySelectorAll('a'));
      const projectLink = links.find(link => 
        link.textContent.includes('CraftaiSolutions') || 
        link.textContent.includes('craftai-solutions')
      );
      if (projectLink) {
        projectLink.click();
        return true;
      }
      return false;
    });
    
    console.log('Clicked on project, waiting for project page...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take screenshot of project page
    await page.screenshot({ path: 'dokploy-project-page.png' });
    console.log('Project page screenshot saved');
    
    // Look for Application or Service configuration
    const configClicked = await page.evaluate(() => {
      // Look for any service/application to configure
      const elements = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
      const configElement = elements.find(el => {
        const text = el.textContent.toLowerCase();
        return text.includes('application') || 
               text.includes('service') ||
               text.includes('configure') ||
               text.includes('settings') ||
               text.includes('deployment');
      });
      if (configElement) {
        configElement.click();
        return true;
      }
      return false;
    });
    
    if (configClicked) {
      console.log('Clicked on service/application configuration');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Take screenshot of configuration page
      await page.screenshot({ path: 'dokploy-config-page.png' });
      console.log('Configuration page screenshot saved');
      
      // Look for GitHub configuration section
      const githubClicked = await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('button, a, div[role="tab"]'));
        const githubTab = tabs.find(tab => {
          const text = tab.textContent.toLowerCase();
          return text.includes('github') || 
                 text.includes('git') ||
                 text.includes('source') ||
                 text.includes('repository');
        });
        if (githubTab) {
          githubTab.click();
          return true;
        }
        return false;
      });
      
      if (githubClicked) {
        console.log('Clicked on GitHub/Source tab');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fill in GitHub repository URL
        const repoSelectors = [
          'input[name="repository"]',
          'input[name="gitRepository"]',
          'input[placeholder*="github"]',
          'input[placeholder*="repository"]',
          'input[placeholder*="git"]',
          'input[placeholder*="https://"]'
        ];
        
        for (const selector of repoSelectors) {
          try {
            const input = await page.$(selector);
            if (input) {
              await page.evaluate((sel) => {
                document.querySelector(sel).value = '';
              }, selector);
              await page.type(selector, 'https://github.com/CraftedMark/craftai-solutions');
              console.log(`Typed repository URL using selector: ${selector}`);
              break;
            }
          } catch (e) {
            console.log(`Selector ${selector} not found`);
          }
        }
        
        // Set branch to master
        const branchSelectors = [
          'input[name="branch"]',
          'input[name="gitBranch"]',
          'input[placeholder*="branch"]',
          'input[placeholder*="main"]',
          'input[placeholder*="master"]'
        ];
        
        for (const selector of branchSelectors) {
          try {
            const input = await page.$(selector);
            if (input) {
              await page.evaluate((sel) => {
                document.querySelector(sel).value = '';
              }, selector);
              await page.type(selector, 'master');
              console.log(`Typed branch using selector: ${selector}`);
              break;
            }
          } catch (e) {
            console.log(`Selector ${selector} not found`);
          }
        }
        
        // Look for Dockerfile path field
        const dockerfileSelectors = [
          'input[name="dockerfile"]',
          'input[name="dockerfilePath"]',
          'input[placeholder*="Dockerfile"]',
          'input[placeholder*="dockerfile"]'
        ];
        
        for (const selector of dockerfileSelectors) {
          try {
            const input = await page.$(selector);
            if (input) {
              await page.evaluate((sel) => {
                document.querySelector(sel).value = '';
              }, selector);
              await page.type(selector, './Dockerfile');
              console.log(`Typed Dockerfile path using selector: ${selector}`);
              break;
            }
          } catch (e) {
            console.log(`Selector ${selector} not found`);
          }
        }
        
        // Take screenshot before saving
        await page.screenshot({ path: 'dokploy-github-configured.png' });
        console.log('GitHub configuration screenshot saved');
        
        // Save the configuration
        const saved = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const saveButton = buttons.find(btn => {
            const text = btn.textContent.toLowerCase();
            return text.includes('save') || 
                   text.includes('update') ||
                   text.includes('deploy') ||
                   text.includes('apply');
          });
          if (saveButton) {
            saveButton.click();
            return true;
          }
          return false;
        });
        
        if (saved) {
          console.log('Configuration saved!');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Look for deploy button
          const deployed = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const deployButton = buttons.find(btn => {
              const text = btn.textContent.toLowerCase();
              return text.includes('deploy') || 
                     text.includes('redeploy') ||
                     text.includes('build');
            });
            if (deployButton) {
              deployButton.click();
              return true;
            }
            return false;
          });
          
          if (deployed) {
            console.log('Deployment triggered!');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'dokploy-final-config.png' });
    console.log('Final configuration screenshot saved');
    
  } catch (error) {
    console.error('Error during configuration:', error);
    const pages = await browser.pages();
    if (pages.length > 0) {
      await pages[0].screenshot({ path: 'dokploy-error-config.png' });
      console.log('Error screenshot saved');
    }
  } finally {
    console.log('Configuration complete. Check the screenshots.');
    console.log('Browser will remain open for inspection. Press Ctrl+C to exit.');
    
    // Keep browser open for manual inspection
    await new Promise(() => {});
  }
}

// Run the configuration
configureDokployProject().catch(console.error);