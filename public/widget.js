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

  var STROKE_COLOR = '#FF3300';
  var STROKE_WIDTH = 4;
  var BLUR_RADIUS = 12;

  var state = {
    isOpen: false,
    view: 'form', // 'form' | 'editor' | 'success'
    isSubmitting: false,
    sourceImage: null, // HTMLImageElement of the raw screenshot
    annotations: [],   // array of {type, x1, y1, x2, y2}
    currentTool: 'arrow',
    drawing: null,     // current in-progress annotation
    finalDataUrl: null, // composited PNG (set when leaving editor)
  };

  var widgetEl = null;

  function injectStyles() {
    var styles = ''
      + '.fb-widget{position:fixed;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}'
      + '.fb-widget-trigger{position:fixed;' + (config.position === 'bottom-left' ? 'left:20px;' : 'right:20px;') + 'bottom:20px;width:56px;height:56px;background:' + config.primaryColor + ';border:2px solid #000;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:4px 4px 0 0 #000;transition:all .15s ease;}'
      + '.fb-widget-trigger:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 0 #000;}'
      + '.fb-widget-trigger:active{transform:translate(2px,2px);box-shadow:2px 2px 0 0 #000;}'
      + '.fb-widget-trigger svg{width:24px;height:24px;}'
      + '.fb-widget-panel{position:fixed;' + (config.position === 'bottom-left' ? 'left:20px;' : 'right:20px;') + 'bottom:88px;width:380px;max-width:calc(100vw - 40px);max-height:calc(100vh - 120px);background:#fff;border:2px solid #000;box-shadow:4px 4px 0 0 #000;display:none;flex-direction:column;overflow:hidden;}'
      + '.fb-widget-panel.open{display:flex;}'
      + '.fb-widget-panel.editor{width:560px;}'
      + '.fb-widget-header{background:' + config.primaryColor + ';border-bottom:2px solid #000;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}'
      + '.fb-widget-header h3{margin:0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;font-family:"IBM Plex Mono",monospace;}'
      + '.fb-widget-close{width:28px;height:28px;background:#fff;border:2px solid #000;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;}'
      + '.fb-widget-close:hover{background:#000;color:#fff;}'
      + '.fb-widget-content{padding:16px;overflow-y:auto;flex:1;}'
      + '.fb-widget-welcome{font-size:14px;color:#525252;margin-bottom:14px;line-height:1.5;}'
      + '.fb-widget-bounty{background:' + config.primaryColor + ';border:2px solid #000;padding:8px 12px;font-size:12px;font-weight:600;text-transform:uppercase;display:inline-block;margin-bottom:14px;font-family:"IBM Plex Mono",monospace;}'
      + '.fb-widget-form-group{margin-bottom:12px;}'
      + '.fb-widget-label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;font-family:"IBM Plex Mono",monospace;color:#525252;}'
      + '.fb-widget-input,.fb-widget-textarea,.fb-widget-select{width:100%;padding:8px 10px;border:2px solid #000;background:#fff;font-size:14px;outline:none;font-family:inherit;box-sizing:border-box;}'
      + '.fb-widget-input:focus,.fb-widget-textarea:focus,.fb-widget-select:focus{background:' + config.primaryColor + ';}'
      + '.fb-widget-textarea{min-height:70px;resize:vertical;}'
      + '.fb-widget-capture-cta{width:100%;border:2px dashed #000;padding:18px;text-align:center;background:#fafafa;cursor:pointer;font-family:"IBM Plex Mono",monospace;font-size:13px;font-weight:600;text-transform:uppercase;margin-bottom:12px;transition:background .15s ease;}'
      + '.fb-widget-capture-cta:hover{background:' + config.primaryColor + ';}'
      + '.fb-widget-capture-cta:disabled{opacity:.5;cursor:not-allowed;}'
      + '.fb-widget-thumb-container{position:relative;border:2px solid #000;margin-bottom:12px;background:#f5f5f5;}'
      + '.fb-widget-thumb{display:block;width:100%;height:auto;max-height:200px;object-fit:contain;}'
      + '.fb-widget-thumb-actions{position:absolute;top:6px;right:6px;display:flex;gap:6px;}'
      + '.fb-widget-thumb-action{background:#fff;border:2px solid #000;padding:4px 8px;font-size:11px;font-family:"IBM Plex Mono",monospace;cursor:pointer;text-transform:uppercase;font-weight:600;}'
      + '.fb-widget-thumb-action:hover{background:' + config.primaryColor + ';}'
      + '.fb-widget-submit{width:100%;background:#000;color:#fff;border:2px solid #000;padding:12px;font-size:14px;font-weight:600;text-transform:uppercase;cursor:pointer;font-family:"IBM Plex Mono",monospace;box-shadow:4px 4px 0 0 #000;transition:all .15s ease;}'
      + '.fb-widget-submit:hover:not(:disabled){background:' + config.primaryColor + ';color:#000;transform:translate(-2px,-2px);box-shadow:6px 6px 0 0 #000;}'
      + '.fb-widget-submit:disabled{opacity:.5;cursor:not-allowed;box-shadow:none;}'
      + '.fb-widget-success{text-align:center;padding:24px 16px;}'
      + '.fb-widget-success h4{margin:0 0 12px;font-size:18px;text-transform:uppercase;font-family:"IBM Plex Mono",monospace;}'
      + '.fb-widget-success p{margin:0;font-size:14px;color:#525252;line-height:1.5;}'
      + '.fb-widget-error{background:#ff3300;color:#fff;padding:8px 12px;font-size:12px;margin-bottom:12px;border:2px solid #000;}'
      + '.fb-widget-loading{display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:fb-spin 1s linear infinite;vertical-align:middle;margin-right:8px;}'
      + '@keyframes fb-spin{to{transform:rotate(360deg);}}'
      // editor styles
      + '.fb-editor{display:flex;flex-direction:column;height:100%;}'
      + '.fb-editor-toolbar{display:flex;gap:6px;padding:8px;border-bottom:2px solid #000;background:#fafafa;flex-wrap:wrap;align-items:center;}'
      + '.fb-tool-btn{border:2px solid #000;background:#fff;padding:6px 10px;font-size:12px;font-family:"IBM Plex Mono",monospace;font-weight:600;cursor:pointer;text-transform:uppercase;display:inline-flex;align-items:center;gap:4px;}'
      + '.fb-tool-btn:hover{background:' + config.primaryColor + ';}'
      + '.fb-tool-btn.active{background:#000;color:#fff;}'
      + '.fb-tool-spacer{flex:1;}'
      + '.fb-canvas-wrap{position:relative;background:#222;display:flex;align-items:center;justify-content:center;overflow:hidden;flex:1;min-height:280px;max-height:60vh;}'
      + '.fb-canvas-wrap canvas{display:block;max-width:100%;max-height:100%;cursor:crosshair;touch-action:none;}'
      + '.fb-editor-footer{padding:10px;border-top:2px solid #000;display:flex;gap:8px;background:#fff;}'
      + '.fb-editor-footer button{flex:1;border:2px solid #000;padding:10px;font-family:"IBM Plex Mono",monospace;font-size:12px;font-weight:600;text-transform:uppercase;cursor:pointer;}'
      + '.fb-editor-footer .fb-secondary{background:#fff;}'
      + '.fb-editor-footer .fb-secondary:hover{background:#eee;}'
      + '.fb-editor-footer .fb-primary{background:#000;color:#fff;}'
      + '.fb-editor-footer .fb-primary:hover{background:' + config.primaryColor + ';color:#000;}'
      + '@media (max-width:600px){.fb-widget-panel.editor{width:calc(100vw - 24px);}}'
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

  // ---------- screenshot capture (lazy-loads html2canvas) ----------

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

    // Tiny delay so the visibility change applies before capture
    setTimeout(function() {
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
    }, 80);
  }

  // ---------- annotation rendering ----------

  function renderAnnotations(canvas, image, annotations, inProgress) {
    var ctx = canvas.getContext('2d');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);

    var all = annotations.slice();
    if (inProgress) all.push(inProgress);

    for (var i = 0; i < all.length; i++) {
      var a = all[i];
      if (a.type === 'arrow') drawArrow(ctx, a);
      else if (a.type === 'rect') drawRect(ctx, a);
      else if (a.type === 'blur') drawBlur(ctx, image, a);
    }
  }

  function drawArrow(ctx, a) {
    ctx.save();
    ctx.strokeStyle = STROKE_COLOR;
    ctx.fillStyle = STROKE_COLOR;
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x1, a.y1);
    ctx.lineTo(a.x2, a.y2);
    ctx.stroke();

    var headLen = 18;
    var angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
    ctx.beginPath();
    ctx.moveTo(a.x2, a.y2);
    ctx.lineTo(a.x2 - headLen * Math.cos(angle - Math.PI / 6), a.y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(a.x2 - headLen * Math.cos(angle + Math.PI / 6), a.y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawRect(ctx, a) {
    ctx.save();
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = STROKE_WIDTH;
    var x = Math.min(a.x1, a.x2);
    var y = Math.min(a.y1, a.y2);
    var w = Math.abs(a.x2 - a.x1);
    var h = Math.abs(a.y2 - a.y1);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  function drawBlur(ctx, image, a) {
    var x = Math.min(a.x1, a.x2);
    var y = Math.min(a.y1, a.y2);
    var w = Math.abs(a.x2 - a.x1);
    var h = Math.abs(a.y2 - a.y1);
    if (w < 4 || h < 4) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.filter = 'blur(' + BLUR_RADIUS + 'px)';
    ctx.drawImage(image, 0, 0);
    ctx.restore();
    // Border so the blur region is visibly intentional
    ctx.save();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  // ---------- DOM ----------

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
      +   '<div class="fb-widget-header"><h3 class="fb-widget-title">Report Issue</h3><button class="fb-widget-close" aria-label="Close">×</button></div>'
      +   '<div class="fb-widget-body"></div>'
      + '</div>';
    document.body.appendChild(el);
    return el;
  }

  function renderForm() {
    var body = widgetEl.querySelector('.fb-widget-body');
    var thumbHtml = state.finalDataUrl
      ? ''
        + '<div class="fb-widget-thumb-container">'
        +   '<img class="fb-widget-thumb" src="' + state.finalDataUrl + '" alt="Annotated screenshot">'
        +   '<div class="fb-widget-thumb-actions">'
        +     '<button type="button" class="fb-widget-thumb-action fb-edit-btn">Edit</button>'
        +     '<button type="button" class="fb-widget-thumb-action fb-remove-btn">×</button>'
        +   '</div>'
        + '</div>'
      : ''
        + '<button type="button" class="fb-widget-capture-cta fb-capture-btn">'
        +   '📸 Capture & annotate screenshot'
        + '</button>';

    body.innerHTML = ''
      + '<div class="fb-widget-content">'
      +   '<form class="fb-widget-form">'
      +     '<div class="fb-widget-bounty">Earn $' + config.bountyAmount + ' credit</div>'
      +     '<p class="fb-widget-welcome">' + escapeHtml(config.welcomeMessage) + '</p>'
      +     thumbHtml
      +     '<div class="fb-widget-form-group"><label class="fb-widget-label">Issue Type</label>'
      +       '<select class="fb-widget-select" name="issueType" required>'
      +         '<option value="">Select type...</option>'
      +         '<option value="bug">Bug / Something broken</option>'
      +         '<option value="ux_confusion">Confusing UX</option>'
      +         '<option value="feature_request">Feature request</option>'
      +       '</select></div>'
      +     '<div class="fb-widget-form-group"><label class="fb-widget-label">Title *</label>'
      +       '<input type="text" class="fb-widget-input" name="title" placeholder="What\'s the issue?" required maxlength="255"></div>'
      +     '<div class="fb-widget-form-group"><label class="fb-widget-label">Description *</label>'
      +       '<textarea class="fb-widget-textarea" name="description" placeholder="Describe what happened and what you expected..." required minlength="10"></textarea></div>'
      +     '<div class="fb-widget-form-group"><label class="fb-widget-label">Email *</label>'
      +       '<input type="email" class="fb-widget-input" name="email" placeholder="your@email.com" required></div>'
      +     '<button type="submit" class="fb-widget-submit">Submit Report</button>'
      +   '</form>'
      + '</div>';

    widgetEl.querySelector('.fb-widget-panel').classList.remove('editor');
    widgetEl.querySelector('.fb-widget-title').textContent = 'Report Issue';

    var captureBtn = body.querySelector('.fb-capture-btn');
    if (captureBtn) captureBtn.addEventListener('click', startCapture);
    var editBtn = body.querySelector('.fb-edit-btn');
    if (editBtn) editBtn.addEventListener('click', enterEditor);
    var removeBtn = body.querySelector('.fb-remove-btn');
    if (removeBtn) removeBtn.addEventListener('click', clearScreenshot);

    body.querySelector('.fb-widget-form').addEventListener('submit', handleSubmit);
  }

  function renderEditor() {
    var body = widgetEl.querySelector('.fb-widget-body');
    body.innerHTML = ''
      + '<div class="fb-editor">'
      +   '<div class="fb-editor-toolbar">'
      +     '<button type="button" class="fb-tool-btn" data-tool="arrow">→ Arrow</button>'
      +     '<button type="button" class="fb-tool-btn" data-tool="rect">▭ Box</button>'
      +     '<button type="button" class="fb-tool-btn" data-tool="blur">▓ Blur</button>'
      +     '<div class="fb-tool-spacer"></div>'
      +     '<button type="button" class="fb-tool-btn fb-undo-btn">↶ Undo</button>'
      +     '<button type="button" class="fb-tool-btn fb-clear-btn">Clear</button>'
      +   '</div>'
      +   '<div class="fb-canvas-wrap"><canvas class="fb-edit-canvas"></canvas></div>'
      +   '<div class="fb-editor-footer">'
      +     '<button type="button" class="fb-secondary fb-cancel-btn">Cancel</button>'
      +     '<button type="button" class="fb-primary fb-done-btn">Use this screenshot</button>'
      +   '</div>'
      + '</div>';

    widgetEl.querySelector('.fb-widget-panel').classList.add('editor');
    widgetEl.querySelector('.fb-widget-title').textContent = 'Annotate';

    var canvas = body.querySelector('.fb-edit-canvas');
    renderAnnotations(canvas, state.sourceImage, state.annotations, null);
    setActiveTool(state.currentTool);

    body.querySelectorAll('.fb-tool-btn[data-tool]').forEach(function(btn) {
      btn.addEventListener('click', function() { setActiveTool(btn.dataset.tool); });
    });
    body.querySelector('.fb-undo-btn').addEventListener('click', function() {
      state.annotations.pop();
      renderAnnotations(canvas, state.sourceImage, state.annotations, null);
    });
    body.querySelector('.fb-clear-btn').addEventListener('click', function() {
      state.annotations = [];
      renderAnnotations(canvas, state.sourceImage, state.annotations, null);
    });
    body.querySelector('.fb-cancel-btn').addEventListener('click', function() {
      // Discard edits to annotations? Keep them — just go back without flattening if nothing changed.
      flattenAndReturnToForm();
    });
    body.querySelector('.fb-done-btn').addEventListener('click', flattenAndReturnToForm);

    wireCanvasInput(canvas);
  }

  function setActiveTool(tool) {
    state.currentTool = tool;
    widgetEl.querySelectorAll('.fb-tool-btn[data-tool]').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
  }

  function wireCanvasInput(canvas) {
    function toImageCoords(e) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }

    canvas.addEventListener('pointerdown', function(e) {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      var p = toImageCoords(e);
      state.drawing = { type: state.currentTool, x1: p.x, y1: p.y, x2: p.x, y2: p.y };
    });

    canvas.addEventListener('pointermove', function(e) {
      if (!state.drawing) return;
      e.preventDefault();
      var p = toImageCoords(e);
      state.drawing.x2 = p.x;
      state.drawing.y2 = p.y;
      renderAnnotations(canvas, state.sourceImage, state.annotations, state.drawing);
    });

    function endStroke(e) {
      if (!state.drawing) return;
      var p = toImageCoords(e);
      state.drawing.x2 = p.x;
      state.drawing.y2 = p.y;
      // Drop micro-strokes
      var dx = state.drawing.x2 - state.drawing.x1;
      var dy = state.drawing.y2 - state.drawing.y1;
      if (dx * dx + dy * dy > 16) {
        state.annotations.push(state.drawing);
      }
      state.drawing = null;
      renderAnnotations(canvas, state.sourceImage, state.annotations, null);
    }
    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);
  }

  function flattenAndReturnToForm() {
    if (state.sourceImage) {
      var canvas = document.createElement('canvas');
      renderAnnotations(canvas, state.sourceImage, state.annotations, null);
      state.finalDataUrl = canvas.toDataURL('image/png');
    }
    state.view = 'form';
    renderForm();
  }

  function clearScreenshot() {
    state.sourceImage = null;
    state.annotations = [];
    state.finalDataUrl = null;
    renderForm();
  }

  function startCapture() {
    var cta = widgetEl.querySelector('.fb-capture-btn');
    if (cta) {
      cta.disabled = true;
      cta.innerHTML = '<span class="fb-widget-loading"></span> Capturing...';
    }
    captureScreenshot().then(function(dataUrl) {
      var img = new Image();
      img.onload = function() {
        state.sourceImage = img;
        state.annotations = [];
        state.finalDataUrl = null;
        state.view = 'editor';
        renderEditor();
      };
      img.onerror = function() {
        if (cta) {
          cta.disabled = false;
          cta.innerHTML = '❌ Capture failed — try again';
        }
      };
      img.src = dataUrl;
    }).catch(function() {
      if (cta) {
        cta.disabled = false;
        cta.innerHTML = '❌ Capture failed — try again';
      }
    });
  }

  function renderSuccess() {
    var body = widgetEl.querySelector('.fb-widget-body');
    body.innerHTML = ''
      + '<div class="fb-widget-content">'
      +   '<div class="fb-widget-success">'
      +     '<h4>✓ Report Submitted</h4>'
      +     '<p>Thanks for helping improve ' + escapeHtml(config.orgName || 'this product') + '. We\'ll review and email you about your reward.</p>'
      +     '<button type="button" class="fb-widget-thumb-action fb-new-report" style="margin-top:16px;">Submit another</button>'
      +   '</div>'
      + '</div>';

    widgetEl.querySelector('.fb-widget-panel').classList.remove('editor');
    widgetEl.querySelector('.fb-widget-title').textContent = 'Done';

    body.querySelector('.fb-new-report').addEventListener('click', function() {
      state.sourceImage = null;
      state.annotations = [];
      state.finalDataUrl = null;
      state.view = 'form';
      state.isSubmitting = false;
      renderForm();
    });
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s == null ? '' : String(s);
    return div.innerHTML;
  }

  // ---------- submit ----------

  function handleSubmit(e) {
    e.preventDefault();
    if (state.isSubmitting) return;

    var form = e.currentTarget;
    var formData = new FormData(form);
    var submitBtn = form.querySelector('.fb-widget-submit');

    state.isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="fb-widget-loading"></span> Submitting...';

    var existingError = form.querySelector('.fb-widget-error');
    if (existingError) existingError.remove();

    Promise.resolve().then(function() {
      if (!state.finalDataUrl) return null;
      return fetch(API_BASE + '/api/upload/presigned', { method: 'POST' })
        .then(function(r) { return r.json(); })
        .then(function(json) {
          return fetch(state.finalDataUrl).then(function(r) { return r.blob(); }).then(function(blob) {
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
        state.view = 'success';
        renderSuccess();
      });
    }).catch(function(err) {
      var div = document.createElement('div');
      div.className = 'fb-widget-error';
      div.textContent = err.message || 'Failed to submit. Please try again.';
      form.insertBefore(div, form.firstChild);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
      state.isSubmitting = false;
    });
  }

  function enterEditor() {
    if (!state.sourceImage) return;
    state.view = 'editor';
    renderEditor();
  }

  // ---------- init ----------

  function togglePanel() {
    state.isOpen = !state.isOpen;
    var panel = widgetEl.querySelector('.fb-widget-panel');
    panel.classList.toggle('open', state.isOpen);
    if (state.isOpen && state.view === 'form') {
      var titleInput = panel.querySelector('input[name="title"]');
      if (titleInput) titleInput.focus();
    }
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
        widgetEl.querySelector('.fb-widget-trigger').addEventListener('click', togglePanel);
        widgetEl.querySelector('.fb-widget-close').addEventListener('click', togglePanel);
        renderForm();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
