(function() {
  'use strict';

  // ---------- locate this script + read config ----------
  var thisScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) return scripts[i];
    }
    return null;
  })();

  function readKey() {
    if (window.FRICTION_BOUNTY_KEY) return window.FRICTION_BOUNTY_KEY;
    if (thisScript) {
      if (thisScript.dataset && thisScript.dataset.key) return thisScript.dataset.key;
      try {
        var u = new URL(thisScript.src, window.location.href);
        var k = u.searchParams.get('key');
        if (k) return k;
      } catch { /* ignore */ }
    }
    return null;
  }

  function readApiBase() {
    if (window.FRICTION_BOUNTY_API_URL) return window.FRICTION_BOUNTY_API_URL;
    if (thisScript) {
      if (thisScript.dataset && thisScript.dataset.api) return thisScript.dataset.api;
      try {
        var u = new URL(thisScript.src, window.location.href);
        return u.origin;
      } catch { /* ignore */ }
    }
    return '';
  }

  var API_KEY = readKey();
  var API_BASE = readApiBase();

  if (!API_KEY) {
    console.warn('[friction-bounty] Missing API key. Add data-key="fb_pk_..." to the script tag.');
    return;
  }

  // ---------- defaults; overridden by /api/widget/config ----------
  var config = {
    primaryColor: '#FFE100',
    position: 'bottom-right',
    welcomeMessage: 'Found an issue? Report it and earn rewards!',
    bountyAmount: '10',
    orgName: '',
  };

  var isOpen = false;
  var screenshotData = null;
  var isSubmitting = false;
  var widgetEl = null;

  function injectStyles() {
    var styles = ''
      + '.fb-widget{position:fixed;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}'
      + '.fb-widget-trigger{position:fixed;' + (config.position === 'bottom-left' ? 'left:20px;' : 'right:20px;') + 'bottom:20px;width:56px;height:56px;background:' + config.primaryColor + ';border:2px solid #000;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:4px 4px 0 0 #000;transition:all .15s ease;}'
      + '.fb-widget-trigger:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 0 #000;}'
      + '.fb-widget-trigger:active{transform:translate(2px,2px);box-shadow:2px 2px 0 0 #000;}'
      + '.fb-widget-trigger svg{width:24px;height:24px;}'
      + '.fb-widget-panel{position:fixed;' + (config.position === 'bottom-left' ? 'left:20px;' : 'right:20px;') + 'bottom:88px;width:360px;max-width:calc(100vw - 40px);max-height:calc(100vh - 120px);background:#fff;border:2px solid #000;box-shadow:4px 4px 0 0 #000;display:none;flex-direction:column;overflow:hidden;}'
      + '.fb-widget-panel.open{display:flex;}'
      + '.fb-widget-header{background:' + config.primaryColor + ';border-bottom:2px solid #000;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;}'
      + '.fb-widget-header h3{margin:0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;font-family:"IBM Plex Mono",monospace;}'
      + '.fb-widget-close{width:28px;height:28px;background:#fff;border:2px solid #000;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;}'
      + '.fb-widget-close:hover{background:#000;color:#fff;}'
      + '.fb-widget-content{padding:16px;overflow-y:auto;flex:1;}'
      + '.fb-widget-welcome{font-size:14px;color:#525252;margin-bottom:16px;line-height:1.5;}'
      + '.fb-widget-bounty{background:' + config.primaryColor + ';border:2px solid #000;padding:8px 12px;font-size:12px;font-weight:600;text-transform:uppercase;display:inline-block;margin-bottom:16px;font-family:"IBM Plex Mono",monospace;}'
      + '.fb-widget-form-group{margin-bottom:12px;}'
      + '.fb-widget-label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;font-family:"IBM Plex Mono",monospace;color:#525252;}'
      + '.fb-widget-input,.fb-widget-textarea,.fb-widget-select{width:100%;padding:8px 10px;border:2px solid #000;background:#fff;font-size:14px;outline:none;font-family:inherit;}'
      + '.fb-widget-input:focus,.fb-widget-textarea:focus,.fb-widget-select:focus{background:' + config.primaryColor + ';}'
      + '.fb-widget-textarea{min-height:80px;resize:vertical;}'
      + '.fb-widget-screenshot-area{border:2px dashed #000;padding:12px;text-align:center;margin-bottom:12px;background:#f5f5f5;}'
      + '.fb-widget-screenshot-preview{max-width:100%;max-height:150px;border:2px solid #000;margin-bottom:8px;}'
      + '.fb-widget-screenshot-btn{background:#fff;border:2px solid #000;padding:8px 16px;font-size:12px;font-weight:600;text-transform:uppercase;cursor:pointer;font-family:"IBM Plex Mono",monospace;box-shadow:2px 2px 0 0 #000;}'
      + '.fb-widget-screenshot-btn:hover{background:' + config.primaryColor + ';}'
      + '.fb-widget-screenshot-btn:disabled{opacity:.5;cursor:not-allowed;}'
      + '.fb-widget-submit{width:100%;background:#000;color:#fff;border:2px solid #000;padding:12px;font-size:14px;font-weight:600;text-transform:uppercase;cursor:pointer;font-family:"IBM Plex Mono",monospace;box-shadow:4px 4px 0 0 #000;transition:all .15s ease;}'
      + '.fb-widget-submit:hover:not(:disabled){background:' + config.primaryColor + ';color:#000;transform:translate(-2px,-2px);box-shadow:6px 6px 0 0 #000;}'
      + '.fb-widget-submit:disabled{opacity:.5;cursor:not-allowed;box-shadow:none;}'
      + '.fb-widget-success{text-align:center;padding:24px 16px;}'
      + '.fb-widget-success h4{margin:0 0 12px;font-size:18px;text-transform:uppercase;font-family:"IBM Plex Mono",monospace;}'
      + '.fb-widget-success p{margin:0;font-size:14px;color:#525252;line-height:1.5;}'
      + '.fb-widget-error{background:#ff3300;color:#fff;padding:8px 12px;font-size:12px;margin-bottom:12px;border:2px solid #000;}'
      + '.fb-widget-loading{display:inline-block;width:16px;height:16px;border:2px solid #000;border-top-color:transparent;border-radius:50%;animation:fb-spin 1s linear infinite;vertical-align:middle;margin-right:8px;}'
      + '@keyframes fb-spin{to{transform:rotate(360deg);}}'
      + '@media (max-width:400px){.fb-widget-panel{width:calc(100vw - 24px);left:12px !important;right:12px !important;}}';
    var el = document.createElement('style');
    el.textContent = styles;
    document.head.appendChild(el);
  }

  function getPageContext() {
    return {
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  }

  function generateFingerprint() {
    try {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      if (!ctx) return 'unknown';
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText(navigator.userAgent + '|' + (navigator.language || ''), 2, 2);
      return canvas.toDataURL().slice(-24);
    } catch {
      return 'unknown';
    }
  }

  function captureScreenshot() {
    return new Promise(function(resolve, reject) {
      if (typeof window.html2canvas !== 'function') {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = function() { doCapture(resolve, reject); };
        script.onerror = function() { reject(new Error('Failed to load screenshot library')); };
        document.head.appendChild(script);
      } else {
        doCapture(resolve, reject);
      }
    });
  }

  function doCapture(resolve, reject) {
    var panel = document.querySelector('.fb-widget-panel');
    var trigger = document.querySelector('.fb-widget-trigger');
    if (panel) panel.style.visibility = 'hidden';
    if (trigger) trigger.style.visibility = 'hidden';

    window.html2canvas(document.body, {
      ignoreElements: function(el) { return el.classList && el.classList.contains('fb-widget'); },
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: 1,
      useCORS: true,
      allowTaint: true,
    }).then(function(canvas) {
      if (panel) panel.style.visibility = '';
      if (trigger) trigger.style.visibility = '';
      resolve(canvas.toDataURL('image/png'));
    }).catch(function(err) {
      if (panel) panel.style.visibility = '';
      if (trigger) trigger.style.visibility = '';
      reject(err);
    });
  }

  function buildWidget() {
    var el = document.createElement('div');
    el.className = 'fb-widget';
    el.innerHTML = ''
      + '<button class="fb-widget-trigger" aria-label="Report an issue">'
      +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      +     '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>'
      +   '</svg>'
      + '</button>'
      + '<div class="fb-widget-panel" role="dialog" aria-label="Submit bug report">'
      +   '<div class="fb-widget-header"><h3>Report Issue</h3><button class="fb-widget-close" aria-label="Close">×</button></div>'
      +   '<div class="fb-widget-content">'
      +     '<form class="fb-widget-form">'
      +       '<div class="fb-widget-bounty">Earn $' + config.bountyAmount + ' credit</div>'
      +       '<p class="fb-widget-welcome">' + config.welcomeMessage + '</p>'
      +       '<div class="fb-widget-form-group"><label class="fb-widget-label">Issue Type</label>'
      +         '<select class="fb-widget-select" name="issueType" required>'
      +           '<option value="">Select type...</option>'
      +           '<option value="bug">Bug / Something broken</option>'
      +           '<option value="ux_confusion">Confusing UX</option>'
      +           '<option value="feature_request">Feature request</option>'
      +         '</select></div>'
      +       '<div class="fb-widget-form-group"><label class="fb-widget-label">Title *</label>'
      +         '<input type="text" class="fb-widget-input" name="title" placeholder="What\'s the issue?" required maxlength="255"></div>'
      +       '<div class="fb-widget-form-group"><label class="fb-widget-label">Description *</label>'
      +         '<textarea class="fb-widget-textarea" name="description" placeholder="Describe what happened and what you expected..." required minlength="10"></textarea></div>'
      +       '<div class="fb-widget-form-group"><label class="fb-widget-label">Email *</label>'
      +         '<input type="email" class="fb-widget-input" name="email" placeholder="your@email.com" required></div>'
      +       '<div class="fb-widget-screenshot-area">'
      +         '<div class="fb-widget-screenshot-preview-container" style="display:none;">'
      +           '<img class="fb-widget-screenshot-preview" alt="Screenshot preview">'
      +           '<button type="button" class="fb-widget-screenshot-btn fb-widget-remove-screenshot">Remove</button>'
      +         '</div>'
      +         '<button type="button" class="fb-widget-screenshot-btn fb-widget-capture-btn">'
      +           '<span class="fb-widget-capture-text">📸 Take Screenshot</span>'
      +         '</button>'
      +       '</div>'
      +       '<button type="submit" class="fb-widget-submit">Submit Report</button>'
      +     '</form>'
      +     '<div class="fb-widget-success" style="display:none;">'
      +       '<h4>✓ Report Submitted</h4>'
      +       '<p>Thanks for helping improve ' + (config.orgName || 'this site') + '. We\'ll review and email you about your reward.</p>'
      +       '<button type="button" class="fb-widget-screenshot-btn fb-widget-new-report" style="margin-top:16px;">Submit Another</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(el);
    return el;
  }

  function wireUp() {
    var trigger = widgetEl.querySelector('.fb-widget-trigger');
    var panel = widgetEl.querySelector('.fb-widget-panel');
    var closeBtn = widgetEl.querySelector('.fb-widget-close');
    var form = widgetEl.querySelector('.fb-widget-form');
    var successMsg = widgetEl.querySelector('.fb-widget-success');
    var captureBtn = widgetEl.querySelector('.fb-widget-capture-btn');
    var previewContainer = widgetEl.querySelector('.fb-widget-screenshot-preview-container');
    var previewImg = widgetEl.querySelector('.fb-widget-screenshot-preview');
    var removeScreenshotBtn = widgetEl.querySelector('.fb-widget-remove-screenshot');
    var newReportBtn = widgetEl.querySelector('.fb-widget-new-report');

    function togglePanel() {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      if (isOpen) {
        var titleInput = panel.querySelector('input[name="title"]');
        if (titleInput) titleInput.focus();
      }
    }

    trigger.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);

    captureBtn.addEventListener('click', function() {
      captureBtn.disabled = true;
      captureBtn.innerHTML = '<span class="fb-widget-loading"></span> Capturing...';
      captureScreenshot().then(function(data) {
        screenshotData = data;
        previewImg.src = data;
        previewContainer.style.display = 'block';
        captureBtn.style.display = 'none';
      }).catch(function() {
        captureBtn.innerHTML = '❌ Failed - Try Again';
      }).finally(function() {
        captureBtn.disabled = false;
      });
    });

    removeScreenshotBtn.addEventListener('click', function() {
      screenshotData = null;
      previewContainer.style.display = 'none';
      captureBtn.style.display = 'inline-block';
      captureBtn.innerHTML = '<span class="fb-widget-capture-text">📸 Take Screenshot</span>';
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (isSubmitting) return;

      var formData = new FormData(form);
      var submitBtn = form.querySelector('.fb-widget-submit');

      isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="fb-widget-loading"></span> Submitting...';

      var existingError = form.querySelector('.fb-widget-error');
      if (existingError) existingError.remove();

      Promise.resolve().then(function() {
        if (!screenshotData) return null;
        return fetch(API_BASE + '/api/upload/presigned', { method: 'POST' })
          .then(function(r) { return r.json(); })
          .then(function(json) {
            return fetch(screenshotData).then(function(r) { return r.blob(); }).then(function(blob) {
              return fetch(json.uploadUrl, {
                method: 'PUT',
                body: blob,
                headers: { 'Content-Type': 'image/png' },
              }).then(function() { return json.publicUrl; });
            });
          });
      }).then(function(screenshotUrl) {
        var ctx = getPageContext();
        return fetch(API_BASE + '/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: API_KEY,
            email: formData.get('email'),
            issueType: formData.get('issueType'),
            title: formData.get('title'),
            description: formData.get('description'),
            screenshotUrl: screenshotUrl || undefined,
            fingerprint: generateFingerprint(),
            pageUrl: ctx.pageUrl,
            referrer: ctx.referrer,
            viewportWidth: ctx.viewportWidth,
            viewportHeight: ctx.viewportHeight,
          }),
        });
      }).then(function(res) {
        return res.json().then(function(j) {
          if (!res.ok) throw new Error(j.error || 'Submission failed');
          form.style.display = 'none';
          successMsg.style.display = 'block';
        });
      }).catch(function(err) {
        var div = document.createElement('div');
        div.className = 'fb-widget-error';
        div.textContent = err.message || 'Failed to submit. Please try again.';
        form.insertBefore(div, form.firstChild);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
        isSubmitting = false;
      });
    });

    newReportBtn.addEventListener('click', function() {
      form.reset();
      screenshotData = null;
      previewContainer.style.display = 'none';
      captureBtn.style.display = 'inline-block';
      captureBtn.innerHTML = '<span class="fb-widget-capture-text">📸 Take Screenshot</span>';
      successMsg.style.display = 'none';
      form.style.display = 'block';
      isSubmitting = false;
      var submitBtn = form.querySelector('.fb-widget-submit');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
    });
  }

  function init() {
    if (document.querySelector('.fb-widget')) return;

    fetch(API_BASE + '/api/widget/config?key=' + encodeURIComponent(API_KEY))
      .then(function(r) {
        if (!r.ok) throw new Error('config fetch failed');
        return r.json();
      })
      .then(function(remote) {
        if (remote && typeof remote === 'object') {
          if (remote.primaryColor) config.primaryColor = remote.primaryColor;
          if (remote.position) config.position = remote.position;
          if (remote.welcomeMessage) config.welcomeMessage = remote.welcomeMessage;
          if (remote.bountyAmount) config.bountyAmount = remote.bountyAmount;
          if (remote.orgName) config.orgName = remote.orgName;
        }
      })
      .catch(function() { /* fall through to defaults */ })
      .finally(function() {
        injectStyles();
        widgetEl = buildWidget();
        wireUp();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
