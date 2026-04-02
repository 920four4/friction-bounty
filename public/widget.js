(function() {
  'use strict';

  // Widget configuration
  const config = {
    apiUrl: window.FRICTION_BOUNTY_API_URL || '',
    primaryColor: window.FRICTION_BOUNTY_COLOR || '#FFE100',
    position: window.FRICTION_BOUNTY_POSITION || 'bottom-right',
    welcomeMessage: window.FRICTION_BOUNTY_MESSAGE || 'Found an issue? Report it and earn rewards!',
    bountyAmount: window.FRICTION_BOUNTY_AMOUNT || '10',
  };

  // State
  let isOpen = false;
  let screenshotData = null;
  let isSubmitting = false;

  // Styles
  const styles = `
    .fb-widget { position: fixed; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .fb-widget-trigger { position: fixed; ${config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'} bottom: 20px; width: 56px; height: 56px; background: ${config.primaryColor}; border: 2px solid #000; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 4px 4px 0 0 #000; transition: all 0.15s ease; }
    .fb-widget-trigger:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 #000; }
    .fb-widget-trigger:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 0 #000; }
    .fb-widget-trigger svg { width: 24px; height: 24px; }
    .fb-widget-panel { position: fixed; ${config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'} bottom: 88px; width: 360px; max-width: calc(100vw - 40px); max-height: calc(100vh - 120px); background: #fff; border: 2px solid #000; box-shadow: 4px 4px 0 0 #000; display: none; flex-direction: column; overflow: hidden; }
    .fb-widget-panel.open { display: flex; }
    .fb-widget-header { background: ${config.primaryColor}; border-bottom: 2px solid #000; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
    .fb-widget-header h3 { margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'IBM Plex Mono', monospace; }
    .fb-widget-close { width: 28px; height: 28px; background: #fff; border: 2px solid #000; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; line-height: 1; }
    .fb-widget-close:hover { background: #000; color: #fff; }
    .fb-widget-content { padding: 16px; overflow-y: auto; flex: 1; }
    .fb-widget-welcome { font-size: 14px; color: #525252; margin-bottom: 16px; line-height: 1.5; }
    .fb-widget-bounty { background: ${config.primaryColor}; border: 2px solid #000; padding: 8px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; display: inline-block; margin-bottom: 16px; font-family: 'IBM Plex Mono', monospace; }
    .fb-widget-form-group { margin-bottom: 12px; }
    .fb-widget-label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-family: 'IBM Plex Mono', monospace; color: #525252; }
    .fb-widget-input, .fb-widget-textarea, .fb-widget-select { width: 100%; padding: 8px 10px; border: 2px solid #000; background: #fff; font-size: 14px; outline: none; font-family: inherit; }
    .fb-widget-input:focus, .fb-widget-textarea:focus, .fb-widget-select:focus { background: ${config.primaryColor}; }
    .fb-widget-textarea { min-height: 80px; resize: vertical; }
    .fb-widget-screenshot-area { border: 2px dashed #000; padding: 12px; text-align: center; margin-bottom: 12px; background: #f5f5f5; }
    .fb-widget-screenshot-preview { max-width: 100%; max-height: 150px; border: 2px solid #000; margin-bottom: 8px; }
    .fb-widget-screenshot-btn { background: #fff; border: 2px solid #000; padding: 8px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; cursor: pointer; font-family: 'IBM Plex Mono', monospace; box-shadow: 2px 2px 0 0 #000; }
    .fb-widget-screenshot-btn:hover { background: ${config.primaryColor}; }
    .fb-widget-screenshot-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .fb-widget-submit { width: 100%; background: #000; color: #fff; border: 2px solid #000; padding: 12px; font-size: 14px; font-weight: 600; text-transform: uppercase; cursor: pointer; font-family: 'IBM Plex Mono', monospace; box-shadow: 4px 4px 0 0 #000; transition: all 0.15s ease; }
    .fb-widget-submit:hover:not(:disabled) { background: ${config.primaryColor}; color: #000; transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 #000; }
    .fb-widget-submit:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
    .fb-widget-success { text-align: center; padding: 24px 16px; }
    .fb-widget-success h4 { margin: 0 0 12px; font-size: 18px; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; }
    .fb-widget-success p { margin: 0; font-size: 14px; color: #525252; line-height: 1.5; }
    .fb-widget-error { background: #ff3300; color: #fff; padding: 8px 12px; font-size: 12px; margin-bottom: 12px; border: 2px solid #000; }
    .fb-widget-loading { display: inline-block; width: 16px; height: 16px; border: 2px solid #000; border-top-color: transparent; border-radius: 50%; animation: fb-spin 1s linear infinite; vertical-align: middle; margin-right: 8px; }
    @keyframes fb-spin { to { transform: rotate(360deg); } }
    @media (max-width: 400px) { .fb-widget-panel { width: calc(100vw - 24px); left: 12px !important; right: 12px !important; } }
  `;

  // Inject styles
  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Get page context
  function getPageContext() {
    return {
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  }

  // Generate fingerprint
  function generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unknown';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText(Date.now().toString(), 2, 2);
    return canvas.toDataURL().slice(-16);
  }

  // Capture screenshot using html2canvas approach
  async function captureScreenshot() {
    return new Promise((resolve, reject) => {
      // Check if html2canvas is available
      if (typeof html2canvas !== 'function') {
        // Load html2canvas dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => doCapture(resolve, reject);
        script.onerror = () => reject(new Error('Failed to load screenshot library'));
        document.head.appendChild(script);
      } else {
        doCapture(resolve, reject);
      }
    });
  }

  async function doCapture(resolve, reject) {
    try {
      // Hide widget temporarily
      const panel = document.querySelector('.fb-widget-panel');
      const trigger = document.querySelector('.fb-widget-trigger');
      if (panel) panel.style.visibility = 'hidden';
      if (trigger) trigger.style.visibility = 'hidden';

      // Capture viewport
      const canvas = await html2canvas(document.body, {
        ignoreElements: (el) => el.classList?.contains('fb-widget'),
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        x: window.scrollX,
        y: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
        scale: 1,
        useCORS: true,
        allowTaint: true,
      });

      // Show widget again
      if (panel) panel.style.visibility = '';
      if (trigger) trigger.style.visibility = '';

      resolve(canvas.toDataURL('image/png'));
    } catch (err) {
      reject(err);
    }
  }

  // Create widget DOM
  function createWidget() {
    const widget = document.createElement('div');
    widget.className = 'fb-widget';
    widget.innerHTML = `
      <button class="fb-widget-trigger" aria-label="Report an issue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      </button>
      <div class="fb-widget-panel" role="dialog" aria-label="Submit bug report">
        <div class="fb-widget-header">
          <h3>Report Issue</h3>
          <button class="fb-widget-close" aria-label="Close">×</button>
        </div>
        <div class="fb-widget-content">
          <form class="fb-widget-form">
            <div class="fb-widget-bounty">Earn $${config.bountyAmount} credit</div>
            <p class="fb-widget-welcome">${config.welcomeMessage}</p>
            
            <div class="fb-widget-form-group">
              <label class="fb-widget-label">Issue Type</label>
              <select class="fb-widget-select" name="issueType" required>
                <option value="">Select type...</option>
                <option value="bug">Bug / Something broken</option>
                <option value="ux_confusion">Confusing UX</option>
                <option value="feature_request">Feature request</option>
              </select>
            </div>
            
            <div class="fb-widget-form-group">
              <label class="fb-widget-label">Title *</label>
              <input type="text" class="fb-widget-input" name="title" placeholder="What's the issue?" required maxlength="255">
            </div>
            
            <div class="fb-widget-form-group">
              <label class="fb-widget-label">Description *</label>
              <textarea class="fb-widget-textarea" name="description" placeholder="Describe what happened and what you expected..." required minlength="10"></textarea>
            </div>
            
            <div class="fb-widget-form-group">
              <label class="fb-widget-label">Email *</label>
              <input type="email" class="fb-widget-input" name="email" placeholder="your@email.com" required>
            </div>
            
            <div class="fb-widget-screenshot-area">
              <div class="fb-widget-screenshot-preview-container" style="display: none;">
                <img class="fb-widget-screenshot-preview" alt="Screenshot preview">
                <button type="button" class="fb-widget-screenshot-btn fb-widget-remove-screenshot">Remove</button>
              </div>
              <button type="button" class="fb-widget-screenshot-btn fb-widget-capture-btn">
                <span class="fb-widget-capture-text">📸 Take Screenshot</span>
              </button>
            </div>
            
            <button type="submit" class="fb-widget-submit">Submit Report</button>
          </form>
          <div class="fb-widget-success" style="display: none;">
            <h4>✓ Report Submitted</h4>
            <p>Thanks for helping us improve! We'll review your report and send your reward via email.</p>
            <button type="button" class="fb-widget-screenshot-btn fb-widget-new-report" style="margin-top: 16px;">Submit Another</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
    return widget;
  }

  // Initialize widget
  function init() {
    if (document.querySelector('.fb-widget')) return;
    
    injectStyles();
    const widget = createWidget();
    
    const trigger = widget.querySelector('.fb-widget-trigger');
    const panel = widget.querySelector('.fb-widget-panel');
    const closeBtn = widget.querySelector('.fb-widget-close');
    const form = widget.querySelector('.fb-widget-form');
    const successMsg = widget.querySelector('.fb-widget-success');
    const captureBtn = widget.querySelector('.fb-widget-capture-btn');
    const previewContainer = widget.querySelector('.fb-widget-screenshot-preview-container');
    const previewImg = widget.querySelector('.fb-widget-screenshot-preview');
    const removeScreenshotBtn = widget.querySelector('.fb-widget-remove-screenshot');
    const newReportBtn = widget.querySelector('.fb-widget-new-report');

    // Toggle panel
    function togglePanel() {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      if (isOpen) {
        panel.querySelector('input[name="title"]')?.focus();
      }
    }

    trigger.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);

    // Capture screenshot
    captureBtn.addEventListener('click', async () => {
      captureBtn.disabled = true;
      captureBtn.innerHTML = '<span class="fb-widget-loading"></span> Capturing...';
      
      try {
        screenshotData = await captureScreenshot();
        previewImg.src = screenshotData;
        previewContainer.style.display = 'block';
        captureBtn.style.display = 'none';
      } catch (err) {
        console.error('Screenshot failed:', err);
        captureBtn.innerHTML = '❌ Failed - Try Again';
      } finally {
        captureBtn.disabled = false;
      }
    });

    // Remove screenshot
    removeScreenshotBtn.addEventListener('click', () => {
      screenshotData = null;
      previewContainer.style.display = 'none';
      captureBtn.style.display = 'inline-block';
      captureBtn.innerHTML = '<span class="fb-widget-capture-text">📸 Take Screenshot</span>';
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const formData = new FormData(form);
      const submitBtn = form.querySelector('.fb-widget-submit');
      
      isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="fb-widget-loading"></span> Submitting...';

      // Remove any existing error messages
      const existingError = form.querySelector('.fb-widget-error');
      if (existingError) existingError.remove();

      try {
        // Upload screenshot if present
        let screenshotUrl = null;
        if (screenshotData) {
          const blob = await fetch(screenshotData).then(r => r.blob());
          const uploadRes = await fetch(`${config.apiUrl}/api/upload/presigned`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const { uploadUrl, publicUrl } = await uploadRes.json();
          await fetch(uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': 'image/png' },
          });
          screenshotUrl = publicUrl;
        }

        // Submit report
        const context = getPageContext();
        const res = await fetch(`${config.apiUrl}/api/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.get('email'),
            issueType: formData.get('issueType'),
            title: formData.get('title'),
            description: formData.get('description'),
            screenshotUrl,
            fingerprint: generateFingerprint(),
            ...context,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Submission failed');
        }

        // Show success
        form.style.display = 'none';
        successMsg.style.display = 'block';

      } catch (err) {
        console.error('Submit failed:', err);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fb-widget-error';
        errorDiv.textContent = err.message || 'Failed to submit. Please try again.';
        form.insertBefore(errorDiv, form.firstChild);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
        isSubmitting = false;
      }
    });

    // New report
    newReportBtn.addEventListener('click', () => {
      form.reset();
      screenshotData = null;
      previewContainer.style.display = 'none';
      captureBtn.style.display = 'inline-block';
      captureBtn.innerHTML = '<span class="fb-widget-capture-text">📸 Take Screenshot</span>';
      successMsg.style.display = 'none';
      form.style.display = 'block';
      isSubmitting = false;
      const submitBtn = form.querySelector('.fb-widget-submit');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
    });
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
