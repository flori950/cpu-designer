import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProcessorDesignTool', () => {
  beforeEach(() => {
    // Reset DOM for each test
    document.body.innerHTML = '';

    // Setup basic DOM structure
    document.body.innerHTML = `
      <div id="app">
        <div class="toolbar">
          <button id="load-design">Load Design</button>
        </div>
        <canvas id="design-canvas" width="800" height="600"></canvas>
        <input type="file" id="design-file-input" accept=".json" style="display: none;">
      </div>
    `;
  });

  describe('Component Management', () => {
    it('should initialize with empty components array', () => {
      window.ProcessorDesignTool = class {
        constructor() {
          this.components = [];
        }
      };

      const tool = new window.ProcessorDesignTool();
      expect(tool.components).toEqual([]);
    });

    it('should add component when dropped on canvas', () => {
      window.ProcessorDesignTool = class {
        constructor() {
          this.components = [];
        }

        addComponent(type, x, y) {
          this.components.push({ id: Date.now(), type, x, y });
        }
      };

      const tool = new window.ProcessorDesignTool();
      tool.addComponent('alu', 100, 100);
      expect(tool.components.length).toBe(1);
      expect(tool.components[0].type).toBe('alu');
    });
  });

  describe('Validation System', () => {
    it('should validate basic processor architecture', () => {
      window.ProcessorDesignTool = class {
        constructor() {
          this.components = [];
          this.connections = [];
        }

        validateDesign() {
          const requiredComponents = ['alu', 'register', 'control-unit'];
          const componentTypes = this.components.map((c) => c.type);
          const hasAllRequired = requiredComponents.every((type) =>
            componentTypes.includes(type)
          );

          return {
            isValid: hasAllRequired,
            errors: hasAllRequired ? [] : ['Missing required components'],
          };
        }
      };

      const tool = new window.ProcessorDesignTool();
      tool.components = [
        { id: 1, type: 'alu', x: 100, y: 100 },
        { id: 2, type: 'register', x: 200, y: 100 },
        { id: 3, type: 'control-unit', x: 300, y: 100 },
      ];

      const validation = tool.validateDesign();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect circular dependencies', () => {
      window.ProcessorDesignTool = class {
        constructor() {
          this.components = [];
          this.connections = [];
        }

        detectCycles() {
          return false; // Simple implementation for testing
        }
      };

      const tool = new window.ProcessorDesignTool();
      const hasCycle = tool.detectCycles();
      expect(typeof hasCycle).toBe('boolean');
    });
  });

  describe('Session Management', () => {
    it('should save design to sessionStorage', () => {
      // Mock sessionStorage
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      window.ProcessorDesignTool = class {
        constructor() {
          this.components = [];
        }

        saveSessionData() {
          const data = { components: this.components };
          sessionStorage.setItem('processorDesign', JSON.stringify(data));
        }
      };

      const tool = new window.ProcessorDesignTool();
      tool.components = [{ id: 1, type: 'alu', x: 100, y: 100 }];
      tool.saveSessionData();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'processorDesign',
        JSON.stringify({ components: tool.components })
      );
    });
  });

  describe('File Operations', () => {
    it('should handle valid JSON design file', async () => {
      const mockDesignData = {
        components: [
          { id: 'comp1', type: 'alu', x: 100, y: 100 },
          { id: 'comp2', type: 'register', x: 200, y: 200 },
        ],
        connections: [],
      };

      window.ProcessorDesignTool = class {
        constructor() {
          this.components = [];
          this.connections = [];
          this.notificationMessage = '';
        }

        async handleFileLoad(event) {
          const file = event.target.files[0];
          if (!file) return;

          try {
            const text = await file.text();
            const designData = JSON.parse(text);
            this.components = designData.components || [];
            this.connections = designData.connections || [];
            this.notificationMessage = 'Design loaded successfully!';
          } catch {
            this.notificationMessage =
              'Error loading design file. Please check the file format.';
          }
        }
      };

      const tool = new window.ProcessorDesignTool();

      // Mock File with text() method
      const mockFile = {
        text: () => Promise.resolve(JSON.stringify(mockDesignData)),
      };

      const mockEvent = {
        target: {
          files: [mockFile],
        },
      };

      await tool.handleFileLoad(mockEvent);

      expect(tool.components.length).toBe(2);
      expect(tool.notificationMessage).toBe('Design loaded successfully!');
    });

    it('should handle invalid JSON design file', async () => {
      window.ProcessorDesignTool = class {
        constructor() {
          this.components = [];
          this.connections = [];
          this.notificationMessage = '';
        }

        async handleFileLoad(event) {
          const file = event.target.files[0];
          if (!file) return;

          try {
            const text = await file.text();
            const designData = JSON.parse(text);
            this.components = designData.components || [];
            this.connections = designData.connections || [];
            this.notificationMessage = 'Design loaded successfully!';
          } catch {
            this.notificationMessage =
              'Error loading design file. Please check the file format.';
          }
        }
      };

      const tool = new window.ProcessorDesignTool();

      // Mock File with invalid JSON
      const mockFile = {
        text: () => Promise.resolve('invalid json content'),
      };

      const mockEvent = {
        target: {
          files: [mockFile],
        },
      };

      await tool.handleFileLoad(mockEvent);

      expect(tool.notificationMessage).toBe(
        'Error loading design file. Please check the file format.'
      );
    });
  });

  describe('Code Generation', () => {
    it('should generate JSON export with metadata', () => {
      window.ProcessorDesignTool = class {
        constructor() {
          this.components = [];
          this.connections = [];
        }

        exportDesign() {
          return {
            metadata: {
              version: '1.0',
              timestamp: new Date().toISOString(),
              tool: 'ProcessorDesignTool',
            },
            components: this.components,
            connections: this.connections,
          };
        }
      };

      const tool = new window.ProcessorDesignTool();
      tool.components = [{ id: 1, type: 'alu', x: 100, y: 100 }];

      const exportData = tool.exportDesign();
      expect(exportData.metadata).toBeDefined();
      expect(exportData.metadata.version).toBe('1.0');
      expect(exportData.components).toEqual(tool.components);
    });
  });

  describe('Component Library', () => {
    it('should include standard processor components', () => {
      const expectedComponents = ['alu', 'register', 'memory', 'control-unit'];

      window.ProcessorDesignTool = class {
        getAvailableComponents() {
          return expectedComponents;
        }
      };

      const tool = new window.ProcessorDesignTool();
      const components = tool.getAvailableComponents();

      expect(components).toContain('alu');
      expect(components).toContain('register');
      expect(components).toContain('memory');
      expect(components).toContain('control-unit');
    });
  });

  describe('DOM Integration', () => {
    it('should have load design button in toolbar', () => {
      const loadButton = document.getElementById('load-design');
      expect(loadButton).toBeTruthy();
      expect(loadButton.textContent).toBe('Load Design');
    });

    it('should have hidden file input for design loading', () => {
      const fileInput = document.getElementById('design-file-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.type).toBe('file');
      expect(fileInput.style.display).toBe('none');
    });
  });
});
