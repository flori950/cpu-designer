import './style.css';

// Processor Design Tool
class ProcessorDesignTool {
  constructor() {
    this.canvas = document.getElementById('design-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.components = [];
    this.connections = [];
    this.selectedComponent = null;
    this.draggedComponent = null;
    this.connectionMode = false;
    this.connectionStart = null;
    this.touchDragData = null; // For mobile drag and drop
    this.debugMode = false; // Add debug mode for mobile troubleshooting

    this.initializeCanvas();
    this.setupEventListeners();
    this.loadSessionData();
    this.setupMobileDebug();
  }

  initializeCanvas() {
    // Set canvas size to container
    const container = document.querySelector('.canvas-container');
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;

    // Resize canvas when window resizes
    window.addEventListener('resize', () => {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
      this.redraw();
    });
  }

  setupEventListeners() {
    // Drag and Drop from palette
    const paletteItems = document.querySelectorAll('.component-item');
    paletteItems.forEach((item) => {
      // Desktop drag and drop
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.dataset.component);
      });

      // Mobile touch events for drag and drop
      item.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.touchDragData = {
          componentType: item.dataset.component,
          startTime: Date.now(),
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          element: item,
        };
        item.style.opacity = '0.5';
        item.style.transform = 'scale(1.1)';
        this.debugLog(
          `Touch start on ${item.dataset.component} at (${e.touches[0].clientX}, ${e.touches[0].clientY})`
        );
      });

      item.addEventListener('touchmove', (e) => {
        if (this.touchDragData && this.touchDragData.element === item) {
          e.preventDefault();
          e.stopPropagation();
          // Provide visual feedback that drag is happening
          const deltaX = e.touches[0].clientX - this.touchDragData.startX;
          const deltaY = e.touches[0].clientY - this.touchDragData.startY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance > 10) {
            item.style.transform = 'scale(1.1) translateZ(0)';
            item.style.zIndex = '1000';
          }
        }
      });

      item.addEventListener('touchend', (e) => {
        if (this.touchDragData && this.touchDragData.element === item) {
          e.preventDefault();
          e.stopPropagation();

          // Check if the touch ended over the canvas
          const touch = e.changedTouches[0];
          const elementAtPoint = document.elementFromPoint(
            touch.clientX,
            touch.clientY
          );

          this.debugLog(
            `Touch end on ${item.dataset.component} at (${touch.clientX}, ${touch.clientY}), element at point: ${elementAtPoint?.tagName || 'none'}`
          );

          if (
            elementAtPoint === this.canvas ||
            this.canvas.contains(elementAtPoint)
          ) {
            // Touch ended on canvas - add component
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            // Check if this was a drag operation (moved at least 10px)
            const deltaX = touch.clientX - this.touchDragData.startX;
            const deltaY = touch.clientY - this.touchDragData.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            this.debugLog(
              `Distance moved: ${distance.toFixed(1)}px, adding component to canvas at (${x.toFixed(1)}, ${y.toFixed(1)})`
            );

            if (distance > 10) {
              this.addComponent(this.touchDragData.componentType, x, y);
            }
          } else {
            this.debugLog(
              `Touch ended outside canvas on: ${elementAtPoint?.tagName || 'unknown'}`
            );
          }

          // Reset styles
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
          item.style.zIndex = '';
          this.touchDragData = null;
        }
      });

      // Handle touch cancel
      item.addEventListener('touchcancel', (e) => {
        if (this.touchDragData && this.touchDragData.element === item) {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
          item.style.zIndex = '';
          this.touchDragData = null;
        }
      });
    });

    // Canvas drop handling
    this.canvas.addEventListener('dragover', (e) => e.preventDefault());
    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const componentType = e.dataTransfer.getData('text/plain');
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.addComponent(componentType, x, y);
    });

    // Canvas interaction
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    // Touch events for canvas interaction (component movement)
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    // Toolbar buttons
    document
      .getElementById('clear-canvas')
      .addEventListener('click', () => this.clearCanvas());
    document
      .getElementById('load-example')
      .addEventListener('click', () => this.showExampleModal());
    document
      .getElementById('load-design')
      .addEventListener('click', () => this.loadDesign());
    document
      .getElementById('validate-design')
      .addEventListener('click', () => this.validateDesign());
    document
      .getElementById('compile-design')
      .addEventListener('click', () => this.showCompilationPanel());
    document
      .getElementById('export-design')
      .addEventListener('click', () => this.exportDesign());
    document
      .getElementById('simulate')
      .addEventListener('click', () => this.toggleSimulation());

    // Panel close buttons
    document
      .getElementById('close-validation')
      ?.addEventListener('click', () => {
        document.getElementById('validation-panel').classList.add('hidden');
      });
    document
      .getElementById('close-compilation')
      ?.addEventListener('click', () => {
        document.getElementById('compilation-panel').classList.add('hidden');
      });
    document.getElementById('close-examples')?.addEventListener('click', () => {
      document.getElementById('example-modal').classList.add('hidden');
    });
    document
      .getElementById('start-compilation')
      ?.addEventListener('click', () => this.compileDesign());

    // Example selection
    document.querySelectorAll('.example-item').forEach((item) => {
      item.addEventListener('click', () => {
        const exampleType = item.dataset.example;
        this.loadExample(exampleType);
        document.getElementById('example-modal').classList.add('hidden');
      });
    });

    // Connection mode toggle
    document
      .getElementById('connection-mode')
      .addEventListener('change', (e) => {
        this.connectionMode = e.target.checked;
        this.canvas.style.cursor = this.connectionMode
          ? 'crosshair'
          : 'default';
      });

    // Mobile menu toggle
    document
      .getElementById('mobile-menu-toggle')
      .addEventListener('click', () => {
        const navbar = document.querySelector('.navbar-nav');
        const toggle = document.getElementById('mobile-menu-toggle');
        navbar.classList.toggle('active');
        toggle.classList.toggle('active');
      });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      const navbar = document.querySelector('.navbar-nav');
      const toggle = document.getElementById('mobile-menu-toggle');
      const isClickInsideNav = navbar.contains(e.target);
      const isToggleClick = toggle.contains(e.target);

      if (
        !isClickInsideNav &&
        !isToggleClick &&
        navbar.classList.contains('active')
      ) {
        navbar.classList.remove('active');
        toggle.classList.remove('active');
      }
    });

    // Simulation controls
    document
      .getElementById('execute-command')
      .addEventListener('click', () => this.executeCommand());
    document
      .getElementById('command-input')
      .addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.executeCommand();
      });

    // Auto-save session data
    setInterval(() => this.saveSessionData(), 5000);

    // File input for loading designs
    document
      .getElementById('design-file-input')
      .addEventListener('change', (e) => this.handleFileLoad(e));
  }

  addComponent(type, x, y) {
    const componentIcons = {
      alu: '🧮',
      register: '📝',
      memory: '💾',
      'control-unit': '🎛️',
      cache: '⚡',
      decoder: '🔍',
      multiplexer: '🔀',
      bus: '🚌',
      clock: '⏰',
      'input-port': '📥',
      'output-port': '📤',
      interrupt: '⚠️',
      adder: '➕',
      shifter: '↔️',
      comparator: '⚖️',
      'program-counter': '📍',
      'instruction-register': '📋',
      'flag-register': '🏳️',
      'stack-pointer': '📚',
    };

    const component = {
      id: Date.now() + Math.random(),
      type: type,
      x: x - 50,
      y: y - 30,
      width: 100,
      height: 60,
      icon: componentIcons[type],
      label: type.toUpperCase().replace('-', ' '),
      connectionPoints: this.getConnectionPoints(type),
    };

    this.components.push(component);
    this.redraw();
    this.saveSessionData();
  }

  getConnectionPoints(type) {
    // Define input/output points for each component type
    const points = {
      alu: [
        { id: 'in1', x: 0, y: 20, type: 'input', label: 'A' },
        { id: 'in2', x: 0, y: 40, type: 'input', label: 'B' },
        { id: 'out', x: 100, y: 30, type: 'output', label: 'Result' },
      ],
      register: [
        { id: 'in', x: 0, y: 30, type: 'input', label: 'Data In' },
        { id: 'out', x: 100, y: 30, type: 'output', label: 'Data Out' },
      ],
      memory: [
        { id: 'addr', x: 0, y: 20, type: 'input', label: 'Address' },
        { id: 'data_in', x: 0, y: 40, type: 'input', label: 'Data In' },
        { id: 'data_out', x: 100, y: 30, type: 'output', label: 'Data Out' },
      ],
      'control-unit': [
        { id: 'instruction', x: 0, y: 30, type: 'input', label: 'Instruction' },
        { id: 'control1', x: 100, y: 20, type: 'output', label: 'Control 1' },
        { id: 'control2', x: 100, y: 40, type: 'output', label: 'Control 2' },
      ],
      cache: [
        { id: 'cpu_in', x: 0, y: 20, type: 'input', label: 'CPU Request' },
        { id: 'mem_in', x: 0, y: 40, type: 'input', label: 'Memory Data' },
        { id: 'cpu_out', x: 100, y: 20, type: 'output', label: 'CPU Data' },
        {
          id: 'mem_out',
          x: 100,
          y: 40,
          type: 'output',
          label: 'Memory Request',
        },
      ],
      decoder: [
        { id: 'encoded_in', x: 0, y: 30, type: 'input', label: 'Encoded' },
        { id: 'out1', x: 100, y: 15, type: 'output', label: 'Out 1' },
        { id: 'out2', x: 100, y: 30, type: 'output', label: 'Out 2' },
        { id: 'out3', x: 100, y: 45, type: 'output', label: 'Out 3' },
      ],
      multiplexer: [
        { id: 'in1', x: 0, y: 15, type: 'input', label: 'In 1' },
        { id: 'in2', x: 0, y: 30, type: 'input', label: 'In 2' },
        { id: 'in3', x: 0, y: 45, type: 'input', label: 'In 3' },
        { id: 'select', x: 50, y: 0, type: 'input', label: 'Select' },
        { id: 'out', x: 100, y: 30, type: 'output', label: 'Output' },
      ],
      bus: [
        { id: 'in1', x: 0, y: 30, type: 'input', label: 'In' },
        { id: 'out1', x: 100, y: 15, type: 'output', label: 'Out 1' },
        { id: 'out2', x: 100, y: 30, type: 'output', label: 'Out 2' },
        { id: 'out3', x: 100, y: 45, type: 'output', label: 'Out 3' },
      ],
      clock: [{ id: 'clk_out', x: 100, y: 30, type: 'output', label: 'Clock' }],
      'input-port': [
        { id: 'external', x: 0, y: 30, type: 'input', label: 'External' },
        { id: 'internal', x: 100, y: 30, type: 'output', label: 'Internal' },
      ],
      'output-port': [
        { id: 'internal', x: 0, y: 30, type: 'input', label: 'Internal' },
        { id: 'external', x: 100, y: 30, type: 'output', label: 'External' },
      ],
      interrupt: [
        { id: 'signal', x: 0, y: 30, type: 'input', label: 'Signal' },
        {
          id: 'cpu_int',
          x: 100,
          y: 30,
          type: 'output',
          label: 'CPU Interrupt',
        },
      ],
      adder: [
        { id: 'in1', x: 0, y: 20, type: 'input', label: 'A' },
        { id: 'in2', x: 0, y: 40, type: 'input', label: 'B' },
        { id: 'out', x: 100, y: 30, type: 'output', label: 'Sum' },
        { id: 'carry', x: 100, y: 15, type: 'output', label: 'Carry' },
      ],
      shifter: [
        { id: 'data_in', x: 0, y: 20, type: 'input', label: 'Data' },
        { id: 'shift_amt', x: 0, y: 40, type: 'input', label: 'Shift Amount' },
        { id: 'direction', x: 0, y: 45, type: 'input', label: 'Direction' },
        {
          id: 'data_out',
          x: 100,
          y: 30,
          type: 'output',
          label: 'Shifted Data',
        },
      ],
      comparator: [
        { id: 'in1', x: 0, y: 20, type: 'input', label: 'A' },
        { id: 'in2', x: 0, y: 40, type: 'input', label: 'B' },
        { id: 'equal', x: 100, y: 15, type: 'output', label: 'Equal' },
        { id: 'greater', x: 100, y: 30, type: 'output', label: 'Greater' },
        { id: 'less', x: 100, y: 45, type: 'output', label: 'Less' },
      ],
      'program-counter': [
        { id: 'clk', x: 0, y: 15, type: 'input', label: 'Clock' },
        { id: 'reset', x: 0, y: 30, type: 'input', label: 'Reset' },
        { id: 'enable', x: 0, y: 45, type: 'input', label: 'Enable' },
        { id: 'address', x: 100, y: 30, type: 'output', label: 'Address' },
      ],
      'instruction-register': [
        {
          id: 'instruction_in',
          x: 0,
          y: 20,
          type: 'input',
          label: 'Instruction',
        },
        { id: 'clk', x: 0, y: 40, type: 'input', label: 'Clock' },
        { id: 'opcode', x: 100, y: 15, type: 'output', label: 'Opcode' },
        { id: 'operand', x: 100, y: 30, type: 'output', label: 'Operand' },
        { id: 'address', x: 100, y: 45, type: 'output', label: 'Address' },
      ],
      'flag-register': [
        { id: 'flags_in', x: 0, y: 20, type: 'input', label: 'Flags In' },
        { id: 'clk', x: 0, y: 40, type: 'input', label: 'Clock' },
        { id: 'zero', x: 100, y: 10, type: 'output', label: 'Zero' },
        { id: 'carry', x: 100, y: 25, type: 'output', label: 'Carry' },
        { id: 'negative', x: 100, y: 40, type: 'output', label: 'Negative' },
        { id: 'overflow', x: 100, y: 55, type: 'output', label: 'Overflow' },
      ],
      'stack-pointer': [
        { id: 'clk', x: 0, y: 15, type: 'input', label: 'Clock' },
        { id: 'push', x: 0, y: 30, type: 'input', label: 'Push' },
        { id: 'pop', x: 0, y: 45, type: 'input', label: 'Pop' },
        {
          id: 'address',
          x: 100,
          y: 30,
          type: 'output',
          label: 'Stack Address',
        },
      ],
    };
    return points[type] || [];
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.connectionMode) {
      this.handleConnectionClick(x, y);
    } else {
      const component = this.getComponentAt(x, y);
      if (component) {
        this.selectedComponent = component;
        this.draggedComponent = component;
        this.dragOffset = { x: x - component.x, y: y - component.y };
      } else {
        this.selectedComponent = null;
      }
      this.redraw();
    }
  }

  handleMouseMove(e) {
    if (this.draggedComponent) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.draggedComponent.x = x - this.dragOffset.x;
      this.draggedComponent.y = y - this.dragOffset.y;
      this.redraw();
    }
  }

  handleMouseUp(_e) {
    if (this.draggedComponent) {
      this.saveSessionData();
    }
    this.draggedComponent = null;
  }

  // Touch event handlers for mobile support
  handleTouchStart(e) {
    // Don't handle if this is a drag from palette
    if (this.touchDragData) {
      return;
    }

    // Prevent default to avoid scrolling and zooming
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (this.connectionMode) {
      this.handleConnectionClick(x, y);
    } else {
      const component = this.getComponentAt(x, y);
      if (component) {
        this.selectedComponent = component;
        this.draggedComponent = component;
        this.dragOffset = { x: x - component.x, y: y - component.y };
      } else {
        this.selectedComponent = null;
      }
      this.redraw();
    }
  }

  handleTouchMove(e) {
    // Don't handle if this is a drag from palette
    if (this.touchDragData) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (this.draggedComponent && e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.draggedComponent.x = x - this.dragOffset.x;
      this.draggedComponent.y = y - this.dragOffset.y;
      this.redraw();
    }
  }

  handleTouchEnd(e) {
    // Don't handle if this is a drag from palette
    if (this.touchDragData) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (this.draggedComponent) {
      this.saveSessionData();
    }
    this.draggedComponent = null;
  }

  handleConnectionClick(x, y) {
    const connectionPoint = this.getConnectionPointAt(x, y);

    if (connectionPoint) {
      if (!this.connectionStart) {
        this.connectionStart = connectionPoint;
      } else {
        if (this.canConnect(this.connectionStart, connectionPoint)) {
          this.addConnection(this.connectionStart, connectionPoint);
        }
        this.connectionStart = null;
      }
      this.redraw();
    }
  }

  getComponentAt(x, y) {
    return this.components.find(
      (comp) =>
        x >= comp.x &&
        x <= comp.x + comp.width &&
        y >= comp.y &&
        y <= comp.y + comp.height
    );
  }

  getConnectionPointAt(x, y) {
    for (const comp of this.components) {
      for (const point of comp.connectionPoints) {
        const pointX = comp.x + point.x;
        const pointY = comp.y + point.y;
        const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
        if (distance <= 10) {
          return { component: comp, point: point };
        }
      }
    }
    return null;
  }

  canConnect(start, end) {
    return (
      start.component !== end.component && start.point.type !== end.point.type
    );
  }

  addConnection(start, end) {
    const connection = {
      id: Date.now() + Math.random(),
      start: start,
      end: end,
    };
    this.connections.push(connection);
    this.saveSessionData();
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections
    this.connections.forEach((conn) => this.drawConnection(conn));

    // Draw components
    this.components.forEach((comp) => this.drawComponent(comp));

    // Highlight connection start point
    if (this.connectionStart) {
      this.highlightConnectionPoint(this.connectionStart);
    }
  }

  drawComponent(comp) {
    const isSelected = comp === this.selectedComponent;

    // Component background
    this.ctx.fillStyle = isSelected ? '#4d4d4d' : '#3d3d3d';
    this.ctx.strokeStyle = isSelected ? '#ffd700' : '#646cff';
    this.ctx.lineWidth = 2;

    this.ctx.fillRect(comp.x, comp.y, comp.width, comp.height);
    this.ctx.strokeRect(comp.x, comp.y, comp.width, comp.height);

    // Component icon
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(comp.icon, comp.x + comp.width / 2, comp.y + 30);

    // Component label
    this.ctx.font = '12px Arial';
    this.ctx.fillText(comp.label, comp.x + comp.width / 2, comp.y + 50);

    // Connection points
    comp.connectionPoints.forEach((point) => {
      const pointX = comp.x + point.x;
      const pointY = comp.y + point.y;

      this.ctx.beginPath();
      this.ctx.arc(pointX, pointY, 6, 0, 2 * Math.PI);
      this.ctx.fillStyle = point.type === 'input' ? '#ff6b6b' : '#4ecdc4';
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    });
  }

  drawConnection(conn) {
    const startX = conn.start.component.x + conn.start.point.x;
    const startY = conn.start.component.y + conn.start.point.y;
    const endX = conn.end.component.x + conn.end.point.x;
    const endY = conn.end.component.y + conn.end.point.y;

    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.strokeStyle = '#646cff';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  highlightConnectionPoint(connectionPoint) {
    const pointX = connectionPoint.component.x + connectionPoint.point.x;
    const pointY = connectionPoint.component.y + connectionPoint.point.y;

    this.ctx.beginPath();
    this.ctx.arc(pointX, pointY, 10, 0, 2 * Math.PI);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  clearCanvas() {
    this.components = [];
    this.connections = [];
    this.selectedComponent = null;
    this.connectionStart = null;
    this.redraw();
    this.saveSessionData();
  }

  exportDesign() {
    const designData = {
      components: this.components,
      connections: this.connections,
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(designData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'processor-design.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  loadDesign() {
    const fileInput = document.getElementById('design-file-input');
    fileInput.click();
  }

  handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const designData = JSON.parse(e.target.result);

        // Validate the loaded data
        if (!designData.components || !designData.connections) {
          throw new Error('Invalid design file format');
        }

        // Clear current design
        this.clearCanvas();

        // Load components
        this.components = designData.components.map((comp) => ({
          ...comp,
          id: comp.id || Math.random().toString(36).substr(2, 9), // Ensure each component has an ID
        }));

        // Load connections
        this.connections = designData.connections || [];

        // Redraw the canvas
        this.redraw();
        this.saveSessionData();

        // Show success message
        this.showNotification('Design loaded successfully!', 'success');
      } catch (error) {
        console.error('Error loading design:', error);
        this.showNotification(
          'Error loading design file. Please check the file format.',
          'error'
        );
      }
    };

    reader.readAsText(file);

    // Reset the input so the same file can be loaded again
    event.target.value = '';
  }

  showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = `notification ${type} show`;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  toggleSimulation() {
    const panel = document.getElementById('simulation-panel');
    panel.classList.toggle('hidden');
  }

  executeCommand() {
    const input = document.getElementById('command-input');
    const output = document.getElementById('simulation-output');
    const command = input.value.trim().toUpperCase();

    if (!command) return;

    // Simple command simulation
    const result = this.simulateCommand(command);

    const timestamp = new Date().toLocaleTimeString();
    output.innerHTML += `<div>[${timestamp}] > ${command}</div>`;
    output.innerHTML += `<div>[${timestamp}] ${result}</div><br>`;
    output.scrollTop = output.scrollHeight;

    input.value = '';
  }

  simulateCommand(command) {
    const parts = command.split(/[,\s]+/);
    const operation = parts[0];

    switch (operation) {
      case 'ADD':
        return `Adding ${parts[1]} and ${parts[2]} → Result stored in ALU`;
      case 'LOAD':
        return `Loading data from memory address ${parts[1]} → Register`;
      case 'STORE':
        return `Storing ${parts[1]} to memory address ${parts[2]}`;
      case 'MOV':
        return `Moving data from ${parts[1]} to ${parts[2]}`;
      case 'CACHE':
        return `Cache operation: ${parts[1]} → ${parts[2] || 'Hit/Miss check'}`;
      case 'INT':
        return `Interrupt ${parts[1]} triggered → Control Unit handling`;
      default:
        return `Unknown command: ${operation}`;
    }
  }

  validateDesign() {
    const results = [];

    // Check for basic components
    const hasALU = this.components.some((c) => c.type === 'alu');
    const hasMemory = this.components.some((c) => c.type === 'memory');
    const hasControl = this.components.some((c) => c.type === 'control-unit');
    const hasRegister = this.components.some((c) => c.type === 'register');

    if (hasALU && hasMemory && hasControl && hasRegister) {
      results.push({
        type: 'success',
        title: 'Complete Basic Architecture',
        message:
          'Design contains all essential processor components (ALU, Memory, Control Unit, Register).',
      });
    } else {
      results.push({
        type: 'warning',
        title: 'Incomplete Basic Architecture',
        message: `Missing components: ${[
          !hasALU ? 'ALU' : '',
          !hasMemory ? 'Memory' : '',
          !hasControl ? 'Control Unit' : '',
          !hasRegister ? 'Register' : '',
        ]
          .filter(Boolean)
          .join(', ')}`,
      });
    }

    // Check connections
    const unconnectedInputs = [];
    const unconnectedOutputs = [];

    this.components.forEach((comp) => {
      comp.connectionPoints.forEach((point) => {
        const isConnected = this.connections.some(
          (conn) =>
            (conn.start.component === comp && conn.start.point === point) ||
            (conn.end.component === comp && conn.end.point === point)
        );

        if (!isConnected) {
          if (point.type === 'input') {
            unconnectedInputs.push(`${comp.label} - ${point.label}`);
          } else {
            unconnectedOutputs.push(`${comp.label} - ${point.label}`);
          }
        }
      });
    });

    if (unconnectedInputs.length === 0 && unconnectedOutputs.length === 0) {
      results.push({
        type: 'success',
        title: 'All Connections Complete',
        message: 'All component inputs and outputs are properly connected.',
      });
    } else {
      if (unconnectedInputs.length > 0) {
        results.push({
          type: 'warning',
          title: 'Unconnected Inputs',
          message: `Unconnected inputs: ${unconnectedInputs.slice(0, 5).join(', ')}${unconnectedInputs.length > 5 ? '...' : ''}`,
        });
      }
      if (unconnectedOutputs.length > 0) {
        results.push({
          type: 'warning',
          title: 'Unconnected Outputs',
          message: `Unconnected outputs: ${unconnectedOutputs.slice(0, 5).join(', ')}${unconnectedOutputs.length > 5 ? '...' : ''}`,
        });
      }
    }

    // Check for clock
    const hasClock = this.components.some((c) => c.type === 'clock');
    if (!hasClock) {
      results.push({
        type: 'warning',
        title: 'No Clock Component',
        message: 'Consider adding a clock component for synchronous operation.',
      });
    }

    // Check for cycles in connections
    const hasCycles = this.detectCycles();
    if (hasCycles) {
      results.push({
        type: 'error',
        title: 'Circular Dependencies Detected',
        message:
          'Design contains circular connections which may cause timing issues.',
      });
    } else {
      results.push({
        type: 'success',
        title: 'No Circular Dependencies',
        message: 'Design is free of circular connection paths.',
      });
    }

    this.displayValidationResults(results);
  }

  detectCycles() {
    // Simple cycle detection using DFS
    const visited = new Set();
    const recursionStack = new Set();

    for (const component of this.components) {
      if (!visited.has(component.id)) {
        if (this.dfsHasCycle(component, visited, recursionStack)) {
          return true;
        }
      }
    }
    return false;
  }

  dfsHasCycle(component, visited, recursionStack) {
    visited.add(component.id);
    recursionStack.add(component.id);

    // Find all components connected from this one's outputs
    const outputConnections = this.connections.filter(
      (conn) => conn.start.component === component
    );

    for (const conn of outputConnections) {
      const nextComponent = conn.end.component;
      if (!visited.has(nextComponent.id)) {
        if (this.dfsHasCycle(nextComponent, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(nextComponent.id)) {
        return true;
      }
    }

    recursionStack.delete(component.id);
    return false;
  }

  displayValidationResults(results) {
    const panel = document.getElementById('validation-panel');
    const resultsDiv = document.getElementById('validation-results');

    resultsDiv.innerHTML = '';

    results.forEach((result) => {
      const item = document.createElement('div');
      item.className = `validation-item ${result.type}`;
      item.innerHTML = `
        <h4>${result.title}</h4>
        <p>${result.message}</p>
      `;
      resultsDiv.appendChild(item);
    });

    panel.classList.remove('hidden');
  }

  showCompilationPanel() {
    const panel = document.getElementById('compilation-panel');
    panel.classList.remove('hidden');
  }

  compileDesign() {
    const target = document.getElementById('compilation-target').value;
    const output = document.getElementById('compilation-output');

    let compiledCode = '';

    switch (target) {
      case 'verilog':
        compiledCode = this.generateVerilog();
        break;
      case 'vhdl':
        compiledCode = this.generateVHDL();
        break;
      case 'assembly':
        compiledCode = this.generateAssembly();
        break;
      case 'json':
        compiledCode = this.generateJSONDescription();
        break;
    }

    output.textContent = compiledCode;
  }

  generateVerilog() {
    let verilog = `// Generated Verilog HDL Code
// Processor Design Tool - florian-hunter.de
// Generated on: ${new Date().toISOString()}

module processor_design (
    input wire clk,
    input wire reset,
    input wire [31:0] instruction,
    output wire [31:0] result
);

`;

    // Generate module declarations for each component
    this.components.forEach((comp) => {
      switch (comp.type) {
        case 'alu':
          verilog += `    // ALU Component
    alu alu_inst (
        .clk(clk),
        .a(alu_input_a),
        .b(alu_input_b),
        .result(alu_output)
    );

`;
          break;
        case 'register':
          verilog += `    // Register Component
    register reg_inst (
        .clk(clk),
        .reset(reset),
        .data_in(reg_data_in),
        .data_out(reg_data_out)
    );

`;
          break;
        case 'memory':
          verilog += `    // Memory Component
    memory mem_inst (
        .clk(clk),
        .address(mem_address),
        .data_in(mem_data_in),
        .data_out(mem_data_out),
        .write_enable(mem_we)
    );

`;
          break;
      }
    });

    verilog += `endmodule

// Component implementations would go here...
// This is a simplified example for demonstration.`;

    return verilog;
  }

  generateVHDL() {
    return `-- Generated VHDL Code
-- Processor Design Tool - florian-hunter.de
-- Generated on: ${new Date().toISOString()}

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity processor_design is
    Port ( 
        clk : in STD_LOGIC;
        reset : in STD_LOGIC;
        instruction : in STD_LOGIC_VECTOR (31 downto 0);
        result : out STD_LOGIC_VECTOR (31 downto 0)
    );
end processor_design;

architecture Behavioral of processor_design is
    -- Component declarations
    ${this.components.map((comp) => `-- ${comp.label} component signals`).join('\n    ')}
    
begin
    -- Component instantiations
    ${this.components.map((comp) => `-- ${comp.label}: entity work.${comp.type}`).join('\n    ')}
    
end Behavioral;

-- This is a simplified VHDL template.
-- Full implementation would require detailed component definitions.`;
  }

  generateAssembly() {
    return `; Generated Assembly Code
; Processor Design Tool - florian-hunter.de
; Generated on: ${new Date().toISOString()}

.section .text
.global _start

_start:
    ; Initialize processor components
    ${this.components.map((comp) => `    ; Setup ${comp.label}`).join('\n')}
    
    ; Main execution loop
main_loop:
    ; Fetch instruction
    load r0, instruction_memory
    
    ; Decode instruction
    decode r0
    
    ; Execute based on components available:
    ${this.components.includes((c) => c.type === 'alu') ? '    ; ALU operations available' : ''}
    ${this.components.includes((c) => c.type === 'memory') ? '    ; Memory operations available' : ''}
    
    ; Continue execution
    jmp main_loop

; This is a simplified assembly template
; based on your processor design components.`;
  }

  generateJSONDescription() {
    return JSON.stringify(
      {
        metadata: {
          title: 'Processor Design',
          generator: 'Processor Design Tool',
          author: 'florian-hunter.de',
          generated: new Date().toISOString(),
          version: '1.0',
        },
        components: this.components.map((comp) => ({
          id: comp.id,
          type: comp.type,
          label: comp.label,
          position: { x: comp.x, y: comp.y },
          dimensions: { width: comp.width, height: comp.height },
          connectionPoints: comp.connectionPoints,
        })),
        connections: this.connections.map((conn) => ({
          id: conn.id,
          from: {
            component: conn.start.component.id,
            point: conn.start.point.id,
          },
          to: {
            component: conn.end.component.id,
            point: conn.end.point.id,
          },
        })),
        statistics: {
          totalComponents: this.components.length,
          totalConnections: this.connections.length,
          componentTypes: [...new Set(this.components.map((c) => c.type))],
        },
      },
      null,
      2
    );
  }

  showExampleModal() {
    const modal = document.getElementById('example-modal');
    modal.classList.remove('hidden');
  }

  loadExample(exampleType) {
    this.clearCanvas();

    const examples = {
      'simple-8bit': this.createSimple8BitCPU(),
      'risc-processor': this.createRISCProcessor(),
      'pipelined-cpu': this.createPipelinedCPU(),
      microcontroller: this.createMicrocontroller(),
    };

    const example = examples[exampleType];
    if (example) {
      this.components = example.components;
      this.connections = example.connections;
      this.redraw();
      this.saveSessionData();
    }
  }

  createSimple8BitCPU() {
    const components = [
      {
        id: 'alu1',
        type: 'alu',
        x: 300,
        y: 200,
        width: 100,
        height: 60,
        icon: '🧮',
        label: 'ALU',
        connectionPoints: this.getConnectionPoints('alu'),
      },
      {
        id: 'reg1',
        type: 'register',
        x: 150,
        y: 150,
        width: 100,
        height: 60,
        icon: '📝',
        label: 'REGISTER',
        connectionPoints: this.getConnectionPoints('register'),
      },
      {
        id: 'reg2',
        type: 'register',
        x: 150,
        y: 250,
        width: 100,
        height: 60,
        icon: '📝',
        label: 'REGISTER',
        connectionPoints: this.getConnectionPoints('register'),
      },
      {
        id: 'mem1',
        type: 'memory',
        x: 500,
        y: 200,
        width: 100,
        height: 60,
        icon: '💾',
        label: 'MEMORY',
        connectionPoints: this.getConnectionPoints('memory'),
      },
      {
        id: 'ctrl1',
        type: 'control-unit',
        x: 300,
        y: 100,
        width: 100,
        height: 60,
        icon: '🎛️',
        label: 'CONTROL UNIT',
        connectionPoints: this.getConnectionPoints('control-unit'),
      },
      {
        id: 'pc1',
        type: 'program-counter',
        x: 150,
        y: 50,
        width: 100,
        height: 60,
        icon: '📍',
        label: 'PROGRAM COUNTER',
        connectionPoints: this.getConnectionPoints('program-counter'),
      },
      {
        id: 'clk1',
        type: 'clock',
        x: 50,
        y: 100,
        width: 100,
        height: 60,
        icon: '⏰',
        label: 'CLOCK',
        connectionPoints: this.getConnectionPoints('clock'),
      },
    ];

    const connections = [
      {
        id: 'conn1',
        start: {
          component: components[1],
          point: components[1].connectionPoints[1],
        },
        end: {
          component: components[0],
          point: components[0].connectionPoints[0],
        },
      },
      {
        id: 'conn2',
        start: {
          component: components[2],
          point: components[2].connectionPoints[1],
        },
        end: {
          component: components[0],
          point: components[0].connectionPoints[1],
        },
      },
      {
        id: 'conn3',
        start: {
          component: components[0],
          point: components[0].connectionPoints[2],
        },
        end: {
          component: components[3],
          point: components[3].connectionPoints[1],
        },
      },
      {
        id: 'conn4',
        start: {
          component: components[4],
          point: components[4].connectionPoints[1],
        },
        end: {
          component: components[0],
          point: components[0].connectionPoints[0],
        },
      },
      {
        id: 'conn5',
        start: {
          component: components[6],
          point: components[6].connectionPoints[0],
        },
        end: {
          component: components[5],
          point: components[5].connectionPoints[0],
        },
      },
    ];

    return { components, connections };
  }

  createRISCProcessor() {
    const components = [
      {
        id: 'alu1',
        type: 'alu',
        x: 400,
        y: 300,
        width: 100,
        height: 60,
        icon: '🧮',
        label: 'ALU',
        connectionPoints: this.getConnectionPoints('alu'),
      },
      {
        id: 'reg1',
        type: 'register',
        x: 200,
        y: 200,
        width: 100,
        height: 60,
        icon: '📝',
        label: 'REGISTER',
        connectionPoints: this.getConnectionPoints('register'),
      },
      {
        id: 'reg2',
        type: 'register',
        x: 200,
        y: 300,
        width: 100,
        height: 60,
        icon: '📝',
        label: 'REGISTER',
        connectionPoints: this.getConnectionPoints('register'),
      },
      {
        id: 'reg3',
        type: 'register',
        x: 200,
        y: 400,
        width: 100,
        height: 60,
        icon: '📝',
        label: 'REGISTER',
        connectionPoints: this.getConnectionPoints('register'),
      },
      {
        id: 'mem1',
        type: 'memory',
        x: 600,
        y: 300,
        width: 100,
        height: 60,
        icon: '💾',
        label: 'MEMORY',
        connectionPoints: this.getConnectionPoints('memory'),
      },
      {
        id: 'ctrl1',
        type: 'control-unit',
        x: 400,
        y: 100,
        width: 100,
        height: 60,
        icon: '🎛️',
        label: 'CONTROL UNIT',
        connectionPoints: this.getConnectionPoints('control-unit'),
      },
      {
        id: 'pc1',
        type: 'program-counter',
        x: 200,
        y: 50,
        width: 100,
        height: 60,
        icon: '📍',
        label: 'PROGRAM COUNTER',
        connectionPoints: this.getConnectionPoints('program-counter'),
      },
      {
        id: 'ir1',
        type: 'instruction-register',
        x: 400,
        y: 50,
        width: 100,
        height: 60,
        icon: '📋',
        label: 'INSTRUCTION REGISTER',
        connectionPoints: this.getConnectionPoints('instruction-register'),
      },
      {
        id: 'mux1',
        type: 'multiplexer',
        x: 300,
        y: 250,
        width: 100,
        height: 60,
        icon: '🔀',
        label: 'MULTIPLEXER',
        connectionPoints: this.getConnectionPoints('multiplexer'),
      },
      {
        id: 'adder1',
        type: 'adder',
        x: 500,
        y: 150,
        width: 100,
        height: 60,
        icon: '➕',
        label: 'ADDER',
        connectionPoints: this.getConnectionPoints('adder'),
      },
    ];

    const connections = [
      {
        id: 'conn1',
        start: {
          component: components[1],
          point: components[1].connectionPoints[1],
        },
        end: {
          component: components[8],
          point: components[8].connectionPoints[0],
        },
      },
      {
        id: 'conn2',
        start: {
          component: components[2],
          point: components[2].connectionPoints[1],
        },
        end: {
          component: components[8],
          point: components[8].connectionPoints[1],
        },
      },
      {
        id: 'conn3',
        start: {
          component: components[8],
          point: components[8].connectionPoints[4],
        },
        end: {
          component: components[0],
          point: components[0].connectionPoints[0],
        },
      },
      {
        id: 'conn4',
        start: {
          component: components[0],
          point: components[0].connectionPoints[2],
        },
        end: {
          component: components[4],
          point: components[4].connectionPoints[1],
        },
      },
    ];

    return { components, connections };
  }

  createPipelinedCPU() {
    const components = [
      // Fetch Stage
      {
        id: 'pc1',
        type: 'program-counter',
        x: 100,
        y: 100,
        width: 100,
        height: 60,
        icon: '📍',
        label: 'PROGRAM COUNTER',
        connectionPoints: this.getConnectionPoints('program-counter'),
      },
      {
        id: 'imem1',
        type: 'memory',
        x: 250,
        y: 100,
        width: 100,
        height: 60,
        icon: '💾',
        label: 'INSTRUCTION MEMORY',
        connectionPoints: this.getConnectionPoints('memory'),
      },

      // Decode Stage
      {
        id: 'ir1',
        type: 'instruction-register',
        x: 100,
        y: 200,
        width: 100,
        height: 60,
        icon: '📋',
        label: 'INSTRUCTION REGISTER',
        connectionPoints: this.getConnectionPoints('instruction-register'),
      },
      {
        id: 'dec1',
        type: 'decoder',
        x: 250,
        y: 200,
        width: 100,
        height: 60,
        icon: '🔍',
        label: 'DECODER',
        connectionPoints: this.getConnectionPoints('decoder'),
      },
      {
        id: 'regfile',
        type: 'register',
        x: 400,
        y: 200,
        width: 100,
        height: 60,
        icon: '📝',
        label: 'REGISTER FILE',
        connectionPoints: this.getConnectionPoints('register'),
      },

      // Execute Stage
      {
        id: 'alu1',
        type: 'alu',
        x: 100,
        y: 300,
        width: 100,
        height: 60,
        icon: '🧮',
        label: 'ALU',
        connectionPoints: this.getConnectionPoints('alu'),
      },
      {
        id: 'comp1',
        type: 'comparator',
        x: 250,
        y: 300,
        width: 100,
        height: 60,
        icon: '⚖️',
        label: 'COMPARATOR',
        connectionPoints: this.getConnectionPoints('comparator'),
      },

      // Memory Stage
      {
        id: 'dmem1',
        type: 'memory',
        x: 100,
        y: 400,
        width: 100,
        height: 60,
        icon: '💾',
        label: 'DATA MEMORY',
        connectionPoints: this.getConnectionPoints('memory'),
      },
      {
        id: 'cache1',
        type: 'cache',
        x: 250,
        y: 400,
        width: 100,
        height: 60,
        icon: '⚡',
        label: 'CACHE',
        connectionPoints: this.getConnectionPoints('cache'),
      },

      // Writeback Stage
      {
        id: 'mux1',
        type: 'multiplexer',
        x: 400,
        y: 400,
        width: 100,
        height: 60,
        icon: '🔀',
        label: 'MULTIPLEXER',
        connectionPoints: this.getConnectionPoints('multiplexer'),
      },

      // Control
      {
        id: 'ctrl1',
        type: 'control-unit',
        x: 550,
        y: 250,
        width: 100,
        height: 60,
        icon: '🎛️',
        label: 'CONTROL UNIT',
        connectionPoints: this.getConnectionPoints('control-unit'),
      },
      {
        id: 'clk1',
        type: 'clock',
        x: 550,
        y: 100,
        width: 100,
        height: 60,
        icon: '⏰',
        label: 'CLOCK',
        connectionPoints: this.getConnectionPoints('clock'),
      },
    ];

    const connections = [
      {
        id: 'conn1',
        start: {
          component: components[0],
          point: components[0].connectionPoints[3],
        },
        end: {
          component: components[1],
          point: components[1].connectionPoints[0],
        },
      },
      {
        id: 'conn2',
        start: {
          component: components[1],
          point: components[1].connectionPoints[2],
        },
        end: {
          component: components[2],
          point: components[2].connectionPoints[0],
        },
      },
      {
        id: 'conn3',
        start: {
          component: components[2],
          point: components[2].connectionPoints[2],
        },
        end: {
          component: components[3],
          point: components[3].connectionPoints[0],
        },
      },
      {
        id: 'conn4',
        start: {
          component: components[4],
          point: components[4].connectionPoints[1],
        },
        end: {
          component: components[5],
          point: components[5].connectionPoints[0],
        },
      },
    ];

    return { components, connections };
  }

  createMicrocontroller() {
    const components = [
      // Core
      {
        id: 'cpu1',
        type: 'alu',
        x: 300,
        y: 200,
        width: 100,
        height: 60,
        icon: '🧮',
        label: 'CPU CORE',
        connectionPoints: this.getConnectionPoints('alu'),
      },
      {
        id: 'mem1',
        type: 'memory',
        x: 450,
        y: 200,
        width: 100,
        height: 60,
        icon: '💾',
        label: 'FLASH MEMORY',
        connectionPoints: this.getConnectionPoints('memory'),
      },
      {
        id: 'ram1',
        type: 'memory',
        x: 450,
        y: 300,
        width: 100,
        height: 60,
        icon: '💾',
        label: 'RAM',
        connectionPoints: this.getConnectionPoints('memory'),
      },

      // I/O
      {
        id: 'in1',
        type: 'input-port',
        x: 150,
        y: 150,
        width: 100,
        height: 60,
        icon: '📥',
        label: 'INPUT PORT A',
        connectionPoints: this.getConnectionPoints('input-port'),
      },
      {
        id: 'in2',
        type: 'input-port',
        x: 150,
        y: 250,
        width: 100,
        height: 60,
        icon: '📥',
        label: 'INPUT PORT B',
        connectionPoints: this.getConnectionPoints('input-port'),
      },
      {
        id: 'out1',
        type: 'output-port',
        x: 600,
        y: 150,
        width: 100,
        height: 60,
        icon: '📤',
        label: 'OUTPUT PORT A',
        connectionPoints: this.getConnectionPoints('output-port'),
      },
      {
        id: 'out2',
        type: 'output-port',
        x: 600,
        y: 250,
        width: 100,
        height: 60,
        icon: '📤',
        label: 'OUTPUT PORT B',
        connectionPoints: this.getConnectionPoints('output-port'),
      },

      // Control & Timing
      {
        id: 'ctrl1',
        type: 'control-unit',
        x: 300,
        y: 100,
        width: 100,
        height: 60,
        icon: '🎛️',
        label: 'CONTROL UNIT',
        connectionPoints: this.getConnectionPoints('control-unit'),
      },
      {
        id: 'clk1',
        type: 'clock',
        x: 150,
        y: 50,
        width: 100,
        height: 60,
        icon: '⏰',
        label: 'OSCILLATOR',
        connectionPoints: this.getConnectionPoints('clock'),
      },
      {
        id: 'int1',
        type: 'interrupt',
        x: 300,
        y: 350,
        width: 100,
        height: 60,
        icon: '⚠️',
        label: 'INTERRUPT CONTROLLER',
        connectionPoints: this.getConnectionPoints('interrupt'),
      },

      // Bus
      {
        id: 'bus1',
        type: 'bus',
        x: 300,
        y: 300,
        width: 100,
        height: 60,
        icon: '🚌',
        label: 'SYSTEM BUS',
        connectionPoints: this.getConnectionPoints('bus'),
      },
    ];

    const connections = [
      {
        id: 'conn1',
        start: {
          component: components[0],
          point: components[0].connectionPoints[2],
        },
        end: {
          component: components[10],
          point: components[10].connectionPoints[0],
        },
      },
      {
        id: 'conn2',
        start: {
          component: components[10],
          point: components[10].connectionPoints[1],
        },
        end: {
          component: components[1],
          point: components[1].connectionPoints[0],
        },
      },
      {
        id: 'conn3',
        start: {
          component: components[10],
          point: components[10].connectionPoints[2],
        },
        end: {
          component: components[2],
          point: components[2].connectionPoints[0],
        },
      },
      {
        id: 'conn4',
        start: {
          component: components[3],
          point: components[3].connectionPoints[1],
        },
        end: {
          component: components[0],
          point: components[0].connectionPoints[0],
        },
      },
      {
        id: 'conn5',
        start: {
          component: components[8],
          point: components[8].connectionPoints[0],
        },
        end: {
          component: components[7],
          point: components[7].connectionPoints[0],
        },
      },
    ];

    return { components, connections };
  }

  saveSessionData() {
    const data = {
      components: this.components,
      connections: this.connections,
    };
    sessionStorage.setItem('processorDesign', JSON.stringify(data));
  }

  loadSessionData() {
    const data = sessionStorage.getItem('processorDesign');
    if (data) {
      const parsed = JSON.parse(data);
      this.components = parsed.components || [];
      this.connections = parsed.connections || [];
      this.redraw();
    }
  }

  setupMobileDebug() {
    // Add mobile debug functionality
    if (window.location.search.includes('debug=true')) {
      this.debugMode = true;
      this.createDebugPanel();
    }
  }

  createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'mobile-debug';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      max-height: 200px;
      overflow-y: auto;
    `;
    debugPanel.innerHTML =
      '<div>Mobile Debug Panel</div><div id="debug-log"></div>';
    document.body.appendChild(debugPanel);
  }

  debugLog(message) {
    if (this.debugMode) {
      const debugLog = document.getElementById('debug-log');
      if (debugLog) {
        const timestamp = new Date().toLocaleTimeString();
        debugLog.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        debugLog.scrollTop = debugLog.scrollHeight;
      }
      console.log('[Mobile Debug]', message);
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new ProcessorDesignTool();
});
