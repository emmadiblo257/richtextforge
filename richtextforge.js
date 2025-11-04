(function() {
  class RichTextForge {
    constructor(selector, options = {}) {
      this.textarea = document.querySelector(selector);
      if (!this.textarea) return console.error("Éditeur non trouvé :", selector);
      
      this.options = {
        placeholder: options.placeholder || "Commencez à écrire...",
        height: options.height || "300px",
        theme: options.theme || "light",
        ...options
      };
      
      this.injectStyle();
      this.init();
    }

    injectStyle() {
      if (document.getElementById('richtextforge-style')) return;
      const style = document.createElement('style');
      style.id = 'richtextforge-style';
      style.textContent = `
        .rtf-wrapper {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .rtf-wrapper:focus-within {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          border-color: #6366f1;
        }
        .rtf-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .rtf-toolbar-group {
          display: flex;
          gap: 2px;
          padding: 0 6px;
          border-right: 1px solid #d1d5db;
        }
        .rtf-toolbar-group:last-child {
          border-right: none;
        }
        .rtf-toolbar button {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          min-width: 36px;
          height: 36px;
        }
        .rtf-toolbar button:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
          transform: translateY(-1px);
        }
        .rtf-toolbar button:active {
          transform: translateY(0);
        }
        .rtf-toolbar button.active {
          background: #6366f1;
          border-color: #4f46e5;
          color: #ffffff;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        }
        .rtf-toolbar button svg {
          width: 18px;
          height: 18px;
          stroke-width: 2;
        }
        .rtf-editor {
          min-height: var(--rtf-height, 300px);
          max-height: 600px;
          overflow-y: auto;
          padding: 16px;
          outline: none;
          background: #ffffff;
          line-height: 1.6;
          color: #1f2937;
        }
        .rtf-editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .rtf-editor:focus {
          background: #fafafa;
        }
        .rtf-editor h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; }
        .rtf-editor h2 { font-size: 1.5em; font-weight: 600; margin: 0.75em 0; }
        .rtf-editor h3 { font-size: 1.17em; font-weight: 600; margin: 0.83em 0; }
        .rtf-editor p { margin: 0.5em 0; }
        .rtf-editor ul, .rtf-editor ol { margin: 0.5em 0; padding-left: 2em; }
        .rtf-editor blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 16px;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
        }
        .rtf-editor code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .rtf-editor a {
          color: #6366f1;
          text-decoration: underline;
        }
        .rtf-code-view {
          font-family: 'Courier New', monospace;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `;
      document.head.appendChild(style);
    }

    init() {
      // Conteneur principal
      const wrapper = document.createElement('div');
      wrapper.className = 'rtf-wrapper';
      wrapper.style.setProperty('--rtf-height', this.options.height);
      this.textarea.style.display = 'none';
      this.textarea.parentNode.insertBefore(wrapper, this.textarea);

      // Barre d'outils
      const toolbar = document.createElement('div');
      toolbar.className = 'rtf-toolbar';
      toolbar.innerHTML = `
        <div class="rtf-toolbar-group">
          <button type="button" data-cmd="bold" title="Gras (Ctrl+B)">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linejoin="round" d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z" />
            </svg>

          </button>
          <button type="button" data-cmd="italic" title="Italique (Ctrl+I)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803" />
            </svg>

          </button>
          <button type="button" data-cmd="underline" title="Souligné (Ctrl+U)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.995 3.744v7.5a6 6 0 1 1-12 0v-7.5m-2.25 16.502h16.5" />
            </svg>

          </button>
          <button type="button" data-cmd="strikeThrough" title="Barré">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 12a8.912 8.912 0 0 1-.318-.079c-1.585-.424-2.904-1.247-3.76-2.236-.873-1.009-1.265-2.19-.968-3.301.59-2.2 3.663-3.29 6.863-2.432A8.186 8.186 0 0 1 16.5 5.21M6.42 17.81c.857.99 2.176 1.812 3.761 2.237 3.2.858 6.274-.23 6.863-2.431.233-.868.044-1.779-.465-2.617M3.75 12h16.5" />
            </svg>

          </button>
        </div>
        <div class="rtf-toolbar-group">
          <button type="button" data-cmd="formatBlock" data-value="h1" title="Titre 1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501m4.501-8.627 2.25-1.5v10.126m0 0h-2.25m2.25 0h2.25" />
            </svg>

          </button>
          <button type="button" data-cmd="formatBlock" data-value="h2" title="Titre 2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 19.5H16.5v-1.609a2.25 2.25 0 0 1 1.244-2.012l2.89-1.445c.651-.326 1.116-.955 1.116-1.683 0-.498-.04-.987-.118-1.463-.135-.825-.835-1.422-1.668-1.489a15.202 15.202 0 0 0-3.464.12M2.243 4.492v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501" />
            </svg>

          </button>
          <button type="button" data-cmd="formatBlock" data-value="h3" title="Titre 3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.905 14.626a4.52 4.52 0 0 1 .738 3.603c-.154.695-.794 1.143-1.504 1.208a15.194 15.194 0 0 1-3.639-.104m4.405-4.707a4.52 4.52 0 0 0 .738-3.603c-.154-.696-.794-1.144-1.504-1.209a15.19 15.19 0 0 0-3.639.104m4.405 4.708H18M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501" />
            </svg>

          </button>
          <button type="button" data-cmd="formatBlock" data-value="p" title="Paragraphe">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-paragraph" viewBox="0 0 16 16">
            <path d="M10.5 15a.5.5 0 0 1-.5-.5V2H9v12.5a.5.5 0 0 1-1 0V9H7a4 4 0 1 1 0-8h5.5a.5.5 0 0 1 0 1H11v12.5a.5.5 0 0 1-.5.5"/>
            </svg>
          </button>
        </div>
        <div class="rtf-toolbar-group">
          <button type="button" data-cmd="insertUnorderedList" title="Liste à puces">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>

          </button>
          <button type="button" data-cmd="insertOrderedList" title="Liste numérotée">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99" />
        </svg>

          </button>
        </div>
        <div class="rtf-toolbar-group">
          <button type="button" data-cmd="createLink" title="Insérer un lien">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>

          </button>
          <button type="button" data-cmd="formatBlock" data-value="blockquote" title="Citation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
            </svg>
          </button>
        </div>
        <div class="rtf-toolbar-group">
          <button type="button" data-cmd="justifyLeft" title="Aligner à gauche">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
            </svg>

          </button>
          <button type="button" data-cmd="justifyCenter" title="Centrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="6" y1="12" x2="18" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
          <button type="button" data-cmd="justifyRight" title="Aligner à droite">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>

          </button>
        </div>
        <div class="rtf-toolbar-group">
          <button type="button" data-cmd="removeFormat" title="Effacer le formatage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 7V4h16v3M9 20h6M12 4v16"></path>
              <line x1="2" y1="2" x2="22" y2="22"></line>
            </svg>
          </button>
          <button type="button" data-cmd="codeView" title="Voir le code HTML">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>

          </button>
        </div>
      `;
      wrapper.appendChild(toolbar);

      // Zone d'édition
      const editor = document.createElement('div');
      editor.className = 'rtf-editor';
      editor.contentEditable = true;
      editor.setAttribute('data-placeholder', this.options.placeholder);
      editor.innerHTML = this.textarea.value || '';
      wrapper.appendChild(editor);

      // Gestion des actions
      toolbar.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          const cmd = btn.dataset.cmd;
          const value = btn.dataset.value;
          
          if (cmd === 'createLink') {
            const url = prompt("Entrer l'URL du lien :");
            if (url) document.execCommand('createLink', false, url);
          } else if (cmd === 'codeView') {
            this.toggleCodeView(editor, btn);
          } else if (cmd === 'formatBlock') {
            document.execCommand('formatBlock', false, value);
          } else {
            document.execCommand(cmd, false, value || null);
          }
          
          editor.focus();
          this.sync();
          this.updateToolbarState();
        });
      });

      // Mise à jour de l'état de la barre d'outils
      editor.addEventListener('mouseup', () => this.updateToolbarState());
      editor.addEventListener('keyup', () => this.updateToolbarState());
      editor.addEventListener('focus', () => this.updateToolbarState());

      // Synchronisation automatique
      editor.addEventListener('input', () => this.sync());
      
      this.editor = editor;
      this.toolbar = toolbar;
      this.wrapper = wrapper;
      
      // État initial
      this.updateToolbarState();
    }

    updateToolbarState() {
      this.toolbar.querySelectorAll('button').forEach(btn => {
        const cmd = btn.dataset.cmd;
        const value = btn.dataset.value;
        
        try {
          if (cmd === 'codeView') {
            // Géré séparément
            return;
          }
          
          if (cmd === 'formatBlock' && value) {
            const blockType = document.queryCommandValue('formatBlock').toLowerCase();
            if (blockType === value || blockType === '<' + value + '>') {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          } else if (document.queryCommandState(cmd)) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        } catch (e) {
          // Certaines commandes peuvent échouer
        }
      });
    }

    toggleCodeView(editor, btn) {
      if (editor.dataset.view === 'code') {
        editor.innerHTML = editor.textContent;
        editor.classList.remove('rtf-code-view');
        editor.dataset.view = 'rich';
        btn.classList.remove('active');
        editor.contentEditable = true;
      } else {
        editor.textContent = editor.innerHTML;
        editor.classList.add('rtf-code-view');
        editor.dataset.view = 'code';
        btn.classList.add('active');
        editor.contentEditable = true;
      }
      this.sync();
    }

    sync() {
      this.textarea.value = this.editor.innerHTML;
      // Déclencher un événement de changement pour les frameworks
      this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    getContent() {
      return this.editor.innerHTML;
    }

    setContent(html) {
      this.editor.innerHTML = html;
      this.sync();
    }

    destroy() {
      if (this.wrapper && this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper);
        this.textarea.style.display = '';
      }
    }
  }

  // Expose au global
  window.RichTextForge = RichTextForge;
})();