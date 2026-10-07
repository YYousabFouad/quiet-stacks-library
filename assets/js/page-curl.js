/**
 * Quiet Stacks Library — WebGL Page-Curl Engine (Three.js r134)
 *
 * How it works
 * ------------
 * - The turning leaf is a deformable Three.js mesh. Every vertex past a moving
 *   crease line is wrapped around a cylinder, and the remainder of the sheet
 *   folds back over it (a developable "paper" deformation, not a rigid rotateY).
 * - The canvas is TRANSPARENT. The flat, untouched part of the sheet is
 *   discarded in the shader, and the real DOM face is clipped along exactly the
 *   same crease line. The live forms you see are always real DOM, never a picture.
 * - The real destination page sits underneath the whole time, so content is
 *   revealed progressively while the paper lifts, not after the animation.
 * - The parameters converge (radius -> 0, angle -> 0, crease -> spine) so the
 *   last frame is exactly the sheet lying flat on the opposite page. That way
 *   there's no jump when the DOM takes over.
 * - Shadows come from a real shadow map onto a transparent ShadowMaterial plane.
 */
(function () {
  'use strict';

  const MARGIN = 90;                       // px of canvas bleed so the lifted flap isn't cropped
  const SEGMENTS = 56;                     // mesh density
  const FOV = 30;                          // camera field of view (deg)
  const DURATION = 760;                    // natural physical paper turn duration (ms)
  const THETA0 = (9 * Math.PI) / 180;      // natural corner peel tilt (deg)
  const PHI0 = (16 * Math.PI) / 180;       // max lift angle of the folded flap
  const MOBILE_QUERY = '(max-width: 860px)';

  const easeInOutSine = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // --------------------------------------------------------------------------
  // Shader patch: per-vertex signed distance to the crease (aS) for crease lighting
  // --------------------------------------------------------------------------
  function patchCurlMaterial(material, withCreaseShade) {
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aS;\nvarying float vS;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvS = aS;');
      let frag = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vS;');
      if (withCreaseShade) {
        // Soft ambient occlusion where the paper leaves the page surface
        frag = frag.replace(
          '#include <dithering_fragment>',
          'gl_FragColor.rgb *= mix(0.88, 1.0, smoothstep(0.0, 24.0, abs(vS)));\n#include <dithering_fragment>'
        );
      }
      shader.fragmentShader = frag;
    };
    material.customProgramCacheKey = () => 'qs-curl-' + (withCreaseShade ? '1' : '0');
    return material;
  }

  // --------------------------------------------------------------------------
  // Small canvas helpers for rasterising the real DOM faces into textures
  // --------------------------------------------------------------------------
  const colorList = (str) => (str && str.match(/rgba?\([^)]*\)/g)) || [];
  function alphaOf(color) {
    if (!color || !color.startsWith('rgb')) return 0;
    const m = color.match(/rgba\([^)]*,\s*([\d.]+)\s*\)/);
    return m ? parseFloat(m[1]) : 1;
  }
  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function transformText(text, tt) {
    if (tt === 'uppercase') return text.toUpperCase();
    if (tt === 'lowercase') return text.toLowerCase();
    if (tt === 'capitalize') return text.replace(/\b\w/g, (c) => c.toUpperCase());
    return text;
  }

  class PageCurlEngine {
    constructor(opts) {
      window.__curlEngine = this;
      this.opts = opts;
      this.spread = document.querySelector('.book-pages-spread');
      this.canvas = document.getElementById('book-curl-canvas');
      this.leaf = document.getElementById('book-turning-leaf');
      this.underPage = document.getElementById('book-under-page');
      this.leafFront = this.leaf && this.leaf.querySelector('.leaf-face-front');
      this.leafBack = this.leaf && this.leaf.querySelector('.leaf-face-back');

      this.busy = false;
      this.dirty = true;
      this.texReady = false;
      this.webgl = false;
      this.drag = null;
      this.suppressClick = false;
      this.svgCache = new Map();
      this.tex = {};
      this.line = { c: 1, s: 0, d: 0 };

      if (!this.spread || !this.leaf || !this.leafFront || !this.leafBack) return;

      // Normalise the resting DOM state without animating it
      this.applyState(this.opts.getMode());

      if (this.canvas && window.THREE) {
        try {
          this.initGL();
          this.webgl = true;
        } catch (err) {
          console.warn('[PageCurl] WebGL unavailable, page turns will be instant.', err);
        }
      }
      if (!this.webgl) {
        if (this.canvas) this.canvas.style.display = 'none';
        return;
      }

      this.layout();

      // Pre-build textures once fonts are ready, so the first turn starts instantly
      const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      fontsReady.then(() => this.buildTexturesAsync());

      // Keep the textures in sync with what the user typed (debounced, off the hot path)
      const markDirty = () => {
        this.dirty = true;
        clearTimeout(this.rebuildTimer);
        this.rebuildTimer = setTimeout(() => {
          if (!this.busy && this.dirty) this.renderFaces();
        }, 300);
      };
      ['input', 'change', 'click'].forEach((ev) => this.leaf.addEventListener(ev, markDirty, true));

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (this.busy) {
            this.needsLayout = true;
            return;
          }
          this.layout();
          markDirty();
        }, 150);
      });

      this.bindDrag();
    }

    // ------------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------------
    turnTo(mode) {
      if (!this.leaf) return;
      if (this.busy || mode === this.opts.getMode()) return;

      this.opts.onNavigate(mode);

      if (!this.canAnimate()) {
        this.applyState(mode);
        return;
      }

      const forward = mode === 'signup';
      this.begin(forward);
      this.tween(0, 1, DURATION, easeInOutSine, () => this.finish(forward, true));
    }

    canAnimate() {
      return (
        this.webgl &&
        this.W > 0 &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        !window.matchMedia(MOBILE_QUERY).matches
      );
    }

    // Final DOM state for a mode, applied WITHOUT the legacy CSS rotateY transition
    applyState(mode) {
      const isSignup = mode === 'signup';
      this.leaf.style.transition = 'none';
      this.spread.classList.toggle('spread-turned-over', isSignup);
      this.spread.classList.remove('turning-to-signup', 'turning-to-login');
      this.leaf.classList.toggle('leaf-turned-over', isSignup);
      this.leaf.classList.toggle('leaf-at-rest', !isSignup);
      this.leaf.classList.remove('turning', 'turning-forward', 'turning-backward');
      if (this.underPage) this.underPage.classList.toggle('mobile-active', isSignup);
      void this.leaf.offsetWidth; // flush styles so the transform jumps, never animates
      requestAnimationFrame(() => {
        this.leaf.style.transition = '';
      });
    }

    // ------------------------------------------------------------------------
    // Three.js scene
    // ------------------------------------------------------------------------
    initGL() {
      const THREE = window.THREE;
      this.THREE = THREE;

      const renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      this.renderer = renderer;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(FOV, 1, 1, 6000);

      // Balanced so a flat, camera-facing sheet renders at ~1.0x its texture colour,
      // matching the DOM paper exactly. Curvature then darkens or brightens it.
      this.scene.add(new THREE.AmbientLight(0xfffaf2, 0.5));

      const light = new THREE.DirectionalLight(0xffffff, 0.56);
      light.castShadow = true;
      light.shadow.mapSize.set(2048, 2048);
      light.shadow.radius = 6;
      light.shadow.bias = -0.0006;
      this.lightDir = new THREE.Vector3(-0.22, 0.3, 1).normalize();
      this.scene.add(light);
      this.scene.add(light.target);
      this.light = light;

      // Transparent plane that only shows the cast shadow over the real pages
      this.shadowCatcher = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.ShadowMaterial({ opacity: 0.3 })
      );
      this.shadowCatcher.position.z = -1;
      this.shadowCatcher.receiveShadow = true;
      this.scene.add(this.shadowCatcher);

      this.sheet = new THREE.Group();
      this.sheet.visible = false;
      this.scene.add(this.sheet);

      this.frontMat = patchCurlMaterial(
        new THREE.MeshStandardMaterial({ roughness: 0.58, metalness: 0, side: THREE.FrontSide }),
        true
      );
      this.frontMat.shadowSide = THREE.DoubleSide;
      this.backMat = patchCurlMaterial(
        new THREE.MeshStandardMaterial({ roughness: 0.58, metalness: 0, side: THREE.BackSide }),
        true
      );
      this.depthMat = patchCurlMaterial(
        new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }),
        false
      );
    }

    layout() {
      const THREE = this.THREE;
      const W = this.spread.offsetWidth;
      const H = this.spread.offsetHeight;
      if (!W || !H) return;
      this.W = W;
      this.H = H;
      this.pageW = W / 2;
      this.pageH = H;
      this.texScale = clamp(window.devicePixelRatio || 1, 1.5, 2);

      const cw = W + MARGIN * 2;
      const ch = H + MARGIN * 2;
      Object.assign(this.canvas.style, {
        left: -MARGIN + 'px',
        top: -MARGIN + 'px',
        width: cw + 'px',
        height: ch + 'px'
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(cw, ch, false);

      // Camera distance chosen so the z = 0 plane maps 1:1 onto CSS pixels
      const dist = ch / 2 / Math.tan((FOV * Math.PI) / 360);
      this.camera.aspect = cw / ch;
      this.camera.position.set(0, 0, dist);
      this.camera.lookAt(0, 0, 0);
      this.camera.updateProjectionMatrix();

      this.light.position.copy(this.lightDir).multiplyScalar(2000);
      const sc = this.light.shadow.camera;
      sc.left = -cw * 0.7;
      sc.right = cw * 0.7;
      sc.top = ch * 0.7;
      sc.bottom = -ch * 0.7;
      sc.near = 100;
      sc.far = 4000;
      sc.updateProjectionMatrix();

      this.shadowCatcher.geometry.dispose();
      this.shadowCatcher.geometry = new THREE.PlaneGeometry(cw, ch);

      this.buildSheet();
      this.render();
    }

    buildSheet() {
      const THREE = this.THREE;
      if (this.frontMesh) {
        this.sheet.remove(this.frontMesh, this.backMesh);
        this.frontMesh.geometry.dispose();
        this.backMesh.geometry.dispose();
      }

      const gFront = new THREE.PlaneGeometry(this.pageW, this.pageH, SEGMENTS, SEGMENTS);
      gFront.translate(this.pageW / 2, 0, 0); // spine at x = 0
      const count = gFront.attributes.position.count;
      this.orig = Float32Array.from(gFront.attributes.position.array);

      const sAttr = new THREE.BufferAttribute(new Float32Array(count), 1);
      sAttr.setUsage(THREE.DynamicDrawUsage);
      gFront.attributes.position.setUsage(THREE.DynamicDrawUsage);
      gFront.setAttribute('aS', sAttr);

      // Two UV sets: "normal" and mirrored-u. They're swapped between the two
      // faces depending on turn direction so text always reads correctly.
      this.uvNormal = gFront.attributes.uv;
      const flipped = this.uvNormal.array.slice();
      for (let i = 0; i < flipped.length; i += 2) flipped[i] = 1 - flipped[i];
      this.uvFlipped = new THREE.BufferAttribute(flipped, 2);

      // Back face shares positions, normals and crease distances with the front face
      const gBack = new THREE.BufferGeometry();
      gBack.setIndex(gFront.index);
      gBack.setAttribute('position', gFront.attributes.position);
      gBack.setAttribute('normal', gFront.attributes.normal);
      gBack.setAttribute('aS', sAttr);
      gBack.setAttribute('uv', this.uvFlipped);

      this.frontMesh = new THREE.Mesh(gFront, this.frontMat);
      this.frontMesh.castShadow = true;
      this.frontMesh.customDepthMaterial = this.depthMat;
      this.backMesh = new THREE.Mesh(gBack, this.backMat);
      this.frontMesh.frustumCulled = false;
      this.backMesh.frustumCulled = false;
      this.sheet.add(this.frontMesh, this.backMesh);
    }

    render() {
      if (this.renderer) this.renderer.render(this.scene, this.camera);
    }

    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // The curl. Coordinates: x from spine (0) to fore-edge (pageW), y up.
    // A backward turn is the same motion with the sheet group mirrored.
    // ------------------------------------------------------------------------
    deform(t) {
      const W = this.pageW;
      const H = this.pageH;
      const halfH = H / 2;

      // Natural corner peel that gently straightens as the sheet sweeps across
      const theta = -THETA0 * Math.pow(1 - t, 1.4);
      const c = Math.cos(theta);
      const s = Math.sin(theta);

      // Crease travels smoothly across the sheet from right edge to spine (0)
      const dStart = W * c + halfH * Math.abs(s);
      const d = dStart * (1 - t);

      // Roll radius swells gracefully mid-turn and converges to 0 at landing
      const sinPi = Math.sin(Math.PI * t);
      const R = W * 0.15 * Math.pow(sinPi, 0.65);
      const phi = PHI0 * sinPi;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      this.line = { c, s, d };

      const pos = this.frontMesh.geometry.attributes.position;
      const arr = pos.array;
      const aS = this.frontMesh.geometry.attributes.aS.array;
      const orig = this.orig;

      for (let i = 0, n = aS.length; i < n; i++) {
        const x = orig[i * 3];
        const y = orig[i * 3 + 1];
        const sd = x * c + y * s - d; // signed distance past the crease line
        aS[i] = sd;

        if (sd <= 0) {
          // Unpeeled portion of the page lies flat on the book until the crease reaches it.
          // This ensures a single natural sheet turns smoothly without a double-hump or 2-page illusion.
          arr[i * 3] = x;
          arr[i * 3 + 1] = y;
          arr[i * 3 + 2] = 0;
          continue;
        }

        // Curled sheet past the crease line: wraps around dynamic 3D cylinder
        const Rl = R * (1.12 - 0.24 * ((y + halfH) / H));
        const arc = Math.PI * Rl;
        let nCoord;
        let z;
        if (sd <= arc && Rl > 0.0001) {
          const b = sd / Rl;
          nCoord = d + Rl * Math.sin(b);
          z = Rl * (1 - Math.cos(b));
        } else {
          const L = sd - arc;
          nCoord = d - L * cosPhi;
          z = 2 * Rl + L * sinPhi;
        }
        const dn = nCoord - (d + sd);
        arr[i * 3] = x + dn * c;
        arr[i * 3 + 1] = y + dn * s;
        arr[i * 3 + 2] = z;
      }

      pos.needsUpdate = true;
      this.frontMesh.geometry.attributes.aS.needsUpdate = true;
      this.frontMesh.geometry.computeVertexNormals();
    }

    // Clip the real DOM face to the flat (sd <= 0) part, using the exact same crease line
    clipFace(forward) {
      const { c, s, d } = this.line;
      const w = this.pageW;
      const h = this.pageH;
      const rect = [[0, -h / 2], [w, -h / 2], [w, h / 2], [0, h / 2]];
      const f = (p) => p[0] * c + p[1] * s - d;
      const out = [];
      for (let i = 0; i < 4; i++) {
        const a = rect[i];
        const b = rect[(i + 1) % 4];
        const fa = f(a);
        const fb = f(b);
        if (fa <= 0) out.push(a);
        if ((fa <= 0) !== (fb <= 0)) {
          const k = fa / (fa - fb);
          out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
        }
      }
      // Front face: local u = x. Back face (turned leaf on the left page): u = w - x.
      const pts = out.map(([x, y]) => `${(forward ? x : w - x).toFixed(2)}px ${(h / 2 - y).toFixed(2)}px`);
      const value = pts.length >= 3 ? `polygon(${pts.join(', ')})` : 'polygon(0 0, 0 0, 0 0)';
      const face = forward ? this.leafFront : this.leafBack;
      const otherFace = forward ? this.leafBack : this.leafFront;
      if (face) {
        face.style.clipPath = value;
        face.style.webkitClipPath = value;
      }
      if (otherFace && otherFace.style.clipPath) {
        otherFace.style.clipPath = '';
        otherFace.style.webkitClipPath = '';
      }
    }

    frame(t) {
      this.deform(t);
      this.render();
    }

    begin(forward) {
      this.busy = true;
      this.forward = forward;

      if (!this.texReady || this.dirty) {
        this.renderFaces();
        this.texReady = true;
      }

      // Forward: login face up, charter on the reverse.
      // Backward: mirrored sheet, charter face up, login on the reverse.
      this.sheet.scale.x = forward ? 1 : -1;
      this.frontMat.map = forward ? this.tex.front : this.tex.back;
      this.backMat.map = forward ? this.tex.back : this.tex.front;
      this.frontMat.needsUpdate = true;
      this.backMat.needsUpdate = true;
      this.frontMesh.geometry.setAttribute('uv', forward ? this.uvNormal : this.uvFlipped);
      this.backMesh.geometry.setAttribute('uv', forward ? this.uvFlipped : this.uvNormal);

      this.canvas.style.display = 'block';
      this.canvas.style.transition = 'none';
      this.canvas.style.opacity = '1';
      this.sheet.visible = true;
      this.spread.classList.add('is-curling');
      this.frame(0);
      if (this.opts.onSound) this.opts.onSound();
    }

    finish(forward, completed) {
      const finalMode = forward === completed ? 'signup' : 'login';
      if (this.opts.getMode() !== finalMode) this.opts.onNavigate(finalMode);

      // The last frame matches the final DOM pose exactly, so swap in place
      this.applyState(finalMode);
      [this.leafFront, this.leafBack].forEach((el) => {
        if (el) {
          el.style.clipPath = '';
          el.style.webkitClipPath = '';
        }
      });
      this.spread.classList.remove('is-curling');

      const cleanup = () => {
        this.sheet.visible = false;
        this.render();
        this.canvas.style.transition = 'none';
        this.canvas.style.opacity = '';
        this.canvas.style.display = 'none';
        this.busy = false;
        if (this.needsLayout) {
          this.needsLayout = false;
          this.layout();
          this.dirty = true;
        }
      };

      if (completed) {
        // Tiny crossfade from the textured sheet to the live DOM underneath it
        this.canvas.style.transition = 'opacity 180ms ease-out';
        void this.canvas.offsetWidth;
        this.canvas.style.opacity = '0';
        setTimeout(cleanup, 200);
      } else {
        cleanup();
      }
    }

    tween(from, to, duration, ease, done) {
      cancelAnimationFrame(this.raf);
      const start = performance.now();
      const step = (now) => {
        const p = clamp((now - start) / duration, 0, 1);
        this.frame(from + (to - from) * ease(p));
        if (p < 1) this.raf = requestAnimationFrame(step);
        else done();
      };
      this.raf = requestAnimationFrame(step);
    }

    // ------------------------------------------------------------------------
    // Drag-to-curl from the dog-ear corners (mouse, pen and touch)
    // ------------------------------------------------------------------------
    bindDrag() {
      const fwdCorner = this.leafFront.querySelector('.page-turn-corner');
      const bwdCorner = this.leafBack.querySelector('.page-turn-corner');

      const start = (e, forward) => {
        if (this.busy || !this.canAnimate() || (e.button !== undefined && e.button > 0)) return;
        const mode = this.opts.getMode();
        if ((forward && mode !== 'login') || (!forward && mode !== 'signup')) return;
        this.drag = {
          forward,
          id: e.pointerId,
          x0: e.clientX,
          lastX: e.clientX,
          lastT: performance.now(),
          v: 0,
          t: 0,
          active: false
        };
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (_) {
          /* capture is optional */
        }
      };

      const move = (e) => {
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        const dx = e.clientX - d.x0;
        if (!d.active) {
          if (Math.abs(dx) < 5) return; // below threshold: still a click
          d.active = true;
          this.begin(d.forward);
        }
        const now = performance.now();
        d.v = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
        d.lastX = e.clientX;
        d.lastT = now;
        const span = this.spread.getBoundingClientRect().width * 0.8;
        d.t = clamp((d.forward ? -dx : dx) / span, 0.001, 0.995);
        this.frame(d.t);
        e.preventDefault();
      };

      const end = (e) => {
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        this.drag = null;
        if (!d.active) return; // plain click: the existing click handler turns the page
        this.suppressClick = true;
        const towards = d.forward ? -d.v : d.v;
        const complete = d.t > 0.3 || towards > 0.45;
        const target = complete ? 1 : 0;
        const duration = 180 + 560 * Math.abs(target - d.t);
        this.tween(d.t, target, duration, easeOutCubic, () => this.finish(d.forward, complete));
      };

      if (fwdCorner) fwdCorner.addEventListener('pointerdown', (e) => start(e, true));
      if (bwdCorner) bwdCorner.addEventListener('pointerdown', (e) => start(e, false));
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);

      // A drag ends with a click on the corner. Swallow it so a cancelled drag doesn't turn the page.
      window.addEventListener(
        'click',
        (e) => {
          if (!this.suppressClick) return;
          this.suppressClick = false;
          e.stopPropagation();
          e.preventDefault();
        },
        true
      );
    }

    // ------------------------------------------------------------------------
    // Textures: rasterise the REAL DOM faces (layout, text, inputs, icons) so the
    // curled paper shows the same content the user sees.
    // ------------------------------------------------------------------------
    async buildTexturesAsync() {
      if (!this.W) this.layout();
      const pending = this.renderFaces();
      if (pending.length) {
        await Promise.all(pending);
        this.renderFaces();
      }
      this.texReady = true;
      this.warmUp();
    }

    renderFaces() {
      const f = this.rasterize(this.leafFront, true);
      const b = this.rasterize(this.leafBack, false);
      this.setTexture('front', f.canvas);
      this.setTexture('back', b.canvas);
      this.dirty = false;
      if (this.busy) {
        this.frontMat.map = this.forward ? this.tex.front : this.tex.back;
        this.backMat.map = this.forward ? this.tex.back : this.tex.front;
      }
      return f.pending.concat(b.pending);
    }

    setTexture(name, canvas) {
      const THREE = this.THREE;
      if (this.tex[name]) this.tex[name].dispose();
      const t = new THREE.CanvasTexture(canvas);
      t.encoding = THREE.sRGBEncoding;
      t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.needsUpdate = true;
      this.tex[name] = t;
    }

    // Compile shaders and upload textures ahead of time, so the first turn doesn't stall
    warmUp() {
      if (this.busy) return;
      const prevOpacity = this.canvas.style.opacity;
      this.canvas.style.opacity = '0';
      this.frontMat.map = this.tex.front;
      this.backMat.map = this.tex.back;
      this.frontMat.needsUpdate = true;
      this.backMat.needsUpdate = true;
      this.sheet.visible = true;
      this.deform(0.5);
      this.render();
      this.sheet.visible = false;
      this.render();
      requestAnimationFrame(() => {
        if (!this.busy) this.canvas.style.opacity = prevOpacity;
      });
    }

    rasterize(face, isFront) {
      const w = this.pageW;
      const h = this.pageH;
      const host = document.createElement('div');
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText =
        `position:absolute;left:50%;top:0;width:${w}px;height:${h}px;` +
        'visibility:hidden;pointer-events:none;z-index:-1;transform:none;';

      const clone = face.cloneNode(true);
      clone.style.cssText +=
        ';transform:none;position:absolute;inset:0;clip-path:none;-webkit-clip-path:none;' +
        'animation:none;transition:none;backface-visibility:visible;';
      // cloneNode doesn't copy live form values
      const src = face.querySelectorAll('input, textarea, select');
      const dst = clone.querySelectorAll('input, textarea, select');
      src.forEach((el, i) => {
        if (dst[i]) dst[i].value = el.value;
      });

      host.appendChild(clone);
      this.spread.appendChild(host);
      try {
        return this.paint(clone, isFront, w, h);
      } finally {
        host.remove();
      }
    }

    paint(root, isFront, w, h) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * this.texScale);
      canvas.height = Math.round(h * this.texScale);
      const ctx = canvas.getContext('2d');
      ctx.scale(this.texScale, this.texScale);

      // Paper (same gradients as .leaf-face-front / .leaf-face-back)
      const g = isFront ? ctx.createLinearGradient(w, 0, 0, 0) : ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#faf6ed');
      g.addColorStop(0.82, '#fdfaf3');
      g.addColorStop(0.96, '#ece4d1');
      g.addColorStop(1, '#dad0ba');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Gutter shading near the spine
      const gx = isFront ? 0 : w;
      const sg = ctx.createLinearGradient(gx, 0, isFront ? 34 : w - 34, 0);
      sg.addColorStop(0, 'rgba(60, 40, 15, 0.12)');
      sg.addColorStop(1, 'rgba(60, 40, 15, 0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, w, h);

      // Gilt fore-edge. It reads as paper thickness once the sheet curls.
      ctx.fillStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.fillRect(isFront ? w - 2 : 0, 0, 2, h);
      ctx.fillRect(0, 0, w, 1);
      ctx.fillRect(0, h - 1, w, 1);

      const base = root.getBoundingClientRect();
      const k = w / (base.width || w);
      const loc = (r) => ({
        x: (r.left - base.left) * k,
        y: (r.top - base.top) * k,
        w: r.width * k,
        h: r.height * k
      });

      const svgs = [];
      const sides = ['Top', 'Right', 'Bottom', 'Left'];

      // Pass 1: boxes (backgrounds, borders) and form fields, in document order
      root.querySelectorAll('*').forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (tag !== 'svg' && el.closest('svg')) return;
        if (el.closest('.page-turn-corner')) return;
        if (!el.getClientRects().length) return;
        const cs = getComputedStyle(el);
        const opacity = parseFloat(cs.opacity);
        if (opacity === 0) return;
        const r = loc(el.getBoundingClientRect());
        if (r.w < 0.5 || r.h < 0.5) return;

        if (tag === 'svg') {
          svgs.push({ el, r, color: cs.color });
          return;
        }

        ctx.save();
        ctx.globalAlpha = isNaN(opacity) ? 1 : opacity;
        const radius = parseFloat(cs.borderTopLeftRadius) || 0;

        const grad = colorList(cs.backgroundImage);
        if (grad.length >= 2) {
          const lg = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
          grad.forEach((col, i) => lg.addColorStop(i / (grad.length - 1), col));
          ctx.fillStyle = lg;
          roundRectPath(ctx, r.x, r.y, r.w, r.h, radius);
          ctx.fill();
        } else if (alphaOf(cs.backgroundColor) > 0.01) {
          ctx.fillStyle = cs.backgroundColor;
          roundRectPath(ctx, r.x, r.y, r.w, r.h, radius);
          ctx.fill();
        }

        const bw = sides.map((sd) => parseFloat(cs['border' + sd + 'Width']) || 0);
        const bc = sides.map((sd) => cs['border' + sd + 'Color']);
        const bs = sides.map((sd) => cs['border' + sd + 'Style']);
        const uniform = bw.every((v) => v === bw[0]) && bc.every((v) => v === bc[0]) && bs.every((v) => v === bs[0]);
        if (uniform && bw[0] > 0 && bs[0] !== 'none' && alphaOf(bc[0]) > 0.01) {
          ctx.lineWidth = bw[0];
          ctx.strokeStyle = bc[0];
          ctx.setLineDash(bs[0] === 'dashed' ? [bw[0] * 3, bw[0] * 2] : bs[0] === 'dotted' ? [bw[0], bw[0]] : []);
          roundRectPath(ctx, r.x + bw[0] / 2, r.y + bw[0] / 2, r.w - bw[0], r.h - bw[0], radius);
          ctx.stroke();
        } else {
          const seg = [
            [r.x, r.y + bw[0] / 2, r.x + r.w, r.y + bw[0] / 2],
            [r.x + r.w - bw[1] / 2, r.y, r.x + r.w - bw[1] / 2, r.y + r.h],
            [r.x, r.y + r.h - bw[2] / 2, r.x + r.w, r.y + r.h - bw[2] / 2],
            [r.x + bw[3] / 2, r.y, r.x + bw[3] / 2, r.y + r.h]
          ];
          for (let i = 0; i < 4; i++) {
            if (!bw[i] || bs[i] === 'none' || alphaOf(bc[i]) <= 0.01) continue;
            ctx.lineWidth = bw[i];
            ctx.strokeStyle = bc[i];
            ctx.setLineDash(bs[i] === 'dashed' ? [bw[i] * 3, bw[i] * 2] : bs[i] === 'dotted' ? [bw[i], bw[i]] : []);
            ctx.beginPath();
            ctx.moveTo(seg[i][0], seg[i][1]);
            ctx.lineTo(seg[i][2], seg[i][3]);
            ctx.stroke();
          }
        }

        if ((tag === 'input' || tag === 'textarea') && el.type !== 'hidden' && el.type !== 'checkbox') {
          let text = el.value || el.getAttribute('placeholder') || '';
          if (el.value && el.type === 'password') text = '\u2022'.repeat(el.value.length);
          ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          ctx.fillStyle = el.value ? cs.color : 'rgba(122, 108, 88, 0.72)';
          ctx.textBaseline = 'middle';
          ctx.setLineDash([]);
          roundRectPath(ctx, r.x, r.y, r.w, r.h, radius);
          ctx.clip();
          ctx.fillText(text, r.x + (parseFloat(cs.paddingLeft) || 0) * k, r.y + r.h / 2);
        }
        ctx.restore();
      });

      // Pass 2: text, word by word, positioned with the real layout
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      let node;
      while ((node = walker.nextNode())) {
        const txt = node.nodeValue;
        if (!txt || !txt.trim()) continue;
        const parent = node.parentElement;
        if (!parent || parent.closest('svg') || parent.closest('.page-turn-corner')) continue;
        if (/^(script|style|option|textarea)$/i.test(parent.tagName)) continue;
        const cs = getComputedStyle(parent);
        if (parseFloat(cs.opacity) === 0) continue;
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        ctx.fillStyle = cs.color;
        if ('letterSpacing' in ctx) ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
        const re = /\S+/g;
        let m;
        while ((m = re.exec(txt))) {
          range.setStart(node, m.index);
          range.setEnd(node, m.index + m[0].length);
          const rr = range.getClientRects();
          if (!rr.length) continue;
          const q = loc(rr[0]);
          ctx.fillText(transformText(m[0], cs.textTransform), q.x, q.y + q.h / 2);
        }
      }
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

      // Pass 3: icons. SVGs become cached images; the first build waits for them.
      const pending = [];
      svgs.forEach(({ el, r, color }) => {
        const img = this.svgImage(el, color, r);
        if (img.complete && img.naturalWidth) {
          ctx.drawImage(img, r.x, r.y, r.w, r.h);
        } else {
          pending.push(
            new Promise((res) => {
              img.addEventListener('load', res, { once: true });
              img.addEventListener('error', res, { once: true });
            })
          );
        }
      });

      return { canvas, pending };
    }

    svgImage(el, color, r) {
      const c = el.cloneNode(true);
      c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      c.setAttribute('width', String(Math.max(1, Math.round(r.w))));
      c.setAttribute('height', String(Math.max(1, Math.round(r.h))));
      const str = new XMLSerializer().serializeToString(c).replace(/currentColor/g, color);
      let img = this.svgCache.get(str);
      if (!img) {
        img = new Image();
        img.decoding = 'async';
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
        this.svgCache.set(str, img);
      }
      return img;
    }
  }

  window.PageCurlEngine = PageCurlEngine;
})();
